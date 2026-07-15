// CLI wrapper so the standalone bash scripts (render_reel.sh / finalize_reel.sh)
// can draw from the same rotating music pool as render-project.mjs. Prints the
// chosen track's absolute path to stdout.
import { pickMusic } from './music-picker.mjs';
// Forward slashes: this path is captured into a bash var and later re-expanded
// via `eval` in finalize_reel.sh, which strips backslashes as escape characters.
process.stdout.write(pickMusic().replace(/\\/g, '/'));
