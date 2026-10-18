/**
 * app/composables/usePostForm.ts
 *
 * Reusable post-form state for /admin/posts/new and /admin/posts/[id].
 *
 *  - selected author (id)
 *  - content (plain text with \n)
 *  - tags (label + variant + sort_order)
 *  - images (existing storage paths + new File previews)
 *  - like/comment/repost counts
 *  - is_following
 *  - created_at (admin override)
 *  - validation
 *  - submit (create / update)
 *
 * spec #20: post is created FIRST, then images upload, then post_images insert.
 * If any image upload fails → best-effort cleanup (delete post + uploaded files).
 */

import type { ChipVariant, PostRow, ProfileRow } from '~/types/cms'
import { optimizeImage, type OptimizeResult } from '~/utils/image-optimizer'
import { useSupabaseAdmin } from '~/composables/useSupabaseTyped'
import { deleteStoragePaths, uploadPostImage } from '~/utils/storage-upload'

// Storage bucket name (hardcoded — matches storage-upload.ts; spec #17)
const BUCKET = 'kkinit-images'

export interface FormTag {
  id?: string
  label: string
  variant: ChipVariant
  sort_order: number
}

export interface FormExistingImage {
  id?: string
  path: string
  sort_order: number
  isExisting: true
}

export interface FormNewImage {
  id: string
  file: File
  previewUrl: string
  optimizeResult: OptimizeResult | null
  isExisting: false
}

export type FormImage = FormExistingImage | FormNewImage

export type SubmitMode = 'create' | 'update'

export interface PostFormState {
  authorId: string
  content: string
  tags: FormTag[]
  images: FormImage[]
  likeCount: number
  commentCount: number
  repostCount: number
  isFollowing: boolean
  createdAt: string
  loading: boolean
  error: string | null
  validationError: string | null
}

export function makePostForm(): PostFormState {
  return {
    authorId: '',
    content: '',
    tags: [],
    images: [],
    likeCount: 0,
    commentCount: 0,
    repostCount: 0,
    isFollowing: true,
    createdAt: new Date().toISOString().slice(0, 16), // yyyy-MM-ddTHH:mm
    loading: false,
    error: null,
    validationError: null
  }
}

export function usePostForm() {
  const state = reactive<PostFormState>(makePostForm())
  const authors = ref<ProfileRow[]>([])

  async function loadAuthors(): Promise<void> {
    const sb = await useSupabaseAdmin()
    if (!sb) return
    const { data, error } = await sb
      .from('profiles')
      .select('*')
      .order('display_name', { ascending: true })
    if (error) {
      if (import.meta.dev) console.warn('[loadAuthors]', error.message)
      return
    }
    authors.value = (data ?? []) as ProfileRow[]
  }

  /**
   * Create a new profile + upload avatar to storage.
   * avatarFile is optional — when omitted the profile is created without one
   * (can still be edited later).
   * On success, the new author is prepended to the in-memory list and
   * state.authorId is set to the new id so the form picks it up immediately.
   */
  async function addAuthor(
    username: string,
    displayName: string,
    avatarFile: File | null
  ): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
    const usernameClean = username.trim().replace(/^@+/, '')
    const displayClean = displayName.trim()
    if (!usernameClean) return { ok: false, error: 'username 을 입력하세요.' }
    if (!displayClean) return { ok: false, error: '표시 이름을 입력하세요.' }
    if (!/^[a-zA-Z0-9_]{2,20}$/.test(usernameClean)) {
      return { ok: false, error: 'username 은 영문/숫자/_ 만, 2~20자' }
    }

    const sb = await useSupabaseAdmin()
    if (!sb) return { ok: false, error: 'Supabase 클라이언트 없음' }

    // Check for duplicate username
    const { data: dup } = await sb
      .from('profiles')
      .select('id')
      .eq('username', usernameClean)
      .maybeSingle()
    if (dup) return { ok: false, error: `username "${usernameClean}" 이미 존재` }

    let avatarPath: string | null = null

    // 1) upload avatar first (if provided)
    if (avatarFile) {
      // optimize (same pipeline as posts)
      const optimized = await optimizeImage(avatarFile)
      // generate path: profiles/<username>.webp  (overwrite if re-uploaded)
      avatarPath = `profiles/${usernameClean}.webp`
      const { error: upErr } = await sb.storage
        .from(BUCKET)
        .upload(avatarPath, optimized.blob, {
          cacheControl: '3600',
          upsert: true,
          contentType: optimized.mimeType
        })
      if (upErr) return { ok: false, error: `아바타 업로드 실패: ${upErr.message}` }
    }

    // 2) insert profile row
    const { data: inserted, error: insErr } = await sb
      .from('profiles')
      .insert({
        username: usernameClean,
        display_name: displayClean,
        avatar_path: avatarPath
      })
      .select('*')
      .single()
      if (insErr) {
      // best-effort cleanup uploaded avatar
      if (avatarPath) {
        await sb.storage.from(BUCKET).remove([avatarPath])
      }
      return { ok: false, error: `작성자 등록 실패: ${insErr.message}` }
    }

    const row = inserted as ProfileRow
    // 3) prepend to list (alphabetical order with the rest)
    authors.value = [...authors.value, row].sort((a, b) =>
      a.display_name.localeCompare(b.display_name)
    )
    state.authorId = row.id
    return { ok: true, id: row.id }
  }

  async function loadPost(postId: string): Promise<void> {
    const sb = await useSupabaseAdmin()
    if (!sb) return

    const [{ data: post, error: e1 }, { data: images, error: e2 }, { data: tags, error: e3 }] =
      await Promise.all([
        sb.from('posts').select('*').eq('id', postId).maybeSingle(),
        sb
          .from('post_images')
          .select('*')
          .eq('post_id', postId)
          .order('sort_order', { ascending: true }),
        sb
          .from('post_tags')
          .select('*')
          .eq('post_id', postId)
          .order('sort_order', { ascending: true })
      ])
    if (e1) throw e1
    if (e2) throw e2
    if (e3) throw e3
    if (!post) throw new Error('Post not found')

    const p = post as PostRow
    state.authorId = p.author_id
    state.content = p.content
    state.likeCount = p.like_count
    state.commentCount = p.comment_count
    state.repostCount = p.repost_count
    state.isFollowing = p.is_following
    state.createdAt = p.created_at.slice(0, 16)
    state.tags = (tags ?? []).map((t) => ({
      id: t.id,
      label: t.label,
      variant: t.variant as ChipVariant,
      sort_order: t.sort_order
    }))
    state.images = (images ?? []).map((i) => ({
      id: i.id,
      path: i.image_path,
      sort_order: i.sort_order,
      isExisting: true as const
    }))
  }

  function addTag(label: string, variant: ChipVariant): void {
    if (!label.trim()) return
    state.tags.push({
      label: label.trim(),
      variant,
      sort_order: state.tags.length
    })
  }

  function removeTag(index: number): void {
    state.tags.splice(index, 1)
    // Re-number
    state.tags.forEach((t, i) => (t.sort_order = i))
  }

  function addNewImages(files: File[]): void {
    for (const file of files) {
      state.images.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
        optimizeResult: null,
        isExisting: false
      })
    }
  }

  function removeImage(index: number): void {
    const img = state.images[index]
    if (!img) return
    if (!img.isExisting) URL.revokeObjectURL(img.previewUrl)
    state.images.splice(index, 1)
  }

  function moveImage(index: number, dir: -1 | 1): void {
    const target = index + dir
    if (target < 0 || target >= state.images.length) return
    const [a, b] = [state.images[index]!, state.images[target]!]
    state.images[index] = b
    state.images[target] = a
    // Re-number
    state.images.forEach((img, i) => (img.sort_order = i))
  }

  function validate(): string | null {
    if (!state.authorId) return '작성자를 선택하세요.'
    if (!state.content.trim()) return '본문을 입력하세요.'
    if (state.likeCount < 0 || state.commentCount < 0 || state.repostCount < 0) {
      return '반응 수는 0 이상이어야 합니다.'
    }
    return null
  }

  async function submit(mode: SubmitMode, postId?: string): Promise<string | null> {
    const err = validate()
    if (err) {
      state.validationError = err
      return null
    }
    state.validationError = null
    state.error = null
    state.loading = true
    let createdPostId: string | null = null
    const uploadedPaths: string[] = []

    try {
      const sb = await useSupabaseAdmin()
      if (!sb) throw new Error('Supabase admin client unavailable')

      // 1. upsert post row
      const postRow = {
        author_id: state.authorId,
        content: state.content,
        like_count: state.likeCount,
        comment_count: state.commentCount,
        repost_count: state.repostCount,
        is_following: state.isFollowing,
        created_at: new Date(state.createdAt).toISOString()
      }

      if (mode === 'create') {
        const { data, error } = await sb
          .from('posts')
          .insert(postRow)
          .select('id')
          .single()
        if (error) throw error
        createdPostId = (data as { id: string }).id
      } else {
        if (!postId) throw new Error('Missing postId for update')
        const { error } = await sb.from('posts').update(postRow).eq('id', postId)
        if (error) throw error
        createdPostId = postId
      }

      // 2. Upload any new images
      const finalImages: { image_path: string; sort_order: number }[] = []

      for (let i = 0; i < state.images.length; i++) {
        const img = state.images[i]!
        if (img.isExisting) {
          finalImages.push({ image_path: img.path, sort_order: i })
        } else {
          // Optimize first
          if (!img.optimizeResult) {
            img.optimizeResult = await optimizeImage(img.file)
          }
          const res = await uploadPostImage(
            createdPostId,
            img.optimizeResult.blob,
            img.optimizeResult.mimeType
          )
          uploadedPaths.push(res.path)
          finalImages.push({ image_path: res.path, sort_order: i })
        }
      }

      // 3. Replace post_images (delete-then-insert in edit mode; insert-only in create)
      if (mode === 'update') {
        const { error: eImgDel } = await sb
          .from('post_images')
          .delete()
          .eq('post_id', createdPostId)
        if (eImgDel) throw eImgDel
      }
      if (finalImages.length > 0) {
        const { error: eImgIns } = await sb
          .from('post_images')
          .insert(
            finalImages.map((i) => ({ ...i, post_id: createdPostId }))
          )
        if (eImgIns) throw eImgIns
      }

      // 4. Replace post_tags
      if (mode === 'update') {
        const { error: eTagDel } = await sb
          .from('post_tags')
          .delete()
          .eq('post_id', createdPostId)
        if (eTagDel) throw eTagDel
      }
      if (state.tags.length > 0) {
        const { error: eTagIns } = await sb
          .from('post_tags')
          .insert(
            state.tags.map((t, i) => ({
              post_id: createdPostId,
              label: t.label,
              variant: t.variant,
              sort_order: i
            }))
          )
        if (eTagIns) throw eTagIns
      }

      return createdPostId
    } catch (e) {
      // Cleanup on failure
      state.error = e instanceof Error ? e.message : String(e)
      if (createdPostId && mode === 'create') {
        try {
          const sb = await useSupabaseAdmin()
          if (sb) {
            await sb.from('posts').delete().eq('id', createdPostId)
          }
        } catch (cleanupErr) {
          if (import.meta.dev) console.warn('[submit cleanup]', cleanupErr)
        }
      }
      if (uploadedPaths.length > 0) {
        await deleteStoragePaths(uploadedPaths)
      }
      return null
    } finally {
      state.loading = false
    }
  }

  return {
    state,
    authors,
    loadAuthors,
    addAuthor,
    loadPost,
    addTag,
    removeTag,
    addNewImages,
    removeImage,
    moveImage,
    submit
  }
}
