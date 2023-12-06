import { Select } from "./Select";
import { Input } from "./Input";
import {
  Faction,
  Format,
  LeaderboardService,
  Season,
  SeasonsService,
} from "../client";
import { Factions } from "../../../api/src/models/factions";
import adamIcon from "../../assets/factions/adam.png";
import sunnyIcon from "../../assets/factions/sunny-lebeau.png";
import apexIcon from "../../assets/factions/apex.png";
import shaperIcon from "../../assets/factions/shaper.png";
import crimIcon from "../../assets/factions/criminal.png";
import anarchIcon from "../../assets/factions/anarch.png";
import hbIcon from "../../assets/factions/haas-bioroid.png";
import jintekiIcon from "../../assets/factions/jinteki.png";
import nbnIcon from "../../assets/factions/nbn.png";
import weylandIcon from "../../assets/factions/weyland-consortium.png";
import neutralRunnerIcon from "../../assets/factions/neutral-runner.png";
import neutralCorpIcon from "../../assets/factions/neutral-corp.png";
import { useSearchParams } from "react-router-dom";
import {
  ChangeEvent,
  HTMLAttributes,
  useCallback,
  useEffect,
  useState,
} from "react";

export const SEASON_PARAM_NAME = "season";
const EMPTY_SEASON = {
  id: -1,
  name: "Season Filter...",
  started_at: "",
} as Season;

export const FACTION_PARAM_NAME = "factionCode";
const EMPTY_FACTION = {
  code: "",
  color: "",
  is_mini: false,
  name: "Faction Filter...",
  side_code: "",
} as Faction;
const FACTION_ICONS: Record<string, any> = {
  [Factions.Adam.code]: adamIcon,
  [Factions.SunnyLebeau.code]: sunnyIcon,
  [Factions.Apex.code]: apexIcon,
  [Factions.Shaper.code]: shaperIcon,
  [Factions.Criminal.code]: crimIcon,
  [Factions.Anarch.code]: anarchIcon,
  [Factions.NeutralRunner.code]: neutralRunnerIcon,
  [Factions.Jinteki.code]: jintekiIcon,
  [Factions.HaasBioroid.code]: hbIcon,
  [Factions.NBN.code]: nbnIcon,
  [Factions.WeylandConsortium.code]: weylandIcon,
  [Factions.NeutralCorp.code]: neutralCorpIcon,
};

export const FORMAT_PARAM_NAME = "formatCode";
const EMPTY_FORMAT = "Format Filter...";

export const SEARCH_PARAM_NAME = "search";

type FilterSectionProps = HTMLAttributes<HTMLDivElement> & {
  hasSearchBar: boolean;
  onParamChange: (_: FilterSectionValues) => void;
};

export type FilterSectionValues = {
  searchString?: string;
  seasonId?: number;
  format?: Format;
  faction?: string;
};

export function getFilterValues(sp: URLSearchParams): FilterSectionValues {
  const searchString = sp.get(SEARCH_PARAM_NAME) || undefined;
  const seasonId = sp.get(SEASON_PARAM_NAME)
    ? Number(sp.get(SEASON_PARAM_NAME))
    : undefined;
  const faction = sp.get(FACTION_PARAM_NAME) || undefined;
  const format = (sp.get(FORMAT_PARAM_NAME) as Format) || undefined;
  return { searchString, seasonId, format, faction };
}

export function getSearchParamsFromValues(
  values: FilterSectionValues,
  base: string = "",
) {
  const sp = new URLSearchParams(base);
  if (values.searchString) {
    sp.set(SEARCH_PARAM_NAME, values.searchString);
  }
  if (values.seasonId != undefined) {
    sp.set(SEASON_PARAM_NAME, String(values.seasonId));
  }
  if (values.format) {
    sp.set(FORMAT_PARAM_NAME, values.format);
  }
  if (values.faction) {
    sp.set(FACTION_PARAM_NAME, values.faction);
  }
  return sp;
}

export function FilterSection({
  hasSearchBar,
  onParamChange: onParamsChange,
}: FilterSectionProps) {
  const [searchParams, setSearchParams] = useSearchParams();

  const values = getFilterValues(searchParams);
  const [searchString, setSearchString] = useState<string>("");

  const [seasons, setSeasons] = useState<Season[]>([EMPTY_SEASON]);
  const [selectedSeason, setSelectedSeason] = useState<Season | undefined>(
    EMPTY_SEASON,
  );

  const [factions, setFactions] = useState<Faction[]>([EMPTY_FACTION]);
  const [selectedFaction, setSelectedFaction] = useState<Faction | undefined>(
    EMPTY_FACTION,
  );

  const [formats, setFormats] = useState<string[]>([EMPTY_FORMAT]);
  const [selectedFormat, setSelectedFormat] = useState<string | undefined>(
    EMPTY_FORMAT,
  );

  const fetchFactions = useCallback(async () => {
    LeaderboardService.getGetFactions().then((factions) => {
      setFactions([EMPTY_FACTION, ...factions]);
      for (const f of factions) {
        if (values.faction == f.code) {
          setSelectedFaction(f);
        }
      }
    });
  }, []);

  const fetchSeasons = useCallback(async () => {
    SeasonsService.getGetSeasons().then((seasons) => {
      setSeasons([EMPTY_SEASON, ...seasons]);
      if (values.seasonId != undefined) {
        setSelectedSeason(seasons[values.seasonId]);
      }
    });
  }, []);

  const fetchFormats = useCallback(async () => {
    LeaderboardService.getGetFormats().then((formats) => {
      setFormats([EMPTY_FORMAT, ...formats]);
      for (const f of formats) {
        if (values.format == f) {
          setSelectedFormat(f);
        }
      }
    });
  }, []);

  // fetches initial resources
  useEffect(() => {
    fetchSeasons().catch((e) => console.log(e));
    fetchFactions().catch((e) => console.log(e));
    fetchFormats().catch((e) => console.log(e));
    return () => {};
  }, []);

  useEffect(() => {
    // put a small debounce on the request since entering a value in the searchbar will trigger
    const getLeaderboard = setTimeout(() => {
      onParamsChange(values);
    }, 200);
    return () => clearTimeout(getLeaderboard);
  }, [searchParams]);

  const handleSeasonChange = (s: Season | undefined) => {
    if (s != undefined && s.id >= 0) {
      searchParams.set(SEASON_PARAM_NAME, String(s.id));
    } else {
      searchParams.delete(SEASON_PARAM_NAME);
    }

    setSearchParams(searchParams);
    setSelectedSeason(s);
  };

  const handleFactionChange = (f: Faction | undefined) => {
    if (f != undefined && f.code) {
      searchParams.set(FACTION_PARAM_NAME, f.code);
    } else {
      searchParams.delete(FACTION_PARAM_NAME);
    }

    setSearchParams(searchParams);
    setSelectedFaction(f);
  };

  const handleFormatChange = (f: string | undefined) => {
    if (f == EMPTY_FORMAT || f == undefined) {
      searchParams.delete(FORMAT_PARAM_NAME);
    } else {
      searchParams.set(FORMAT_PARAM_NAME, f);
    }

    setSearchParams(searchParams);
    setSelectedFormat(f);
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

  return (
    <div
      className={
        "z-1 grid grid-cols-1 gap-x-4 sm:grid-cols-2 xl:flex xl:grid-cols-none xl:flex-row"
      }
    >
      <Select
        width={"w-full"}
        items={seasons}
        renderItem={(s) => {
          return s != undefined && s.id >= 0 ? `S${s.id} - ${s.name}` : s?.name;
        }}
        selected={selectedSeason}
        label={"Seasons"}
        onChange={handleSeasonChange}
      />
      <Select
        width={"w-full"}
        items={factions}
        selected={selectedFaction}
        renderItem={(f) => {
          return (
            <div className={"relative flex flex-row items-center"}>
              <div>
                {f != undefined && f.code in FACTION_ICONS ? (
                  <img
                    className={"left-0 h-4 w-4"}
                    alt={f.code}
                    src={FACTION_ICONS[f.code]}
                  />
                ) : (
                  f?.code != "" && <div className={"h-4 w-4"} />
                )}
              </div>
              <text className={"pl-2"}>{f?.name}</text>
            </div>
          );
        }}
        label={"Faction"}
        onChange={handleFactionChange}
      />
      <Select
        width={"w-full"}
        items={formats}
        renderItem={(f) => {
          return f;
        }}
        selected={selectedFormat}
        label={"Format"}
        onChange={handleFormatChange}
      />
      {hasSearchBar && (
        <Input
          className={"h-12 w-full rounded-lg"}
          label={"Search"}
          type={"search"}
          placeholder="Search"
          onChange={handleSearchStringChange}
          value={searchString}
          data-name={SEARCH_PARAM_NAME}
        />
      )}
    </div>
  );
}
