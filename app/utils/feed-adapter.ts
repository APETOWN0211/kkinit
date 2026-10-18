/**
 * app/utils/feed-adapter.ts
 *
 *  - Supabase row → FeedPost component prop shape
 *  - DB content (single string with \n) → ContentLine[][] using tag ranges
 *
 *  - tag rendering: parse "텍스트 [chip:label:variant] 텍스트 ..." once
 *    (the content we save to DB is plain text with no inline chip markup).
 *
 *  Spec #29: keep FeedPost unaware of DB schema. All mapping here.
 *
 *  - Pure functions only — no useRuntimeConfig / useNuxtApp.
 *    Caller (useFeedPosts) resolves `supabaseUrl` from nuxt context once
 *    and passes it in. This keeps the adapter SSR-safe.
 */

import type { ContentLine } from '~/components/feed/FeedPost.vue'
import type { PostWithRelations, ChipVariant } from '~/types/cms'
import { STORAGE_FOLDERS } from '~/utils/storage'
import { formatRelativeTime } from '~/utils/relative-time'

/**
 * Storage context pre-resolved by the caller (so the adapter stays
 * nuxt-context-free).
 */
export interface StorageContext {
  supabaseUrl: string
  bucket: string
}

interface FeedPostProp {
  id: number
  author: {
    name: string
    avatar: string
    isFollowing: boolean
  }
  time: string
  content: ContentLine[][]
  images: string[]
  likes: number
  comments: number
  reposts: number
  isLiked: boolean
  isReposted: boolean
  isBookmarked: boolean
}

interface PostTag {
  label: string
  variant: ChipVariant
  sortOrder: number
}

/**
 * Greedy match: split content by tag labels (longest first), wrap each
 * matched span as a chip. Unmatched text becomes a plain text segment.
 *
 *   input:  "우리 동네 유명한 삼겹살 집인데\n저녁에는 웨이팅 30분"
 *   tags:   [{label:'삼겹살',variant:'orange'}, {label:'웨이팅',variant:'teal'}]
 *   output: [
 *     [{text:'우리 동네 유명한 '},{text:'삼겹살',isChip:true,chipType:'orange'},{text:' 집인데'}],
 *     [{text:'저녁에는 '},{text:'웨이팅',isChip:true,chipType:'teal'},{text:' 30분'}],
 *   ]
 */
function renderContent(
  content: string,
  tags: PostTag[]
): ContentLine[][] {
  // Sort by length desc so '삼겹살' beats '삼겹' etc.
  const ordered = [...tags].sort((a, b) => b.label.length - a.label.length)

  // Per-line map of positions already replaced (for tags spanning lines, ignore).
  return content.split('\n').map((line) => {
    if (ordered.length === 0 || line.length === 0) {
      return [{ text: line }]
    }

    const out: ContentLine[] = []
    let remaining = line

    while (remaining.length > 0) {
      // Find earliest occurrence of any tag in `remaining`
      let bestIdx = -1
      let bestTag: PostTag | null = null
      for (const tag of ordered) {
        const idx = remaining.indexOf(tag.label)
        if (idx < 0) continue
        if (bestIdx === -1 || idx < bestIdx) {
          bestIdx = idx
          bestTag = tag
        }
      }

      if (!bestTag || bestIdx === -1) {
        out.push({ text: remaining })
        break
      }

      if (bestIdx > 0) {
        out.push({ text: remaining.slice(0, bestIdx) })
      }
      out.push({
        text: bestTag.label,
        isChip: true,
        chipType: bestTag.variant
      })
      remaining = remaining.slice(bestIdx + bestTag.label.length)
    }

    return out
  })
}

/**
 * Convert DB post + relations → FeedPost component shape.
 *
 * `id` becomes a numeric hash of the uuid so FeedPost can keep `id: number`.
 * (collision-resistant enough for a small feed)
 */
function uuidToNumber(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/**
 * Build a Supabase public URL for a storage path.
 * Pure function — no nuxt context.
 */
function buildStorageUrl(
  imagePath: string | null | undefined,
  folder: string,
  ctx: StorageContext
): string {
  if (!imagePath) return '/images/chat/default-avatar.svg'
  if (/^https?:\/\//i.test(imagePath)) return imagePath
  if (imagePath.startsWith('/')) return imagePath
  if (!ctx.supabaseUrl || !ctx.bucket) {
    return `/images/${imagePath.replace(/^\/+/, '')}`
  }
  const cleanPath = imagePath.replace(/^\/+/, '')
  const finalPath = cleanPath.includes('/')
    ? cleanPath
    : folder
      ? `${folder}/${cleanPath}`
      : cleanPath
  return `${ctx.supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/${ctx.bucket}/${finalPath}`
}

export function mapPostToFeedPost(
  p: PostWithRelations,
  ctx: StorageContext
): FeedPostProp {
  const tags: PostTag[] = p.tags
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((t) => ({ label: t.label, variant: t.variant, sortOrder: t.sort_order }))

  const images = p.images
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => buildStorageUrl(img.image_path, STORAGE_FOLDERS.feed, ctx))

  return {
    id: uuidToNumber(p.post.id),
    author: {
      name: p.author.display_name,
      avatar: buildStorageUrl(p.author.avatar_path, STORAGE_FOLDERS.chat, ctx),
      isFollowing: p.post.is_following
    },
    time: formatRelativeTime(p.post.created_at),
    content: renderContent(p.post.content, tags),
    images,
    likes: p.post.like_count,
    comments: p.post.comment_count,
    reposts: p.post.repost_count,
    isLiked: false,
    isReposted: false,
    isBookmarked: false
  }
}

export type { FeedPostProp }
