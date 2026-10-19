<script setup lang="ts">
/*
 * /chat/[id] — 메시지 입력창 (Figma 93:948 — 채팅 상세 하단 composer)
 *
 *  - 좌: 50×50 light gray 원형 grid (2x2 rounded square, rgba(77,81,96,0.4))
 *  - 가운데: F3F4F6 fill input wrap (height 50, radius 24, padding 10 8 10 16)
 *      └─ placeholder "메시지를 입력해주세요." (Pretendard Regular 16)
 *      └─ 우측 34×34 orange send button (Figma asset: send-button.svg Group 311)
 *  - viewport bottom 에 fixed. safe-area + visualViewport-keyboard 보정.
 *  - input 에서 enter 또는 send 클릭 시:
 *      emit('send', text) → 부모에서 messages 에 push.
 *  - 입력 후 input 자동 clear + 부모가 scroll bottom 처리.
 *  - DB 연결 없음. local mock message array 만 push.
 */
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import sendArrow from '~/assets/icons/chat-detail/send-button.svg?raw'

const props = defineProps<{
  /* 부모가 v-model 로 양방향 바인딩하면 input clear 자동. */
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
  (e: 'send', text: string): void
}>()

const onInput = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}

const onSend = () => {
  const text = props.modelValue.trim()
  if (!text) return
  emit('send', text)
  emit('update:modelValue', '')
}

const onKeydown = (e: KeyboardEvent) => {
  /*
   * Spec #28: 텍스트 입력 후 엔터 → send.
   * Shift+Enter 는 줄바꿈이지만, 이 input 은 single-line 이라 무시.
   * 모바일에서는 IME 가 들어가면 keydown 이 IME composition 중이므로
   * isComposing 으로 차단하여 한글 조합 중 중복 send 방지.
   */
  if (e.key === 'Enter' && !e.isComposing) {
    e.preventDefault()
    onSend()
  }
}

/* ============================================
 * Spec #30: 모바일 키보드 대응
 *  - input focus 시 window.visualViewport.height 가 viewport 보다 작아지면
 *    키보드가 올라온 것. keyboardOffsetPx = window.innerHeight - visualViewport.height.
 *  - 0 이 아니면 input bar 의 bottom = keyboardOffsetPx 로 보정해
 *    키보드 위에 input 이 떠 있도록 한다.
 * ============================================ */
const keyboardOffsetPx = ref(0)
let _vvHandle: ((e: Event) => void) | null = null
const recompute = () => {
  if (!import.meta.client) return
  const vv = window.visualViewport
  if (!vv) return
  const offset = Math.max(0, Math.round(window.innerHeight - vv.height - (vv.offsetTop ?? 0)))
  keyboardOffsetPx.value = offset
}
onMounted(() => {
  if (import.meta.client && window.visualViewport) {
    _vvHandle = () => recompute()
    window.visualViewport.addEventListener('resize', _vvHandle)
    window.visualViewport.addEventListener('scroll', _vvHandle)
    recompute()
  }
})
onBeforeUnmount(() => {
  if (import.meta.client && window.visualViewport && _vvHandle) {
    window.visualViewport.removeEventListener('resize', _vvHandle)
    window.visualViewport.removeEventListener('scroll', _vvHandle)
  }
})

/*
 * Figma 93:868 (frame 844): composer 가 viewport bottom 0 에 붙고
 * 그 아래 home indicator 21px. → 우리 코드는 safe-area-inset-bottom 으로
 * 같은 효과를 내고, keyboardOffsetPx 로 키보드 보정.
 */
const inputBarStyle = computed(() => ({
  bottom: `calc(0px + env(safe-area-inset-bottom) + ${keyboardOffsetPx.value}px)`
}))

/*
 * Figma 93:949 grid button — 2x2 rounded squares (icon container 28x28,
 * inner 26x26 with 1px margin, 4 rects 12x12, gap 2, radius 2.8).
 * SVG viewBox 28x28, rect positions (0,0)/(14,0)/(0,14)/(14,14).
 */
const GRID_RECT_SIZE = 12
const GRID_RECT_GAP = 2
const GRID_RECT_RADIUS = 2.8
const GRID_RECT_INDENT = 1
const GRID_RECTS = [
  { x: GRID_RECT_INDENT, y: GRID_RECT_INDENT },
  { x: GRID_RECT_INDENT + GRID_RECT_SIZE + GRID_RECT_GAP, y: GRID_RECT_INDENT },
  { x: GRID_RECT_INDENT, y: GRID_RECT_INDENT + GRID_RECT_SIZE + GRID_RECT_GAP },
  {
    x: GRID_RECT_INDENT + GRID_RECT_SIZE + GRID_RECT_GAP,
    y: GRID_RECT_INDENT + GRID_RECT_SIZE + GRID_RECT_GAP
  }
]
</script>

<template>
  <div
    class="chat-input-bar"
    :style="inputBarStyle"
    role="group"
    aria-label="메시지 입력"
  >
    <!-- 4-grid functionality button (Figma 93:949) -->
    <button
      type="button"
      class="chat-input-bar__grid"
      aria-label="기능"
    >
      <svg
        class="chat-input-bar__grid-svg"
        viewBox="0 0 28 28"
        fill="rgba(77,81,96,0.4)"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          v-for="(r, i) in GRID_RECTS"
          :key="i"
          :x="r.x"
          :y="r.y"
          :width="GRID_RECT_SIZE"
          :height="GRID_RECT_SIZE"
          :rx="GRID_RECT_RADIUS"
        />
      </svg>
    </button>

    <!-- 입력 wrap (Figma 93:956) — placeholder + send button (justify-between) -->
    <div class="chat-input-bar__field">
      <input
        type="text"
        class="chat-input-bar__input"
        :value="modelValue"
        placeholder="메시지를 입력해주세요."
        @input="onInput"
        @keydown="onKeydown"
      />

      <!-- Send button (Figma 93:958 — 34×34 orange 원형 + chevron) -->
      <button
        type="button"
        class="chat-input-bar__send"
        aria-label="전송"
        :disabled="!modelValue.trim()"
        @click="onSend"
      >
        <span class="chat-input-bar__send-icon" v-html="sendArrow" />
      </button>
    </div>
  </div>
</template>

<style scoped>
/*
 * Figma 93:948 — frame 390 × 50, padding 0 20, gap 10.
 *  - viewport bottom 에 fixed (composer 자체가 position: fixed).
 *  - safe-area + visualViewport-keyboard 보정.
 *  - 좌: 4-grid 원형 버튼 (50×50, ECECEE)
 *  - 가운데: pill input wrap (F3F4F6, radius 24, padding 10 8 10 16)
 *      └─ send 버튼은 wrap 안쪽 우측에 위치 (34×34 orange)
 *  - placeholder: 16px / weight 400 / rgba(77,81,96,0.4) / letter 0.32
 */
.chat-input-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(0px + env(safe-area-inset-bottom));
  z-index: 6;

  display: flex;
  align-items: center;
  gap: 10px;

  width: 100%;
  max-width: 390px;
  margin: 0 auto;

  padding: 0 20px;

  background: transparent;

  box-sizing: border-box;

  /* 키보드 올라올 때 부드러운 transition */
  transition: bottom 160ms ease-out;
}

/* 4-grid function button — 회색 원형 (50×50) — Figma 93:949 */
.chat-input-bar__grid {
  flex: 0 0 50px;
  width: 50px;
  height: 50px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  background: #ECECEE;
  border: none;
  border-radius: 999px;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, opacity 120ms ease;
}

.chat-input-bar__grid:active {
  transform: scale(0.94);
  opacity: 0.9;
}

.chat-input-bar__grid-svg {
  display: block;
  width: 28px;
  height: 28px;
}

/* Input wrap (Figma 93:956) — F3F4F6 fill, height 50, radius 24, padding 10 8 10 16 */
.chat-input-bar__field {
  flex: 1 1 auto;
  min-width: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;

  height: 50px;
  padding: 10px 8px 10px 16px;

  background: #F3F4F6;
  border-radius: 24px;

  box-sizing: border-box;
  overflow: hidden;
}

.chat-input-bar__input {
  flex: 1 1 auto;
  min-width: 0;

  display: block;
  width: 100%;
  height: 100%;

  background: transparent;
  border: 0;
  outline: 0;

  color: #4D5160;
  font-family: inherit;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0.32px;
}

.chat-input-bar__input::placeholder {
  color: rgba(77, 81, 96, 0.4);
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: 0.32px;
}

/* Send button — wrap 안쪽 우측의 orange 원형 (34×34) — Figma 93:958 */
.chat-input-bar__send {
  flex: 0 0 34px;
  width: 34px;
  height: 34px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 0;

  background: transparent;
  border: 0;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  opacity: 1;
  transition: transform 120ms ease, opacity 120ms ease;
}

.chat-input-bar__send:active:not(:disabled) {
  transform: scale(0.92);
  opacity: 0.85;
}

.chat-input-bar__send:disabled {
  cursor: default;
  opacity: 0.4;
}

.chat-input-bar__send-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
}

.chat-input-bar__send-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
