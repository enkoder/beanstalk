import { useQuery } from "@tanstack/react-query";
import { clsx } from "clsx";
import { ChangeEvent, HTMLAttributes, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Factions } from "../../../api/src/models/factions";
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
  LeaderboardService,
  Season,
  SeasonsService,
  Tag,
  TagsService,
} from "../client";
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
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const FACTION_ICONS: Record<string, any> = {
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

  const { data: tags } = useQuery<Tag[]>({
    queryKey: ["tags"],
    queryFn: () => TagsService.getGetTags(),
  });
  const [selectedTags, setSelectedTags] = useState<Tag[] | undefined>([]);

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
    if (tags && values.tags !== undefined && values.tags.length > 0) {
      const foundTags: Tag[] = [];
      for (const tag of tags || []) {
        for (const spTag of values.tags) {
          if (tag.normalized === spTag) {
            foundTags.push(tag);
          }
        }
      }
      setSelectedTags(foundTags);
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

  const handleTagsChange = (tags: Tag[] | undefined) => {
    searchParams.delete(TAGS_PARAM_NAME);
    if (tags?.length) {
      for (const tag of tags || []) {
        searchParams.append(TAGS_PARAM_NAME, tag.normalized);
      }
    }

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

  return (
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
        itemFilter={(tag, query) =>
          tag?.normalized.includes(query.replace(/\s+/g, "").toLowerCase()) ||
          false
        }
        itemToString={(tag) => tag?.name || ""}
        placeholder="Tag Filter..."
      />
    </div>
  );
}
