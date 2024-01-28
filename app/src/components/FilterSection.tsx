import { Disclosure, Transition } from "@headlessui/react";
import { ChevronUpIcon } from "@heroicons/react/20/solid";
import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import {
  ChangeEvent,
  HTMLAttributes,
  ReactNode,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";
import AdamIcon from "../../assets/factions/NSG_ADAM.svg";
import NeutralCorpIcon from "../../assets/factions/NSG_AGENDA.svg";
import AnarchIcon from "../../assets/factions/NSG_ANARCH.svg";
import ApexIcon from "../../assets/factions/NSG_APEX.svg";
import CrimIcon from "../../assets/factions/NSG_CRIMINAL.svg";
import HbIcon from "../../assets/factions/NSG_HB.svg";
import JintekiIcon from "../../assets/factions/NSG_JINTEKI.svg";
import NeutralRunnerIcon from "../../assets/factions/NSG_LINK.svg";
import NbnIcon from "../../assets/factions/NSG_NBN.svg";
import ShaperIcon from "../../assets/factions/NSG_SHAPER.svg";
import SunnyIcon from "../../assets/factions/NSG_SUNNY.svg";
import WeylandIcon from "../../assets/factions/NSG_WEYLAND.svg";
import {
  Faction,
  Format,
  GetTagsResponse,
  LeaderboardService,
  Season,
  SeasonsService,
  TagsService,
} from "../client";
import { Factions } from "../types";
import ComboBox from "./ComboBox";
import { Input } from "./Input";
import { Select } from "./Select";

export const SEASON_PARAM_NAME = "season";
export const FORMAT_PARAM_NAME = "formatCode";
export const TAGS_PARAM_NAME = "tags";
export const SEARCH_PARAM_NAME = "search";
export const FACTION_PARAM_NAME = "factionCode";

const EMPTY_SEASON = {
  id: -1,
  name: "Season Filter...",
  started_at: "",
} as Season;

const EMPTY_FACTION = {
  code: "",
  color: "",
  is_mini: false,
  name: "Faction Filter...",
  side_code: "",
} as Faction;

const ICON_SIZE = "h-6 w-6";
const FACTION_ICONS: Record<string, ReactNode> = {
  [Factions.Adam.code]: (
    <AdamIcon className={ICON_SIZE} width={16} height={16} />
  ),
  [Factions.SunnyLebeau.code]: <SunnyIcon className={ICON_SIZE} />,
  [Factions.Apex.code]: (
    <ApexIcon className={clsx(ICON_SIZE, "fill-red-600")} />
  ),
  [Factions.Shaper.code]: <ShaperIcon className={ICON_SIZE} />,
  [Factions.Criminal.code]: <CrimIcon className={ICON_SIZE} />,
  [Factions.Anarch.code]: <AnarchIcon className={ICON_SIZE} />,
  [Factions.NeutralRunner.code]: (
    <NeutralRunnerIcon className={clsx(ICON_SIZE, "fill-gray-300")} />
  ),
  [Factions.Jinteki.code]: <JintekiIcon className={ICON_SIZE} />,
  [Factions.HaasBioroid.code]: <HbIcon className={ICON_SIZE} />,
  [Factions.NBN.code]: <NbnIcon className={ICON_SIZE} />,
  [Factions.WeylandConsortium.code]: <WeylandIcon className={ICON_SIZE} />,
  [Factions.NeutralCorp.code]: (
    <NeutralCorpIcon className={clsx(ICON_SIZE, "fill-gray-300")} />
  ),
};

type FilterSectionProps = HTMLAttributes<HTMLDivElement> & {
  hasSearchBar: boolean;
};

export type FilterSectionValues = {
  searchString?: string;
  seasonId?: number;
  format?: Format;
  faction?: string;
  tags?: string[];
};

export function getFilterValues(sp: URLSearchParams): FilterSectionValues {
  const searchString = sp.get(SEARCH_PARAM_NAME) || undefined;
  const seasonId = sp.get(SEASON_PARAM_NAME)
    ? Number(sp.get(SEASON_PARAM_NAME))
    : undefined;
  const faction = sp.get(FACTION_PARAM_NAME) || undefined;
  // Default to standard format
  const format = (sp.get(FORMAT_PARAM_NAME) as Format) || "standard";
  const tags = (sp.getAll(TAGS_PARAM_NAME) as string[]) || [];
  return { searchString, seasonId, format, faction, tags };
}

export function getSearchParamsFromValues(
  values: FilterSectionValues,
  base = "",
) {
  const sp = new URLSearchParams(base);
  if (values.searchString) {
    sp.set(SEARCH_PARAM_NAME, values.searchString);
  }
  if (values.seasonId !== undefined) {
    sp.set(SEASON_PARAM_NAME, String(values.seasonId));
  }
  if (values.format) {
    sp.set(FORMAT_PARAM_NAME, values.format);
  }
  if (values.faction) {
    sp.set(FACTION_PARAM_NAME, values.faction);
  }
  for (const tag of values.tags || []) {
    sp.append(TAGS_PARAM_NAME, tag);
  }
  return sp;
}

export function FilterSection({ hasSearchBar }: FilterSectionProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const values = getFilterValues(searchParams);
  const [searchString, setSearchString] = useState<string>("");

  const { data: seasons } = useQuery<Season[]>({
    queryKey: ["seasons"],
    queryFn: () => SeasonsService.getGetSeasons(),
  });
  if (seasons && seasons[0] !== EMPTY_SEASON) seasons.unshift(EMPTY_SEASON);
  const [selectedSeason, setSelectedSeason] = useState<Season | undefined>(
    EMPTY_SEASON,
  );

  const { data: factions } = useQuery<Faction[]>({
    queryKey: ["factions"],
    queryFn: () => LeaderboardService.getGetFactions(),
  });
  if (factions && factions[0] !== EMPTY_FACTION)
    factions.unshift(EMPTY_FACTION);
  const [selectedFaction, setSelectedFaction] = useState<Faction | undefined>(
    EMPTY_FACTION,
  );

  const { data: formats } = useQuery<string[]>({
    queryKey: ["formats"],
    queryFn: () => LeaderboardService.getGetFormats(),
  });

  const [selectedFormat, setSelectedFormat] = useState<string | undefined>(
    "standard",
  );

  const { data: tags } = useQuery<GetTagsResponse[]>({
    queryKey: ["tags"],
    queryFn: () => TagsService.getGetTags(),
  });

  const [selectedTags, setSelectedTags] = useState<GetTagsResponse[]>([]);

  useEffect(() => {
    if (seasons && values.seasonId !== undefined) {
      setSelectedSeason(seasons[values.seasonId + 1]);
    }
    if (factions && values.faction !== undefined) {
      for (const f of factions) {
        if (values.faction === f.code) {
          setSelectedFaction(f);
        }
      }
    }
    if (formats && values.format !== undefined) {
      for (const f of formats) {
        if (values.format === f) {
          setSelectedFormat(f);
        }
      }
    }
    if (values.searchString) {
      setSearchString(values.searchString);
    }
    if (tags && values.tags !== undefined) {
      if (!(selectedTags || []).length) {
        const foundTags: GetTagsResponse[] = [];
        for (const spTag of values.tags) {
          for (const tag of tags || []) {
            if (tag.normalized === spTag) {
              foundTags.push(tag);
            }
          }
        }

        if (foundTags.length) {
          setSelectedTags(foundTags.concat(selectedTags || []));
        }
      }
    }
  }, [values]);

  const handleSeasonChange = (s: Season | undefined) => {
    if (s !== undefined && s.id >= 0) {
      searchParams.set(SEASON_PARAM_NAME, String(s.id));
    } else {
      searchParams.delete(SEASON_PARAM_NAME);
    }

    setSearchParams(searchParams);
    setSelectedSeason(s);
  };

  const handleFactionChange = (f: Faction | undefined) => {
    if (f?.code) {
      searchParams.set(FACTION_PARAM_NAME, f.code);
    } else {
      searchParams.delete(FACTION_PARAM_NAME);
    }

    setSearchParams(searchParams);
    setSelectedFaction(f);
  };

  const handleFormatChange = (f: string | undefined) => {
    if (f) searchParams.set(FORMAT_PARAM_NAME, f);

    setSearchParams(searchParams);
    setSelectedFormat(f);
  };

  const handleTagsChange = (tags: GetTagsResponse[]) => {
    searchParams.delete(TAGS_PARAM_NAME);
    if (tags?.length) {
      for (const tag of tags || []) {
        searchParams.append(TAGS_PARAM_NAME, tag.normalized);
      }
    }

    console.log(tags);
    setSearchParams(searchParams);
    setSelectedTags(tags);
  };

  const handleSearchStringChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;

    if (value) {
      searchParams.set(SEARCH_PARAM_NAME, value);
    } else {
      searchParams.delete(SEARCH_PARAM_NAME);
    }

    setSearchParams(searchParams);
    setSearchString(value);
  };

  const renderFactionItem = (f: Faction | undefined) => {
    let name = f ? f.name : "";
    if (f && f === Factions.NeutralCorp) {
      name = "Neutral Corp";
    }
    if (f && f === Factions.NeutralRunner) {
      name = "Neutral Runner";
    }
    return (
      <div className={"relative flex flex-row items-center"}>
        {f !== undefined && f.code in FACTION_ICONS && FACTION_ICONS[f?.code]}
        <text className={"pl-2"}>{name}</text>
      </div>
    );
  };

  const filters = (
    <div
      className={
        "z-1 grid grid-cols-1 gap-x-4 sm:grid-cols-2 xl:flex xl:grid-cols-none xl:flex-row"
      }
    >
      {hasSearchBar && (
        <Input
          width={"w-full"}
          className={"h-12 rounded-lg"}
          label={"Search"}
          type={"search"}
          placeholder="Search"
          onChange={handleSearchStringChange}
          value={searchString}
          data-name={SEARCH_PARAM_NAME}
        />
      )}
      <Select
        width={"w-full"}
        items={seasons || []}
        renderItem={(s) => {
          return s !== undefined && s.id >= 0
            ? `S${s.id} - ${s.name}`
            : s?.name;
        }}
        selected={selectedSeason}
        label={"Seasons"}
        onChange={handleSeasonChange}
      />
      <Select
        width={"w-full"}
        items={factions || []}
        selected={selectedFaction}
        renderItem={renderFactionItem}
        label={"Faction"}
        onChange={handleFactionChange}
      />
      <Select
        width={"w-full"}
        items={formats || []}
        renderItem={(f) => {
          return f;
        }}
        selected={selectedFormat}
        label={"Format"}
        onChange={handleFormatChange}
      />
      <ComboBox
        width={"w-full"}
        items={tags || []}
        selected={selectedTags}
        renderItem={(tag) => tag?.name}
        label={"Tags"}
        onChange={handleTagsChange}
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
        as={"div"}
        className={"block sm:hidden my-4 border border-gray-700 rounded-lg"}
      >
        {({ open }) => (
          <>
            <Disclosure.Button
              className={clsx(
                open ? "rounded-t-lg" : "rounded-lg",
                "flex w-full justify-between bg-gray-900 px-4 py-2 text-left text-md font-medium text-cyan-400 hover:bg-cyan-600 hover:text-gray-950 focus:outline-none focus-visible:ring focus-visible:ring-cyan-500",
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
              <Disclosure.Panel className="px-4 pb-2 pt-4 text-sm text-gray-500">
                {filters}
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>

      <div className={"hidden sm:block"}>{filters}</div>
    </>
  );
}
