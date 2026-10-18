<script setup lang="ts">
/*
 * Explore — Figma 30:1063 (탐색 - 메인, 최신)
 *  - 390 × 844 (scrollable AppContent)
 *  - safe-area top header (white)
 *  - gray band (#F3F4F6) with: white card (title+carousel+CTA) + group section + ranking section
 *  - floating nav (app-level)
 */
import ExploreHeader from '~/components/explore/ExploreHeader.vue'
import RestaurantCarousel from '~/components/explore/RestaurantCarousel.vue'
import GroupSection, { type GroupCategory, type GroupItem } from '~/components/explore/GroupSection.vue'
import NeighborhoodRanking from '~/components/explore/NeighborhoodRanking.vue'
import badgeRevisit from '~/assets/icons/explore/badge-revisit.svg?raw'
import badgeSolo from '~/assets/icons/explore/badge-solo.svg?raw'
import badgeLocal from '~/assets/icons/explore/badge-local.svg?raw'
import { getStorageImageUrl, STORAGE_FOLDERS } from '~/utils/storage'

/*
 * 헤더: 합정동
 */
const location = ref('합정동')

/*
 * 사용자 닉네임 (recommendation highlight).
 */
const userHandle = '닮은살걀'

/*
 * 추천 맛집 (Figma 30:1063 기준 새 asset).
 */
const restaurants = [
  {
    id: 'r1',
    image: getStorageImageUrl('r1.png', STORAGE_FOLDERS.explore),
    location: '망원동 · 일식',
    name: '유메노키',
    distance: '1.2km',
    hours: '08:00-20:30',
    amenities: '무선 인터넷, 유아의자, 단체 이용 가능',
    badge: { label: '재방문률 높음', variant: 'orange' as const, icon: badgeRevisit }
  },
  {
    id: 'r2',
    image: getStorageImageUrl('r2.png', STORAGE_FOLDERS.explore),
    location: '상수동 · 수제버거',
    name: '웨이브버거',
    distance: '1.5km',
    hours: '11:30-20:30',
    amenities: '포장, 배달, 단체 이용 가능',
    badge: { label: '혼밥 인기', variant: 'solo' as const, icon: badgeSolo }
  },
  {
    id: 'r3',
    image: getStorageImageUrl('r3.png', STORAGE_FOLDERS.explore),
    location: '합정동 · 양식',
    name: '오브테이블',
    distance: '0.9km',
    hours: '11:30-22:00',
    amenities: '예약, 무선 인터넷, 단체 이용 가능',
    badge: { label: '동네 인기', variant: 'green' as const, icon: badgeLocal }
  }
]

/*
 * 모임 카테고리.
 */
const categories: Array<{ id: GroupCategory; label: string }> = [
  { id: 'all', label: '전체' },
  { id: 'eat-together', label: '같이 먹기' },
  { id: 'explore', label: '맛집 탐방' },
  { id: 'solo', label: '혼밥' },
  { id: 'cafe', label: '카페' },
  { id: 'drink', label: '술 · 야식' }
]

const activeCategory = ref<GroupCategory>('all')

const allGroups: GroupItem[] = [
  {
    id: 'g1',
    thumbnail: getStorageImageUrl('g1.png', STORAGE_FOLDERS.explore),
    name: '라멘원정대',
    members: 21,
    membersLabel: '21명',
    time: '1분 전',
    timeVariant: 'accent',
    locationChip: '망원동',
    categoryChip: '맛집 탐방',
    avatars: [
      getStorageImageUrl('g1a.png', STORAGE_FOLDERS.explore),
      getStorageImageUrl('g1b.png', STORAGE_FOLDERS.explore),
      getStorageImageUrl('g1c.png', STORAGE_FOLDERS.explore)
    ]
  },
  {
    id: 'g2',
    thumbnail: getStorageImageUrl('g2.png', STORAGE_FOLDERS.explore),
    name: '점심시간에 혼밥은 싫어',
    members: 30,
    membersLabel: '30명',
    time: '방금 대화',
    timeVariant: 'accent',
    locationChip: '연남동',
    categoryChip: '같이 먹기',
    avatars: [
      getStorageImageUrl('g2a.png', STORAGE_FOLDERS.explore),
      getStorageImageUrl('g2b.png', STORAGE_FOLDERS.explore),
      getStorageImageUrl('g2c.png', STORAGE_FOLDERS.explore)
    ]
  },
  {
    id: 'g3',
    thumbnail: getStorageImageUrl('g3.png', STORAGE_FOLDERS.explore),
    name: '을지로 술친구',
    members: 45,
    membersLabel: '45명',
    time: '방금 대화',
    timeVariant: 'accent',
    locationChip: '합정동',
    categoryChip: '술 · 야식',
    avatars: [
      getStorageImageUrl('g3a.png', STORAGE_FOLDERS.explore),
      getStorageImageUrl('g3b.png', STORAGE_FOLDERS.explore),
      getStorageImageUrl('g3c.png', STORAGE_FOLDERS.explore)
    ]
  }
]

const visibleGroups = computed(() => {
  if (activeCategory.value === 'all') return allGroups
  const map: Record<GroupCategory, string> = {
    'all': '',
    'eat-together': '같이 먹기',
    'explore': '맛집 탐방',
    'solo': '혼밥',
    'cafe': '카페',
    'drink': '술 · 야식'
  }
  const target = map[activeCategory.value]
  return allGroups.filter(g => g.categoryChip === target)
})

/*
 * 10월 동네 랭킹.
 */
const rankingItems = [
  { id: 'rank2', name: '상수동', visits: '1,239회 방문', rank: 2 as const, image: getStorageImageUrl('ranking-1.png', STORAGE_FOLDERS.explore), barHeight: 41 },
  { id: 'rank1', name: '서교동', visits: '3,499회 방문', rank: 1 as const, image: getStorageImageUrl('ranking-2.png', STORAGE_FOLDERS.explore), barHeight: 68 },
  { id: 'rank3', name: '망원동', visits: '507회 방문', rank: 3 as const, image: getStorageImageUrl('ranking-3.png', STORAGE_FOLDERS.explore), barHeight: 24 }
]

const { safeNavigate } = useSafeNavigation()

const onSearchClick = () => {
  safeNavigate('/explore/search')
}

const onLocationClick = () => {
  // TODO: location picker
}

const onSeeMore = () => {
  safeNavigate('/explore/groups')
}

const onOpenGroup = (id: string) => {
  safeNavigate(`/groups/${id}`)
}

const onMapClick = () => {
  safeNavigate('/map')
}

const onSelectCategory = (id: GroupCategory) => {
  activeCategory.value = id
}

const onBookmarkToggle = (id: string) => {
  console.debug('[explore] bookmark toggle', id)
}
</script>

<template>
  <div class="explore-page">
    <ExploreHeader
      :location="location"
      @search-click="onSearchClick"
      @location-click="onLocationClick"
    />

    <div class="explore-page__band">
      <RestaurantCarousel
        :restaurants="restaurants"
        :user-handle="userHandle"
        @map-click="onMapClick"
      />

      <GroupSection
        :groups="visibleGroups"
        :categories="categories"
        :active-category="activeCategory"
        @select-category="onSelectCategory"
        @see-more="onSeeMore"
        @open-group="onOpenGroup"
      />

      <NeighborhoodRanking
        month="10월"
        top-area="10월에는"
        top-neighborhood="서교동"
        :items="rankingItems"
      />
    </div>
  </div>
</template>

<style scoped>
/*
 * Explore page — Figma 30:1063 (탐색 - 메인)
 *  - root bg #FFFFFF (header 가 white, page 자체도 white)
 *  - band (below header): bg #F3F4F6, flex-col, gap 16, pb 16
 *    children 순서:
 *      1) white card (RestaurantCarousel): title+carousel+CTA 묶음
 *      2) GroupSection: transparent root (gray 비쳐 보임), title row + tab row + white list
 *      3) NeighborhoodRanking: white root with gray inner card
 */
.explore-page {
  display: flex;
  flex-direction: column;
  align-items: stretch;

  width: 100%;
  min-height: 100%;

  background: #FFFFFF;
}

.explore-page__band {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;

  padding-bottom: 16px;

  background: #F3F4F6;
}
</style>