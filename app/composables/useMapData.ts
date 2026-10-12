/*
 * /map mock data.
 *
 * - 좌표/이미지/텍스트는 Figma 25:706 (지도 - 메인) / 25:905 (식당 미리보기) 의
 *   actual value 를 그대로 따른다.
 * - 실제 API / Supabase 는 연결하지 않는다 (이번 작업 범위 밖).
 */

export type MapPlaceCategory = 'korean' | 'japanese' | 'western' | 'cafe'

export type MapPlace = {
  id: string
  name: string
  category: MapPlaceCategory
  /*
   * map container (390×844 viewport) 기준 marker top-left 좌표 (px).
   * Figma 의 marker wrapper (28×31) 위치를 그대로 사용.
   */
  x: number
  y: number
  /* Figma actual: marker 아래 label top (px). */
  labelY: number
  /* label 의 transform-x center. label 자체는 absolute left 로 지정. */
  labelX: number
  /*
   * visual marker variant.
   *  - 'default' (orange outline circle + dot)  → marker-orange.svg
   *  - 'selected' (teal outline circle + dot)   → marker-teal.svg
   *  - 'uchon' (Figma 25:905 의 active 상태)    → marker-uchon.svg
   */
  variant: 'default' | 'selected' | 'uchon'
  /* Figma 25:905 에서 사용. */
  images: string[]
  distance: string
  hours: string
  badge?: string
  description: string
  isOpen?: boolean
  tags?: string[]
}

/*
 * Figma 25:706 actual 위치 그대로.
 * (marker wrapper 28×31 + label top/left)
 */
export const MAP_PLACES: MapPlace[] = [
  {
    id: 'myeonghewon',
    name: '명희원',
    category: 'korean',
    x: 26,
    y: 310,
    labelY: 346,
    labelX: 40,
    variant: 'default',
    images: [],
    distance: '0.6km',
    hours: '11:00-21:00',
    description: '오랜 시간 단골로 찾아오는 한식당.',
    tags: ['한식']
  },
  {
    id: 'uchon',
    name: '숯불구이 우촌',
    category: 'korean',
    x: 108,
    y: 374,
    labelY: 409.56,
    labelX: 122,
    variant: 'default',
    images: ['/images/map/uchon-1.png', '/images/map/uchon-2.png'],
    distance: '1.2km',
    hours: '08:00-20:30',
    badge: '영업중',
    description:
      '20년동안 진심이 담긴 고기와 집밥의 맛을 지키고 있는 골목식당 우촌숯불구이입니다. 찾아오시는 길은 내비게이션에 \'우촌숯불구이\'를 검색하시면 됩니다.',
    isOpen: true,
    tags: ['한식', '고기']
  },
  {
    id: 'butasushi',
    name: '부타스시',
    category: 'japanese',
    x: 215,
    y: 250,
    labelY: 286,
    labelX: 229,
    variant: 'default',
    images: [],
    distance: '2.1km',
    hours: '11:30-22:00',
    description: '정통 일식 스시 전문점.',
    tags: ['일식', '스시']
  },
  {
    id: 'waveburger',
    name: '웨이브버거',
    category: 'western',
    x: 315,
    y: 183,
    labelY: 218.56,
    labelX: 329,
    variant: 'selected',
    images: [],
    distance: '0.9km',
    hours: '11:00-23:00',
    description: '수제 햄버거 전문점.',
    tags: ['양식', '버거']
  }
]

/*
 * Map 위에 떠 있는 사용자/친구 profile avatar marker.
 * Figma 25:706 의 duck / dino avatar 위치를 그대로 사용한다.
 */
export type MapProfileMarkerKind = 'duck' | 'dino' | 'duck2'

export type MapProfileMarker = {
  id: string
  kind: MapProfileMarkerKind
  x: number
  y: number
  size: number
}

export const MAP_PROFILE_MARKERS: MapProfileMarker[] = [
  /* Figma 25:781 — left 387.38 top 160.95, wrapper 48×48 (42×42 avatar + pointer) */
  { id: 'p1', kind: 'duck', x: 384, y: 158, size: 48 },
  /* Figma 25:715 — left 467.38 top 407.95, wrapper 48×48 */
  { id: 'p2', kind: 'duck2', x: 464, y: 408, size: 48 }
  /*
   * green dino avatar 는 Figma 의 다른 layer 에서 발견되지 않아
   * 일단 제외. 추후 asset 추가 시 위 배열에 더한다.
   */
]

/*
 * Map 우측 control button 위치 (Figma 25:797 / 25:946, 25:700 / 25:945).
 * - profile button : 38×38, top 351 (base) / 316 (selected)
 * - locate button  : 38×38, top 397 (base) / 362 (selected)
 *
 * 두 상태 모두 같은 우측 column (left = calc(75% + 39.5px) ≈ 332px).
 */
export const MAP_RIGHT_CONTROLS = {
  left: 332,
  size: 38,
  gap: 8,
  profileTop: 351,
  locateTop: 397
}

/* Filter chip 옵션 (Figma 25:801). */
export type MapFilter = 'all' | 'friends' | 'following' | 'hot'

export const MAP_FILTERS: { id: MapFilter; label: string; icon?: string }[] = [
  { id: 'all',       label: '전체' },
  { id: 'friends',   label: '친구 방문', icon: '/images/map/icon-friends.svg' },
  { id: 'following', label: '팔로잉 언급', icon: '/images/map/icon-people.svg' },
  { id: 'hot',       label: '요즘 뜨는', icon: '/images/map/icon-hot.svg' }
]

/*
 * Quick cards (Figma 25:737) + Event (25:752) + Recent visits (25:766/25:771)
 * 모두 실제 텍스트를 그대로 사용한다.
 */
export const MAP_QUICK_CARDS = [
  {
    id: 'friends',
    avatars: ['/images/map/avatar-1.png', '/images/map/avatar-2.png'],
    text: ['친구 2명이', '근처에 있어요.'],
    bg: '#FEF7E4',
    accent: '#FFB300'
  },
  {
    id: 'event',
    icon: '/images/map/icon-event.svg',
    text: ['오늘', '열리는 ', '저녁 모임'],
    bg: '#E0FFF8',
    accent: '#55C7AE',
    accentBold: true
  },
  {
    id: 'posts',
    icon: '/images/map/icon-posts.svg',
    text: ['방금 글이', '올라온 곳 ', '4개'],
    bg: '#F5F6F8',
    accent: '#FF6940',
    accentBold: true
  }
] as const

export const MAP_TODAY_EVENT = {
  day: '27',
  month: 'APR',
  dayColor: '#FF6940',
  monthColor: '#39AC92',
  title: '웨얼이즈누들 망원본점',
  time1: '오늘',
  time2: '오후 7:00',
  time1Color: '#191919',
  time2Color: '#9F9A9A'
}

export const MAP_RECENT_VISITS = [
  { id: 'v1', date: '8월 21일', dateColor: '#FF6940', name: '긴자료코 서촌점' },
  { id: 'v2', date: '8월 20일', dateColor: '#FF6940', name: '웨이브버거' },
  { id: 'v3', date: '8월 18일', dateColor: '#FF6940', name: '숯불구이 우촌' }
]