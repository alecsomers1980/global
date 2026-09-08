import type { ComponentType } from "react";
import {
  BarFridgeIcon,
  KettleIcon,
  AirconIcon,
  FlatscreenTvIcon,
  DstvIcon,
  GardenViewIcon,
  CouchIcon,
  JacuzziIcon,
  FanIcon,
  VerandaIcon,
  BalconyIcon,
  InterlinkingIcon,
  WifiIcon,
  SafeIcon,
  HairdryerIcon,
  NonSmokingIcon,
  MosquitoNetIcon,
  BraaiAreaIcon,
} from "@/components/admin/AmenityIcons";
import { BathIcon } from "@/components/site/DetailIcons";

export type AmenityDef = {
  key: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

// Curated, closed set — 13 entries match real data already in the 8 rooms
// (see the 2026-09-08 design spec), 6 are common guesthouse toggles added
// even though unused today. Adding a new amenity later means adding one
// entry here, not an admin-facing "custom" feature (deliberate trade-off,
// approved in the spec).
export const AMENITIES: AmenityDef[] = [
  { key: "bar_fridge", label: "Bar fridge", Icon: BarFridgeIcon },
  { key: "kettle", label: "Kettle", Icon: KettleIcon },
  { key: "aircon", label: "Air-con", Icon: AirconIcon },
  { key: "flatscreen_tv", label: "Flat-screen TV", Icon: FlatscreenTvIcon },
  { key: "dstv", label: "DStv", Icon: DstvIcon },
  { key: "garden_view", label: "Garden view", Icon: GardenViewIcon },
  { key: "couch", label: "Couch", Icon: CouchIcon },
  { key: "ensuite", label: "En-suite bathroom", Icon: BathIcon },
  { key: "jacuzzi", label: "Jacuzzi", Icon: JacuzziIcon },
  { key: "fan", label: "Fan", Icon: FanIcon },
  { key: "veranda", label: "Veranda", Icon: VerandaIcon },
  { key: "balcony", label: "Balcony", Icon: BalconyIcon },
  { key: "interlinking", label: "Interlinking rooms", Icon: InterlinkingIcon },
  { key: "wifi", label: "WiFi", Icon: WifiIcon },
  { key: "safe", label: "Safe", Icon: SafeIcon },
  { key: "hairdryer", label: "Hairdryer", Icon: HairdryerIcon },
  { key: "non_smoking", label: "Non-smoking", Icon: NonSmokingIcon },
  { key: "mosquito_net", label: "Mosquito net", Icon: MosquitoNetIcon },
  { key: "braai_area", label: "Braai area", Icon: BraaiAreaIcon },
];

export function findAmenityByLabel(label: string): AmenityDef | undefined {
  return AMENITIES.find((a) => a.label === label);
}
