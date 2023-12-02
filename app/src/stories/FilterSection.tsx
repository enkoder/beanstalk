import { Select } from "./Select";
import { Input } from "./Input";
import {
  Faction,
  Format,
  LeaderboardService,
  Season,
  SeasonsService,
} from "../client";
import { useSearchParams } from "react-router-dom";
import {
  ChangeEvent,
  HTMLAttributes,
  useCallback,
  useEffect,
  useState,
} from "react";

const DEFAULT_SEASON = 1;
export const SEASON_PARAM_NAME = "season";
export const FACTION_PARAM_NAME = "factionCode";
export const FORMAT_PARAM_NAME = "formatCode";
export const SEARCH_PARAM_NAME = "search";

type FilterSectionProps = HTMLAttributes<HTMLDivElement> & {
  hasSearchBar: boolean;
  onParamChange: (_: FilterSectionValues) => void;
};

export type FilterSectionValues = {
  searchString: string;
  seasonId: number;
  format: Format | undefined;
  faction: string | undefined;
};

export function getFilterValues(sp: URLSearchParams): FilterSectionValues {
  const searchString = sp.get(SEARCH_PARAM_NAME) || "";
  const seasonId = Number(sp.get(SEASON_PARAM_NAME) || DEFAULT_SEASON);
  const faction = sp.get(FACTION_PARAM_NAME) || undefined;
  const format = sp.get(FORMAT_PARAM_NAME) || undefined;
  return { searchString, seasonId, format, faction };
}

export function getSearchParamsFromValues(
  values: FilterSectionValues,
  base: string = "",
) {
  const sp = new URLSearchParams(base);
  sp.set(SEASON_PARAM_NAME, String(values.seasonId));

  if (values.searchString) {
    sp.set(SEARCH_PARAM_NAME, values.searchString);
  }
  if (values.faction) {
    sp.set(FACTION_PARAM_NAME, values.faction);
  }
  if (values.format) {
    sp.set(FORMAT_PARAM_NAME, values.format);
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

  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number>(
    values.seasonId,
  );

  const [factions, setFactions] = useState<Faction[]>([]);
  const [selectedFaction, setSelectedFaction] = useState<string | undefined>(
    values.faction,
  );

  const [formats, setFormats] = useState<Format[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<string | undefined>(
    values.format,
  );

  const fetchFactions = useCallback(async () => {
    LeaderboardService.getGetFactions().then((factions) => {
      setFactions(factions);
    });
  }, []);

  const fetchSeasons = useCallback(async () => {
    SeasonsService.getGetSeasons().then((seasons) => {
      setSeasons(seasons);
    });
  }, []);

  const fetchFormats = useCallback(async () => {
    LeaderboardService.getGetFormats().then((formats) => {
      setFormats(formats);
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

  const handleSeasonChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { value } = event.target;

    if (value) {
      searchParams.set(SEASON_PARAM_NAME, value);
      setSelectedSeasonId(Number(value));
    } else {
      searchParams.delete(SEASON_PARAM_NAME);
    }

    setSearchParams(searchParams);
  };

  const handleFormatChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { value } = event.target;

    if (value) {
      searchParams.set(FORMAT_PARAM_NAME, value);
    } else {
      searchParams.delete(FORMAT_PARAM_NAME);
    }

    setSearchParams(searchParams);
    setSelectedFormat(value);
  };

  const handleFactionChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { value } = event.target;

    if (value) {
      searchParams.set(FACTION_PARAM_NAME, value);
    } else {
      searchParams.delete(FACTION_PARAM_NAME);
    }

    setSearchParams(searchParams);
    setSelectedFaction(value);
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
    <div className={"grid grid-cols-2 gap-6 lg:flex lg:flex-row lg:gap-4"}>
      <Select
        className={"h-12 w-full rounded-3xl"}
        label={"Seasons"}
        onChange={handleSeasonChange}
      >
        {seasons.map((s, i) => (
          <option value={i} selected={i == selectedSeasonId}>
            {i ? `S${i} - ${s.name}` : s.name}
          </option>
        ))}
      </Select>
      <Select
        initialOptionText={"Faction Filter..."}
        className={"h-12 w-full rounded-3xl"}
        label={"Faction"}
        onChange={handleFactionChange}
      >
        {factions.map((f) => (
          <option
            value={f.code}
            data-name={FACTION_PARAM_NAME}
            selected={f.code == selectedFaction}
          >
            {f.name != "Neutral" ? f.name : `${f.name} ${f.side_code}`}
          </option>
        ))}
      </Select>
      <Select
        initialOptionText={"Format Filter..."}
        className={"h-12 w-full rounded-3xl"}
        label={"Format"}
        onChange={handleFormatChange}
      >
        {formats.map((f) => (
          <option
            value={f}
            data-name={FORMAT_PARAM_NAME}
            selected={f == selectedFormat}
          >
            {f}
          </option>
        ))}
      </Select>
      {hasSearchBar && (
        <Input
          className={"h-12 w-full rounded-3xl"}
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
