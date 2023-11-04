import { parse } from "node-html-parser";
import { z } from "zod";
import { error } from "itty-router";
import { HttpError } from "./errors";
import { PrivateAccountInfo, PrivateAccountInfoType } from "../openapi";

export const NRDBUser = z.object({
  name: z.string(),
});
export type NRDBUserType = z.infer<typeof NRDBUser>;

const NRDB_BASE_URL = "https://netrunnerdb.com";

export async function getNameFromId(id: number): Promise<string> {
  const url = new URL(`${NRDB_BASE_URL}/en/profile/${id}`);
  const resp = await fetch(url.toString());
  if (!resp.ok) {
    throw error(400, "Could not fetch html from nrdb.");
  }
  // using the title parsed from the HTML page for now. It's fragile, probably won't work long term
  // for example - enkoder &middot; NetrunnerDB
  const html = parse(await resp.text());
  return html.querySelector("title").innerText.split("&middot;")[0].trim();
}

export async function getPrivateAccountInfo(
  token: string,
): Promise<PrivateAccountInfoType> {
  const url = new URL(`${NRDB_BASE_URL}/api/2.0/private/account/info`);
  const resp = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) {
    throw new HttpError(
      401,
      `Could not fetch private info from nrdb api - ${await resp.text()}`,
    );
  }

  const respJson = await resp.json();
  return PrivateAccountInfo.parse(respJson.data[0]);
}
