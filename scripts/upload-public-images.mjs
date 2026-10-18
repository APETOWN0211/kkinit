// scripts/upload-public-images.mjs
// Usage: node --env-file=.env scripts/upload-public-images.mjs
//
// public/images/ 아래의 모든 file 을 kkinit-images bucket 에 upload 합니다.
//
// rule (spec #8):
//   path: public/images/<category>/<rest...>
//   - depth 2 (category/file.ext)   → 그대로 upload (예: map/avatar-1.png)
//   - depth 3+ (category/sub/...)   → flat upload   (예: my/repost/dogidog-1.png → my-repost-dogidog-1.png)
//   - depth 1 (file.ext)            → skip
//   - chat/default-avatar.svg       → skip (placeholder)
//
//   .png / .jpg / .jpeg 은 원본 그대로 + .webp 변환본 모두 upload 합니다.
//   (코드가 .webp URL 을 hardcode 하고 있어도 항상 200 OK 가 떨어진다.)

import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  || process.env.SUPABASE_SERVICE_KEY
  || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
const BUCKET = process.env.NUXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'kkinit-images'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('SUPABASE_URL 과 KEY 필요')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } })
const SRC = 'public/images'

const SKIP_PATHS = new Set([
  'chat/default-avatar.svg',
])

const IMG_EXT = /\.(png|jpe?g|webp|svg)$/i
const RASTER_EXT = /\.(png|jpe?g|webp)$/i

function contentTypeOf (p) {
  const ext = path.extname(p).toLowerCase()
  switch (ext) {
    case '.png':  return 'image/png'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.webp': return 'image/webp'
    case '.svg':  return 'image/svg+xml'
    default:      return 'application/octet-stream'
  }
}

async function* walk (dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else yield p
  }
}

async function uploadOne (key, body, contentType) {
  const { error } = await sb.storage.from(BUCKET).upload(key, body, {
    contentType,
    upsert: true,
    cacheControl: '31536000'
  })
  if (error) {
    console.log(`  FAIL  ${key}  ::  ${error.message}`)
    return false
  }
  return true
}

async function main () {
  const dryRun = process.argv.includes('--dry-run')
  console.log(`bucket: ${BUCKET}`)
  console.log(`source: ${SRC}`)
  console.log('walking ...')
  const files = []
  for await (const abs of walk(SRC)) {
    if (!IMG_EXT.test(abs)) continue
    const rel = path.relative(SRC, abs).replace(/\\/g, '/')
    if (SKIP_PATHS.has(rel)) continue
    files.push({ abs, rel })
  }
  console.log(`found: ${files.length} files`)

  let ok = 0, skip = 0, fail = 0

  for (const { abs, rel } of files) {
    const parts = rel.split('/')
    let key
    if (parts.length === 2) {
      key = rel
    } else if (parts.length >= 3) {
      key = parts.join('-')
    } else {
      console.log(`  SKIP (depth 1): ${rel}`)
      skip++
      continue
    }

    const ext = path.extname(abs).toLowerCase()
    const base = key.slice(0, -path.extname(key).length)

    // 1) 원본 upload
    if (dryRun) {
      console.log(`  DRY  ${rel}  →  ${BUCKET}/${key}`)
      ok++
    } else {
      const body = await fs.readFile(abs)
      const ct = contentTypeOf(abs)
      const ok1 = await uploadOne(key, body, ct)
      if (ok1) ok++
      else fail++
    }

    // 2) .png/.jpg/.jpeg 이면 .webp 변환본도 upload
    if (/\.(png|jpe?g)$/i.test(abs)) {
      const webpKey = `${base}.webp`
      if (dryRun) {
        console.log(`  DRY  ${rel}  →  ${BUCKET}/${webpKey}  (webp)`)
        ok++
        continue
      }
      try {
        const body = await fs.readFile(abs)
        const webp = await sharp(body).webp({ quality: 80 }).toBuffer()
        const ok2 = await uploadOne(webpKey, webp, 'image/webp')
        if (ok2) ok++
        else fail++
      } catch (e) {
        console.log(`  FAIL  ${webpKey}  ::  ${e.message}`)
        fail++
      }
    }
  }
  console.log(`done. ok=${ok} skip=${skip} fail=${fail}`)
}

main().catch(e => { console.error(e); process.exit(1) })
