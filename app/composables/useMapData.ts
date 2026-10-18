/*
 * /map mock data.
 *
 * - 좌표/이미지/텍스트는 Figma 44:1019 (지도 - 메인) 의 actual value 를 그대로 따른다.
 * - 실제 API / Supabase 는 연결하지 않는다 (이번 작업 범위 밖).
 *
 * image_path → URL 변환은 `useMapSelection` 의 caller 인 /map 페이지의 setup 에서
 * `getStorageImageUrl` 로 일괄 처리한다. 이 모듈은 path 만 보관 (spec #22).
 */
import { imagePathFacade } from '~/utils/storage'

export type MapPlaceCategory = 'korean' | 'japanese' | 'western' | 'cafe'

export type MapPlace = {
  id: string
  name: string
  category: MapPlaceCategory
  /*
   * 390×844 AppShell 기준 marker wrapper (28 × 31.556) top-left 좌표 (px).
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
   *  - 'uchon' (Figma 식당 미리보기 active 상태) → marker-uchon.svg
   */
  variant: 'default' | 'selected' | 'uchon'
  /* 식당 미리보기 (selected state) 에서 사용. */
  images: string[]
  distance: string
  hours: string
  badge?: string
  description: string
  isOpen?: boolean
  tags?: string[]
}

/*
 * Figma 44:1019 actual 위치 그대로.
 * (marker wrapper 28×31.556 + label top/left)
 *
 * x/y 는 390×844 AppShell 기준 marker wrapper top-left 좌표 (px).
 * labelX/labelY 는 label element absolute top-left 좌표.
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
    x: 156,
    y: 374,
    labelY: 409.56,
    labelX: 170.5,
    variant: 'default',
    images: [imagePathFacade.map('uchon-1.webp'), imagePathFacade.map('uchon-2.webp')],
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
    x: 255,
    y: 250,
    labelY: 286,
    labelX: 268.5,
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
    x: 329,
    y: 183,
    labelY: 218.56,
    labelX: 343.5,
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
 * Figma 44:1100 / 44:1043 의 absolute viewport 좌표.
 *  - 44:1100 (top duck, Frame744)  : wrapper left 387.38 - 221.38 = 166, top 160.95 - 1.95 = 159
 *  - 44:1043 (bottom duck, Frame743): wrapper left 470.38 - 221.38 = 249, top 410.95 - 1.95 = 409
 */
export type MapProfileMarkerKind = 'duck' | 'dino' | 'kurumi'

export type MapProfileMarker = {
  id: string
  kind: MapProfileMarkerKind
  x: number
  y: number
  size: number
}

export const MAP_PROFILE_MARKERS: MapProfileMarker[] = [
  /*
   * kind 변경 이력:
   *  - p1 (위쪽): 'duck' → 'dino'   (티라노리 공룡 avatar)
   *  - p2 (아래쪽): 'duck2' → 'kurumi' (쿠루미 avatar, chat 폴더)
   *
   * 이유: Figma original 에서는 두 marker 가 같은 duck avatar 였지만,
   * mock 단계에서 두 marker 가 같은 profile image 로 표시되면 사용자가
   * "두 명 다 같은 사람" 으로 오해함 → 위는 티라노리, 아래는 쿠루미로 분리.
   */
  { id: 'p1', kind: 'dino',   x: 163, y: 156, size: 48 },
  { id: 'p2', kind: 'kurumi', x: 246, y: 406, size: 48 }
]

/*
 * Map 우측 control button 위치 (Figma 44:1111 / Frame714).
 *  - left = calc(75% + 39.5px) ≈ 332px
 *  - profile button (Frame714): 38×38, top 351
 *  - locate button  (44:1111)  : 38×38, top 397
 */
export const MAP_RIGHT_CONTROLS = {
  left: 332,
  right: 20,
  size: 38,
  gap: 8,
  profileTop: 351,
  locateTop: 397
}

/* Filter chip 옵션 (Figma 44:1115). */
export type MapFilter = 'all' | 'friends' | 'following' | 'hot'

export const MAP_FILTERS: { id: MapFilter; label: string; icon?: string }[] = [
  { id: 'all',       label: '전체' },
  { id: 'friends',   label: '친구 방문', icon: imagePathFacade.map('icon-friends.svg') },
  { id: 'following', label: '팔로잉 언급', icon: imagePathFacade.map('icon-people.svg') },
  { id: 'hot',       label: '요즘 뜨는', icon: imagePathFacade.map('icon-hot.svg') }
]

/*
 * Quick cards (Figma 44:1051) + Event (44:1066) + Recent visits (44:1080/44:1085)
 * 모두 실제 텍스트를 그대로 사용한다.
 */
export const MAP_QUICK_CARDS = [
  {
    id: 'friends',
    avatars: [imagePathFacade.map('avatar-1.webp'), imagePathFacade.map('avatar-2.webp')],
    text: ['친구 2명이', '근처에 있어요.'],
    bg: '#FEF7E4',
    accent: '#FFB300'
  },
  {
    id: 'event',
    icon: imagePathFacade.map('icon-event.svg'),
    text: ['오늘', '열리는 ', '저녁 모임'],
    bg: '#E0FFF8',
    accent: '#55C7AE',
    accentBold: true
  },
  {
    id: 'posts',
    icon: imagePathFacade.map('icon-posts.svg'),
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