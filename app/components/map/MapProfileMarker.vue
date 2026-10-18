<script setup lang="ts">
/*
 * /map profile/avatar marker (사용자·친구 표시).
 *
 * Figma 25:781 / 25:715:
 *  - wrapper 48x48 (Group337 = 42×48, Frame743/744 = 42×42 avatar + pointer)
 *  - duck avatar (/images/map/profile-duck.png, profile-dino.png) 를 그대로 사용
 *
 * Figma 25:794 location-marker.svg (37x41) 는 별도의 current-location 표시.
 * 여기서는 사용자 avatar marker 만 다룬다.
 *
 * 위치는 props 의 x/y (wrapper top-left) 그대로.
 */
import type { MapProfileMarker } from '~/composables/useMapData'
import { getStorageImageUrl, imagePathFacade, STORAGE_FOLDERS } from '~/utils/storage'

defineProps<{
  marker: MapProfileMarker
}>()

function markerAvatarName(kind: MapProfileMarker['kind']) {
  if (kind === 'duck') return 'duck'
  if (kind === 'duck2') return 'duck' // Frame743 → 같은 duck 사진이 두 번 사용됨
  return 'dino'
}

/*
 * Storage path 로 통일. helper 가 .webp / .png 매핑.
 *
 * `imagePath.map(...)` 는 storage path 만 반환 (spec #22).
 * `<img :src>` 에는 public URL 이 필요하므로, 같은 helper 인 `getStorageImageUrl`
 * 로 감싸서 한 번에 public URL 로 만든다.
 */
function markerAvatarPath(kind: MapProfileMarker['kind']): string {
  const name = markerAvatarName(kind)
  return getStorageImageUrl(imagePathFacade.map(`profile-${name}.webp`), STORAGE_FOLDERS.map)
}
</script>

<template>
  <div
    class="map-profile-marker"
    :style="{ left: marker.x + 'px', top: marker.y + 'px', width: marker.size + 'px', height: marker.size + 'px' }"
    aria-hidden="true"
  >
    <img
      class="map-profile-marker__avatar"
      :src="markerAvatarPath(marker.kind)"
      alt=""
      draggable="false"
    />
  </div>
</template>

<style scoped>
/*
 * Figma 25:781 / 25:715 actual:
 *  - 48×48 wrapper (Group337 42×48 + Frame 42×42 avatar inside)
 *  - background white circle, shadow 0 3 12 rgba(0,0,0,0.15)
 *
 * Avatar 자체 (Frame743/744) 는 42x42.
 * pointer (Group337) 가 42×48 (avatar + 작은 아래 pointer).
 */
.map-profile-marker {
  position: absolute;
  z-index: 2;

  width: 48px;
  height: 48px;

  border-radius: 999px;

  background: #FFFFFF;

  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);

  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  pointer-events: none; /* click-through */
}

/*
 * Avatar 자체 (Frame743/744 42×42).
 * Figma 의 avatar 사진은 full-bleed 라 wrapper 의 42×42 (정중앙) 에 배치.
 */
.map-profile-marker__avatar {
  display: block;
  width: 42px;
  height: 42px;
  object-fit: cover;
  border-radius: 999px;
  user-select: none;
  -webkit-user-drag: none;
}
</style>