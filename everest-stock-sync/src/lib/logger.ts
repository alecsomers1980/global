/** Tiny structured logger — timestamped lines, easy to grep later. */

type Level = "info" | "warn" | "error" | "ok";

const tag: Record<Level, string> = {
  info: "·",
  ok: "✅",
  warn: "⚠️ ",
  error: "❌",
};

export function log(level: Level, msg: string, extra?: unknown) {
  const ts = new Date().toISOString();
  const line = `${ts} ${tag[level]} ${msg}`;
  if (extra !== undefined) {
    console.log(line, extra);
  } else {
    console.log(line);
  }
}
