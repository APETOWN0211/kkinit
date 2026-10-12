<script setup lang="ts">
/*
 * /map 상단 search bar.
 *
 * Figma 25:787 (지도 - 메인) / 25:935 (식당 미리보기)
 *
 * Layout (Figma actual):
 *   - container: top 47px, left 0, padding 10px 20px, gap 12px, w 390px
 *   - search field: flex 1 0 0, padding 12px, gap 10px, radius 12px,
 *                   bg white, shadow 0 3 10 0 rgba(0,0,0,0.12)
 *   - search icon: 16×16, left inside field
 *   - placeholder: Pretendard Medium 18px #9F9A9A
 *     '망원동에서 뭐 먹지?'
 *   - orange button (25:791 / 25:939): 50×50, bg #FF6940, radius 44px,
 *     shadow 0 3 10 rgba(0,0,0,0.12), icon fa6-solid:location-arrow 24×27
 */
import searchIcon from '~/assets/icons/common/map-search.svg?raw'
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
 *  - container 390×auto, gap 12, padding 10 20, top 47
 */
.map-search-bar {
  position: absolute;
  top: 47px;
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
 * Figma 25:788 / 25:936 — search field
 *  - flex 1 0 0, padding 12, gap 10, radius 12, bg white,
 *  - shadow 0 3 10 0 rgba(0,0,0,0.12)
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
}

.map-search-bar__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 16px;
  height: 16px;

  flex-shrink: 0;

  color: #191919;
}

.map-search-bar__icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.map-search-bar__input {
  flex: 1 1 auto;
  min-width: 0;

  padding: 0;
  border: 0;
  background: transparent;

  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 18px;
  font-weight: 500;
  line-height: 1;
  color: #191919;
  letter-spacing: 0;

  outline: none;

  -webkit-tap-highlight-color: transparent;
}

.map-search-bar__input::placeholder {
  color: #9F9A9A;
  font-weight: 500;
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