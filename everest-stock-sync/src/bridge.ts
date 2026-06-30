import { createServer } from "http";
import { spawn } from "child_process";
import { log } from "./lib/logger.js";

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

  // Create routes
  if (
    method === "POST" &&
    (pathname === "/create/carscoza" || pathname === "/create/autotrader")
  ) {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      let payload: { id?: string; stock?: string };
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

      const child = spawn("npx", ["tsx", script], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          VEHICLE_ID: payload.id || "",
          VEHICLE_STOCK: payload.stock || "",
        },
        shell: true,
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
