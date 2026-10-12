<script setup lang="ts">
/*
 * /map filter chip row.
 *
 * Figma 25:801 / 25:950 actual:
 *  - container top 117, left 0, w 390, padding 0 20, gap 8,
 *    overflow-x: auto, drop-shadow 0 2 3 rgba(0,0,0,0.07)
 *  - chip  : 35 height, padding 10 14, radius 12
 *  - active chip : bg #FF6940, text white, Pretendard SemiBold 16
 *  - inactive chip : bg white, text #191919, Pretendard Medium 16, optional icon
 */
import type { MapFilter } from '~/composables/useMapData'
import { MAP_FILTERS } from '~/composables/useMapData'

const active = defineModel<MapFilter>({ required: true })

const onChipClick = (id: MapFilter) => {
  active.value = id
}
</script>

<template>
  <div class="map-filter-chips" role="tablist" aria-label="지도 필터">
    <button
      v-for="chip in MAP_FILTERS"
      :key="chip.id"
      type="button"
      class="map-filter-chips__chip"
      :class="{ 'map-filter-chips__chip--active': active === chip.id }"
      :aria-pressed="active === chip.id"
      role="tab"
      @click="onChipClick(chip.id)"
    >
      <img
        v-if="chip.icon && active !== chip.id"
        :src="chip.icon"
        class="map-filter-chips__chip-icon"
        alt=""
        aria-hidden="true"
      />
      <span>{{ chip.label }}</span>
    </button>
  </div>
</template>

<style scoped>
/*
 * Figma 25:801 / 25:950 actual:
 *  - container top 117, left 0, w 390, padding 0 20, gap 8
 *  - overflow-x: auto, drop-shadow 0 2 3 rgba(0,0,0,0.07)
 */
.map-filter-chips {
  position: absolute;
  top: 117px;
  left: 0;
  right: 0;

  display: flex;
  align-items: flex-start;
  gap: 8px;

  padding: 0 20px;

  z-index: 4;

  overflow-x: auto;
  overflow-y: hidden;

  scrollbar-width: none;
  -ms-overflow-style: none;
}

.map-filter-chips::-webkit-scrollbar {
  display: none;
}

/*
 * Figma chip:
 *  - h 35, padding 10 14, radius 12
 *  - active bg #FF6940 / text white
 *  - inactive bg white / text #191919
 *  - drop-shadow 는 container 가 아니라 chip 자체에 살짝 적용
 */
.map-filter-chips__chip {
  flex: 0 0 auto;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  height: 35px;
  padding: 10px 14px;

  border: 0;
  border-radius: 12px;

  background: #FFFFFF;

  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  color: #191919;

  white-space: nowrap;

  cursor: pointer;

  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, opacity 120ms ease;
}

.map-filter-chips__chip:active {
  transform: scale(0.96);
  opacity: 0.85;
}

.map-filter-chips__chip--active {
  background: #FF6940;
  color: #FFFFFF;
  font-weight: 600;
}

.map-filter-chips__chip-icon {
  display: block;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
</style>