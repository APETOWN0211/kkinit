/**
 * app/composables/useFeedPosts.ts
 *
 * Home feed — pulls posts + relations from Supabase.
 *
 *   1) posts        (created_at desc, limit 30)
 *   2) profiles     (for author display_name + avatar_path)
 *   3) post_images  (sort_order asc)
 *   4) post_tags    (sort_order asc)
 *
 * Returns a `FeedPostProp[]` already mapped via `mapPostToFeedPost`.
 * Empty / error states included.
 *
 * SSR caveat: pages must call this composable as the *only* top-level
 * statement that awaits (or call it inside `useAsyncData`'s handler).
 * Internally we pre-resolve the supabase client + runtime config OUTSIDE
 * the useAsyncData handler, because the handler runs without a nuxt
 * composable context.
 *
 * `useFeedPosts()` is SYNCHRONOUS: it returns refs immediately and the
 * fetch happens lazily inside `useAsyncData`. The caller should not
 * `await` the composable; just call it from a `<script setup>` top-level
 * and use the returned reactive refs.
 */

import type { FeedPostProp } from '~/utils/feed-adapter'
import type { PostRow, ProfileRow, PostImageRow, PostTagRow } from '~/types/cms'
import { useSupabaseAnon } from '~/composables/useSupabaseTyped'
import { mapPostToFeedPost, type StorageContext } from '~/utils/feed-adapter'
import { STORAGE_BUCKETS } from '~/utils/storage'

export interface FeedState {
  posts: Ref<FeedPostProp[]>
  loading: Ref<boolean>
  error: Ref<string | null>
  reload: () => Promise<void>
}

export function useFeedPosts(): FeedState {
  const posts = ref<FeedPostProp[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  // Pre-resolve nuxt-context values in the *current* (page setup) context.
  // The values are captured by the useAsyncData handler closure.
  const sb = useSupabaseAnon()
  const cfg = useRuntimeConfig()
  const storageCtx: StorageContext = {
    supabaseUrl: (cfg.public.supabaseUrl as string) ?? '',
    bucket: STORAGE_BUCKETS.images
  }

  // The handler uses ONLY the closure-captured `sb` and `storageCtx` —
  // no nuxt composables are called inside the handler.
  const {
    data,
    error: fetchError,
    pending,
    refresh
  } = useAsyncData<FeedPostProp[]>('feed:posts', async () => {
    const client = await sb
    if (!client) {
      throw new Error('Supabase env not configured.')
    }

    const { data: postRows, error: e1 } = await client
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)

    if (e1) throw e1
    if (!postRows || postRows.length === 0) return []

    const postList = postRows as PostRow[]
    const postIds = postList.map((p) => p.id)
    const authorIds = Array.from(new Set(postList.map((p) => p.author_id)))

    const [profilesRes, imagesRes, tagsRes] = await Promise.all([
      client.from('profiles').select('*').in('id', authorIds),
      client
        .from('post_images')
        .select('*')
        .in('post_id', postIds)
        .order('sort_order', { ascending: true }),
      client
        .from('post_tags')
        .select('*')
        .in('post_id', postIds)
        .order('sort_order', { ascending: true })
    ])

    if (profilesRes.error) throw profilesRes.error
    if (imagesRes.error) throw imagesRes.error
    if (tagsRes.error) throw tagsRes.error

    const profileById = new Map<string, ProfileRow>()
    for (const p of (profilesRes.data ?? []) as ProfileRow[]) {
      profileById.set(p.id, p)
    }

    const imagesByPost = new Map<string, PostImageRow[]>()
    for (const img of (imagesRes.data ?? []) as PostImageRow[]) {
      const list = imagesByPost.get(img.post_id) ?? []
      list.push(img)
      imagesByPost.set(img.post_id, list)
    }

    const tagsByPost = new Map<string, PostTagRow[]>()
    for (const tag of (tagsRes.data ?? []) as PostTagRow[]) {
      const list = tagsByPost.get(tag.post_id) ?? []
      list.push(tag)
      tagsByPost.set(tag.post_id, list)
    }

    return postList.map((post) => {
      const author = profileById.get(post.author_id)
      if (!author) {
        throw new Error(`Missing profile for post ${post.id}`)
      }
      return mapPostToFeedPost({
        post,
        author,
        images: imagesByPost.get(post.id) ?? [],
        tags: tagsByPost.get(post.id) ?? []
      }, storageCtx)
    })
  })

  // Mirror useAsyncData state into our local refs (sync).
  watch(
    data,
    (v) => {
      posts.value = Array.isArray(v) ? v : []
    },
    { immediate: true }
  )
  watch(
    pending,
    (v) => {
      loading.value = v
    },
    { immediate: true }
  )
  watch(
    fetchError,
    (v) => {
      error.value = v ? (v instanceof Error ? v.message : String(v)) : null
    },
    { immediate: true }
  )

  async function reload(): Promise<void> {
    error.value = null
    try {
      await refresh()
    } catch (e) {
      if (import.meta.dev) console.error('[useFeedPosts] reload', e)
      error.value = e instanceof Error ? e.message : String(e)
    }
  }

  return { posts, loading, error, reload }
}
