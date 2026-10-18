// scripts/delete-all-storage.mjs
// Usage: node --env-file=.env scripts/delete-all-storage.mjs
//
// Storage 의 kkinit-images bucket 안의 모든 object 를 삭제합니다.
// (top-level folder/file + 그 안의 모든 nested objects 까지)

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE_KEY || process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
const BUCKET = 'kkinit-images'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('SUPABASE_URL 과 (SUPABASE_SERVICE_ROLE_KEY 또는 NUXT_PUBLIC_SUPABASE_ANON_KEY) 필요')
  process.exit(1)
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
})

async function listAll(prefix = '') {
  const out = []
  let offset = 0
  const limit = 1000
  while (true) {
    const { data, error } = await sb.storage.from(BUCKET).list(prefix, {
      limit,
      offset,
      sortBy: { column: 'name', order: 'asc' }
    })
    if (error) throw error
    if (!data || data.length === 0) break
    for (const e of data) {
      const name = prefix ? `${prefix}/${e.name}` : e.name
      if (e.id) {
        // file
        out.push(name)
      } else {
        // folder → recurse
        const nested = await listAll(name)
        out.push(...nested)
      }
    }
    if (data.length < limit) break
    offset += limit
  }
  return out
}

async function main() {
  console.log(`bucket: ${BUCKET}`)
  console.log('listing all objects (recursive) ...')
  const all = await listAll('')
  console.log(`found: ${all.length} objects`)
  if (all.length === 0) {
    console.log('nothing to delete.')
    return
  }
  if (process.argv.includes('--dry-run')) {
    console.log('--- dry-run, would delete: ---')
    for (const p of all) console.log(`  ${p}`)
    return
  }
  // delete 100 개씩 batch
  const BATCH = 100
  let deleted = 0
  for (let i = 0; i < all.length; i += BATCH) {
    const slice = all.slice(i, i + BATCH)
    const { data, error } = await sb.storage.from(BUCKET).remove(slice)
    if (error) {
      console.error(`  FAIL batch ${i}: ${error.message}`)
    } else {
      deleted += data?.length ?? slice.length
      console.log(`  deleted ${deleted}/${all.length}`)
    }
  }
  console.log(`done. ${deleted} objects removed.`)
}

main().catch(e => { console.error(e); process.exit(1) })
