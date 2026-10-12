<script setup lang="ts">
/*
 * Explore Header — Figma 30:1064 / 30:1063 (탐색 - 메인, 최신)
 *  - frame top: 47px (header y position)
 *  - height: 50px
 *  - padding-x: 20px
 *  - left: location icon 24×24 + location name 24px SemiBold + chevron-down 12×6
 *  - right: search 32×32
 *
 *  - location SVG root: 18 × 21.814 (정사각형 아님 — 종횡비 유지 필요)
 *    SVG inline 의 preserveAspectRatio="none" 을 xMidYMid meet 로 교체하여
 *    wrapper 24×24 안에서 SVG 가 stretched 되지 않고 비율을 유지한다.
 *  - 다른 요소 (합정동 typography, search icon, header spacing) 는 변경 X
 */
import locationIcon from '~/assets/icons/explore/location-fill.svg?raw'
import chevronDown from '~/assets/icons/explore/chevron-down.svg?raw'
import searchIcon from '~/assets/icons/explore/search.svg?raw'

/*
 * SVG 의 preserveAspectRatio="none" 가 wrapper 안에 stretched 되게 만드는 원인.
 * location-fill.svg 의 root viewBox 는 0 0 18 21.814 로 18:21.814 비율을 가지고 있지만
 * inline style 에 preserveAspectRatio="none" 이 박혀 있어 24×24 wrapper 에서
 * 가로/세로가 각각 wrapper 크기로 강제 stretch 된다.
 *
 * path 자체는 수정하지 않고 inline 의 preserveAspectRatio="none" 만
 * xMidYMid meet 로 교체한다 (이것은 SVG attribute 이지 path 가 아니다).
 */
const locationIconSafe = locationIcon.replace(
  'preserveAspectRatio="none"',
  'preserveAspectRatio="xMidYMid meet"'
)

defineProps<{
  location: string
}>()

const emit = defineEmits<{
  'search-click': []
  'location-click': []
}>()

const onLocationClick = () => emit('location-click')
const onSearchClick = () => emit('search-click')
</script>

<template>
  <header class="explore-header">
    <button
      type="button"
      class="explore-header__location"
      aria-label="현재 지역 변경"
      @click="onLocationClick"
    >
      <span class="explore-header__location-icon" v-html="locationIconSafe" />
      <span class="explore-header__location-name">{{ location }}</span>
      <span class="explore-header__location-chevron" v-html="chevronDown" />
    </button>

    <button
      type="button"
      class="explore-header__search"
      aria-label="검색"
      @click="onSearchClick"
    >
      <span class="explore-header__search-icon" v-html="searchIcon" />
    </button>
  </header>
</template>

<style scoped>
/*
 * Figma 30:1064 (탐색 - 메인, 최신)
 *  - top: 47, height: 50, width: 390, px: 20
 *  - background: white
 *  - left section:
 *      - location icon wrapper: 24 × 24 (정사각형 visual frame)
 *      - SVG root: 18 × 21.814 → preserveAspectRatio="xMidYMid meet" 로 종횡비 유지
 *      - "합정동" 24px Pretendard SemiBold #191919
 *      - chevron 12 × 6
 *  - right section: search icon 32 × 32
 *  - gap location icon -> name: 4px (CSS margin-left)
 *  - gap name -> chevron: 6px
 */
.explore-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: calc(50px + env(safe-area-inset-top, 47px));

  padding: env(safe-area-inset-top, 47px) var(--page-padding) 0;

  background: #FFFFFF;
}

.explore-header__location {
  display: inline-flex;
  align-items: center;

  padding: 0;
  border: 0;
  background: transparent;

  cursor: pointer;

  -webkit-tap-highlight-color: transparent;
}

/*
 * Location icon wrapper — Figma 30:1066: 24 × 24 정사각형.
 * SVG 가 stretched 되지 않도록 명시적 정사각형 visual frame + flex-shrink:0.
 */
.explore-header__location-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;
  min-width: 24px;
  min-height: 24px;

  flex: 0 0 24px;
  flex-shrink: 0;
  flex-grow: 0;

  aspect-ratio: 1 / 1;

  overflow: hidden;
}

/*
 * SVG 자체:
 *  - SVG root 는 18 × 21.814 (정사각형 아님).
 *  - template 단계에서 preserveAspectRatio="none" → "xMidYMid meet" 로 교체했으므로
 *    width: 100%; height: 100% 만 지정해도 종횡비 유지하며 wrapper 안에 맞춰 들어감.
 *  - flex-shrink:0 으로 부모 flex container 안에서 wrapper 가 줄어드는 것 방지.
 */
.explore-header__location-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  flex-shrink: 0;
}

.explore-header__location-name {
  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif;
  font-size: 24px;
  font-weight: 600;
  /* Pretendard SemiBold (600) = regular axis position 600 in variable font */
  font-variation-settings: 'wght' 600;
  line-height: 1.2;
  letter-spacing: -0.4px;
  color: #191919;

  margin-left: 4px;
  white-space: nowrap;
  flex: 0 0 auto;
  flex-shrink: 0;
}

.explore-header__location-chevron {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 12px;
  height: 6px;
  min-width: 12px;
  min-height: 6px;

  flex-shrink: 0;

  margin-left: 6px;

  color: #191919;
}

.explore-header__location-chevron :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  flex-shrink: 0;
}

.explore-header__search {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  padding: 0;
  border: 0;
  background: transparent;

  cursor: pointer;

  -webkit-tap-highlight-color: transparent;
}

.explore-header__search-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;
}

.explore-header__search-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>