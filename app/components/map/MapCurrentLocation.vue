<script setup lang="ts">
/*
 * /map current-location marker (파란 dot).
 *
 * Figma 25:794 actual:
 *  - location-marker.svg 37x41 (asset 그대로)
 *  - left 58, top 215
 *
 * 이번 작업에서는 실제 geolocation API 를 호출하지 않는다.
 * 단순 visual marker 만 표시한다.
 */
defineProps<{
  x: number
  y: number
}>()

import { getStorageImageUrl, STORAGE_FOLDERS } from '~/utils/storage'
</script>

<template>
  <div
    class="map-current-location"
    :style="{ left: x + 'px', top: y + 'px' }"
    aria-hidden="true"
  >
    <img
      class="map-current-location__icon"
      :src="getStorageImageUrl('location-marker.svg', STORAGE_FOLDERS.map)"
      alt=""
      draggable="false"
    />
  </div>
</template>

<style scoped>
/*
 * Figma 25:794 actual: svg 37×41 그대로 (preserveAspectRatio 'none' 으로 export)
 * center 좌표에 맞도록 wrapper 를 (37, 41) 로 두고 position absolute.
 */
.map-current-location {
  position: absolute;
  z-index: 2;

  width: 37px;
  height: 41px;

  pointer-events: none;
}

.map-current-location__icon {
  display: block;
  width: 100%;
  height: 100%;
  user-select: none;
  -webkit-user-drag: none;
}
</style>