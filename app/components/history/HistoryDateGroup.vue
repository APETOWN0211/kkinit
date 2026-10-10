<script setup lang="ts">
/*
 * HistoryDateGroup — Figma 22:926 actual
 *  - flex row gap 10, items-start, w 350 (= 390 - 40 page padding)
 *  - left col  (22:927): flex col gap 2, items-center, py 16
 *      - "30"   Pretendard SemiBold 16 (일요일 = #FF6940, 그 외 #191919)
 *      - "수"   Pretendard Medium 14 #73787E
 *  - right col: visit-card slot
 *
 * Figma 에서는 한 row 에 visit card 1개만 들어가지만, 같은 날짜에 방문이 여러 개면
 * 같은 date label 을 공유하는 여러 card 가 한 column 으로 쌓이도록
 * `visits: HistoryVisit[]` 배열을 받는다.
 */

import HistoryVisitCard, { type HistoryVisit } from './HistoryVisitCard.vue'

const props = defineProps<{
  date: number
  weekday: string
  visits: HistoryVisit[]
  /** 일요일/공휴일 등 강조 색 (Figma actual: "27 일" 의 27 = #FF6940) */
  isAccent?: boolean
}>()

const emit = defineEmits<{
  more: [visitId: string]
  writeStory: [visitId: string]
}>()
</script>

<template>
  <div class="date-group">
    <div class="date-group__date">
      <p
        class="date-group__date-num"
        :class="{ 'date-group__date-num--accent': isAccent }"
      >{{ date }}</p>
      <p class="date-group__date-day">{{ weekday }}</p>
    </div>

    <div class="date-group__cards">
      <HistoryVisitCard
        v-for="visit in visits"
        :key="visit.id"
        :visit="visit"
        @more="(id) => emit('more', id)"
        @write-story="(id) => emit('writeStory', id)"
      />
    </div>
  </div>
</template>

<style scoped>
/*
 * HistoryDateGroup — Figma 22:926 actual
 *  - flex row, gap 10, items-start, w 350, overflow-clip
 *  - 같은 날짜에 visits 가 여러 개면 cards column 이 row 방향으로 쌓인다
 *    (Figma 의 row + flex-wrap 아님 — Figma 는 1 row 1 card).
 */
.date-group {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
  width: 100%;
  overflow: hidden;
}

/*
 * Figma 22:927 — flex col gap 2, items-center, py 16.
 * width 는 intrinsic (= 큰 숫자 + 작은 요일 의 max 너비).
 */
.date-group__date {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 16px 0;
}

.date-group__date-num {
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0;
  color: #191919;
}

.date-group__date-num--accent {
  color: #ff6940;
}

.date-group__date-day {
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
  color: #73787e;
}

/*
 * Figma 의 right col 은 1 row 1 card.
 * 우리 구현은 같은 날짜의 여러 visit card 가 세로로 쌓이도록 flex col 로 둔다.
 * card 는 모두 동일 폭 100% (date label 옆에 정렬).
 */
.date-group__cards {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;
}
</style>
