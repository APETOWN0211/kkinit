<script setup lang="ts">
/*
 * /admin/posts
 * spec #9 / #10 — list posts with search, author filter, sort.
 */
import { useSupabaseAdmin } from '~/composables/useSupabaseTyped'
import type { PostRow, ProfileRow, PostImageRow } from '~/types/cms'
import { formatRelativeTime } from '~/utils/relative-time'
import { publicUrl } from '~/utils/admin-helpers'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const router = useRouter()

interface Row {
  post: PostRow
  author: ProfileRow
  imageCount: number
  thumbnail: string | null
}

const posts = ref<Row[]>([])
const loading = ref(true)
const errorMessage = ref<string | null>(null)
const searchText = ref('')
const authorFilter = ref<string>('all')
const sortMode = ref<'newest' | 'oldest'>('newest')
const deleteTarget = ref<Row | null>(null)
const deleting = ref(false)

const allAuthors = computed(() => {
  const map = new Map<string, ProfileRow>()
  for (const row of posts.value) map.set(row.author.id, row.author)
  return Array.from(map.values())
})

const filtered = computed<Row[]>(() => {
  let list = posts.value
  if (authorFilter.value !== 'all') {
    list = list.filter((r) => r.author.id === authorFilter.value)
  }
  if (searchText.value.trim()) {
    const q = searchText.value.trim().toLowerCase()
    list = list.filter(
      (r) =>
        r.post.content.toLowerCase().includes(q) ||
        r.author.display_name.toLowerCase().includes(q) ||
        r.author.username.toLowerCase().includes(q)
    )
  }
  list = [...list].sort((a, b) => {
    const ta = new Date(a.post.created_at).getTime()
    const tb = new Date(b.post.created_at).getTime()
    return sortMode.value === 'newest' ? tb - ta : ta - tb
  })
  return list
})

async function load(): Promise<void> {
  loading.value = true
  errorMessage.value = null
  try {
    const sb = await useSupabaseAdmin()
    if (!sb) {
      errorMessage.value = 'Supabase 환경변수가 설정되지 않았습니다.'
      return
    }
    const { data: postRows, error: e1 } = await sb
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (e1) throw e1

    const list = (postRows ?? []) as PostRow[]
    const authorIds = Array.from(new Set(list.map((p) => p.author_id)))
    const postIds = list.map((p) => p.id)

    const [{ data: profilesData, error: e2 }, { data: imagesData, error: e3 }] =
      await Promise.all([
        sb.from('profiles').select('*').in('id', authorIds),
        sb
          .from('post_images')
          .select('*')
          .in('post_id', postIds)
          .order('sort_order', { ascending: true })
      ])
    if (e2) throw e2
    if (e3) throw e3

    const profileById = new Map<string, ProfileRow>()
    for (const p of (profilesData ?? []) as ProfileRow[]) {
      profileById.set(p.id, p)
    }
    const imagesByPost = new Map<string, PostImageRow[]>()
    for (const img of (imagesData ?? []) as PostImageRow[]) {
      const arr = imagesByPost.get(img.post_id) ?? []
      arr.push(img)
      imagesByPost.set(img.post_id, arr)
    }

    posts.value = list.map((post) => {
      const author = profileById.get(post.author_id)
      if (!author) {
        throw new Error(`Missing profile for post ${post.id}`)
      }
      const imgs = imagesByPost.get(post.id) ?? []
      return {
        post,
        author,
        imageCount: imgs.length,
        thumbnail: imgs[0]?.image_path ?? null
      }
    })
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)

function contentSnippet(s: string, max = 60): string {
  if (s.length <= max) return s
  return s.slice(0, max) + '...'
}

function goNew(): void {
  router.push('/admin/posts/new')
}

function goEdit(id: string): void {
  router.push(`/admin/posts/${id}`)
}

function confirmDelete(row: Row): void {
  deleteTarget.value = row
}

async function doDelete(): Promise<void> {
  if (!deleteTarget.value) return
  const target = deleteTarget.value
  deleting.value = true
  try {
    const sb = await useSupabaseAdmin()
    if (!sb) return

    // 1) collect image paths
    const { data: imagesData, error: e1 } = await sb
      .from('post_images')
      .select('image_path')
      .eq('post_id', target.post.id)
    if (e1) throw e1
    const paths = (imagesData ?? []).map((r: { image_path: string }) => r.image_path)

    // 2) delete post (CASCADE removes post_images / post_tags)
    const { error: e2 } = await sb.from('posts').delete().eq('id', target.post.id)
    if (e2) throw e2

    // 3) delete storage
    if (paths.length > 0) {
      await sb.storage.from('kkinit-images').remove(paths)
    }

    deleteTarget.value = null
    await load()
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : String(e)
  } finally {
    deleting.value = false
  }
}

function avatarUrl(avatar: ProfileRow): string {
  return publicUrl(avatar.avatar_path ?? '')
}
</script>

<template>
  <div class="admin-posts">
    <header class="admin-posts__header">
      <h1 class="admin-posts__title">끼닛 게시글 관리</h1>
      <button class="admin-posts__new-btn" @click="goNew">+ 새 게시글</button>
    </header>

    <div class="admin-posts__toolbar">
      <input
        v-model="searchText"
        type="text"
        placeholder="제목/본문/작성자 검색..."
        class="admin-posts__search"
      />
      <select v-model="authorFilter" class="admin-posts__select">
        <option value="all">전체 작성자</option>
        <option v-for="a in allAuthors" :key="a.id" :value="a.id">
          {{ a.display_name }} (@{{ a.username }})
        </option>
      </select>
      <select v-model="sortMode" class="admin-posts__select">
        <option value="newest">최신순</option>
        <option value="oldest">오래된순</option>
      </select>
      <button class="admin-posts__refresh" @click="load">새로고침</button>
    </div>

    <p v-if="errorMessage" class="admin-posts__error">{{ errorMessage }}</p>

    <div v-if="loading" class="admin-posts__loading">불러오는 중...</div>

    <div v-else-if="filtered.length === 0" class="admin-posts__empty">
      아직 게시글이 없어요.
    </div>

    <table v-else class="admin-posts__table">
      <thead>
        <tr>
          <th>썸네일</th>
          <th>작성자</th>
          <th>본문</th>
          <th>이미지</th>
          <th>좋아요</th>
          <th>댓글</th>
          <th>리포스트</th>
          <th>작성</th>
          <th>관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in filtered" :key="row.post.id">
          <td>
            <div class="admin-posts__thumb">
              <img v-if="row.thumbnail" :src="publicUrl(row.thumbnail)" alt="" />
              <span v-else class="admin-posts__thumb-empty">—</span>
            </div>
          </td>
          <td>
            <div class="admin-posts__author">
              <img
                v-if="row.author.avatar_path"
                class="admin-posts__author-avatar"
                :src="avatarUrl(row.author)"
                :alt="row.author.display_name"
              />
              <span v-else class="admin-posts__author-avatar admin-posts__author-avatar--empty" />
              <div>
                <div class="admin-posts__author-name">{{ row.author.display_name }}</div>
                <div class="admin-posts__author-handle">@{{ row.author.username }}</div>
              </div>
            </div>
          </td>
          <td class="admin-posts__snippet">
            {{ contentSnippet(row.post.content) }}
          </td>
          <td>{{ row.imageCount }}장</td>
          <td>{{ row.post.like_count }}</td>
          <td>{{ row.post.comment_count }}</td>
          <td>{{ row.post.repost_count }}</td>
          <td>{{ formatRelativeTime(row.post.created_at) }}</td>
          <td class="admin-posts__actions">
            <button class="admin-posts__edit" @click="goEdit(row.post.id)">수정</button>
            <button class="admin-posts__delete" @click="confirmDelete(row)">삭제</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="deleteTarget" class="admin-posts__modal">
      <div class="admin-posts__modal-card">
        <h2>이 게시글을 삭제할까요?</h2>
        <p>{{ deleteTarget.author.display_name }} · {{ contentSnippet(deleteTarget.post.content, 30) }}</p>
        <p class="admin-posts__modal-warning">첨부 이미지도 함께 삭제됩니다.</p>
        <div class="admin-posts__modal-actions">
          <button class="admin-posts__modal-cancel" @click="deleteTarget = null">취소</button>
          <button class="admin-posts__modal-confirm" :disabled="deleting" @click="doDelete">
            {{ deleting ? '삭제 중...' : '삭제' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-posts {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;
}
.admin-posts__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.admin-posts__title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #191919;
}
.admin-posts__new-btn {
  height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 12px;
  background: #FE5531;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 120ms ease;
}
.admin-posts__new-btn:hover { background: #E64A2A; }

.admin-posts__toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.admin-posts__search,
.admin-posts__select {
  height: 36px;
  padding: 0 12px;
  border: 1px solid #E2E5EA;
  border-radius: 8px;
  background: #FFFFFF;
  font-size: 14px;
  font-family: inherit;
  color: #191919;
  outline: none;
}
.admin-posts__search { flex: 1 1 240px; }
.admin-posts__search:focus,
.admin-posts__select:focus { border-color: #FE5531; }
.admin-posts__refresh {
  height: 36px;
  padding: 0 14px;
  border: 1px solid #E2E5EA;
  border-radius: 8px;
  background: #FFFFFF;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
  color: #4D5160;
}
.admin-posts__refresh:hover { background: #F5F6F8; }

.admin-posts__error {
  margin: 0 0 12px;
  padding: 10px 14px;
  background: #FEE2E2;
  color: #B91C1C;
  border-radius: 8px;
  font-size: 13px;
}
.admin-posts__loading,
.admin-posts__empty {
  padding: 60px 0;
  text-align: center;
  color: #73787E;
  font-size: 14px;
}

.admin-posts__table {
  width: 100%;
  background: #FFFFFF;
  border-radius: 12px;
  border: 1px solid #E2E5EA;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  font-size: 13px;
}
.admin-posts__table th,
.admin-posts__table td {
  padding: 12px 14px;
  text-align: left;
  vertical-align: middle;
  border-bottom: 1px solid #F3F4F6;
}
.admin-posts__table th {
  background: #F9FAFB;
  color: #73787E;
  font-weight: 600;
  font-size: 12px;
  white-space: nowrap;
}
.admin-posts__table tbody tr:last-child td { border-bottom: 0; }
.admin-posts__table tbody tr:hover { background: #FAFAFA; }

.admin-posts__thumb {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  background: #F3F4F6;
  display: flex;
  align-items: center;
  justify-content: center;
}
.admin-posts__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.admin-posts__thumb-empty {
  font-size: 12px;
  color: #A0A4AB;
}
.admin-posts__author {
  display: flex;
  align-items: center;
  gap: 8px;
}
.admin-posts__author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  object-fit: cover;
  background: #F3F4F6;
  flex-shrink: 0;
}
.admin-posts__author-avatar--empty {
  display: inline-block;
}
.admin-posts__author-name {
  font-weight: 600;
  color: #191919;
}
.admin-posts__author-handle {
  color: #73787E;
  font-size: 12px;
}
.admin-posts__snippet {
  max-width: 280px;
  color: #4D5160;
  white-space: pre-line;
  word-break: keep-all;
  font-size: 13px;
  line-height: 1.45;
}
.admin-posts__actions {
  display: flex;
  gap: 6px;
}
.admin-posts__edit,
.admin-posts__delete {
  height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.admin-posts__edit {
  background: #F5F6F8;
  color: #191919;
}
.admin-posts__edit:hover { background: #ECEEF1; }
.admin-posts__delete {
  background: #FEE2E2;
  color: #B91C1C;
}
.admin-posts__delete:hover { background: #FECACA; }

.admin-posts__modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.admin-posts__modal-card {
  background: #FFFFFF;
  padding: 24px;
  border-radius: 12px;
  max-width: 360px;
  width: 100%;
}
.admin-posts__modal-card h2 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: #191919;
}
.admin-posts__modal-card p {
  margin: 0 0 8px;
  color: #4D5160;
  font-size: 13px;
}
.admin-posts__modal-warning {
  color: #B91C1C;
  font-size: 12px;
}
.admin-posts__modal-actions {
  display: flex;
  gap: 8px;
  margin-top: 20px;
  justify-content: flex-end;
}
.admin-posts__modal-cancel,
.admin-posts__modal-confirm {
  height: 36px;
  padding: 0 16px;
  border: 0;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.admin-posts__modal-cancel {
  background: #F5F6F8;
  color: #4D5160;
}
.admin-posts__modal-confirm {
  background: #FE5531;
  color: #FFFFFF;
}
.admin-posts__modal-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
