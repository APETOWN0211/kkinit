<script setup lang="ts">
/*
 * HistoryHeader — Figma 22:907 actual
 *  - top 5.57% (status bar 47), h 50 (= 47 + 50) ⇒ top 47, h 50
 *    (Figma 의 inset 5.57% 0 88.51% 0 = top 47, height 47 + ... ).
 *  - bg #FFFFFF, justify-between, items-center, px 20
 *  - 좌측: back button 24×24
 *  - 중앙: "방문기록" Pretendard Medium 20 #191919
 *  - 우측: 24×24 invisible placeholder (Figma actual)
 *
 * Status bar 는 구현하지 않고 (PWA safe-area 만 사용), header band 의
 * status-bar padding 은 archive 패턴과 동일하게 env(safe-area-inset-top) 사용.
 */

import backIcon from '~/assets/icons/common/back.svg?raw'

const emit = defineEmits<{
  back: []
}>()

const router = useRouter()

const onBack = () => {
  emit('back')
  if (import.meta.client) {
    router.back()
  }
}
</script>

<template>
  <header class="history-header">
    <button
      type="button"
      class="history-header__back"
      aria-label="뒤로 가기"
      @click="onBack"
    >
      <span class="history-header__back-icon" v-html="backIcon" />
    </button>

    <h1 class="history-header__title">방문기록</h1>

    <div class="history-header__placeholder" aria-hidden="true" />
  </header>
</template>

<style scoped>
/*
 * HistoryHeader — Figma 22:907 actual
 *  - top 47, h 50, px 20
 *  - bg white, justify-between, items-center
 *  - Figma 에서 우측은 24×24 invisible placeholder (data-node-id 22:911 opacity 0).
 *    우측 메뉴가 없으므로 자리만 유지.
 *  - Figma 의 status bar 47px 는 HTML 로 구현하지 않고 PWA safe-area 로 대체.
 */
.history-header {
  position: relative;

  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: calc(50px + env(safe-area-inset-top));
  padding: env(safe-area-inset-top) 20px 0;
  box-sizing: border-box;

  background: #ffffff;
  flex-shrink: 0;
}

.history-header__back {
  flex: 0 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  margin: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, opacity 120ms ease;
}

.history-header__back:active {
  transform: scale(0.9);
  opacity: 0.7;
}

.history-header__back-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.history-header__back-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/*
 * Figma 22:910 — Pretendard Medium 20 #191919, leading normal, word-break break-word,
 * whitespace-nowrap.
 * absolute center 가 아닌 자연 정렬 (Figma 의 22:907 은 flex justify-between 으로
 *  left back / center title / right placeholder 가 정확히 3 분할).
 * → title 은 자연 middle, back/placeholder 가 양쪽 24px fixed.
 *  → 24 + title + 24 = 390-40=350. title 이 max-width 없이 flex 1 0 으로 늘어나면
 *    가운데 자동 정렬은 아니고 back 다음부터 350-24 까지 width 차지.
 *  → Figma actual 은 left 24, center (auto width), right 24 ⇒ title 이 left
 *    의 24px 다음에 시작. back 의 24px 와 placeholder 의 24px 가 정확히 양쪽 끝에
 *    있고 title 은 그 사이의 flex container.
 *  → 구현: title 에 flex:1 0 + text-align center 로 가운데 텍스트 정렬.
 */
.history-header__title {
  flex: 1 1 0;
  margin: 0;
  text-align: center;

  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
  color: #191919;
  white-space: nowrap;
}

.history-header__placeholder {
  flex: 0 0 24px;
  width: 24px;
  height: 24px;
}
</style>
