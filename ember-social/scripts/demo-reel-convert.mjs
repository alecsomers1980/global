import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import ffmpegPath from 'ffmpeg-static'

const videoUrl = 'https://customer-n0h1tl1ja253bs5w.cloudflarestream.com/717f0a10a1eaa251887a55f62bcb8883/downloads/default.mp4'
const outDir = path.join(process.env.TEMP || '/tmp', 'everest-reel-demo')

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

const inputFile = path.join(outDir, 'original.mp4')
const outputFile = path.join(outDir, 'reel-9x16.mp4')

// Download
console.log('Downloading video...')
const curlCmd = `curl -L -o "${inputFile}" "${videoUrl}"`
execSync(curlCmd, { stdio: 'inherit' })

const inStats = fs.statSync(inputFile)
console.log(`Downloaded: ${(inStats.size / 1024 / 1024).toFixed(1)} MB`)

// Convert: 16:9 → 9:16 with blurred background padding
//  1. Scale input to fit 1080 width
//  2. Split → one stays sharp, one gets blurred + expanded to 1080x1920
//  3. Overlay sharp centered on the full-frame blurred background
console.log('Converting to 9:16 reel format (1080x1920 with blur padding)...')

const filter = [
    '[0:v]scale=1080:-1[sharp]',
    '[sharp]split[sharp2][forblur]',
    '[forblur]boxblur=20:8,scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[bg]',
    '[bg][sharp2]overlay=(W-w)/2:(H-h)/2[out]'
].join(';')

execSync(`"${ffmpegPath}" -i "${inputFile}" -filter_complex "${filter}" -map "[out]" -map "0:a" -c:v libx264 -preset fast -crf 23 -c:a aac -shortest "${outputFile}"`, {
    stdio: 'inherit',
    timeout: 300000,
})

const outStats = fs.statSync(outputFile)
console.log(`\nOutput: ${(outStats.size / 1024 / 1024).toFixed(1)} MB`)
console.log(`Original: ${inputFile}`)
console.log(`Reel 9:16: ${outputFile}`)
console.log('\nDone! Compare the two files side by side.')
