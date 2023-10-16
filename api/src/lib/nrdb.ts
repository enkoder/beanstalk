import { parse } from "node-html-parser";
import { z } from "zod";
import { error } from "itty-router";

export const NRDBUser = z.object({
  name: z.string(),
});
export type NRDBUserType = z.infer<typeof NRDBUser>;

const NRDB_BASE_URL = "https://netrunnerdb.com/en/profile";

export async function getNameFromId(id: number): Promise<string> {
  const url = new URL(`${NRDB_BASE_URL}/${id}`);
  const resp = await fetch(url.toString());
  if (!resp.ok) {
    throw error(400, "Could not fetch html from nrdb.");
  }
  // using the title parsed from the HTML page for now. It's fragile, probably won't work long term
  // for example - enkoder &middot; NetrunnerDB
  const html = parse(await resp.text());
  return html.querySelector("title").innerText.split("&middot;")[0].trim();
}
