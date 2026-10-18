/*
 * list-storage.mjs
 *
 *  - kkinit-images bucket 의 모든 object 를 path 와 함께 list 한다.
 *  - 결과를 console 에 table 형태로 출력 + 같은 내용을 .backup/storage-listing.txt 로 저장.
 *  - 잘못 들어간 path (예: map/map/..., feed/feed/...) 를 찾는 1차 진단용.
 *
 *  사용법:
 *    node --env-file=.env scripts/list-storage.mjs
 *    node --env-file=.env scripts/list-storage.mjs --prefix map    (특정 folder 만)
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

let loadedFrom = 'process.env (--env-file)'
try {
  const { config } = await import('dotenv')
  config()
  loadedFrom = 'dotenv fallback'
} catch {}
console.log(`[list] env loaded: ${loadedFrom}`)

const SUPABASE_URL = process.env.NUXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
const BUCKET = process.env.NUXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'kkinit-images'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[list] NUXT_PUBLIC_SUPABASE_URL / NUXT_PUBLIC_SUPABASE_ANON_KEY 가 비어있음.')
  process.exit(1)
}

let createClient
try {
  createClient = (await import('@supabase/supabase-js')).createClient
} catch {
  console.error('[list] @supabase/supabase-js 가 설치되어 있지 않음.')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })

const args = process.argv.slice(2)
let prefix = ''
for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (a === '--prefix') prefix = args[++i]
  else if (a === '-h' || a === '--help') {
    console.log('Usage: node --env-file=.env scripts/list-storage.mjs [--prefix <folder>]')
    process.exit(0)
  }
}

console.log(`[list] bucket  : ${BUCKET}`)
console.log(`[list] prefix  : ${prefix || '(all)'}`)
console.log('')

async function listAll (prefix = '') {
  const out = []
  let offset = 0
  const page = 1000
  while (true) {
    const { data, error } = await sb.storage.from(BUCKET).list(prefix, {
      limit: page,
      offset,
      sortBy: { column: 'name', order: 'asc' }
    })
    if (error) {
      console.error('[list] error:', error.message)
      process.exit(1)
    }
    if (!data || data.length === 0) break
    for (const e of data) {
      const name = prefix ? `${prefix}/${e.name}` : e.name
      if (e.id) {
        // file
        out.push(e)
      } else {
        // folder → recurse
        const nested = await listAll(name)
        out.push(...nested)
      }
    }
    if (data.length < page) break
    offset += page
  }
  return out
}

const all = await listAll(prefix)

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const outFile = path.join(root, '.backup', 'storage-listing.txt')
await fs.mkdir(path.dirname(outFile), { recursive: true })

const lines = []
for (const o of all) {
  const name = prefix ? `${prefix}/${o.name}` : o.name
  const size = o.metadata?.size ?? 0
  const line = `${name}\t${size}B`
  console.log(line)
  lines.push(line)
}
await fs.writeFile(outFile, lines.join('\n') + '\n', 'utf8')

console.log('')
console.log(`[list] total : ${all.length}`)
console.log(`[list] saved : ${outFile}`)

// 진단 — depth 2 이상인 path (예: map/map/foo) 찾기
const bad = lines
  .map(l => l.split('\t')[0])
  .filter(n => n.split('/').length >= 3)
if (bad.length) {
  console.log('')
  console.log(`[list] ⚠ depth 3+ paths found (${bad.length}):`)
  for (const b of bad) console.log(`     - ${b}`)
} else {
  console.log('')
  console.log('[list] ✓ 모든 path 가 depth 2 이하 (정상).')
}
