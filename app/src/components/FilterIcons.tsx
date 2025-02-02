import { clsx } from "clsx";
import * as React from "react";
import type { ReactNode } from "react";
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
import type { Faction } from "../client";
import { Factions } from "../types";

const ICON_SIZE = "h-6 w-6";

export const FACTION_ICONS: Record<string, ReactNode> = {
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

export const renderFactionItem = (f: Faction | undefined) => {
  let name = f ? f.name : "";
  if (f === Factions.NeutralCorp) name = "Neutral Corp";
  if (f === Factions.NeutralRunner) name = "Neutral Runner";
  return (
    <div className="relative flex flex-row items-center">
      {f !== undefined && f.code in FACTION_ICONS && FACTION_ICONS[f?.code]}
      <span className="pl-2">{name}</span>
    </div>
  );
};
