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
 *
 * Auto-scroll:
 *  - activeFilter 가 바뀌면 nextTick 이후 active chip 의 button 을
 *    scrollIntoView({ inline: 'nearest', block: 'nearest', behavior: 'smooth' }).
 *  - 'nearest' 를 쓰면 이미 충분히 보이는 chip 은 움직이지 않고,
 *    오른쪽에서 잘린 경우엔 필요한 만큼만 왼쪽으로,
 *    왼쪽에서 잘린 경우엔 필요한 만큼만 오른쪽으로 scroll 된다.
 *  - container 의 scroll-padding-inline: 20px 가 'nearest' 의 viewport margin 역할을
 *    해서 active chip 의 양쪽 edge 에 항상 20px 의 시각적 여백이 남는다.
 *
 * Icon handling:
 *  - SVG 는 `?raw` 로 inline string 으로 import → v-html 로 inline 삽입.
 *  - SVG path 의 fill 은 `currentColor` 로 통일해서 부모 color (chip 의 `color`)
 *    만 바꿔도 active(white) / inactive(category color) 가 자연스럽게 전환된다.
 *  - 아이콘은 active / inactive 와 무관하게 항상 렌더링 → DOM 구조는 동일.
 *    active 시 layout shift 가 발생하지 않는다.
 */
import type { MapFilter } from '~/composables/useMapData'
import { MAP_FILTERS } from '~/composables/useMapData'

import iconFriends from '~/assets/icons/map/filter-friends.svg?raw'
import iconPeople from '~/assets/icons/map/filter-people.svg?raw'
import iconHot from '~/assets/icons/map/filter-hot.svg?raw'

const active = defineModel<MapFilter>({ required: true })

/*
 * 각 chip button DOM ref 를 id → element 로 보관.
 *  - activeFilter 가 바뀌면 nextTick 이후 active.id 의 element 를 찾아서
 *    scrollIntoView 호출.
 *  - :ref binding 은 function 으로 받아서 직접 Map 에 set / clear.
 *  - template ref callback 의 인자 타입은 Element | ComponentPublicInstance | null
 *    지만 우리 template 에는 native <button> 만 있어서 Element 로 cast.
 */
const buttonRefs = new Map<MapFilter, HTMLElement | null>()
const setButtonRef = (id: MapFilter) => (el: unknown) => {
  buttonRefs.set(id, (el as HTMLElement | null) ?? null)
}

/*
 * Figma 25:801 / 25:950 actual icon size + default (inactive) color.
 *  - 친구 방문    : 11.667 × 14  / #73787E (gray)
 *  - 팔로잉 언급  : 16     × 16  / #1E51AD (blue)
 *  - 요즘 뜨는    : 11.375 × 13.5065 / #FF6940 (orange)
 * active 시에는 chip color 가 #FFFFFF 로 바뀌면서 아이콘도 currentColor 로 같이 white.
 */
const ICON_BY_ID: Record<string, { raw: string; w: number; h: number; color: string }> = {
  friends:   { raw: iconFriends, w: 11.667, h: 14,      color: '#73787E' },
  following: { raw: iconPeople,  w: 16,     h: 16,      color: '#1E51AD' },
  hot:       { raw: iconHot,     w: 11.375, h: 13.5065, color: '#FF6940' }
}

const onChipClick = (id: MapFilter) => {
  active.value = id
}

/*
 * active 변경 시 active chip 을 viewport 안으로 scroll.
 *  - 이미 충분히 보이는 chip 은 'nearest' 가 no-op 으로 처리해서
 *    불필요하게 움직이지 않는다.
 *  - 오른쪽에서 잘린 chip 은 필요한 만큼만 왼쪽으로,
 *    왼쪽에서 잘린 chip 은 필요한 만큼만 오른쪽으로 scroll.
 *  - container 의 scroll-padding-inline: 20px 가 'nearest' 의
 *    viewport margin 역할을 해서, 마지막 chip 을 선택해도
 *    오른쪽 edge 에 20px 의 시각적 여백이 항상 남는다.
 */
const scrollActiveIntoView = async () => {
  await nextTick()
  const btn = buttonRefs.get(active.value)
  if (!btn) return
  btn.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'nearest'
  })
}

watch(active, scrollActiveIntoView, { flush: 'post' })

/*
 * 최초 mount 시 (이미 active='all' 이 default 인 경우) 도 안전하게 한 번 호출.
 *  - 'all' chip 은 항상 첫 번째라 viewport 안에 있으므로 실제 scroll 은 없지만,
 *    혹시 외부에서 programmatic 으로 active 가 초기값으로 세팅되는 경우에도
 *    일관되게 동작하도록 보장.
 */
onMounted(() => {
  scrollActiveIntoView()
})
</script>

<template>
  <div class="map-filter-chips" role="tablist" aria-label="지도 필터">
    <button
      v-for="chip in MAP_FILTERS"
      :key="chip.id"
      :ref="setButtonRef(chip.id)"
      type="button"
      class="map-filter-chips__chip"
      :class="{ 'map-filter-chips__chip--active': active === chip.id }"
      :aria-pressed="active === chip.id"
      role="tab"
      @click="onChipClick(chip.id)"
    >
      <!--
        아이콘은 active 와 무관하게 항상 렌더링.
        ICON_BY_ID 에 등록된 chip 만 아이콘이 있다 (전체 는 icon 없음).
      -->
      <span
        v-if="ICON_BY_ID[chip.id]"
        class="map-filter-chips__chip-icon"
        :style="{
          width: ICON_BY_ID[chip.id].w + 'px',
          height: ICON_BY_ID[chip.id].h + 'px',
          color: active === chip.id ? '#FFFFFF' : ICON_BY_ID[chip.id].color
        }"
        aria-hidden="true"
        v-html="ICON_BY_ID[chip.id].raw"
      />
      <span class="map-filter-chips__chip-label">{{ chip.label }}</span>
    </button>
  </div>
</template>

<style scoped>
/*
 * Figma 25:801 / 25:950 actual:
 *  - container top 117, left 0, w 390, padding 0 20, gap 8
 *  - overflow-x: auto, drop-shadow 0 2 3 rgba(0,0,0,0.07)
 *
 *  - Figma 의 status bar 47px 는 웹에서 구현하지 않으므로,
 *    원래 top 117 → 70 (= 117 - 47) 로 보정.
 *    → search bar (top 0, padding-top 10, field h 44) 아래 16px 의
 *      동일 gap 유지.
 *
 * scroll-padding-inline: 20px;
 *  - scrollIntoView({ inline: 'nearest' }) 가 호출됐을 때
 *    active chip 의 left/right edge 가 container 의 scroll-port
 *    양쪽에서 20px 안쪽에 들어와야 'visible' 로 간주.
 *  - 즉 마지막 chip 을 선택해도 오른쪽 edge 에 20px 의 시각적 여백이 남고,
 *    첫 chip 을 선택해도 왼쪽 edge 에 20px 의 여백이 보장된다.
 */
.map-filter-chips {
  position: absolute;
  top: 70px;
  left: 0;
  right: 0;

  display: flex;
  align-items: flex-start;
  gap: 8px;

  padding: 0 20px;
  scroll-padding-inline: 20px;

  z-index: 4;

  overflow-x: auto;
  overflow-y: hidden;

  scrollbar-width: none;
  -ms-overflow-style: none;

  -webkit-overflow-scrolling: touch;
}

.map-filter-chips::-webkit-scrollbar {
  display: none;
}

/*
 * Figma chip:
 *  - h 35, padding 10 14, radius 12
 *  - active bg #FF6940 / text white
 *  - inactive bg white / text #191919
 *  - chip 자체에는 drop-shadow 적용 안 함 (container 가 담당)
 *  - 아이콘 유무와 무관하게 동일한 layout 유지.
 *  - 아이콘이 active/inactive 모두에서 항상 존재하므로 width 가 튀지 않는다.
 */
.map-filter-chips__chip {
  flex: 0 0 auto;

  display: inline-flex;
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

  /* selection 시 color/background 만 부드럽게 전환, transform 은 press feedback */
  transition:
    background-color 180ms ease,
    color 180ms ease,
    transform 120ms ease;
}

.map-filter-chips__chip:active {
  transform: scale(0.96);
}

.map-filter-chips__chip--active {
  background: #FF6940;
  color: #FFFFFF;
  font-weight: 600;
}

/*
 * 아이콘 wrapper.
 *  - inline SVG 가 wrapper 크기만큼 정확히 그려지도록 강제.
 *  - SVG 의 intrinsic width/height (Figma actual) 는 inline style 로 명시.
 *  - 전역 svg rule 을 두지 않고, 이 wrapper 의 :deep(svg) 만 제한한다.
 */
.map-filter-chips__chip-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  flex: 0 0 auto;
  flex-shrink: 0;

  line-height: 0;
}

.map-filter-chips__chip-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/* 라벨은 따로 분리해서 단순화. */
.map-filter-chips__chip-label {
  display: inline-block;
  line-height: 1;
}
</style>