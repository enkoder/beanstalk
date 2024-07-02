import { Disclosure, Transition } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/20/solid";
import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import {
  type Faction,
  type GetTagsResponse,
  LeaderboardService,
  type Season,
  SeasonsService,
  TagsService,
} from "../client";
import {
  type FilterSectionValues,
  getFilterValues,
  getSearchParamsFromValues,
} from "../filterUtils";
import ComboBox from "./ComboBox";
import { renderFactionItem } from "./FilterIcons";
import { Input } from "./Input";
import { Select } from "./Select";

const EMPTY_SEASON: Season = {
  id: -1,
  name: "Season Filter...",
  started_at: "",
};
const EMPTY_FACTION: Faction = {
  code: "anarch",
  color: "",
  is_mini: false,
  name: "Faction Filter...",
  side_code: "runner",
};

export interface FilterSectionProps {
  hasSearchBar?: boolean;
  startSeason?: number;
  onFilterChange?: (values: FilterSectionValues) => void;
}

export function FilterSection({
  hasSearchBar = true,
  startSeason = -1,
  onFilterChange,
}: FilterSectionProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [values, setValues] = useState<FilterSectionValues>(
    getFilterValues(searchParams),
  );

  const { data: seasons } = useQuery<Season[]>({
    queryKey: ["seasons"],
    queryFn: () => SeasonsService.getGetSeasons(),
  });

  const { data: factions } = useQuery<Faction[]>({
    queryKey: ["factions"],
    queryFn: () => LeaderboardService.getGetFactions(),
  });

  const { data: formats } = useQuery<string[]>({
    queryKey: ["formats"],
    queryFn: () => LeaderboardService.getGetFormats(),
  });

  const { data: tags } = useQuery<GetTagsResponse[]>({
    queryKey: ["tags"],
    queryFn: () => TagsService.getGetTags(),
  });

  useEffect(() => {
    if (seasons && startSeason > -1) {
      const initialSeason =
        seasons.find((s) => s.id === startSeason) || EMPTY_SEASON;
      handleFilterChange("seasonId", initialSeason.id);
    }
  }, [seasons, startSeason]);

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const handleFilterChange = (key: keyof FilterSectionValues, value: any) => {
    const newValues = { ...values, [key]: value };
    setValues(newValues);
    setSearchParams(getSearchParamsFromValues(newValues));
    onFilterChange?.(newValues);
  };

  const renderFilters = () => (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:grid-cols-2 xl:grid-cols-5">
      {hasSearchBar && (
        <Input
          width="w-full"
          label="Search"
          type="search"
          placeholder="Search"
          value={values.searchString || ""}
          onChange={(e) => handleFilterChange("searchString", e.target.value)}
        />
      )}
      <Select
        width="w-full"
        label="Seasons"
        items={[EMPTY_SEASON, ...(seasons || [])]}
        renderItem={(s) =>
          s !== undefined && s.id >= 0 ? `S${s.id} - ${s.name}` : s?.name
        }
        selected={
          seasons?.find((s) => s.id === values.seasonId) || EMPTY_SEASON
        }
        onChange={(s) => handleFilterChange("seasonId", s?.id)}
      />
      <Select
        width="w-full"
        label="Faction"
        items={[EMPTY_FACTION, ...(factions || [])]}
        renderItem={renderFactionItem}
        selected={
          factions?.find((f) => f.code === values.faction) || EMPTY_FACTION
        }
        onChange={(f) => handleFilterChange("faction", f?.code)}
      />
      <Select
        width="w-full"
        label="Format"
        items={formats || []}
        renderItem={(f) => f}
        selected={values.format}
        onChange={(f) => handleFilterChange("format", f)}
      />
      <ComboBox
        width="w-full"
        label="Tags"
        items={tags || []}
        selected={
          tags?.filter((t) => values.tags?.includes(t.normalized)) || []
        }
        renderItem={(tag) => tag?.name}
        onChange={(selectedTags) =>
          handleFilterChange(
            "tags",
            selectedTags.map((t) => t.normalized),
          )
        }
        preProcess={(items, query) =>
          items.filter((tag) => tag?.normalized.includes(query.toLowerCase()))
        }
        itemToString={(tags) => (tags || []).map((tag) => tag.name).join(",")}
        placeholder="Tag Filter..."
        multiple={true}
        nullable={true}
      />
    </div>
  );

  return (
    <>
      <Disclosure
        as="div"
        className="my-4 block rounded-lg border border-gray-700 sm:hidden"
      >
        {({ open }) => (
          <>
            <Disclosure.Button
              className={clsx(
                open ? "rounded-t-lg" : "rounded-lg",
                "flex w-full justify-between bg-gray-900 px-4 py-2 text-left font-medium text-cyan-400 text-md hover:bg-cyan-600 hover:text-gray-950 focus:outline-none focus-visible:ring focus-visible:ring-cyan-500",
              )}
            >
              <span>Filters</span>
              <ChevronUpIcon
                className={clsx(open && "rotate-180 transform", "h-5 w-5")}
              />
            </Disclosure.Button>
            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Disclosure.Panel className="px-4 pt-4 pb-2 text-gray-500 text-sm">
                {renderFilters()}
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>

      <div className="hidden sm:block">{renderFilters()}</div>
    </>
  );
}
