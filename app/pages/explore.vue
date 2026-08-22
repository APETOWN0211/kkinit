<script setup lang="ts">
import ExploreSearch from '~/components/explore/ExploreSearch.vue'
import MoodChips from '~/components/explore/MoodChips.vue'
import TrendingKeywords from '~/components/explore/TrendingKeywords.vue'
import DistanceFilters from '~/components/explore/DistanceFilters.vue'

const searchQuery = ref('')
const selectedMood = ref<string>('')

const moodOptions = [
  { id: 'spicy', label: '매콤한' },
  { id: 'filling', label: '든든한' },
  { id: 'light', label: '가볍게' },
  { id: 'late-night', label: '야식' },
  { id: 'solo', label: '혼밥' },
  { id: 'date', label: '데이트' }
]

const trendingKeywords = [
  { id: 't1', rank: 1, label: '성수 파스타' },
  { id: 't2', rank: 2, label: '연남동 이자카야' },
  { id: 't3', rank: 3, label: '마라탕' },
  { id: 't4', rank: 4, label: '망원동 카페' },
  { id: 't5', rank: 5, label: '혼밥 맛집' }
]

const distanceOptions = [
  { id: '1km', label: '반경 1km' },
  { id: 'open', label: '지금 영업중' },
  { id: 'wait', label: '웨이팅 적은' },
  { id: 'solo-ok', label: '혼밥 가능' }
]
</script>

<template>
  <div class="explore-page">
    <div class="explore-content">
      <div class="explore-header">
        <ExploreSearch v-model="searchQuery" />
      </div>

      <MoodChips
        v-model="selectedMood"
        :options="moodOptions"
      />

      <TrendingKeywords :items="trendingKeywords" />

      <DistanceFilters :options="distanceOptions" />
    </div>
  </div>
</template>

<style scoped>
.explore-page {
  width: 100%;
  min-height: 100%;
  background: var(--color-background);
  padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom));
}

.explore-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-top: calc(8px + env(safe-area-inset-top));
}

.explore-header {
  padding: 0 var(--page-padding);
}
</style>