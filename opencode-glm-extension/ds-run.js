// Runner: node ds-run.js <promptFile> <outFile>
// Sends prompt file contents to DeepSeek via the local proxy, writes raw text to outFile.
const fs = require('fs');
const { callDeepSeek } = require('./ds-agent');

const [, , promptFile, outFile] = process.argv;
if (!promptFile || !outFile) {
  console.error('Usage: node ds-run.js <promptFile> <outFile>');
  process.exit(1);
}

const prompt = fs.readFileSync(promptFile, 'utf8');

(async () => {
  try {
    const { text, usage, stop_reason } = await callDeepSeek(prompt);
    fs.writeFileSync(outFile, text, 'utf8');
    console.log(`OK -> ${outFile} (${text.length} chars) stop=${stop_reason} in=${usage?.input_tokens} out=${usage?.output_tokens}`);
  } catch (e) {
    console.error('DS ERROR:', e.message);
    process.exit(1);
  }
})();
