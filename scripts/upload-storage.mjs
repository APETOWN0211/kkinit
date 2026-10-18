/*
 * upload-storage.mjs
 *
 *  - spec #7 (Upload images to Supabase Storage) 의 일회성 admin script.
 *  - spec #26 (안전 규칙) 준수:
 *      · service_role key 는 이 script 어디에도 받지 않는다.
 *      · NUXT_PUBLIC_SUPABASE_URL / NUXT_PUBLIC_SUPABASE_ANON_KEY 만 사용.
 *      · anon key 로 업로드 가능하려면 Supabase Dashboard 의 bucket 정책에서
 *        INSERT/UPDATE/DELETE 를 anon role 에 허용해야 한다.
 *        (대상 folder: feed, restaurants, profiles, groups, map, history)
 *      · 이 script 는 일회성이다. 완료되면 storage 측 policy 를 INSERT 만 가능하도록
 *        좁혀도 좋다 (수정/삭제는 다시 필요할 때만 풀어주기).
 *
 *  - input  : .backup/images/optimized/<bucket>/<file>.webp   (기본값)
 *             또는   public/images/<...>.png                  (-i 옵션으로 변경)
 *  - output : <SUPABASE_URL>/storage/v1/object/public/kkinit-images/<bucket>/<file>
 *
 *  - 사용법:
 *      node --env-file=.env scripts/upload-storage.mjs
 *      node --env-file=.env scripts/upload-storage.mjs -i public/images
 *      node --env-file=.env scripts/upload-storage.mjs --dry-run
 *
 *  - 재실행 안전: 같은 path 면 upsert:true 로 덮어쓴다.
 *
 *  의존성:
 *      @supabase/supabase-js   (npm i -D @supabase/supabase-js)
 *      dotenv                  (Node 20.6+ 는 --env-file 사용, 그 미만은 dotenv)
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/*
 * ----- .env 로드 (Nuxt 와 동일한 NUXT_PUBLIC_ prefix 환경변수 사용) -----
 *  - Node 20.6+ : --env-file=.env 옵션으로 process.env 에 주입됨
 *  - 그 이하    : 아래 fallback 에서 dotenv 시도
 */
let loadedFrom = 'process.env (--env-file)'
try {
  const { config } = await import('dotenv')
  config()
  loadedFrom = 'dotenv fallback'
} catch {
  // dotenv 없으면 process.env 그대로 사용 (Node 20.6+)
}
console.log(`[upload] env loaded: ${loadedFrom}`)

const SUPABASE_URL = process.env.NUXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
const BUCKET = process.env.NUXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'kkinit-images'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    '[upload] NUXT_PUBLIC_SUPABASE_URL / NUXT_PUBLIC_SUPABASE_ANON_KEY 가 비어있음.\n' +
    '         .env 를 채우거나 `node --env-file=.env scripts/upload-storage.mjs` 로 실행.'
  )
  process.exit(1)
}

/*
 * ----- CLI 인자 파싱 (간단 버전) -----
 *  -i, --input <dir>   : 업로드할 로컬 root (default .backup/images/optimized)
 *  -b, --bucket <name> : Supabase bucket name (default kkinit-images)
 *  --dry-run           : 실제로 업로드 안 하고 list 만
 *  --no-cache          : cacheControl 3600 (1h) 으로 덮어쓰기 (staging 용)
 */
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const args = process.argv.slice(2)
const opt = { input: '.backup/images/optimized', bucket: BUCKET, dryRun: false, cacheControl: '31536000' }
for (let i = 0; i < args.length; i++) {
  const a = args[i]
  if (a === '-i' || a === '--input') opt.input = args[++i]
  else if (a === '-b' || a === '--bucket') opt.bucket = args[++i]
  else if (a === '--dry-run') opt.dryRun = true
  else if (a === '--no-cache') opt.cacheControl = '3600'
  else if (a === '-h' || a === '--help') {
    console.log('Usage: node --env-file=.env scripts/upload-storage.mjs [-i <dir>] [-b <bucket>] [--dry-run]')
    process.exit(0)
  }
}
const SRC = path.isAbsolute(opt.input) ? opt.input : path.join(root, opt.input)

/*
 * ----- supabase client (dynamic import, 없으면 친절한 에러) -----
 */
let createClient
try {
  const mod = await import('@supabase/supabase-js')
  createClient = mod.createClient
} catch (e) {
  console.error(
    '[upload] @supabase/supabase-js 가 설치되어 있지 않음.\n' +
    '         npm i -D @supabase/supabase-js  로 설치 후 다시 실행.'
  )
  process.exit(1)
}
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })

/*
 * ----- helpers -----
 */
async function exists(p) { try { await fs.access(p); return true } catch { return false } }
async function* walk(dir) {
  if (!(await exists(dir))) return
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else yield p
  }
}
function contentTypeOf(file) {
  const ext = path.extname(file).slice(1).toLowerCase()
  if (ext === 'webp') return 'image/webp'
  if (ext === 'png') return 'image/png'
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg'
  if (ext === 'svg') return 'image/svg+xml'
  return 'application/octet-stream'
}

/*
 * ----- main -----
 */
console.log(`[upload] source   : ${SRC}`)
console.log(`[upload] bucket   : ${opt.bucket}`)
console.log(`[upload] mode     : ${opt.dryRun ? 'DRY-RUN (no upload)' : 'UPLOAD'}`)
console.log(`[upload] cache    : ${opt.cacheControl}s`)
console.log('')

if (!(await exists(SRC))) {
  console.error(`[upload] 입력 폴더가 없음: ${SRC}`)
  console.error(`         WebP 변환 후 실행 (npm run images:optimize). 또는 -i public/images`)
  process.exit(1)
}

let ok = 0, skip = 0, fail = 0
const failed = []
const t0 = Date.now()

for await (const abs of walk(SRC)) {
  const rel = path.relative(SRC, abs).replace(/\\/g, '/')
  const ext = path.extname(abs).toLowerCase()
  if (!/\.(webp|png|jpe?g|svg)$/i.test(ext)) { skip++; continue }

  if (opt.dryRun) {
    console.log(`  DRY  ${rel}`)
    ok++
    continue
  }

  const body = await fs.readFile(abs)
  const { error } = await sb.storage.from(opt.bucket).upload(rel, body, {
    contentType: contentTypeOf(abs),
    upsert: true,
    cacheControl: opt.cacheControl
  })
  if (error) {
    fail++
    failed.push({ rel, msg: error.message })
    console.error(`  FAIL ${rel}  ->  ${error.message}`)
  } else {
    ok++
    if (ok % 20 === 0) console.log(`  ... ${ok} uploaded`)
  }
}

const sec = ((Date.now() - t0) / 1000).toFixed(1)
console.log('')
console.log(`[upload] done in ${sec}s`)
console.log(`         ok   : ${ok}`)
console.log(`         skip : ${skip}  (non-image files)`)
console.log(`         fail : ${fail}`)
if (failed.length) {
  console.log('         failures:')
  for (const f of failed.slice(0, 10)) console.log(`           - ${f.rel}: ${f.msg}`)
  if (failed.length > 10) console.log(`           ... and ${failed.length - 10} more`)
  process.exit(2)
}
