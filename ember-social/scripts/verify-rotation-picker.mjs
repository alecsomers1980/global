import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadEnv(file) {
	for (const raw of readFileSync(resolve(file), 'utf8').split('\n')) {
		const m = raw.replace(/\r$/, '').match(/^([A-Z0-9_]+)=(.*)$/)
		if (!m) continue
		let v = m[2]; if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1)
		process.env[m[1]] = v
	}
}
loadEnv('.env.local')

const { pickRotationSeats } = await import('../src/lib/rotation/pillarHistory.ts')
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

const WORKSPACE_ID = process.argv[2]
if (!WORKSPACE_ID) { console.error('Usage: node scripts/verify-rotation-picker.mjs <workspaceId>'); process.exit(1) }

const seats = await pickRotationSeats(supabase, WORKSPACE_ID)
console.log('Rotation seats picked:', seats)
if (seats.length !== 2 || seats[0] === seats[1]) {
	console.error('FAIL: expected 2 distinct pillars')
	process.exit(1)
}
console.log('OK: 2 distinct pillars returned')
