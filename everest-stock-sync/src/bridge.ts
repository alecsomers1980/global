import "dotenv/config";
import { createServer } from "http";
import { spawn } from "child_process";
import path from "path";
import { log } from "./lib/logger.js";
import { dashboardHtml } from "./dashboard.js";
import { fetchVehicles, type VehicleListItem } from "./lib/supabase.js";
import { getListedFlags, setListed, type Portal } from "./lib/listedStore.js";
import { getPortalListings } from "./lib/scrapeListed.js";

// Does a scraped listing row text describe this vehicle? Requires year + make +
// the first model word to all appear (loose but avoids false positives).
const normText = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
function listingMatches(text: string, v: VehicleListItem): boolean {
  const t = normText(text);
  if (v.year && !t.includes(String(v.year))) return false;
  if (v.make && !t.includes(normText(v.make))) return false;
  const modelTok = (v.model || "").split(/\s+/)[0];
  if (modelTok && !t.includes(normText(modelTok))) return false;
  return Boolean(v.year || v.make);
}

const PORT = parseInt(process.env.BRIDGE_PORT || "8799", 10);
const ALLOW_ORIGINS = (
  process.env.BRIDGE_ALLOW_ORIGINS ||
  "http://localhost:3000,https://everestmotoring.co.za,https://www.everestmotoring.co.za"
)
  .split(",")
  .map((o) => o.trim());

let busy = false;

function isAllowedOrigin(origin: string): boolean {
  if (ALLOW_ORIGINS.includes(origin)) return true;
  // Allow any local dev origin regardless of port (next dev may use 3000/3001/…).
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function getCorsOrigin(origin?: string): string {
  if (origin && isAllowedOrigin(origin)) return origin;
  return ALLOW_ORIGINS[0];
}

function setCorsHeaders(res: import("http").ServerResponse, origin?: string) {
  res.setHeader("Access-Control-Allow-Origin", getCorsOrigin(origin));
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function respond(
  res: import("http").ServerResponse,
  status: number,
  payload: unknown,
  origin?: string,
) {
  setCorsHeaders(res, origin);
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

const server = createServer((req, res) => {
  const origin = req.headers.origin;
  const { method } = req;
  const parsedUrl = new URL(req.url!, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // Preflight
  if (method === "OPTIONS") {
    setCorsHeaders(res, origin);
    res.writeHead(204);
    res.end();
    return;
  }

  // Health check
  if (method === "GET" && pathname === "/health") {
    respond(res, 200, { ok: true }, origin);
    return;
  }

  // Local dashboard (served to the dealer's own browser).
  if (method === "GET" && (pathname === "/" || pathname === "/index.html")) {
    setCorsHeaders(res, origin);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(dashboardHtml);
    return;
  }

  // Stock list for the dashboard (with each car's manual "listed" flags merged).
  if (method === "GET" && pathname === "/vehicles") {
    fetchVehicles()
      .then((vehicles) => {
        const flags = getListedFlags();
        const merged = vehicles.map((v) => ({
          ...v,
          carscoza_listed: Boolean(flags[v.id]?.carscoza),
          autotrader_listed: Boolean(flags[v.id]?.autotrader),
        }));
        respond(res, 200, { ok: true, vehicles: merged }, origin);
      })
      .catch((err) => respond(res, 500, { ok: false, error: String(err?.message || err) }, origin));
    return;
  }

  // Manual toggle: mark/unmark a vehicle as listed on a portal.
  if (method === "POST" && pathname === "/mark-listed") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      let p: { id?: string; portal?: Portal; listed?: boolean };
      try {
        p = JSON.parse(body);
      } catch {
        return respond(res, 400, { ok: false, error: "invalid json" }, origin);
      }
      if (!p.id || (p.portal !== "carscoza" && p.portal !== "autotrader")) {
        return respond(res, 400, { ok: false, error: "id and portal (carscoza|autotrader) required" }, origin);
      }
      setListed(p.id, p.portal, Boolean(p.listed));
      respond(res, 200, { ok: true }, origin);
    });
    return;
  }

  // Auto-detect: scrape each portal's live stock and return matched vehicle ids.
  if (method === "GET" && pathname === "/listed") {
    if (busy) {
      respond(res, 409, { ok: false, busy: true, error: "A run is already in progress" }, origin);
      return;
    }
    busy = true;
    (async () => {
      try {
        const [listings, vehicles] = await Promise.all([getPortalListings(), fetchVehicles()]);
        const carscoza = vehicles.filter((v) => listings.carscoza.some((t) => listingMatches(t, v))).map((v) => v.id);
        const autotrader = vehicles.filter((v) => listings.autotrader.some((t) => listingMatches(t, v))).map((v) => v.id);
        respond(res, 200, { ok: true, carscoza, autotrader }, origin);
      } catch (err) {
        respond(res, 500, { ok: false, error: String((err as Error)?.message || err) }, origin);
      } finally {
        busy = false;
      }
    })();
    return;
  }

  // Create routes
  if (
    method === "POST" &&
    (pathname === "/create/carscoza" || pathname === "/create/autotrader")
  ) {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      let payload: { id?: string; stock?: string; submit?: boolean };
      try {
        payload = JSON.parse(body);
      } catch {
        respond(res, 400, { ok: false, error: "invalid json" }, origin);
        return;
      }

      if (!payload.id && !payload.stock) {
        respond(res, 400, { ok: false, error: "id or stock required" }, origin);
        return;
      }

      if (busy) {
        respond(
          res,
          409,
          {
            ok: false,
            busy: true,
            error: "A syndication run is already in progress",
          },
          origin,
        );
        return;
      }

      busy = true;

      const scriptMap: Record<string, string> = {
        "/create/carscoza": "src/create-carscoza.ts",
        "/create/autotrader": "src/create-autotrader.ts",
      };
      const script = scriptMap[pathname];

      // Use the running Node + local tsx CLI (no npx/npm) so this also works
      // when packaged with a bundled node.exe and no global tooling.
      const tsxCli = path.join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");
      const child = spawn(process.execPath, [tsxCli, script], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          VEHICLE_ID: payload.id || "",
          VEHICLE_STOCK: payload.stock || "",
          SUBMIT: payload.submit ? "true" : "",
        },
      });

      let output = "";
      let responded = false;

      const sendOnce = (status: number, bodyObj: unknown) => {
        if (!responded) {
          responded = true;
          busy = false;
          respond(res, status, bodyObj, origin);
        }
      };

      child.stdout?.on("data", (data) => {
        const text = data.toString();
        output += text;
        log("info", text.trim());
      });

      child.stderr?.on("data", (data) => {
        const text = data.toString();
        output += text;
        log("info", text.trim());
      });

      child.on("close", (code) => {
        sendOnce(200, {
          ok: code === 0,
          exitCode: code,
          log: output.slice(-4000),
        });
      });

      child.on("error", (err) => {
        sendOnce(500, {
          ok: false,
          error: err.message,
        });
      });
    });

    req.on("error", (err) => {
      log("error", `Request error: ${err.message}`);
      if (!res.writableEnded) {
        respond(res, 500, { ok: false, error: "request error" }, origin);
      }
    });
    return;
  }

  // Not found
  respond(res, 404, { ok: false, error: "not found" }, origin);
});

server.listen(PORT, () => {
  log(
    "ok",
    `Bridge server listening on port ${PORT}, allowed origins: ${ALLOW_ORIGINS.join(", ")}`,
  );
});
