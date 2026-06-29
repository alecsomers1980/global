import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { log } from "./logger.js";

/**
 * Download image URLs to a temp folder and return the local file paths, in
 * order. Failed downloads are skipped (and logged), not fatal.
 */
export async function downloadImages(urls: string[]): Promise<string[]> {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "everest-photos-"));
  const paths: string[] = [];
  let i = 0;
  for (const url of urls) {
    i++;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        log("warn", `  image ${i} download failed: ${res.status}`);
        continue;
      }
      const ext = (url.split("?")[0].match(/\.(jpe?g|png|webp)$/i)?.[1] ?? "jpg").toLowerCase();
      const file = path.join(dir, `${String(i).padStart(2, "0")}.${ext}`);
      fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
      paths.push(file);
    } catch (err) {
      log("warn", `  image ${i} download error`, err);
    }
  }
  log("info", `  downloaded ${paths.length}/${urls.length} image(s) to ${dir}`);
  return paths;
}
