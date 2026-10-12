import { ref } from 'vue'
import type { MapPlace } from '~/composables/useMapData'

/*
 * Map page 의 selectedPlace 상태를 app-level 까지 공유한다.
 *
 * /map 페이지에서 marker 를 선택하면 selectedPlace 가 set 되고,
 * 그 동안에는 Figma 25:905 의 동작에 맞춰:
 *   - BottomNavigation (floating dark nav) 숨김
 *   - FAB (CreatePost) 숨김
 *   - theme-color 는 map 의 #F9F8F9 그대로 (변경 없음)
 *
 * selectedPlace 가 null 이면 다시 default 상태 (Figma 25:706) 로 복귀.
 *
 * 같은 module-scope 의 ref 를 모든 호출자가 공유하므로
 * /map 페이지 내부의 local state 와 app.vue 의 computed 가 동기화된다.
 */

const selectedPlace = ref<MapPlace | null>(null)

const setSelectedPlace = (place: MapPlace) => {
  selectedPlace.value = place
}

const clearSelectedPlace = () => {
  selectedPlace.value = null
}

export const useMapSelection = () => {
  return {
    selectedPlace,
    setSelectedPlace,
    clearSelectedPlace
  }
}