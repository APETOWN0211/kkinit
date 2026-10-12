<script setup lang="ts">
/*
 * Neighborhood Ranking — Figma 1:1840 (10월 동네 랭킹)
 *  - title: "10월 동네 랭킹", Pretendard Bold 20px, "10월" #FF5538, rest #191919
 *  - section title → card: 20px gap
 *  - card: bg #F3F4F6, padding 25, radius 12
 *  - lead text: 2 줄, "10월에는 / 서교동을 가장 많이 찾았어요"
 *    - font-size 20px / line-height 1.4 / letter-spacing -0.3px / color #191919
 *    - "서교동" 아래 4px orange underline
 *  - headline → ranking row: 20px gap
 *  - rank row: 3 items, 가운데 1위가 가장 위
 *    - avatar 46px, border 4px (rank 1 #FFD54B, 2 #E1E0E5, 3 #C47E66), radius 12
 *    - name Pretendard SemiBold 16px #191919
 *    - visits Pretendard Regular 12px #4D5160
 *    - bar: bg white, height 68/41/24, radius 2
 *    - image → name 8px, name → visits 4px
 */
export type RankingItem = {
  id: string
  name: string
  visits: string    // e.g. "3,499회 방문"
  rank: 1 | 2 | 3
  image: string
  barHeight: number
}

defineProps<{
  month: string
  topArea: string
  topNeighborhood: string
  items: RankingItem[]
}>()
</script>

<template>
  <section class="neighborhood-ranking">
    <!--
      Section title — 10월 + 동네 랭킹
      "10월" 만 primary orange + bold, 나머지 191919 + bold
    -->
    <div class="neighborhood-ranking__header">
      <h2 class="neighborhood-ranking__title">
        <span class="neighborhood-ranking__month">{{ month }}</span>
        <span> 동네 랭킹</span>
      </h2>
    </div>

    <!--
      Card
      margin-top 20px 로 section title → card 20px 간격 확보
    -->
    <div class="neighborhood-ranking__card">
      <!--
        Headline — 2 줄 구조
        "10월에는" / "<서교동>을 가장 많이 찾았어요"
      -->
      <p class="neighborhood-ranking__message">
        10월에는<br />
        <span class="neighborhood-ranking__highlight">서교동</span>을 가장 많이 찾았어요
      </p>

      <!-- Rank row -->
      <div class="neighborhood-ranking__row">
        <div
          v-for="item in items"
          :key="item.id"
          class="neighborhood-ranking__item"
        >
          <div class="neighborhood-ranking__avatar-wrap">
            <div
              class="neighborhood-ranking__avatar"
              :class="`neighborhood-ranking__avatar--rank${item.rank}`"
            >
              <img :src="item.image" :alt="item.name" loading="lazy" />
            </div>
            <p class="neighborhood-ranking__name">{{ item.name }}</p>
            <p class="neighborhood-ranking__visits">{{ item.visits }}</p>
          </div>
          <div
            class="neighborhood-ranking__bar"
            :style="{ height: `${item.barHeight}px` }"
          >
            <span class="neighborhood-ranking__rank-num">{{ item.rank }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/*
 * 10월 동네 랭킹 섹션
 *  - Figma 1:1840
 *  - section padding: 20px (top/sides), title → card 20px gap
 *  - card: bg #F3F4F6, padding 25px 20px, radius 12
 *  - lead: 2 줄, 20px / 1.4 / -0.3px, 191919
 *  - highlight underline: 4px, primary orange, 텍스트 폭에 정확히
 *  - rank row: 3 columns, 가운데 1위가 가장 위
 *  - avatar 46px / border 4 / radius 12
 */
.neighborhood-ranking {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: #FFFFFF;
}

/* Section title */
.neighborhood-ranking__header {
  padding: 20px 20px 0;
}

.neighborhood-ranking__title {
  /* Figma: Pretendard Bold 20px */
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
  color: #191919;
  white-space: nowrap;
}

.neighborhood-ranking__month {
  /* "10월" — primary orange + bold */
  color: #FF5538;
  font-weight: 700;
}

/* Card */
.neighborhood-ranking__card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 20px;

  /* section title → card 20px gap (Figma spacing) */
  margin: 20px 20px 20px;
  padding: 25px 20px;
  border-radius: 12px;
  background: #F3F4F6;

  /* 내용이 잘리지 않도록 auto, Figma 비율 유지 */
  height: auto;
  min-height: 290px;
}

/* Headline (2 줄) */
.neighborhood-ranking__message {
  margin: 0;

  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 20px;
  font-weight: 500;
  line-height: 1.4;
  letter-spacing: -0.3px;
  color: #191919;
}

/* "서교동" highlight + underline */
.neighborhood-ranking__highlight {
  position: relative;
  display: inline-block;

  font-weight: 600;
  color: #191919;
}

.neighborhood-ranking__highlight::after {
  content: '';

  position: absolute;
  left: 0;
  right: 0;

  bottom: -4px;

  height: 4px;
  background: #FF5538;
  border-radius: 999px;
}

/* rank row */
.neighborhood-ranking__row {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
}

.neighborhood-ranking__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  flex: 1;
  max-width: 102px;
}

.neighborhood-ranking__avatar-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;

  /* image → name 8px, name → visits 4px */
  gap: 4px;
  margin-bottom: 20px;
}

.neighborhood-ranking__avatar {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  border: 4px solid;
  overflow: hidden;
  flex-shrink: 0;
  background: #E9E9E9;

  /* image → name 8px (위 4px + 추가) */
  margin-bottom: 8px;
}

.neighborhood-ranking__avatar--rank1 {
  border-color: #FFD54B;
}

.neighborhood-ranking__avatar--rank2 {
  border-color: #E1E0E5;
}

.neighborhood-ranking__avatar--rank3 {
  border-color: #C47E66;
}

.neighborhood-ranking__avatar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.neighborhood-ranking__name {
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: #191919;
  text-align: center;
}

.neighborhood-ranking__visits {
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  color: #4D5160;
  text-align: center;
}

/* bar */
.neighborhood-ranking__bar {
  width: 100%;
  background: #FFFFFF;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.neighborhood-ranking__rank-num {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  color: #B7B7B7;
  text-align: center;
}
</style>
