<script setup lang="ts">
/*
 * Admin post form (shared by /admin/posts/new and /admin/posts/[id]).
 *
 * spec #11 — UI:
 *   - 작성자 select
 *   - 작성자 preview
 *   - 본문 textarea
 *   - 태그 editor + 미리보기
 *   - 이미지 업로드 + 미리보기
 *   - 좋아요/댓글/리포스트
 *   - 팔로잉 상태
 *   - 작성 시간 (admin override)
 *   - [취소] / [게시하기]
 *
 * Right side: live preview (spec #23) using the SAME FeedPost component
 * (spec #24 — no copy).
 */
import { getStorageImageUrl, STORAGE_FOLDERS } from '~/utils/storage'
import { publicUrl } from '~/utils/admin-helpers'
import { formatRelativeTime } from '~/utils/relative-time'
import type { ChipVariant, ProfileRow } from '~/types/cms'
import type { FeedPost } from '~/components/feed/FeedPost.vue'

const props = defineProps<{
  mode: 'create' | 'update'
  state: ReturnType<typeof usePostForm>['state']
  authors: ProfileRow[]
  loading: boolean
  /*
   * 작성자 추가 함수 — 부모 (new.vue / [id].vue) 가
   * usePostForm().addAuthor 를 그대로 넘긴다. await 가능.
   * 성공 시 state.authorId 갱신 + authors 갱신까지 끝낸다.
   * 실패 시 state.error 에 메시지 세팅.
   */
  addAuthor?: (
    username: string,
    displayName: string,
    avatarFile: File | null
  ) => Promise<{ ok: true; id: string } | { ok: false; error: string }>
}>()

const emit = defineEmits<{
  submit: []
  cancel: []
  'add-image': [files: File[]]
  'remove-image': [index: number]
  'move-image': [index: number, dir: -1 | 1]
  'add-tag': [label: string, variant: ChipVariant]
  'remove-tag': [index: number]
  'prefetch-author': [authorId: string]
}>()

const newTagLabel = ref('')
const newTagVariant = ref<ChipVariant>('orange')
const fileInput = ref<HTMLInputElement | null>(null)
const authorFileInput = ref<HTMLInputElement | null>(null)
const submitting = ref(false)

const showAuthorForm = ref(false)
const newAuthorUsername = ref('')
const newAuthorDisplayName = ref('')
const newAuthorFile = ref<File | null>(null)
const newAuthorPreviewUrl = ref<string | null>(null)
const newAuthorBusy = ref(false)
const newAuthorError = ref<string | null>(null)

function toggleAuthorForm(): void {
  showAuthorForm.value = !showAuthorForm.value
  if (!showAuthorForm.value) {
    // reset
    newAuthorUsername.value = ''
    newAuthorDisplayName.value = ''
    if (newAuthorPreviewUrl.value) URL.revokeObjectURL(newAuthorPreviewUrl.value)
    newAuthorFile.value = null
    newAuthorPreviewUrl.value = null
    newAuthorError.value = null
  }
}

function onAuthorFileChange(e: Event): void {
  const input = e.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return
  const f = input.files[0]!
  if (newAuthorPreviewUrl.value) URL.revokeObjectURL(newAuthorPreviewUrl.value)
  newAuthorFile.value = f
  newAuthorPreviewUrl.value = URL.createObjectURL(f)
  input.value = ''
}

function clearAuthorFile(): void {
  if (newAuthorPreviewUrl.value) URL.revokeObjectURL(newAuthorPreviewUrl.value)
  newAuthorFile.value = null
  newAuthorPreviewUrl.value = null
}

async function submitAuthorForm(): Promise<void> {
  if (newAuthorBusy.value) return
  if (!props.addAuthor) {
    newAuthorError.value = '작성자 추가 기능이 연결되지 않았습니다.'
    return
  }
  newAuthorBusy.value = true
  newAuthorError.value = null
  try {
    const res = await props.addAuthor(
      newAuthorUsername.value,
      newAuthorDisplayName.value,
      newAuthorFile.value
    )
    if (!res.ok) {
      newAuthorError.value = res.error
      return
    }
    // success — authorId watcher closes the form.
  } catch (e) {
    newAuthorError.value = e instanceof Error ? e.message : String(e)
  } finally {
    newAuthorBusy.value = false
  }
}

watch(
  () => props.state.authorId,
  (id) => {
    if (id && showAuthorForm.value) {
      // success — close & reset
      toggleAuthorForm()
    }
  }
)

const selectedAuthor = computed<ProfileRow | null>(() => {
  if (!props.state.authorId) return null
  return props.authors.find((a) => a.id === props.state.authorId) ?? null
})

const variantOptions: ChipVariant[] = ['orange', 'teal', 'lime', 'gray']

function onFileChange(e: Event): void {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  const files = Array.from(input.files)
  if (files.length === 0) return
  emit('add-image', files)
  input.value = ''
}

function onAddTag(): void {
  if (!newTagLabel.value.trim()) return
  emit('add-tag', newTagLabel.value, newTagVariant.value)
  newTagLabel.value = ''
}

function authorPreviewUrl(): string {
  return publicUrl(selectedAuthor.value?.avatar_path ?? '')
}

/* Build a live-preview FeedPost shape from the form state. */
const previewPost = computed<FeedPost>(() => {
  // Render content as a single line; chips from tags are inserted as plain text
  // (FeedPost's chip rendering happens through its own ContentLine[][]).
  const tagsSorted = [...props.state.tags].sort(
    (a, b) => a.sort_order - b.sort_order
  )
  const images = props.state.images
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((img) => {
      if (img.isExisting) {
        return getStorageImageUrl(img.path, STORAGE_FOLDERS.feed)
      }
      return img.previewUrl
    })

  // Parse content into ContentLine[][]
  const content: FeedPost['content'] = props.state.content
    .split('\n')
    .map((line) => {
      if (tagsSorted.length === 0) return [{ text: line }]
      const segments: FeedPost['content'][number] = []
      let remaining = line
      while (remaining.length > 0) {
        let bestIdx = -1
        let bestTag: typeof tagsSorted[number] | null = null
        for (const tag of tagsSorted) {
          const idx = remaining.indexOf(tag.label)
          if (idx < 0) continue
          if (bestIdx === -1 || idx < bestIdx) {
            bestIdx = idx
            bestTag = tag
          }
        }
        if (!bestTag) {
          segments.push({ text: remaining })
          break
        }
        if (bestIdx > 0) segments.push({ text: remaining.slice(0, bestIdx) })
        segments.push({
          text: bestTag.label,
          isChip: true,
          chipType: bestTag.variant
        })
        remaining = remaining.slice(bestIdx + bestTag.label.length)
      }
      return segments
    })

  return {
    id: 0,
    author: {
      name: selectedAuthor.value?.display_name ?? '작성자',
      avatar: authorPreviewUrl() || getStorageImageUrl('', STORAGE_FOLDERS.chat),
      isFollowing: props.state.isFollowing
    },
    time: formatRelativeTime(new Date(props.state.createdAt).toISOString()),
    content,
    images,
    likes: props.state.likeCount,
    comments: props.state.commentCount,
    reposts: props.state.repostCount,
    isLiked: false,
    isReposted: false,
    isBookmarked: false
  }
})

function onCancel(): void {
  emit('cancel')
}

function onSubmit(): void {
  if (submitting.value || props.loading) return
  emit('submit')
}
</script>

<template>
  <div class="post-form">
    <div class="post-form__col">
      <h2 class="post-form__heading">
        {{ mode === 'create' ? '게시글 작성' : '게시글 수정' }}
      </h2>

      <p v-if="state.error" class="post-form__error">{{ state.error }}</p>
      <p v-if="state.validationError" class="post-form__validation">
        {{ state.validationError }}
      </p>

      <label class="post-form__label">
        작성자
        <select v-model="state.authorId" class="post-form__input" :disabled="loading">
          <option value="">— 선택 —</option>
          <option v-for="a in authors" :key="a.id" :value="a.id">
            {{ a.display_name }} (@{{ a.username }})
          </option>
        </select>
      </label>

      <button
        type="button"
        class="post-form__toggle"
        :disabled="loading"
        @click="toggleAuthorForm"
      >
        {{ showAuthorForm ? '– 새 작성자 닫기' : '+ 새 작성자 추가' }}
      </button>

      <div v-if="showAuthorForm" class="post-form__author-create">
        <div class="post-form__author-create-avatar">
          <img
            v-if="newAuthorPreviewUrl"
            :src="newAuthorPreviewUrl"
            class="post-form__author-create-img"
            alt="새 작성자 아바타"
          />
          <span v-else class="post-form__author-create-img post-form__author-create-img--empty" />
          <input
            ref="authorFileInput"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            class="post-form__file-input"
            :disabled="newAuthorBusy || loading"
            @change="onAuthorFileChange"
          />
          <div class="post-form__author-create-avatar-actions">
            <button
              type="button"
              class="post-form__add-btn post-form__add-btn--small"
              :disabled="newAuthorBusy || loading"
              @click="authorFileInput?.click()"
            >아바타 선택</button>
            <button
              v-if="newAuthorFile"
              type="button"
              class="post-form__add-btn post-form__add-btn--small post-form__add-btn--ghost"
              :disabled="newAuthorBusy || loading"
              @click="clearAuthorFile"
            >제거</button>
          </div>
        </div>

        <div class="post-form__author-create-fields">
          <label class="post-form__label">
            username
            <input
              v-model="newAuthorUsername"
              type="text"
              placeholder="예: kurumi"
              class="post-form__input"
              :disabled="newAuthorBusy || loading"
            />
          </label>
          <label class="post-form__label">
            표시 이름
            <input
              v-model="newAuthorDisplayName"
              type="text"
              placeholder="예: 쿠루미"
              class="post-form__input"
              :disabled="newAuthorBusy || loading"
            />
          </label>
          <p v-if="newAuthorError" class="post-form__error">{{ newAuthorError }}</p>
          <div class="post-form__author-create-actions">
            <button
              type="button"
              class="post-form__cancel"
              :disabled="newAuthorBusy || loading"
              @click="toggleAuthorForm"
            >닫기</button>
            <button
              type="button"
              class="post-form__submit"
              :disabled="newAuthorBusy || loading || !newAuthorUsername.trim() || !newAuthorDisplayName.trim()"
              @click="submitAuthorForm"
            >{{ newAuthorBusy ? '추가 중...' : '작성자 추가' }}</button>
          </div>
        </div>
      </div>

      <div v-if="selectedAuthor" class="post-form__author-preview">
        <img
          v-if="selectedAuthor.avatar_path"
          :src="authorPreviewUrl()"
          class="post-form__author-avatar"
          :alt="selectedAuthor.display_name"
        />
        <span v-else class="post-form__author-avatar post-form__author-avatar--empty" />
        <div>
          <div class="post-form__author-name">{{ selectedAuthor.display_name }}</div>
          <div class="post-form__author-handle">@{{ selectedAuthor.username }}</div>
        </div>
      </div>

      <label class="post-form__label">
        게시글 내용
        <textarea
          v-model="state.content"
          rows="6"
          class="post-form__textarea"
          placeholder="내용을 입력하세요. 줄바꿈은 그대로 표시됩니다."
          :disabled="loading"
        />
      </label>

      <div class="post-form__group">
        <div class="post-form__group-header">태그</div>
        <div class="post-form__tag-list">
          <span
            v-for="(t, i) in state.tags"
            :key="`${t.label}-${i}`"
            class="post-form__tag-chip"
            :class="`post-form__tag-chip--${t.variant}`"
          >
            {{ t.label }}
            <button
              type="button"
              class="post-form__tag-remove"
              aria-label="태그 삭제"
              :disabled="loading"
              @click="emit('remove-tag', i)"
            >×</button>
          </span>
        </div>
        <div class="post-form__tag-editor">
          <input
            v-model="newTagLabel"
            type="text"
            placeholder="태그 텍스트"
            class="post-form__input post-form__input--small"
            :disabled="loading"
          />
          <select v-model="newTagVariant" class="post-form__input post-form__input--small" :disabled="loading">
            <option v-for="v in variantOptions" :key="v" :value="v">{{ v }}</option>
          </select>
          <button
            type="button"
            class="post-form__add-btn"
            :disabled="!newTagLabel.trim() || loading"
            @click="onAddTag"
          >+ 태그 추가</button>
        </div>
      </div>

      <div class="post-form__group">
        <div class="post-form__group-header">사진</div>
        <input
          ref="fileInput"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          class="post-form__file-input"
          :disabled="loading"
          @change="onFileChange"
        />
        <button
          type="button"
          class="post-form__add-btn"
          :disabled="loading"
          @click="fileInput?.click()"
        >업로드</button>

        <div v-if="state.images.length > 0" class="post-form__image-list">
          <div
            v-for="(img, i) in state.images"
            :key="img.isExisting ? img.path : img.id"
            class="post-form__image-item"
          >
            <img
              :src="img.isExisting ? getStorageImageUrl(img.path, STORAGE_FOLDERS.feed) : img.previewUrl"
              alt=""
              class="post-form__image-preview"
            />
            <div class="post-form__image-actions">
              <button
                type="button"
                class="post-form__img-btn"
                :disabled="i === 0 || loading"
                aria-label="왼쪽으로"
                @click="emit('move-image', i, -1)"
              >←</button>
              <button
                type="button"
                class="post-form__img-btn"
                :disabled="i === state.images.length - 1 || loading"
                aria-label="오른쪽으로"
                @click="emit('move-image', i, 1)"
              >→</button>
              <button
                type="button"
                class="post-form__img-btn post-form__img-btn--danger"
                :disabled="loading"
                aria-label="삭제"
                @click="emit('remove-image', i)"
              >×</button>
            </div>
          </div>
        </div>
      </div>

      <div class="post-form__row">
        <label class="post-form__label post-form__label--inline">
          좋아요
          <input
            v-model.number="state.likeCount"
            type="number"
            min="0"
            class="post-form__input post-form__input--small"
            :disabled="loading"
          />
        </label>
        <label class="post-form__label post-form__label--inline">
          댓글
          <input
            v-model.number="state.commentCount"
            type="number"
            min="0"
            class="post-form__input post-form__input--small"
            :disabled="loading"
          />
        </label>
        <label class="post-form__label post-form__label--inline">
          리포스트
          <input
            v-model.number="state.repostCount"
            type="number"
            min="0"
            class="post-form__input post-form__input--small"
            :disabled="loading"
          />
        </label>
      </div>

      <label class="post-form__label post-form__label--check">
        <input
          v-model="state.isFollowing"
          type="checkbox"
          :disabled="loading"
        />
        이 작성자를 팔로우 중
      </label>

      <label class="post-form__label">
        작성 시간
        <input
          v-model="state.createdAt"
          type="datetime-local"
          class="post-form__input"
          :disabled="loading"
        />
      </label>

      <div class="post-form__actions">
        <button
          type="button"
          class="post-form__cancel"
          :disabled="loading"
          @click="onCancel"
        >취소</button>
        <button
          type="button"
          class="post-form__submit"
          :disabled="loading"
          @click="onSubmit"
        >
          {{ loading ? '저장 중...' : (mode === 'create' ? '게시하기' : '저장하기') }}
        </button>
      </div>
    </div>

    <div class="post-form__col post-form__col--preview">
      <h2 class="post-form__heading">실시간 미리보기</h2>
      <div class="post-form__preview-frame">
        <FeedPost :post="previewPost" :show-bookmark="false" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px;
}
@media (max-width: 1024px) {
  .post-form {
    grid-template-columns: 1fr;
  }
}
.post-form__col {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
}
.post-form__heading {
  margin: 0 0 20px;
  font-size: 20px;
  font-weight: 700;
  color: #191919;
}
.post-form__error,
.post-form__validation {
  margin: 0 0 12px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
}
.post-form__error {
  background: #FEE2E2;
  color: #B91C1C;
}
.post-form__validation {
  background: #FEF3C7;
  color: #92400E;
}
.post-form__label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #4D5160;
  margin-bottom: 14px;
}
.post-form__label--inline {
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  margin-right: 12px;
}
.post-form__label--check {
  flex-direction: row;
  align-items: center;
  gap: 8px;
}
.post-form__input,
.post-form__textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #E2E5EA;
  border-radius: 8px;
  background: #FFFFFF;
  font-size: 14px;
  color: #191919;
  font-family: inherit;
  outline: none;
}
.post-form__input--small {
  width: auto;
  min-width: 80px;
}
.post-form__textarea {
  resize: vertical;
  line-height: 1.5;
  white-space: pre-wrap;
}
.post-form__input:focus,
.post-form__textarea:focus {
  border-color: #FE5531;
}

.post-form__author-preview {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #F9FAFB;
  border-radius: 8px;
  margin-bottom: 16px;
}
.post-form__author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  object-fit: cover;
  background: #F3F4F6;
}
.post-form__author-avatar--empty {
  display: inline-block;
}
.post-form__author-name {
  font-weight: 600;
  color: #191919;
  font-size: 14px;
}
.post-form__author-handle {
  color: #73787E;
  font-size: 12px;
}

.post-form__group {
  margin-bottom: 16px;
  padding: 14px;
  background: #F9FAFB;
  border-radius: 8px;
}
.post-form__group-header {
  font-size: 13px;
  font-weight: 600;
  color: #4D5160;
  margin-bottom: 10px;
}
.post-form__tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 10px;
}
.post-form__tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
}
.post-form__tag-chip--orange { background: #FFE4D6; color: #C7392C; }
.post-form__tag-chip--teal { background: #C1F2EA; color: #1B7A6B; }
.post-form__tag-chip--lime { background: #E4F8C5; color: #4A6B0F; }
.post-form__tag-chip--gray { background: #E5E7EB; color: #4B5563; }
.post-form__tag-remove {
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0;
}
.post-form__tag-editor {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.post-form__add-btn {
  height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  background: #FE5531;
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.post-form__add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.post-form__file-input {
  display: none;
}
.post-form__image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}
.post-form__image-item {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 8px;
  overflow: hidden;
  background: #F3F4F6;
}
.post-form__image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.post-form__image-actions {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  padding: 4px;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.5));
  opacity: 0;
  transition: opacity 120ms ease;
}
.post-form__image-item:hover .post-form__image-actions {
  opacity: 1;
}
.post-form__img-btn {
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 4px;
  background: #FFFFFF;
  color: #191919;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}
.post-form__img-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.post-form__img-btn--danger {
  color: #B91C1C;
}

.post-form__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 8px;
}

.post-form__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #F3F4F6;
}
.post-form__cancel,
.post-form__submit {
  height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}
.post-form__cancel {
  background: #F5F6F8;
  color: #4D5160;
}
.post-form__cancel:hover { background: #ECEEF1; }
.post-form__submit {
  background: #FE5531;
  color: #FFFFFF;
}
.post-form__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.post-form__toggle {
  border: 0;
  background: transparent;
  color: #FE5531;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin: -8px 0 14px;
  font-family: inherit;
}
.post-form__toggle:disabled { opacity: 0.5; cursor: not-allowed; }

.post-form__author-create {
  display: flex;
  gap: 16px;
  padding: 14px;
  margin-bottom: 16px;
  background: #FFF7F4;
  border: 1px dashed #FE5531;
  border-radius: 8px;
}
.post-form__author-create-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 96px;
}
.post-form__author-create-img {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  object-fit: cover;
  background: #F3F4F6;
}
.post-form__author-create-img--empty {
  display: inline-block;
  border: 1px dashed #D1D5DB;
}
.post-form__author-create-avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.post-form__author-create-fields {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.post-form__author-create-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 8px;
}
.post-form__add-btn--small {
  height: 30px;
  padding: 0 10px;
  font-size: 12px;
}
.post-form__add-btn--ghost {
  background: #F5F6F8;
  color: #4D5160;
}
.post-form__add-btn--ghost:hover { background: #ECEEF1; }

.post-form__col--preview {
  background: #F3F4F6;
}
.post-form__preview-frame {
  background: #FAFAFA;
  border-radius: 12px;
  padding: 0;
  max-width: 390px;
  margin: 0 auto;
  border: 1px solid #E2E5EA;
}
</style>
