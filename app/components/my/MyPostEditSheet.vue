<script setup lang="ts">
/*
 * MyPostEditSheet.vue
 *
 * /my › Feed 탭에서 내 게시글 더보기(more) 아이콘을 누르면
 * 아래에서 올라오는 수정 시트. content 텍스트와 시간을 수정할 수 있고
 * 저장을 누르면 부모 (my.vue) 가 myPosts 배열을 in-place 갱신한다.
 *
 * Spec:
 *  - content: ContentLine[][] → plain text 로 직렬화 (줄바꿈 = line break,
 *    chip 텍스트도 그대로 노출. 사용자가 chip prefix(#, @) 를 유지하면
 *    부모가 다시 chip 으로 변환).
 *  - createdAt: ISO string, 기본값은 현재 post.createdAt, "지금" 으로
 *    한 번에 갱신 가능.
 *  - 리포스트 (isReposted) 게시글은 호출되지 않는다 (부모에서 차단).
 */
import closeIcon from '~/assets/icons/my/close.svg?raw'
import type { FeedPost } from '~/components/feed/FeedPost.vue'
import { formatRelativeTime } from '~/utils/relative-time'

const props = defineProps<{
  post: FeedPost
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', payload: { id: number; content: string; createdAt: string }): void
}>()

/*
 * ContentLine[][] → plain text
 *  - 각 line 은 개행 (\n) 으로 join
 *  - 한 line 안의 segment 는 공백으로 join
 *  - chip 텍스트도 그대로 (사용자가 지우면 chip 도 사라짐 = 의도)
 */
const initialText = computed(() => {
  return props.post.content
    .map(line => line.map(seg => seg.text).join(' '))
    .join('\n')
})

const draftText = ref('')
/*
 * createdAt 은 ISO string 으로 저장 (Supabase 호환).
 * UI 에서는 "1분 전" 같은 상대 시간 단위로만 입력받는다.
 */
const draftCreatedAt = ref('')

/*
 * 시트가 열릴 때마다 (post 가 바뀌거나 다시 열릴 때) draft 초기화.
 * props.open 이 true 가 되는 순간 watch 로 잡는다.
 */
watch(
  () => [props.open, props.post.id],
  ([isOpen]) => {
    if (isOpen) {
      draftText.value = initialText.value
      draftCreatedAt.value = props.post.createdAt ?? new Date().toISOString()
    }
  },
  { immediate: true }
)

const isTextEmpty = computed(() => draftText.value.trim().length === 0)

/* =========================================
   작성 시간 — 상대 시간 프리셋
   =========================================
 * 사용자가 게시글 시간을 "1분 전 / 5분 전 / 1시간 전" 처럼
 * 직관적인 단위로 선택할 수 있게 한다.
 *
 *  - 값은 minutes (정수) 로 저장
 *  - 0 분 = "방금 전"
 *  - 0~59 분 = N 분 전
 *  - 60 분 단위 = N 시간 전
 *  - 1440 분 단위 = N 일 전
 *  - 10080 분 단위 = N 주 전
 */
interface TimePreset {
  label: string
  minutes: number
}

const TIME_PRESETS: TimePreset[] = [
  { label: '방금', minutes: 0 },
  { label: '1분 전', minutes: 1 },
  { label: '5분 전', minutes: 5 },
  { label: '10분 전', minutes: 10 },
  { label: '30분 전', minutes: 30 },
  { label: '1시간 전', minutes: 60 },
  { label: '3시간 전', minutes: 60 * 3 },
  { label: '6시간 전', minutes: 60 * 6 },
  { label: '12시간 전', minutes: 60 * 12 },
  { label: '1일 전', minutes: 60 * 24 },
  { label: '2일 전', minutes: 60 * 24 * 2 },
  { label: '3일 전', minutes: 60 * 24 * 3 },
  { label: '1주 전', minutes: 60 * 24 * 7 },
  { label: '2주 전', minutes: 60 * 24 * 14 }
]

/*
 * draftCreatedAt (ISO) → 분 단위로 환산.
 * createdAt 이 "now" 보다 얼마나 전인지.
 */
const selectedMinutes = computed<number | null>(() => {
  if (!draftCreatedAt.value) return null
  const ts = new Date(draftCreatedAt.value).getTime()
  if (Number.isNaN(ts)) return null
  const diffMs = Date.now() - ts
  if (diffMs < 30_000) return 0 // 방금
  return Math.max(0, Math.round(diffMs / 60_000))
})

/*
 * 프리셋 버튼 클릭 — 분 만큼 빼서 ISO 갱신.
 * 자정(00:00:00) 을 넘기면 자동으로 어제로 이동.
 */
const setPreset = (minutes: number) => {
  const d = new Date(Date.now() - minutes * 60_000)
  draftCreatedAt.value = d.toISOString()
}

/*
 * 현재 draftCreatedAt 의 "1분 전 / 1시간 전 / 1일 전" 표기.
 * formatRelativeTime 와 동일 포맷이므로 미리보기와 일치.
 */
const previewRelative = computed(() => {
  if (!draftCreatedAt.value) return ''
  return formatRelativeTime(draftCreatedAt.value)
})

/*
 * "직접" 모드 — datetime input 으로 세밀 조정.
 * 시트가 열려있을 때만 동작.
 */
const showCustomTime = ref(false)
const customTimeLocal = ref('')

watch(
  () => [props.open, draftCreatedAt.value],
  ([isOpen]) => {
    if (isOpen) {
      // datetime-local 은 "yyyy-MM-ddTHH:mm" 형식
      customTimeLocal.value = draftCreatedAt.value
        ? new Date(draftCreatedAt.value).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16)
    }
  },
  { immediate: true }
)

const onCustomTimeChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.value) return
  const d = new Date(target.value)
  if (Number.isNaN(d.getTime())) return
  draftCreatedAt.value = d.toISOString()
}

const onSave = () => {
  if (isTextEmpty.value) return
  emit('save', {
    id: props.post.id,
    content: draftText.value,
    createdAt: draftCreatedAt.value || new Date().toISOString()
  })
}

const onBackdropClick = () => {
  emit('close')
}

const onTextareaInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement
  draftText.value = target.value
}
</script>

<template>
  <Teleport to="body">
    <Transition name="edit-sheet">
      <div v-if="open" class="edit-sheet-root" role="dialog" aria-modal="true">
        <div class="edit-sheet-backdrop" @click="onBackdropClick" />
        <div class="edit-sheet">
          <!--
            Figma 마이탭 수정 시트 참고안함 — 자체 디자인.
            - handle bar 32 × 4 px
            - header  : 닫기 (X) + "게시글 수정" + 저장
            - body    : textarea + 시간 row
          -->
          <div class="edit-sheet__handle" aria-hidden="true" />

          <header class="edit-sheet__header">
            <button
              type="button"
              class="edit-sheet__icon-button"
              aria-label="닫기"
              @click="onBackdropClick"
            >
              <span class="edit-sheet__icon" v-html="closeIcon" />
            </button>
            <h2 class="edit-sheet__title">게시글 수정</h2>
            <button
              type="button"
              class="edit-sheet__save"
              :disabled="isTextEmpty"
              @click="onSave"
            >
              저장
            </button>
          </header>

          <div class="edit-sheet__body">
            <textarea
              class="edit-sheet__textarea"
              :value="draftText"
              rows="6"
              maxlength="500"
              placeholder="게시글을 입력하세요"
              @input="onTextareaInput"
            />

            <div class="edit-sheet__time-section">
              <div class="edit-sheet__time-header">
                <span class="edit-sheet__time-label">작성 시간</span>
                <span class="edit-sheet__time-preview">
                  {{ previewRelative || '—' }}
                </span>
              </div>

              <!--
                상대 시간 프리셋 — 칩 형태.
                선택된 분(=selectedMinutes) 와 일치하는 칩은 active.
              -->
              <div class="edit-sheet__preset-grid" role="radiogroup" aria-label="작성 시간">
                <button
                  v-for="preset in TIME_PRESETS"
                  :key="preset.minutes"
                  type="button"
                  class="edit-sheet__preset"
                  :class="{
                    'edit-sheet__preset--active':
                      selectedMinutes === preset.minutes
                  }"
                  role="radio"
                  :aria-checked="selectedMinutes === preset.minutes"
                  @click="setPreset(preset.minutes)"
                >
                  {{ preset.label }}
                </button>
                <button
                  type="button"
                  class="edit-sheet__preset edit-sheet__preset--toggle"
                  :class="{
                    'edit-sheet__preset--active': showCustomTime
                  }"
                  @click="showCustomTime = !showCustomTime"
                >
                  직접
                </button>
              </div>

              <!--
                직접 — datetime input 으로 세밀 조정.
                showCustomTime 가 true 일 때만 펼쳐진다.
              -->
              <div v-if="showCustomTime" class="edit-sheet__custom-time">
                <input
                  type="datetime-local"
                  class="edit-sheet__datetime"
                  :value="customTimeLocal"
                  @change="onCustomTimeChange"
                />
                <span class="edit-sheet__custom-hint">
                  직접 입력한 날짜/시간으로 설정됩니다
                </span>
              </div>
            </div>

            <p class="edit-sheet__hint">
              # 또는 @ 로 시작하는 단어는 칩으로 표시됩니다
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.edit-sheet-root {
  position: fixed;
  inset: 0;
  z-index: 1000;

  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.edit-sheet-backdrop {
  position: absolute;
  inset: 0;

  background: rgba(0, 0, 0, 0.45);
}

.edit-sheet {
  position: relative;

  display: flex;
  flex-direction: column;

  width: 100%;
  max-width: 480px;
  max-height: 80vh;

  padding: 8px 20px 24px;
  box-sizing: border-box;

  background: #ffffff;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.12);
}

.edit-sheet__handle {
  align-self: center;
  width: 32px;
  height: 4px;
  margin-bottom: 12px;
  border-radius: 999px;
  background: #e5e7eb;
}

.edit-sheet__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  margin-bottom: 16px;
}

.edit-sheet__icon-button {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 36px;
  height: 36px;
  padding: 0;

  border: 0;
  background: transparent;
  border-radius: 999px;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.edit-sheet__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 20px;
  height: 20px;

  color: #191919;
}

.edit-sheet__icon :deep(svg) {
  display: block;
  width: 20px;
  height: 20px;
}

.edit-sheet__title {
  flex: 1;
  margin: 0;

  font-size: 17px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.4px;
  text-align: center;

  color: #191919;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

.edit-sheet__save {
  display: flex;
  align-items: center;
  justify-content: center;

  height: 36px;
  min-width: 56px;
  padding: 0 14px;

  border: 0;
  border-radius: 999px;

  background: #191919;

  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.3px;

  color: #ffffff;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  transition: opacity 140ms ease, transform 120ms ease;
}

.edit-sheet__save:active {
  transform: scale(0.96);
  opacity: 0.85;
}

.edit-sheet__save:disabled {
  background: #d1d5db;
  color: #ffffff;
  cursor: not-allowed;
  transform: none;
  opacity: 1;
}

.edit-sheet__body {
  display: flex;
  flex-direction: column;
  gap: 14px;

  flex: 1;
  min-height: 0;

  overflow-y: auto;
}

.edit-sheet__textarea {
  width: 100%;
  min-height: 140px;
  padding: 14px 14px;

  box-sizing: border-box;
  resize: none;

  border: 1.5px solid #e5e7eb;
  border-radius: 12px;

  background: #f9fafb;

  font-size: 15px;
  font-weight: 500;
  line-height: 1.55;
  letter-spacing: -0.3px;

  color: #191919;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;

  outline: none;
  transition: border-color 140ms ease, background 140ms ease;
}

.edit-sheet__textarea:focus {
  border-color: #191919;
  background: #ffffff;
}

.edit-sheet__time-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.edit-sheet__time-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 0 4px;
}

.edit-sheet__time-label {
  font-size: 13px;
  font-weight: 600;
  color: #73787e;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

.edit-sheet__time-preview {
  font-size: 13px;
  font-weight: 700;
  color: #191919;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

.edit-sheet__preset-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.edit-sheet__preset {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  height: 32px;
  padding: 0 12px;

  border: 1.5px solid #e5e7eb;
  border-radius: 999px;

  background: #ffffff;

  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.3px;

  color: #4d5160;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  transition: background 140ms ease, border-color 140ms ease, color 140ms ease, transform 120ms ease;
}

.edit-sheet__preset:active {
  transform: scale(0.96);
}

.edit-sheet__preset--active {
  background: #191919;
  border-color: #191919;
  color: #ffffff;
}

.edit-sheet__preset--toggle {
  margin-left: auto;
  background: #f5f6f8;
  border-color: #f5f6f8;
  color: #73787e;
}

.edit-sheet__preset--toggle.edit-sheet__preset--active {
  background: #191919;
  border-color: #191919;
  color: #ffffff;
}

.edit-sheet__custom-time {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f5f6f8;
}

.edit-sheet__datetime {
  height: 36px;
  padding: 0 10px;

  border: 1.5px solid #e5e7eb;
  border-radius: 8px;

  background: #ffffff;

  font-size: 13px;
  font-weight: 500;
  color: #191919;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;

  outline: none;
  transition: border-color 140ms ease;
}

.edit-sheet__datetime:focus {
  border-color: #191919;
}

.edit-sheet__custom-hint {
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

.edit-sheet__hint {
  margin: 0;

  font-size: 12px;
  font-weight: 500;
  line-height: 1.4;

  color: #9ca3af;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* =========================================
   Transition (slide from bottom)
   ========================================= */
.edit-sheet-enter-active,
.edit-sheet-leave-active {
  transition: opacity 220ms ease;
}

.edit-sheet-enter-active .edit-sheet,
.edit-sheet-leave-active .edit-sheet {
  transition: transform 240ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.edit-sheet-enter-from,
.edit-sheet-leave-to {
  opacity: 0;
}

.edit-sheet-enter-from .edit-sheet,
.edit-sheet-leave-to .edit-sheet {
  transform: translateY(100%);
}
</style>
