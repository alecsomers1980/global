import fs from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Local, per-machine record of which vehicles the dealer has marked as already
 * listed on each portal. Stored in %APPDATA% so it survives app reinstalls.
 * (Manual flags only — the scrape endpoint provides live cross-check.)
 */

export type Portal = "carscoza" | "autotrader";
type Store = Record<string, { carscoza?: string; autotrader?: string }>; // id -> portal -> ISO date

const dir = path.join(process.env.APPDATA || os.homedir(), "EverestSyndicationAgent");
const file = path.join(dir, "listed.json");

function read(): Store {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8")) as Store;
  } catch {
    return {};
  }
}

function write(s: Store): void {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(s, null, 2), "utf8");
}

export function getListedFlags(): Store {
  return read();
}

export function setListed(id: string, portal: Portal, listed: boolean): void {
  const s = read();
  s[id] = s[id] || {};
  if (listed) s[id][portal] = new Date().toISOString();
  else delete s[id][portal];
  if (!s[id].carscoza && !s[id].autotrader) delete s[id];
  write(s);
}
