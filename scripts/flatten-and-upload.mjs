/*
 * flatten-and-upload.mjs
 *
 *  Storage 에 잘못 들어간 (depth 3+) 객체를 정리하고,
 *  .backup/images/optimized 를 spec #8 bucket convention 에 맞춰 flat 한 후 재업로드.
 *
 *  Step 1. Storage 의 잘못된 path (예: map/map/avatar-1.webp) 전부 삭제.
 *  Step 2. .backup/images/optimized/<bucket>/<bucket>/X.webp  →  <bucket>/X.webp 로 평탄화.
 *  Step 3. .backup/images/optimized 의 모든 webp 를 재업로드 (upsert).
 *
 *  안전:
 *    - .backup/images/original 은 절대 건드리지 않음.
 *    - public/images 도 절대 건드리지 않음.
 *    - Storage 의 depth 2 정상 path 는 건드리지 않음.
 *    - dry-run 옵션 지원.
 *
 *  사용법:
 *    node --env-file=.env scripts/flatten-and-upload.mjs            (실제 실행)
 *    node --env-file=.env scripts/flatten-and-upload.mjs --dry-run  (시뮬레이션)
 *    node --env-file=.env scripts/flatten-and-upload.mjs --skip-storage   (.backup 만 정리)
 *    node --env-file=.env scripts/flatten-and-upload.mjs --skip-backup    (Storage 만 정리)
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
console.log(`[flatten] env loaded: ${loadedFrom}`)

const SUPABASE_URL = process.env.NUXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
const BUCKET = process.env.NUXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'kkinit-images'

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[flatten] NUXT_PUBLIC_SUPABASE_URL / NUXT_PUBLIC_SUPABASE_ANON_KEY 가 비어있음.')
  process.exit(1)
}

const args = process.argv.slice(2)
const opt = { dryRun: false, skipStorage: false, skipBackup: false }
for (const a of args) {
  if (a === '--dry-run') opt.dryRun = true
  else if (a === '--skip-storage') opt.skipStorage = true
  else if (a === '--skip-backup') opt.skipBackup = true
  else if (a === '-h' || a === '--help') {
    console.log('Usage: node --env-file=.env scripts/flatten-and-upload.mjs [--dry-run] [--skip-storage] [--skip-backup]')
    process.exit(0)
  }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')
const OUT_DIR = path.join(root, '.backup', 'images', 'optimized')

let createClient
try {
  createClient = (await import('@supabase/supabase-js')).createClient
} catch {
  console.error('[flatten] @supabase/supabase-js 가 설치되어 있지 않음.')
  process.exit(1)
}
const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })

/* -------- helpers -------- */
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

/* -------- Step 1: Storage 에서 잘못된 depth 3+ path 삭제 -------- */
async function listAll(prefix = '') {
  const all = []
  let offset = 0
  const page = 1000
  while (true) {
    const { data, error } = await sb.storage.from(BUCKET).list(prefix, {
      limit: page, offset, sortBy: { column: 'name', order: 'asc' }
    })
    if (error) throw error
    if (!data || data.length === 0) break
    all.push(...data.map(o => prefix ? `${prefix}/${o.name}` : o.name))
    if (data.length < page) break
    offset += page
  }
  return all
}

console.log('=====================================================')
console.log('Step 1. Storage 정리 (depth 3+ path 삭제)')
console.log('=====================================================')
console.log(`         bucket  : ${BUCKET}`)
console.log(`         mode    : ${opt.dryRun ? 'DRY-RUN' : 'EXECUTE'}`)

if (!opt.skipStorage) {
  const all = await listAll('')
  const bad = all.filter(n => n.split('/').length >= 3)
  console.log(`         total   : ${all.length} objects`)
  console.log(`         bad     : ${bad.length} objects (depth 3+)`)
  if (bad.length === 0) {
    console.log('         ✓ 잘못 들어간 path 없음.')
  } else {
    for (const n of bad) console.log(`           - ${n}`)
    if (!opt.dryRun) {
      // supabase-js 는 prefix 단위 delete 를 지원. 정확한 path list 로 한 번에 시도.
      const { error } = await sb.storage.from(BUCKET).remove(bad)
      if (error) {
        console.error(`         ✗ remove error: ${error.message}`)
        console.log('           (대안: Dashboard 에서 수동 삭제)')
      } else {
        console.log(`         ✓ ${bad.length} 개 삭제 완료.`)
      }
    }
  }
} else {
  console.log('         (--skip-storage) skip')
}
console.log('')

/* -------- Step 2: .backup/images/optimized 의 <bucket>/<bucket>/X → <bucket>/X -------- */
console.log('=====================================================')
console.log('Step 2. .backup/images/optimized 평탄화')
console.log('=====================================================')

async function removeEmptyDirs(dir) {
  if (!(await exists(dir))) return
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    if (e.isDirectory()) await removeEmptyDirs(path.join(dir, e.name))
  }
  const rest = await fs.readdir(dir)
  if (rest.length === 0) await fs.rmdir(dir)
}

if (!opt.skipBackup) {
  if (!(await exists(OUT_DIR))) {
    console.log(`         (${OUT_DIR} 없음, skip)`)
  } else {
    const buckets = await fs.readdir(OUT_DIR, { withFileTypes: true })
    const plans = [] // { from, to }
    const usedNames = new Map() // bucket -> Set<basename>

    function reserve(bucket, base) {
      if (!usedNames.has(bucket)) usedNames.set(bucket, new Set())
      const set = usedNames.get(bucket)
      if (!set.has(base)) { set.add(base); return base }
      const ext = path.extname(base)
      const stem = base.slice(0, base.length - ext.length)
      let i = 2
      while (set.has(`${stem} (${i})${ext}`)) i++
      const final = `${stem} (${i})${ext}`
      set.add(final)
      return final
    }

    // pass 1: bucket 직속의 file 을 먼저 reserved 로 등록
    for (const b of buckets) {
      if (!b.isDirectory()) continue
      const bucket = b.name
      const bucketDir = path.join(OUT_DIR, bucket)
      for (const e of await fs.readdir(bucketDir, { withFileTypes: true })) {
        if (e.isFile()) reserve(bucket, e.name)
      }
    }
    // pass 2: subdir 안의 file 을 walk 해서 depth 3+ 만 bucket 직속의 새 이름으로 평탄화
    for (const b of buckets) {
      if (!b.isDirectory()) continue
      const bucket = b.name
      const bucketDir = path.join(OUT_DIR, bucket)
      for await (const abs of walk(bucketDir)) {
        const rel = path.relative(bucketDir, abs)
        const depth = rel.split(/[\\/]/).length
        if (depth < 3) continue // depth 1 = bucket 직속 file, depth 2 = bucket/file (spec #8) — 둘 다 OK
        const relFlat = rel.replace(/[\\/]/g, '-')
        const finalName = reserve(bucket, relFlat)
        const to = path.join(bucketDir, finalName)
        plans.push({ from: abs, to })
      }
    }

    console.log(`         planned moves: ${plans.length}`)
    for (const p of plans) {
      const fromRel = path.relative(root, p.from)
      const toRel = path.relative(root, p.to)
      console.log(`         move ${fromRel}  →  ${toRel}`)
    }

    if (!opt.dryRun) {
      for (const p of plans) {
        if (await exists(p.to)) {
          console.log(`         WARN target exists, overwrite: ${path.relative(root, p.to)}`)
          await fs.unlink(p.to)
        }
        await fs.rename(p.from, p.to)
      }
      for (const b of buckets) {
        if (!b.isDirectory()) continue
        const bucketDir = path.join(OUT_DIR, b.name)
        await removeEmptyDirs(bucketDir)
      }
      console.log(`         ✓ ${plans.length} files moved, empty dirs removed.`)
    }
  }
} else {
  console.log('         (--skip-backup) skip')
}
console.log('')

/* -------- Step 3: 재업로드 -------- */
console.log('=====================================================')
console.log('Step 3. .backup/images/optimized → Storage 업로드')
console.log('=====================================================')

if (!(await exists(OUT_DIR))) {
  console.log(`         (${OUT_DIR} 없음, skip)`)
} else {
  let ok = 0, skip = 0, fail = 0
  const t0 = Date.now()
  for await (const abs of walk(OUT_DIR)) {
    const rel = path.relative(OUT_DIR, abs).replace(/\\/g, '/')
    if (!/\.(webp|png|jpe?g|svg)$/i.test(rel)) { skip++; continue }
    if (opt.dryRun) {
      console.log(`  DRY  ${rel}`)
      ok++; continue
    }
    const body = await fs.readFile(abs)
    const { error } = await sb.storage.from(BUCKET).upload(rel, body, {
      contentType: contentTypeOf(abs),
      upsert: true,
      cacheControl: '31536000'
    })
    if (error) {
      fail++
      console.error(`  FAIL ${rel}  ->  ${error.message}`)
    } else {
      ok++
      if (ok % 20 === 0) console.log(`  ... ${ok} uploaded`)
    }
  }
  const sec = ((Date.now() - t0) / 1000).toFixed(1)
  console.log(`         ok   : ${ok}`)
  console.log(`         skip : ${skip}`)
  console.log(`         fail : ${fail}`)
  console.log(`         done in ${sec}s`)
}
console.log('')
console.log('=====================================================')
console.log('완료.')
console.log('=====================================================')
console.log('다음 단계:')
console.log('  1) `node --env-file=.env scripts/list-storage.mjs` 로 다시 list 확인.')
console.log('  2) 브라우저에서 /map 페이지 reload → Storage 이미지 200 OK 확인.')
console.log('  3) Network 탭에 `https://.../kkinit-images/map/avatar-2.webp` 가 보임.')
