<script setup lang="ts">
/*
 * /map place marker (식당 marker).
 *
 * Figma 의 marker-orange (Group327, default orange outline + dot),
 * marker-teal (Group326, active teal outline + dot),
 * marker-uchon (Group328, 25:905 의 selected 상태 variant) 셋을 지원한다.
 *
 * 좌표는 useMapData 의 x/y 로 부모에서 받는다.
 *
 * Layout (Figma actual):
 *  - marker wrapper : 28 x 31 (marker svg preserveAspectRatio 비활성)
 *  - label         : Pretendard Medium 12 #191919, letter-spacing 0.24,
 *                    아래로 max 2줄 (e.g. '숯불구이\n우촌')
 *  - label X 는 Figma 에서 -translate-x-1/2 로 center 정렬.
 *
 * Touch target:
 *  - visual marker 는 28x31이지만 모바일 터치를 위해 wrapper hit area 는
 *    가로/세로 40px 이상으로 확장한다 (40px hit zone, visual 은 그대로).
 */
import type { MapPlace } from '~/composables/useMapData'

const props = defineProps<{
  place: MapPlace
  isSelected: boolean
  /**
   * Figma 의 selected state 와 marker variant 'uchon'/'selected' 가
   * 동시에 active 인 경우, preview 가 열린 상태에서만 'uchon' variant
   * (Group328) 을 보여준다. 단순 active (waveburger 같은 비-preview) 는
   * 'selected' (Group326) 만 사용한다.
   */
  forceUchonWhenSelected?: boolean
}>()

const emit = defineEmits<{
  select: [place: MapPlace]
}>()

const onClick = (e: Event) => {
  /*
   * marker 클릭 직후 background click 이 같이 발생해 selection 이
   * 즉시 해제되는 문제를 막기 위해 propagation 을 끊는다.
   */
  e.stopPropagation()
  emit('select', props.place)
}

/*
 * visual marker svg 선택.
 * 우선순위:
 *  1) preview 가 열려 있고, 현재 marker 가 selected 이고 force 옵션이면 uchon
 *  2) 단순 selected (active chip default) 면 teal
 *  3) 그 외 orange
 */
const markerSrc = computed(() => {
  if (props.isSelected && props.forceUchonWhenSelected) {
    return '/images/map/marker-uchon.svg'
  }
  if (props.place.variant === 'selected' || props.isSelected) {
    return '/images/map/marker-teal.svg'
  }
  return '/images/map/marker-orange.svg'
})
</script>

<template>
  <button
    type="button"
    class="map-place-marker"
    :class="{
      'map-place-marker--active': place.variant === 'selected' || isSelected
    }"
    :style="{
      left: place.x + 'px',
      top: place.y + 'px'
    }"
    :aria-label="place.name + ' 선택'"
    :aria-pressed="isSelected"
    @click="onClick"
  >
    <span class="map-place-marker__hit">
      <img
        class="map-place-marker__visual"
        :src="markerSrc"
        :alt="place.name"
        draggable="false"
      />
    </span>
    <span
      class="map-place-marker__label"
      :style="{ left: place.labelX + 'px', top: place.labelY + 'px' }"
    >
      {{ place.name }}
    </span>
  </button>
</template>

<style scoped>
/*
 * Figma 25:817/25:833/25:842/25:851 marker wrapper
 *  - 위치는 props 의 x/y 그대로
 *  - visual marker 28x31 (svg preserveAspectRatio='none' 이미 그대로 적용됨)
 *  - touch hit area 는 40x40 으로 키워 모바일에서 누르기 쉽게 한다.
 */
.map-place-marker {
  position: absolute;
  z-index: 3;

  /* visual marker 는 wrapper 안의 hit 자식이므로 button 자체 padding 0 */
  padding: 0;
  border: 0;
  background: transparent;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  /* label 이 button 영역을 덮어도 clickable 이어야 하므로 pointer-events 는
     button 이 가지되, label 자체는 hit-through (아래 style). */
  pointer-events: auto;
}

/*
 * hit area: visual marker 의 중심이 hit area 의 (left+20, top+15) 가 되도록
 * wrapper 의 offset 을 (-6, -6) 으로 잡고 40x43 hit box 를 만든다.
 */
.map-place-marker__hit {
  position: absolute;
  left: -6px;
  top: -6px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 43px;
}

/*
 * Figma marker svg 는 width 28 height 31 로 export 되어 있다.
 * (vector wrapper 가 아니라 svg 자체 size)
 */
.map-place-marker__visual {
  display: block;
  width: 28px;
  height: 31px;
  flex-shrink: 0;
  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none;
}

/*
 * Label:
 *  - Figma 25:824 (명희원) 등: Pretendard Medium 12px #191919, tracking 0.24
 *  - X 는 labelX 로 center (Figma -translate-x-1/2)
 *  - multi-line (e.g. 숯불구이\n우촌) 가능
 */
.map-place-marker__label {
  position: absolute;

  /* Figma -translate-x-1/2 와 동일 */
  transform: translateX(-50%);

  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.15;
  color: #191919;
  letter-spacing: 0.24px;
  text-align: center;

  white-space: pre-line;

  /*
   * label 은 marker 의 시각 표시일 뿐 클릭은 marker (button) 에서 받는다.
   */
  pointer-events: none;
}

.map-place-marker--active .map-place-marker__label {
  color: #191919;
}
</style>