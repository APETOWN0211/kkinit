<script setup lang="ts">
/*
 * Explore — Figma 1:1639 / 1:1651 (탐색 - 메인)
 *  - 390 × 844
 *  - safe-area top
 *  - sticky header
 *  - recommend band: white carousel + #F3F4F6 background
 *  - group section
 *  - neighborhood ranking section
 *  - bottom: floating nav (앱 레벨)
 */
import ExploreHeader from '~/components/explore/ExploreHeader.vue'
import RestaurantCarousel from '~/components/explore/RestaurantCarousel.vue'
import GroupSection, { type GroupCategory, type GroupItem } from '~/components/explore/GroupSection.vue'
import NeighborhoodRanking from '~/components/explore/NeighborhoodRanking.vue'
import badgeRevisit from '~/assets/icons/explore/badge-revisit.svg?raw'
import badgeSolo from '~/assets/icons/explore/badge-solo.svg?raw'
import badgeLocal from '~/assets/icons/explore/badge-local.svg?raw'

/*
 * 헤더: 합정동
 */
const location = ref('합정동')

/*
 * 사용자 닉네임 (recommendation highlight).
 */
const userHandle = '닮은살걀'

/*
 * 추천 맛집 (Figma 1:1657/1:1689/1:1719 참고).
 * image URL은 Figma node 1:1651 기준 새 asset.
 */
const restaurants = [
  {
    id: 'r1',
    image: '/images/explore/r1.png',
    location: '망원동 · 일식',
    name: '유메노키',
    distance: '1.2km',
    hours: '08:00-20:30',
    amenities: '무선 인터넷, 유아의자, 단체 이용 가능',
    badge: { label: '재방문률 높음', variant: 'orange' as const, icon: badgeRevisit }
  },
  {
    id: 'r2',
    image: '/images/explore/r2.png',
    location: '상수동 · 수제버거',
    name: '웨이브버거',
    distance: '1.5km',
    hours: '11:30-20:30',
    amenities: '포장, 배달, 단체 이용 가능',
    badge: { label: '혼밥 인기', variant: 'solo' as const, icon: badgeSolo }
  },
  {
    id: 'r3',
    image: '/images/explore/r3.png',
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
    thumbnail: '/images/explore/g1.png',
    name: '라멘원정대',
    members: 21,
    membersLabel: '21명',
    time: '1분 전',
    timeVariant: 'accent',
    locationChip: '망원동',
    categoryChip: '맛집 탐방',
    avatars: ['/images/explore/g1a.png', '/images/explore/g1b.png', '/images/explore/g1c.png']
  },
  {
    id: 'g2',
    thumbnail: '/images/explore/g2.png',
    name: '점심시간에 혼밥은 싫어',
    members: 30,
    membersLabel: '30명',
    time: '방금 대화',
    timeVariant: 'accent',
    locationChip: '연남동',
    categoryChip: '같이 먹기',
    avatars: ['/images/explore/g2a.png', '/images/explore/g2b.png', '/images/explore/g2c.png']
  },
  {
    id: 'g3',
    thumbnail: '/images/explore/g3.png',
    name: '을지로 술친구',
    members: 45,
    membersLabel: '45명',
    time: '방금 대화',
    timeVariant: 'accent',
    locationChip: '합정동',
    categoryChip: '술 · 야식',
    avatars: ['/images/explore/g3a.png', '/images/explore/g3b.png', '/images/explore/g3c.png']
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
  { id: 'rank2', name: '상수동', visits: '1,239회 방문', rank: 2 as const, image: '/images/explore/ranking-1.png', barHeight: 41 },
  { id: 'rank1', name: '서교동', visits: '3,499회 방문', rank: 1 as const, image: '/images/explore/ranking-2.png', barHeight: 68 },
  { id: 'rank3', name: '망원동', visits: '507회 방문', rank: 3 as const, image: '/images/explore/ranking-3.png', barHeight: 24 }
]

const router = useRouter()

const onSearchClick = () => {
  router.push('/explore/search')
}

const onLocationClick = () => {
  // TODO: location picker
}

const onSeeMore = () => {
  router.push('/explore/groups')
}

const onOpenGroup = (id: string) => {
  router.push(`/groups/${id}`)
}

const onMapClick = () => {
  router.push('/map')
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
      />

      <button
        type="button"
        class="explore-page__map-cta"
        aria-label="지도에서 확인하기"
        @click="onMapClick"
      >
        지도에서 확인하기
      </button>
    </div>

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
</template>

<style scoped>
/*
 * Explore page — Figma 1:1639 / 1:1651
 *  - recommend band: white carousel + #F3F4F6 background
 *  - CTA: width 350, padding 20x16, radius 12, bg #FE5531, white 16 SemiBold
 *  - group section: white background
 *  - neighborhood ranking: white background
 *  - bottom: floating nav (app-level)
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
  align-items: center;
  gap: 16px;

  padding-bottom: 16px;

  background: #F3F4F6;
}

.explore-page__map-cta {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 350px;
  padding: 16px 20px;

  border: 0;
  border-radius: 12px;
  background: #FE5531;

  color: #FFFFFF;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: normal;
  white-space: nowrap;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  transition: opacity 120ms ease, transform 120ms ease;
}

.explore-page__map-cta:active {
  opacity: 0.92;
  transform: scale(0.99);
}
</style>
