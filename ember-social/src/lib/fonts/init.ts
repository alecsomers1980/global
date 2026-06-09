import path from "path";
import fs from "fs";

const fontsDir = path.resolve(process.cwd(), "public", "fonts");
const confPath = path.join(fontsDir, "fonts.conf");

if (!process.env.FONTCONFIG_PATH && fs.existsSync(fontsDir)) {
  process.env.FONTCONFIG_PATH = fontsDir;
}

if (!process.env.FONTCONFIG_FILE && fs.existsSync(confPath)) {
  process.env.FONTCONFIG_FILE = confPath;
}

if (process.env.FONTCONFIG_PATH) {
  console.debug(`[fonts/init] fontconfig → ${process.env.FONTCONFIG_PATH}`);
}

export {};
