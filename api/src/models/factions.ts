import { Faction, FactionCode } from "../schema.js";

export const Factions = {
  Anarch: {
    code: "anarch",
    color: "FF4500",
    is_mini: false,
    name: "Anarch",
    side_code: "runner",
  } as Faction,
  Criminal: {
    code: "criminal",
    color: "4169E1",
    is_mini: false,
    name: "Criminal",
    side_code: "runner",
  } as Faction,
  Shaper: {
    code: "shaper",
    color: "32CD32",
    is_mini: false,
    name: "Shaper",
    side_code: "runner",
  } as Faction,
  NeutralRunner: {
    code: "neutral-runner",
    color: "808080",
    is_mini: false,
    name: "Neutral",
    side_code: "runner",
  } as Faction,
  HaasBioroid: {
    code: "haas-bioroid",
    color: "8A2BE2",
    is_mini: false,
    name: "Haas-Bioroid",
    side_code: "corp",
  } as Faction,
  Jinteki: {
    code: "jinteki",
    color: "DC143C",
    is_mini: false,
    name: "Jinteki",
    side_code: "corp",
  } as Faction,
  NBN: {
    code: "nbn",
    color: "FF8C00",
    is_mini: false,
    name: "NBN",
    side_code: "corp",
  } as Faction,
  WeylandConsortium: {
    code: "weyland-consortium",
    color: "006400",
    is_mini: false,
    name: "Weyland Consortium",
    side_code: "corp",
  } as Faction,
  NeutralCorp: {
    code: "neutral-corp",
    color: "808080",
    is_mini: false,
    name: "Neutral",
    side_code: "corp",
  } as Faction,
  Apex: {
    code: "apex",
    color: "8C4847",
    is_mini: true,
    name: "Apex",
    side_code: "runner",
  } as Faction,
  Adam: {
    code: "adam",
    color: "A79C59",
    is_mini: true,
    name: "Adam",
    side_code: "runner",
  } as Faction,
  SunnyLebeau: {
    code: "sunny-lebeau",
    color: "6E6E6E",
    is_mini: true,
    name: "Sunny Lebeau",
    side_code: "runner",
  } as Faction,
};

export function getFactionFromCode(code: FactionCode): Faction {
  for (const factionName in Factions) {
    if (Factions[factionName].code == code) {
      return Factions[factionName];
    }
  }
  throw new Error(`Invalid faction code ${code}. How did ts not catch this??`);
}
