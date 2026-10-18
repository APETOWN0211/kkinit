/*
 * images.mjs
 *
 * 한 번에 세 가지를 수행:
 *   1) 원본 raster backup:  public/images  →  .backup/images/original/
 *   2) display size에 맞춘 resize + WebP 변환:  .backup/images/original/  →  .backup/images/optimized/<bucket-path>/
 *   3) WebP 변환 후 용량 통계 출력
 *
 * Input  : public/images (현재 raster)
 * Output : .backup/images/original/<rel>  (원본 백업)
 *          .backup/images/optimized/<bucket>/<rel>.webp  (Storage 업로드 후보)
 *
 * 외부 도구 (둘 중 하나만 있으면 동작):
 *   - sharp (npm i -D sharp)             — Node 내장, 가장 안정적
 *   - ImageMagick (magick) + cwebp CLI   — 시스템 도구
 *
 * 권장 (Node only, 이식성):
 *   npm i -D sharp
 *   node scripts/images.mjs
 *
 * Storage bucket folder convention (spec #8):
 *   profiles/   feed/   restaurants/   groups/   map/   history/
 *
 * 같은 raster가 여러 위치에서 쓰이는 경우 (예: post-img1.png → feed, my),
 *   가장 display size가 큰 쪽을 1순위로 사용한다. 원본은 backup에 보존.
 */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const PUBLIC_DIR = path.join(root, 'public', 'images')
const BACKUP_DIR = path.join(root, '.backup', 'images', 'original')
const OUT_DIR = path.join(root, '.backup', 'images', 'optimized')

/*
 * Display size rules (Figma actual).
 *  - Figma size × 2 (DPR) + 약간의 여유(1.25) → max target width/height.
 *  - maxWidth/maxHeight 보다 큰 경우만 downscale.
 *  - aspect ratio 는 유지.
 */
const RULES = [
  // bucket   subdir  maxW  maxH  quality
  { bucket: 'feed',        subdir: 'feed',        maxW: 720,  maxH: 720,  q: 82, match: (rel) => rel.startsWith('feed/') },
  { bucket: 'restaurants', subdir: 'explore',     maxW: 540,  maxH: 360,  q: 82, match: (rel) => rel.startsWith('explore/r') },
  { bucket: 'restaurants', subdir: 'archive',     maxW: 240,  maxH: 240,  q: 82, match: (rel) => rel.startsWith('archive/') },
  { bucket: 'map',         subdir: 'map',         maxW: 540,  maxH: 540,  q: 82, match: (rel) => rel.startsWith('map/uchon-') },
  { bucket: 'map',         subdir: 'map',         maxW: 1100, maxH: 2400, q: 80, match: (rel) => rel === 'map/map-bg.png' },
  { bucket: 'map',         subdir: 'map',         maxW: 360,  maxH: 360,  q: 82, match: (rel) => rel.startsWith('map/avatar-') },
  { bucket: 'map',         subdir: 'map',         maxW: 360,  maxH: 360,  q: 82, match: (rel) => rel.startsWith('map/profile-') },
  { bucket: 'profiles',    subdir: 'chat',        maxW: 220,  maxH: 220,  q: 85, match: (rel) => rel.startsWith('chat/profile-') },
  { bucket: 'profiles',    subdir: 'chat',        maxW: 220,  maxH: 220,  q: 85, match: (rel) => rel.startsWith('chat/group-member-') },
  { bucket: 'profiles',    subdir: 'feed',        maxW: 220,  maxH: 220,  q: 85, match: (rel) => rel.startsWith('feed/profile-') },
  { bucket: 'profiles',    subdir: 'home',        maxW: 144,  maxH: 144,  q: 85, match: (rel) => rel.startsWith('home/') },
  { bucket: 'profiles',    subdir: 'my',          maxW: 220,  maxH: 220,  q: 85, match: (rel) => rel === 'my/avatar.png' || rel === 'my/post-author.png' },
  { bucket: 'feed',        subdir: 'my',          maxW: 720,  maxH: 720,  q: 82, match: (rel) => rel.startsWith('my/post-img') },
  { bucket: 'feed',        subdir: 'my',          maxW: 720,  maxH: 720,  q: 82, match: (rel) => rel.startsWith('my/repost/') },
  { bucket: 'groups',      subdir: 'explore',     maxW: 240,  maxH: 240,  q: 82, match: (rel) => rel.startsWith('explore/g') },
  { bucket: 'restaurants', subdir: 'explore',     maxW: 540,  maxH: 320,  q: 82, match: (rel) => rel.startsWith('explore/ranking-') }
]

/* --------------- helpers --------------- */

async function exists(p) { try { await fs.access(p); return true } catch { return false } }
async function rimraf(p) { if (await exists(p)) await fs.rm(p, { recursive: true, force: true }) }
async function mkdirp(p) { await fs.mkdir(p, { recursive: true }) }

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walk(p)
    else yield p
  }
}

function relFromPublic(abs) {
  return path.relative(PUBLIC_DIR, abs).replace(/\\/g, '/')
}

function bucketFor(rel) {
  for (const r of RULES) if (r.match(rel)) return r
  return null
}

/*
 * Storage folder convention (spec #8):
 *   kkinit-images/<bucket>/<filename>.webp   (단일 depth)
 *
 * input PNG 의 rel 경로에 이미 folder prefix 가 있는 경우 (예: feed/post1-food1.png),
 * bucket 안의 subfolder 까지 보존하지 않고 <bucket>/<basename>.webp 로 평탄화한다.
 *   - 이유 1: spec #8 의 bucket convention 과 일치.
 *   - 이유 2: helper 의 `imagePath.feed/post1-food1.webp` (= "feed/post1-food1.webp") 와
 *             Storage 의 실제 object name 이 1:1 매핑되도록.
 *   - 이유 3: 옛 mock data 의 절대 path ("/images/feed/post1-food1.png") 가
 *             helper mode 4 에서도 "feed/post1-food1.webp" 로 매핑되므로 storage 와 일치.
 */
function targetPath(rel, rule) {
  const flat = path.basename(rel).replace(/\.[^.]+$/, '.webp') // png → webp, 첫 segment만
  return path.join(OUT_DIR, rule.bucket, flat)
}

/* --------------- sharp path (preferred) --------------- */

async function trySharp() {
  try {
    const sharp = (await import('sharp')).default
    return sharp
  } catch {
    return null
  }
}

async function processWithSharp(sharp) {
  await rimraf(BACKUP_DIR)
  await rimraf(OUT_DIR)
  await mkdirp(BACKUP_DIR)
  await mkdirp(OUT_DIR)

  const tasks = []
  for await (const abs of walk(PUBLIC_DIR)) {
    const rel = relFromPublic(abs)
    if (!/\.(png|jpe?g)$/i.test(rel)) continue
    const rule = bucketFor(rel)
    if (!rule) continue

    const backup = path.join(BACKUP_DIR, rel)
    const out = targetPath(rel, rule)
    await mkdirp(path.dirname(backup))
    await mkdirp(path.dirname(out))
    await fs.copyFile(abs, backup)

    tasks.push(
      sharp(abs)
        .rotate() // EXIF 보정
        .resize({
          width: rule.maxW,
          height: rule.maxH,
          fit: 'inside',
          withoutEnlargement: true
        })
        .webp({ quality: rule.q, effort: 4 })
        .toFile(out)
    )
  }
  await Promise.all(tasks)
}

/* --------------- ImageMagick + cwebp fallback --------------- */

async function processWithIm() {
  await rimraf(BACKUP_DIR)
  await rimraf(OUT_DIR)
  await mkdirp(BACKUP_DIR)
  await mkdirp(OUT_DIR)

  for await (const abs of walk(PUBLIC_DIR)) {
    const rel = relFromPublic(abs)
    if (!/\.(png|jpe?g)$/i.test(rel)) continue
    const rule = bucketFor(rel)
    if (!rule) continue

    const backup = path.join(BACKUP_DIR, rel)
    const out = targetPath(rel, rule)
    await mkdirp(path.dirname(backup))
    await mkdirp(path.dirname(out))
    await fs.copyFile(abs, backup)

    // magick input -resize 540x360> -quality 82 out.webp
    // (the trailing '>' means only shrink, never enlarge)
    const { spawn } = await import('node:child_process')
    await new Promise((resolve, reject) => {
      const args = [
        abs,
        '-resize', `${rule.maxW}x${rule.maxH}>`,
        '-quality', String(rule.q),
        out
      ]
      const p = spawn('magick', args, { stdio: 'inherit' })
      p.on('exit', code => code === 0 ? resolve() : reject(new Error('magick exit ' + code)))
    })
  }
}

/* --------------- size report --------------- */

async function* walkSafe(dir) {
  if (!(await exists(dir))) return
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* walkSafe(p)
    else yield p
  }
}

async function dirSize(dir) {
  let total = 0
  for await (const f of walkSafe(dir)) {
    const st = await fs.stat(f)
    total += st.size
  }
  return total
}

async function report() {
  const before = await dirSize(PUBLIC_DIR)
  const after = await dirSize(OUT_DIR)
  console.log('--- size report ---')
  console.log(`public/images (current raster) : ${(before/1024).toFixed(1)} KB  (${(before/1024/1024).toFixed(2)} MB)`)
  console.log(`.backup/images/optimized (webp) : ${(after/1024).toFixed(1)} KB  (${(after/1024/1024).toFixed(2)} MB)`)
  if (before > 0) {
    const saved = (1 - after / before) * 100
    console.log(`saved                           : ${saved.toFixed(1)}%`)
  }
}

/* --------------- main --------------- */

async function main() {
  console.log('kkinit image optimization')
  console.log('=========================')
  const sharp = await trySharp()
  if (sharp) {
    console.log('using sharp (npm)')
    await processWithSharp(sharp)
  } else {
    console.log('sharp not installed — falling back to ImageMagick (magick).')
    console.log('tip: npm i -D sharp  # recommended, no system deps')
    await processWithIm()
  }
  await report()
}

main().catch(err => { console.error(err); process.exit(1) })
