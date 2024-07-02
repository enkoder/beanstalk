import type { Format } from "./client";

export const SEASON_PARAM_NAME = "season";
export const FORMAT_PARAM_NAME = "formatCode";
export const TAGS_PARAM_NAME = "tags";
export const SEARCH_PARAM_NAME = "search";
export const FACTION_PARAM_NAME = "factionCode";

export interface FilterSectionValues {
  searchString?: string;
  seasonId?: number;
  format?: Format;
  faction?: string;
  tags?: string[];
}

export function getFilterValues(sp: URLSearchParams): FilterSectionValues {
  return {
    searchString: sp.get(SEARCH_PARAM_NAME) || undefined,
    seasonId: sp.get(SEASON_PARAM_NAME)
      ? Number(sp.get(SEASON_PARAM_NAME))
      : undefined,
    faction: sp.get(FACTION_PARAM_NAME) || undefined,
    format: (sp.get(FORMAT_PARAM_NAME) as Format) || "standard",
    tags: sp.getAll(TAGS_PARAM_NAME) || [],
  };
}

export function getSearchParamsFromValues(
  values: FilterSectionValues,
  base = "",
): URLSearchParams {
  const sp = new URLSearchParams(base);
  if (values.searchString) sp.set(SEARCH_PARAM_NAME, values.searchString);
  if (values.seasonId !== undefined)
    sp.set(SEASON_PARAM_NAME, String(values.seasonId));
  if (values.format) sp.set(FORMAT_PARAM_NAME, values.format);
  if (values.faction) sp.set(FACTION_PARAM_NAME, values.faction);
  for (const tag of values.tags || []) {
    sp.append(TAGS_PARAM_NAME, tag);
  }
  return sp;
}
