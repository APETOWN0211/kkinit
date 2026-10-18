<script setup lang="ts">
/*
 * /map 상단 search bar.
 *
 * Figma 44:1102 (지도 - 메인, search field) 기준.
 *
 * Layout (Figma actual — Figma 의 9:41 status bar 47px 는 웹에서 구현하지 않음):
 *   - container: top 0, left 0, padding 10px 20px, gap 12px, w 390px
 *   - Figma 좌표의 y=47 status bar 영역은 빼고 top=0 부터 시작.
 *   - search field (44:1102):
 *       bg #FFFFFF
 *       padding 12px
 *       gap 10px (icon ↔ text)
 *       border-radius 12px
 *       shadow 0 3 10 0 rgba(0,0,0,0.12)
 *       display flex, align-items center, overflow hidden
 *       height: search icon 16 → placeholder 18 → line-height 기준 약 44
 *   - search icon (44:1103 Vector):
 *       16×16 frame, flex 0 0 16px, shrink 0
 *       실제 vector bounds 는 frame 보다 약 6.77% 바깥으로 나감
 *       (Figma 에서 inset-[-6.77%] 로 렌더링) → SVG 의 overflow visible 유지.
 *   - placeholder (44:1104):
 *       Pretendard Medium 18px, line-height normal, color #9F9A9A
 *       text "망원동에서 뭐 먹지?"
 *   - orange button (25:791 / 25:939): 50×50, bg #FF6940, radius 44px,
 *     shadow 0 3 10 rgba(0,0,0,0.12), icon fa6-solid:location-arrow 24×27
 */
import searchIcon from '~/assets/icons/map/search.svg?raw'
import navArrowIcon from '~/assets/icons/common/location-arrow.svg?raw'

const props = defineProps<{
  /* placeholder 는 추후 동적 변경 가능성 대비해 prop 으로 받는다. */
  placeholder?: string
}>()

const value = defineModel<string>({ default: '' })
</script>

<template>
  <div class="map-search-bar">
    <label class="map-search-bar__field">
      <span class="map-search-bar__icon" v-html="searchIcon" />
      <input
        v-model="value"
        type="text"
        class="map-search-bar__input"
        :placeholder="placeholder ?? '망원동에서 뭐 먹지?'"
        aria-label="장소 검색"
      />
    </label>
    <button
      type="button"
      class="map-search-bar__nav"
      aria-label="내비게이션"
    >
      <span class="map-search-bar__nav-icon" v-html="navArrowIcon" />
    </button>
  </div>
</template>

<style scoped>
/*
 * Figma 25:787 actual:
 *  - container 390×auto, gap 12, padding 10 20, top 0
 *  (Figma 의 status bar 47px 는 구현하지 않으므로 top=0 부터 시작)
 */
.map-search-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 10px 20px;

  z-index: 5;

  pointer-events: none; /* wrapper 는 click-through, 내부만 클릭 가능 */
}

/*
 * Figma 44:1102 — search field
 *  - flex 1 0 0, padding 12, gap 10, radius 12, bg white,
 *  - shadow 0 3 10 0 rgba(0,0,0,0.12)
 *  - display flex, align-items center, overflow hidden
 *  - height: search icon 16 → placeholder 18 → line-height 기준 약 44
 */
.map-search-bar__field {
  pointer-events: auto;

  flex: 1 1 auto;
  min-width: 0;

  display: flex;
  align-items: center;
  gap: 10px;

  padding: 12px;
  border-radius: 12px;

  background: #FFFFFF;

  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);

  height: 44px;

  box-sizing: border-box;

  overflow: hidden;
}

/*
 * Figma 44:1103 Vector — search icon wrapper.
 *  - 16×16 frame, shrink 0, overflow visible.
 *  - 실제 SVG vector bounds 는 Figma 기준 frame 보다 약 6.77% 바깥.
 *  - SVG 자체는 원본 viewBox 비율 (18.1654 × 18.1654) 그대로 유지하고
 *    wrapper 안에서 100% 로 렌더 → Figma 의 inset-[-6.77%] 효과와 동일.
 *  - 임의 scale / aspect-ratio 변경 금지.
 */
.map-search-bar__icon {
  position: relative;

  width: 16px;
  height: 16px;

  flex: 0 0 16px;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;
}

.map-search-bar__icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

/*
 * Figma 44:1104 — placeholder / input text.
 *  - Pretendard Medium 18px, line-height normal, color (placeholder) #9F9A9A.
 *  - input 자체는 text #191919 (placeholder 는 #9F9A9A override).
 *  - WebKit input type="search" 기본 X / decoration 은 명시적으로 제거하여
 *    Figma 의 단일 SVG icon 만 보이도록 한다.
 */
.map-search-bar__input {
  flex: 1 1 auto;
  min-width: 0;

  padding: 0;
  border: 0;
  background: transparent;

  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 18px;
  font-weight: 500;
  line-height: normal;
  color: #191919;
  letter-spacing: 0;

  outline: none;

  -webkit-tap-highlight-color: transparent;

  /* WebKit default search decoration 제거 (Figma icon 만 보이도록). */
  appearance: none;
  -webkit-appearance: none;
}

.map-search-bar__input::-webkit-search-decoration,
.map-search-bar__input::-webkit-search-cancel-button,
.map-search-bar__input::-webkit-search-results-button,
.map-search-bar__input::-webkit-search-results-decoration {
  appearance: none;
  -webkit-appearance: none;
  display: none;
}

.map-search-bar__input::placeholder {
  color: #9F9A9A;
  font-weight: 500;
  font-size: 18px;
  line-height: normal;
}

/*
 * Figma 25:791 / 25:939 — orange circular nav button
 *  - 50×50, bg #FF6940, radius 44px, shadow 0 3 10 rgba(0,0,0,0.12)
 *  - icon: fa6-solid:location-arrow 24×27 (Figma: left 13, top 12)
 */
.map-search-bar__nav {
  pointer-events: auto;

  flex: 0 0 auto;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 50px;
  height: 50px;

  padding: 0;
  border: 0;
  border-radius: 44px;

  background: #FF6940;

  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.12);

  cursor: pointer;

  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, opacity 120ms ease;
}

.map-search-bar__nav:active {
  transform: scale(0.94);
  opacity: 0.85;
}

.map-search-bar__nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 27px;

  color: #FFFFFF;
}

.map-search-bar__nav-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>