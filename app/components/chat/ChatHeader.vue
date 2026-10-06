<script setup lang="ts">
import composeIcon from '~/assets/icons/chat/compose.svg?raw'

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'compose'): void
}>()

const onEdit = () => emit('edit')
const onCompose = () => emit('compose')
</script>

<template>
  <header class="chat-header">
    <button
      type="button"
      class="header-button header-button--text"
      aria-label="편집"
      @click="onEdit"
    >
      <span class="header-button__label">편집</span>
    </button>

    <h1 class="chat-title">대화</h1>

    <button
      type="button"
      class="header-button header-button--icon"
      aria-label="새 대화"
      @click="onCompose"
    >
      <span class="header-icon" v-html="composeIcon" />
    </button>
  </header>
</template>

<style scoped>
/*
 * Figma 11:245 — Header
 *  - frame: width 390, height 50, padding 3px / 20px
 *  - left 0, top 47 (헤더가 차지하는 y 영역)
 *  - sticky 로 두지 않고 일반 flow 안에 둔다.
 *    (스크롤 시 함께 사라지지 않게 하려면 app.vue 의 page 영역에서 처리)
 *  - 실제 iPhone safe-area 만 상단 padding 으로 반영.
 *
 * 편집 / 작성 버튼은 Figma 11:246, 11:249 와 동일:
 *  - bg #FFFFFF, radius 18, shadow 0 2 3.85 rgba(0,0,0,0.09)
 *  - padding 10, 높이 = 100% (row height 50)
 *  - 작성 버튼 width 44 (icon 18)
 *  - 편집 버튼은 텍스트 폭만큼 (현재 30)
 */
.chat-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  width: 100%;
  height: calc(50px + env(safe-area-inset-top));
  padding: env(safe-area-inset-top) var(--page-padding) 3px;
  box-sizing: border-box;
  background: var(--color-background);
}

.header-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 10px;
  background: #FFFFFF;
  border: none;
  border-radius: 18px;
  box-shadow: 0 2px 3.85px rgba(0, 0, 0, 0.09);
  cursor: pointer;
  transition: transform 120ms ease, opacity 120ms ease;
}

.header-button:active {
  transform: scale(0.96);
  opacity: 0.85;
}

.header-button--text {
  justify-self: start;
}

.header-button--icon {
  justify-self: end;
  width: 44px;
}

.header-button__label {
  display: inline-block;
  font-size: 17px;
  font-weight: 400;
  line-height: normal;
  color: #4D5160;
  text-align: center;
  white-space: nowrap;
}

.header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.header-icon :deep(svg) {
  display: block;
  width: 18px;
  height: 18px;
}

/*
 * Figma 11:248 — 대화 타이틀
 *  - Pretendard Medium 20
 *  - color #191919
 *  - 중앙 정렬
 */
.chat-title {
  margin: 0;
  justify-self: center;
  font-size: 20px;
  font-weight: 500;
  line-height: normal;
  color: var(--color-text-primary);
  white-space: nowrap;
  text-align: center;
}
</style>