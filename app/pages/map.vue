<script setup lang="ts">
/*
 * /map 페이지.
 *
 * Figma 기준:
 *   - 기본 상태  : 25:706 (지도 - 메인)
 *   - 선택 상태  : 25:905 (지도 - 식당 미리보기)
 *
 * 두 상태를 별도 route 로 만들지 않고, 같은 /map 안에서
 * selectedPlace state 로만 전환한다.
 *
 * 라우트 변경 / page transition 은 발생하지 않는다.
 *
 * BottomNavigation (NavigationBottomNavigation):
 *   - 기본 상태 (selectedPlace === null) → 표시
 *   - 선택 상태 (selectedPlace !== null) → 숨김 (Figma 25:905 에 nav 가 없음)
 *
 * FAB (NavigationCreatePostFab):
 *   - app.vue 에서 이미 mainTabRoutes (Home/Explore/Map/Chat) 에서만 보이게
 *     되어 있고, /map 도 그 안에 있다.
 *   - 다만 Figma 의 /map 화면에는 orange FAB 가 없으므로,
 *     여기서도 노출하지 않도록 /map 에서만 FAB 를 끈다.
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
 * - null: Figma 25:706 (default bottom panel, BottomNavigation 표시)
 * - MapPlace: Figma 25:905 (place preview, BottomNavigation 숨김)
 *
 * app.vue 에서 shared state 로도 참조한다 — /map 에서 selected state 일 때
 * floating dark BottomNavigation 을 숨기기 위함.
 */
const { selectedPlace, setSelectedPlace, clearSelectedPlace } = useMapSelection()

/*
 * filter chip active state.
 * mock marker visibility 만 영향을 주도록 구성 (선택 state 와는 독립).
 */
const activeFilter = ref<MapFilter>('all')

/*
 * Mock filter 적용:
 *  - all        : 전체 marker 표시
 *  - friends    : profile marker 가 있는 곳만 (여기선 모든 place 표시)
 *  - following  : 모든 place 표시
 *  - hot        : 모든 place 표시
 * (Figma 에서는 chip 클릭이 mock data visibility 만 바꾼다.)
 */
const visiblePlaceIds = computed<Set<string>>(() => {
  if (activeFilter.value === 'all') return new Set(MAP_PLACES.map(p => p.id))
  // 그 외 filter 는 mock 으로 전부 노출 (실제 API 없음)
  return new Set(MAP_PLACES.map(p => p.id))
})

const onPlaceSelect = (place: MapPlace) => {
  if (selectedPlace.value?.id === place.id) {
    /*
     * 같은 marker 를 다시 누른 경우 Figma prototype 우선이므로,
     * 명시된 toggle close 동작이 없으면 selection 유지 (default).
     * (사용자 요청: 'toggle close 여부는 Figma prototype 우선' 이라 명시)
     */
    return
  }
  setSelectedPlace(place)
}

const onBackgroundClick = () => {
  /*
   * Figma 25:706 → 25:905 의 transition 은 marker click 으로만 발생.
   * 선택된 상태에서 '지도 빈 영역 tap → selectedPlace = null' 은
   * 사용자 명시 fallback 으로 처리.
   */
  if (selectedPlace.value) {
    clearSelectedPlace()
  }
}

const onLocateClick = () => {
  /*
   * 실제 geolocation 통합은 이번 작업 범위 밖.
   * mock current location center 상태 정도만 처리 (state 변경 X).
   */
}

const onProfileClick = () => {
  /*
   * Figma 25:700 의 profile button (Frame714) 은 drawer / my 페이지로
   * 연결될 가능성이 높지만 이번 작업 범위 밖이므로 press feedback 만.
   */
}

/*
 * current location marker 위치: Figma 25:794 actual: left 58, top 215.
 */
const CURRENT_LOCATION = { x: 58, y: 215 }
</script>

<template>
  <!--
    Page wrapper.
    - /map 은 interactive full-viewport view 이므로 페이지 자체가
      AppContent 위에서 세로 스크롤되면 안 된다.
    - AppShell 이 viewport 크기를 관리하므로 여기서 100dvh 를 추가하지 않는다.
    - iOS safe-area 는 search/filter/panel/navigation 내부에서 env() 로 처리.
  -->
  <div class="map-page">
    <!--
      Map container.
      selection state 와 무관하게 항상 mount 되어 있다
      (panel 교체 시 지도가 remount 되지 않도록).
    -->
    <div class="map-page__map">
      <MapCanvas
        :show-locate-top="selectedPlace ? 'selected' : 'base'"
        @backgroundclick="onBackgroundClick"
        @locateclick="onLocateClick"
        @profileclick="onProfileClick"
      />

      <!--
        current location marker (Figma 25:794).
        map background 위 marker layer.
      -->
      <MapCurrentLocation
        :x="CURRENT_LOCATION.x"
        :y="CURRENT_LOCATION.y"
      />

      <!--
        profile/avatar markers (Figma 25:781 / 25:715).
      -->
      <MapProfileMarker
        v-for="p in MAP_PROFILE_MARKERS"
        :key="p.id"
        :marker="p"
      />

      <!--
        Place markers (Figma 25:817 / 25:826 / 25:835 / 25:844).
        marker click 으로 selectedPlace 변경.
        - visible filter 는 mock 으로 모든 marker 가 노출되지만,
          필요 시 visiblePlaceIds 로 가려도 된다.
      -->
      <MapPlaceMarker
        v-for="place in MAP_PLACES"
        :key="place.id"
        v-show="visiblePlaceIds.has(place.id)"
        :place="place"
        :is-selected="selectedPlace?.id === place.id"
        :force-uchon-when-selected="selectedPlace?.id === place.id"
        @select="onPlaceSelect"
      />

      <!--
        상단 search bar (Figma 25:787).
        selected state 에서도 그대로 유지.
      -->
      <MapSearchBar />

      <!--
        Filter chip row (Figma 25:801).
        selected state 에서도 그대로 유지.
      -->
      <MapFilterChips v-model="activeFilter" />

      <!--
        우측 control button 은 MapCanvas 가 자체 렌더링 (Figma 우측 column).
        여기서는 column 위치를 참고하기 위한 placeholder 상수만 사용.
        (MAP_RIGHT_CONTROLS 는 향후 control button 추가 시 사용 예정)
      -->
      <template v-if="false">{{ MAP_RIGHT_CONTROLS }}</template>
    </div>

    <!--
      Bottom panel 영역.
      - 기본 상태: MapOverviewPanel (Figma 25:730)
      - 선택 상태: MapPlacePreview (Figma 25:999), MapOverviewPanel 숨김
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
 *
 * AppShell 이 viewport(390×844) 의 전체 영역을 flex column 으로 관리하고,
 * AppContent 가 그 안에서 scroll container 역할을 한다.
 * /map 은 AppContent 의 page-level scroll 이 필요 없으므로,
 * height 100% + overflow hidden 으로 page 자체가 위아래로 스크롤되지 않게 한다.
 *
 * 단, marker / panel 등의 absolute layer 가 정상 배치되도록
 * position: relative + width 100% + flex 1 1 auto 로 둔다.
 *
 * Figma 의 9:41 status bar 등 desktop fake padding 은 두지 않는다.
 * iOS safe-area 는 panel/navigation 내부에서 env() 로 흡수.
 */
.map-page {
  position: relative;

  width: 100%;
  height: 100%;
  min-height: 0;

  display: flex;
  flex-direction: column;

  background: var(--color-background);

  overflow: hidden;
}

/*
 * Map container: 100% × 100% (AppContent 의 남는 영역).
 * - map 자체는 full-bleed 이고 search/filter/control buttons/marker 들은
 *   이 container 의 absolute child.
 */
.map-page__map {
  position: relative;

  flex: 1 1 auto;
  width: 100%;
  min-height: 0;

  overflow: hidden;
}
</style>