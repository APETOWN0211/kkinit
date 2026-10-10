<script setup lang="ts">
/*
 * /history — Figma 22:906 actual
 *  - 390 × 844, bg #F3F4F6
 *  - top  : status bar (PWA safe-area) → white band (h 50 + safe-area-top)
 *           → month selector (164w intrinsic) gap 20 from header
 *           → filter chips (intrinsic) gap 10 between
 *           → history list (col gap 16) pb 20
 *
 *  - BottomNavigation / FAB 없음 (Figma 에도 없음).
 *  - Scroll 은 .app-content (app.vue) 가 담당. history-page 자체는 100% height.
 *  - Mock data: Figma 22:906 의 5개 카드 (30 수 유메노키, 27 일 버거킹, 25 금 유메노키,
 *    24 목 사카야, 25 금 유메노키).
 */

import HistoryHeader from '~/components/history/HistoryHeader.vue'
import HistoryMonthSelector from '~/components/history/HistoryMonthSelector.vue'
import HistoryFilters, {
  type TimeFilter,
  type PartyFilter
} from '~/components/history/HistoryFilters.vue'
import HistoryDateGroup from '~/components/history/HistoryDateGroup.vue'
import type { HistoryVisit } from '~/components/history/HistoryVisitCard.vue'

interface HistoryGroup {
  date: number
  weekday: string
  /** 일요일 등 강조색 처리 (Figma 22:961 의 "27" = #FF6940) */
  isAccent?: boolean
  visits: HistoryVisit[]
}

interface MonthState {
  year: number
  month: number
}

const currentMonth = ref<MonthState>({ year: 2026, month: 9 })

const timeFilter = ref<TimeFilter>('all')
const partyFilter = ref<PartyFilter>('all')

/*
 * Figma 22:906 의 4개 date + 5개 visit card.
 *  - 30 수: 유메노키 (memo 있음)
 *  - 27 일: 버거킹 연희점 (memo 없음 → 이야기 작성 CTA)
 *  - 25 금: 유메노키 (memo 있음)
 *  - 24 목: 사카야 (memo 있음)
 *  - 25 금: 유메노키 (memo 있음, 같은 25 가 두 번 — Figma 그대로)
 */
const historyGroups = ref<HistoryGroup[]>([
  {
    date: 30,
    weekday: '수',
    visits: [
      {
        id: 'v-1',
        placeName: '유메노키',
        location: '망원동',
        category: '일식',
        time: '13:00',
        visitType: '두번째 방문',
        amount: '143,000원',
        payment: '카드결제',
        memo: '오랜만에 만난 친구들과 스시 먹었음! 자주 만납시다~'
      }
    ]
  },
  {
    date: 27,
    weekday: '일',
    isAccent: true,
    visits: [
      {
        id: 'v-2',
        placeName: '버거킹 연희점',
        location: '연희동',
        category: '패스트푸드',
        time: '20:00',
        visitType: '첫번째 방문',
        amount: '10,900원',
        payment: '카드결제'
      }
    ]
  },
  {
    date: 25,
    weekday: '금',
    visits: [
      {
        id: 'v-3',
        placeName: '유메노키',
        location: '망원동',
        category: '일식',
        time: '13:00',
        visitType: '두번째 방문',
        amount: '143,000원',
        payment: '카드결제',
        memo: '오랜만에 만난 친구들과 스시 먹었음! 자주 만납시다~'
      }
    ]
  },
  {
    date: 24,
    weekday: '목',
    visits: [
      {
        id: 'v-4',
        placeName: '사카야',
        location: '연희동',
        category: '일식',
        time: '21:00',
        visitType: '첫번째 방문',
        amount: '209,000원',
        payment: '카드결제',
        memo: '연희동 가보고 싶었던 이자카야 방문했음~ 완전 일본분위기여서 좋았어요'
      }
    ]
  },
  {
    date: 25,
    weekday: '금',
    visits: [
      {
        id: 'v-5',
        placeName: '유메노키',
        location: '망원동',
        category: '일식',
        time: '13:00',
        visitType: '두번째 방문',
        amount: '143,000원',
        payment: '카드결제',
        memo: '오랜만에 만난 친구들과 스시 먹었음! 자주 만납시다~'
      }
    ]
  }
])

/*
 * Filter 는 현재 mock 단계에서 visual 만 유지. 실제 데이터 filtering 은
 * visit 당 시간대 / 인원 정보가 visit object 에 없어서 stub.
 *  - timeFilter 가 all 이 아니면 "아침/점심/저녁" 라벨만 표시.
 *  - partyFilter 도 동일하게 local 만 유지.
 * 현재 구현: data 는 그대로 두고, page-level 에서 filter 가 active 한 동안
 * header 아래에 표시 (chip label 자체가 active 표시). mock data 는 변하지 않음.
 */

const onVisitMore = (visitId: string) => {
  // 카드 more 버튼. press feedback 만, 실제 메뉴는 별도 작업.
  // eslint-disable-next-line no-console
  console.log('[history] more:', visitId)
}

const onWriteStory = (visitId: string) => {
  // 이야기 작성. 현재 글 작성 route 없음 → press feedback 만.
  // eslint-disable-next-line no-console
  console.log('[history] writeStory:', visitId)
}
</script>

<template>
  <div class="history-page">
    <!--
      Header band (Figma 22:907) — white, status bar safe-area top, h 50.
      page 자체의 첫 child, sticky 아님 (Figma 의도).
    -->
    <HistoryHeader @back="() => {}" />

    <!--
      Page body — Figma 22:913.
      bg #F3F4F6, flex col gap 20, items-start, p 20, w 390 (= 100%).
    -->
    <div class="history-page__body">
      <HistoryMonthSelector v-model="currentMonth" />
      <HistoryFilters
        v-model:time-filter="timeFilter"
        v-model:party-filter="partyFilter"
      />

      <!--
        Figma 22:925 — flex col gap 16, items-start, pb 20.
        Date group 들을 v-for.
      -->
      <div class="history-page__list">
        <HistoryDateGroup
          v-for="(group, idx) in historyGroups"
          :key="`${group.date}-${group.weekday}-${idx}`"
          :date="group.date"
          :weekday="group.weekday"
          :is-accent="group.isAccent"
          :visits="group.visits"
          @more="onVisitMore"
          @write-story="onWriteStory"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
 * /history — Figma 22:906 actual
 *  - 390 × 844, bg #F3F4F6
 *  - .app-content 가 scroll container. history-page 는 100% height 만 가진다.
 *  - body 안의 month selector / filters / list 가 normal flow.
 */
.history-page {
  display: flex;
  flex-direction: column;
  align-items: stretch;

  width: 100%;
  min-height: 100%;

  /*
   * .app-content 가 flex-direction: column 이라 child 가 intrinsic height
   * 만 가지면 viewport 보다 작아져서 그 윗부분이 .app-shell (#FAFAFA) 으로
   * 노출된다. flex: 1 1 auto + min-height: 100% 로 항상 viewport 를 채워
   * background #F3F4F6 가 전체에 깔리도록 한다.
   */
  flex: 1 1 auto;

  background: #F3F4F6;
}

/*
 * Figma 22:913 — flex col, gap 20, items-start, p 20, w 390.
 * page 자체에 safe-area bottom 을 추가해 마지막 카드가 home indicator 에 가리지 않도록.
 */
.history-page__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;

  width: 100%;
  padding: 20px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;

  background: #F3F4F6;
}

/*
 * Figma 22:925 — flex col, gap 16, items-start, pb 20.
 * pb 20 은 Figma 의 list 자체의 pb 이지만, list 위 body 의 p 20 + safe-area 가
 * 이미 하단 여백을 제공하므로 여기선 gap 16 만 둔다.
 */
.history-page__list {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  gap: 16px;
}
</style>
