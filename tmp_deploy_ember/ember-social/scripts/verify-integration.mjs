// Using global fetch
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const everestEnvFile = path.normalize(path.join(__dirname, '../../everest-motoring/.env.local'))

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const content = fs.readFileSync(filePath, 'utf-8')
  const env = {}
  content.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const index = trimmed.indexOf('=')
    if (index > 0) {
      const key = trimmed.slice(0, index).trim()
      const value = trimmed.slice(index + 1).trim()
      env[key] = value
    }
  })
  return env
}

const env = loadEnv(everestEnvFile)
const apiKey = env.EMBER_SOCIAL_API_KEY
const apiUrl = env.EMBER_SOCIAL_URL || 'http://localhost:3000'

if (!apiKey) {
  console.error('Missing EMBER_SOCIAL_API_KEY in everest-motoring/.env.local')
  process.exit(1)
}

async function verify() {
  console.log('Sending test post to Ember Social...')
  console.log(`URL: ${apiUrl}/api/trigger`)
  
  const payload = {
    content: "Test Arrival! 🚗💨\n\n2024 Toyota Hilux\nPrice: R 850,000\nMileage: 1,500 km\nBuilt for tough terrains.",
    media_urls: ["https://example.com/hilux.jpg"],
    platforms: ['facebook', 'instagram']
  }

  try {
    const response = await fetch(`${apiUrl}/api/trigger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (response.ok) {
      console.log('SUCCESS!')
      console.log('Response:', data)
      console.log('\nNow check the Ember Social Dashboard at http://localhost:3000/dashboard')
    } else {
      console.error('FAILED!')
      console.error('Status:', response.status)
      console.error('Error:', data.error)
    }
  } catch (error) {
    console.error('CONNECTION ERROR!')
    console.error(error.message)
    console.log('\nMake sure the Ember Social dev server is running at', apiUrl)
  }
}

verify()
