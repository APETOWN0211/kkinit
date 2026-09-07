<script setup lang="ts">
/*
 * Explore Header — Figma 1:1640 (탐색 - 메인)
 *  - frame top: 47px (header y position)
 *  - height: 50px
 *  - padding-x: 20px
 *  - left: location icon 24px + location name 24px SemiBold + chevron-down
 *  - right: search 32×32
 */
import locationIcon from '~/assets/icons/explore/location-fill.svg?raw'
import chevronDown from '~/assets/icons/explore/chevron-down.svg?raw'
import searchIcon from '~/assets/icons/explore/search.svg?raw'

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
      <span class="explore-header__location-icon" v-html="locationIcon" />
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
 * Figma 1:1640
 *  - top: 47, height: 50, width: 390, px: 20
 *  - background: white
 *  - left section: location icon 24, "합정동" 24px Pretendard SemiBold #191919,
 *                  chevron 12×6
 *  - right section: search icon 32×32
 *  - gap left group: 4px
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
  display: flex;
  align-items: center;
  gap: 4px;

  padding: 0;
  border: 0;
  background: transparent;

  cursor: pointer;

  -webkit-tap-highlight-color: transparent;
}

.explore-header__location-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;

  flex-shrink: 0;
}

.explore-header__location-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
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
  flex-shrink: 0;
}

.explore-header__location-chevron {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 12px;
  height: 6px;

  flex-shrink: 0;

  margin-left: 6px;

  color: #191919;
}

.explore-header__location-chevron :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
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
