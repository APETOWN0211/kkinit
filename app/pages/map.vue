<script setup lang="ts">
/*
 * /map 페이지.
 *
 * Figma 44:1019 (지도 - 메인) / 44:1101 (search) / 44:1115 (filter) /
 * 44:1044 (bottom sheet) 기준.
 *
 * Layer 구조:
 *   .map-page
 *     .map-surface        (지도 background layer, 단독)
 *     .map-overlay        (UI layer: search, filter, marker, controls)
 *     .map-bottom-sheet   (Figma 44:1044, top 457px)
 *
 * map background 는 이번 작업에서 비워두고, 추후 사용자가 직접 image asset 을
 * `.map-surface { background-image: url(...); }` 한 줄로 교체할 수 있도록
 * surface 만 따로 둔다.
 *
 * selected state (marker click):
 *   - selectedPlace 가 set 되면 MapOverviewPanel 대신 MapPlacePreview 표시
 *   - BottomNavigation (app.vue 에서 제어) 은 selectedPlace !== null 일 때 hide
 *   - FAB 도 /map 에선 hide (app.vue 에서 이미 처리)
 */
import {
  MAP_PLACES,
  MAP_PROFILE_MARKERS,
  MAP_RIGHT_CONTROLS,
  type MapPlace,
  type MapFilter
} from '~/composables/useMapData'
import { useMapSelection } from '~/composables/useMapSelection'

/*
 * selectedPlace state.
 * - null: Figma 44:1019 (default bottom panel, BottomNavigation 표시)
 * - MapPlace: Figma 의 식당 미리보기 (BottomNavigation 숨김)
 */
const { selectedPlace, setSelectedPlace, clearSelectedPlace } = useMapSelection()

/*
 * filter chip active state.
 * mock marker visibility 만 영향을 주도록 구성.
 */
const activeFilter = ref<MapFilter>('all')

const visiblePlaceIds = computed<Set<string>>(() => {
  if (activeFilter.value === 'all') return new Set(MAP_PLACES.map(p => p.id))
  return new Set(MAP_PLACES.map(p => p.id))
})

const onPlaceSelect = (place: MapPlace) => {
  if (selectedPlace.value?.id === place.id) return
  setSelectedPlace(place)
}

const onBackgroundClick = () => {
  if (selectedPlace.value) clearSelectedPlace()
}

const onLocateClick = () => {
  /* 실제 geolocation 통합은 이번 작업 범위 밖. */
}

const onProfileClick = () => {
  /* drawer / my 페이지로 연결 가능 — press feedback 만. */
}

/*
 * current location marker 위치: Figma 44:1108 actual.
 *  - left 58, top 215
 *  - size 37 × 41.254
 */
const CURRENT_LOCATION = { x: 58, y: 215 }

/*
 * 우측 control button 위치: Figma 44:1111 + Frame714 actual.
 *  - left = calc(75% + 39.5px) = 332px (390 viewport) → CSS 에서 right: 20px 로 표현
 *  - profile top 351, locate top 397
 *  - size 38×38
 */
const controlRight = MAP_RIGHT_CONTROLS.right
const profileTop = MAP_RIGHT_CONTROLS.profileTop
const locateTop = MAP_RIGHT_CONTROLS.locateTop
</script>

<template>
  <div class="map-page">
    <!--
      지도 background layer.
      - Figma 44:1036 (MAP 4 1) 의 asset 을 그대로 사용.
        asset: public/images/map/map-bg.png (Figma node 44:1036 안 image)
        Figma 실제 크기: 390 × 844, viewport 와 동일 비율.
      - 추후 다른 map 으로 교체할 때 public/images/map/map-bg.png 만 갈아끼우면 된다.
      - 모든 UI/search/marker/control 은 이 layer 위에 absolute 로 올라간다.
      - z-index 1 (오버레이 z-index 2 보다 뒤).
    -->
    <div class="map-surface" aria-hidden="true">
      <img
        class="map-surface__img"
        src="/images/map/map-bg.png"
        alt=""
        draggable="false"
      />
    </div>

    <!--
      UI overlay layer.
      - search, filter, marker, current location, 우측 control buttons 모두 여기에.
      - bottom sheet 와는 별개 layer (bottom sheet 는 sheet 자체의 layer 로 분리).
    -->
    <div class="map-overlay" @click="onBackgroundClick">
      <!-- current location marker (Figma 44:1108) -->
      <MapCurrentLocation
        :x="CURRENT_LOCATION.x"
        :y="CURRENT_LOCATION.y"
      />

      <!-- profile/avatar markers (Figma 44:1100 / 44:1043) -->
      <MapProfileMarker
        v-for="p in MAP_PROFILE_MARKERS"
        :key="p.id"
        :marker="p"
      />

      <!-- place markers (Figma 44:1131 / 44:1140 / 44:1149 / 44:1158) -->
      <MapPlaceMarker
        v-for="place in MAP_PLACES"
        :key="place.id"
        v-show="visiblePlaceIds.has(place.id)"
        :place="place"
        :is-selected="selectedPlace?.id === place.id"
        :force-uchon-when-selected="selectedPlace?.id === place.id"
        @select="onPlaceSelect"
      />

      <!-- 상단 search bar (Figma 44:1101) -->
      <MapSearchBar />

      <!-- filter chip row (Figma 44:1115) -->
      <MapFilterChips v-model="activeFilter" />

      <!--
        우측 control buttons (Figma 44:1111 + Frame714).
        - locate (ion:locate) : top 397
        - profile (iconamoon:profile-fill) : top 351
      -->
      <div class="map-controls" @click.stop>
        <button
          type="button"
          class="map-controls__btn map-controls__btn--profile"
          aria-label="내 프로필"
          @click="onProfileClick"
        >
          <span class="map-controls__icon">
            <img src="/images/map/profile-icon.svg" alt="" draggable="false" />
          </span>
        </button>
        <button
          type="button"
          class="map-controls__btn map-controls__btn--locate"
          aria-label="현재 위치로"
          @click="onLocateClick"
        >
          <span class="map-controls__icon">
            <img src="/images/map/locate.svg" alt="" draggable="false" />
          </span>
        </button>
      </div>
    </div>

    <!--
      Bottom sheet (Figma 44:1044).
      - default: MapOverviewPanel
      - selected: MapPlacePreview
    -->
    <MapPlacePreview
      v-if="selectedPlace"
      :key="selectedPlace.id"
      :place="selectedPlace"
    />
    <MapOverviewPanel v-else />
  </div>
</template>

<style scoped>
/*
 * /map 페이지 wrapper.
 * - AppContent 안에서 100% × 100% 차지.
 * - position: relative + overflow hidden 으로 page 자체는 스크롤되지 않게.
 * - BottomNavigation (app.vue 의 fixed element) 은 viewport 하단에 floating
 *   되므로 이 page 의 layout 과 무관하다.
 */
.map-page {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;

  display: block;

  background: #FFFFFF;

  overflow: hidden;
}

/*
 * 지도 background layer.
 * - Figma 44:1036 (MAP 4 1) 의 PNG asset (public/images/map/map-bg.png).
 * - Figma viewport 비율 390:844 와 정확히 일치.
 *
 * position: absolute; inset: 0;
 *  - .map-page 의 자식으로서 부모 (.map-page) 의 leave transition
 *    (transform: translate3d(-8px, 0, 0), opacity 0) 을 함께 따라간다.
 *  - /map → 다른 탭 (chat, home 등) 으로 navigate 할 때
 *    Vue/Nuxt 가 .map-page 에 page-slide-leave-active / leave-to 를 적용하고
 *    그 동안 .map-surface 도 함께 viewport 밖으로 이동 + fade out.
 *    leave 끝나면 .map-page 가 DOM 에서 제거되며 .map-surface 도 함께 제거.
 *  - 만약 position: fixed 였다면 부모의 leave transition 의 영향을 받지 않고
 *    viewport 에 그대로 남아, 새로 들어오는 페이지를 덮어 "흰 화면" 으로
 *    보이게 된다. absolute 로 두면 이 문제가 사라진다.
 *
 * contain: paint;
 *  - PlacePreview 의 등장 animation (translateY 20→0, 260ms) 이
 *    .map-page 안에서 발생할 때, 그 reflow/repaint 가 background image 까지
 *    전파되어 object-fit: cover 의 crop 영역이 흔들리는 현상을 차단.
 *  - position: fixed 없이도 background image 가 안정적으로 유지됨.
 *
 * pointer-events: none;
 *  - 배경 layer 와 그 자식 image 모두 click 이벤트를 가로채지 않는다.
 *  - 이를 통해 .app-shell 의 BottomNavigation (sibling, z-index 30) 이
 *    viewport 하단 click 을 정상적으로 받게 된다.
 *  - click-through 는 overlay (.map-overlay @click=onBackgroundClick) 가
 *    받는다.
 *
 * z-index 1 → overlay (z-index 2) / bottom sheet (z-index 7) 보다 뒤.
 * background-color fallback (asset 미로드 / 미존재 시 흰 배경).
 */
.map-surface {
  position: absolute;
  inset: 0;
  z-index: 1;

  background: #FFFFFF;

  overflow: hidden;
  contain: paint;

  pointer-events: none;
}

/*
 * Background image element.
 * - Figma 비율 (390:844 ≈ 0.4618) 을 aspect-ratio 로 고정.
 *   viewport 비율과 다르더라도 container 가 항상 Figma 비율로 잡히므로
 *   object-fit: cover 가 매번 다른 영역을 잘라내지 않고 일관된 crop 유지.
 * - object-position: center top 으로 위쪽부터 보이게 (Figma status bar 영역 포함).
 * - 부모 (.map-surface) 가 pointer-events: none 이므로 자식 img 도 click-through.
 * - 이전 fix 의 transform: translateZ(0) 는 GPU layer 를 분리해 부모 (.map-page)
 *   의 leave transition 에서 background 가 viewport 에 남는 부작용을 만들었다.
 *   absolute parent + paint contain 으로 같은 안정성을 얻으면서
 *   transition 도 정상 동작하므로 translateZ 는 제거.
 */
.map-surface__img {
  display: block;

  width: 100%;
  height: 100%;
  aspect-ratio: 390 / 844;

  object-fit: cover;
  object-position: center top;

  user-select: none;
  -webkit-user-drag: none;
  pointer-events: none; /* click-through: overlay 가 받음 */
}

/*
 * UI overlay layer.
 * - search, filter, marker, current location, controls 모두 absolute.
 * - 이 layer 위에서 click 이 발생하면 background click 으로 처리되어
 *   selectedPlace 가 해제된다 (marker 자체는 stopPropagation 으로 무시).
 */
.map-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;

  display: block;
}

/*
 * 우측 control buttons (Figma 44:1111 + Frame714).
 * - 두 button 은 우측 column (left = 332px on 390 viewport) 에 vertical.
 * - profile top 351, locate top 397.
 * - 38×38, white, shadow 0 3 12 rgba(0,0,0,0.15).
 */
.map-controls {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.map-controls__btn {
  position: absolute;
  z-index: 6;

  right: 20px;
  width: 38px;
  height: 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;
  border: 0;
  border-radius: 999px;

  background: #FFFFFF;

  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);

  pointer-events: auto;

  cursor: pointer;

  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, opacity 120ms ease;
}

.map-controls__btn:active {
  transform: scale(0.94);
  opacity: 0.85;
}

.map-controls__btn--profile {
  top: 351px;
}

.map-controls__btn--locate {
  top: 397px;
}

.map-controls__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;

  flex-shrink: 0;
}

.map-controls__icon img {
  display: block;
  width: 100%;
  height: 100%;
  user-select: none;
  -webkit-user-drag: none;
}

/*
 * Figma 25:701: profile icon 은 button 38 안에서 20×20.
 */
.map-controls__btn--profile .map-controls__icon {
  width: 20px;
  height: 20px;
}
</style>
