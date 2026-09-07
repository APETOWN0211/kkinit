<script setup lang="ts">
/*
 * Neighborhood Ranking — Figma 1:1840 (10월 동네 랭킹)
 *  - title: "10월 동네 랭킹", Pretendard Bold 20px, "10월" #FF6940, rest #191919
 *  - card: bg #F3F4F6, padding 20, radius 12, width 350
 *  - lead text: Pretendard SemiBold 20px, 3 lines with 서교동 in middle
 *  - rank row: 3 items, gap 2px, centered
 *    - item: avatar 46px border-4, name Pretendard SemiBold 16px, visits Pretendard Regular 12px
 *    - rank 1: gold border #FFD54B (서교동), rank 2: silver border #E1E0E5 (상수동), rank 3: bronze border #C47E66 (망원동)
 *    - bar: bg white, height varies (68/41/24), rank number inside
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
    <div class="neighborhood-ranking__header">
      <p>
        <span class="neighborhood-ranking__month">{{ month }}</span>
        <span> </span>
        <span class="neighborhood-ranking__title">동네 랭킹</span>
      </p>
    </div>

    <div class="neighborhood-ranking__card">
      <!-- Lead text -->
      <div class="neighborhood-ranking__lead">
        <p>
          <span class="neighborhood-ranking__lead-light">10월에는</span>
          <br />
          <span class="neighborhood-ranking__lead-bold">{{ topNeighborhood }}</span>
          <br />
          <span class="neighborhood-ranking__lead-light">을 가장 많이 찾았어요</span>
        </p>
        <div class="neighborhood-ranking__lead-line" />
      </div>

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
 * Figma 1:1840-1:1869
 *  - header: padding 20, pt 20, Pretendard Bold 20px, "10월" #FF6940
 *  - card: bg #F3F4F6, padding 25, radius 12, width 350
 *  - lead: Pretendard SemiBold 20px, line height 1.4, underline below
 *  - rank row: gap 2px, items centered
 *    - avatar: 46×46, border-4, radius 12
 *    - rank 1: border #FFD54B, rank 2: #E1E0E5, rank 3: #C47E66
 *    - name: Pretendard SemiBold 16px #191919
 *    - visits: Pretendard Regular 12px #4D5160
 *    - bar: bg white, height 68/41/24, radius 2, rank number centered
 */
.neighborhood-ranking {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: #FFFFFF;
}

.neighborhood-ranking__header {
  padding: 20px 20px 0;
}

.neighborhood-ranking__header p {
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 20px;
  font-weight: 700;
  line-height: normal;
  color: #191919;
  white-space: nowrap;
}

.neighborhood-ranking__month {
  color: #FF6940;
}

.neighborhood-ranking__title {
  font-weight: 600;
}

.neighborhood-ranking__card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 20px;

  margin: 0 20px 20px;
  padding: 25px 20px;
  border-radius: 12px;
  background: #F3F4F6;
}

/* Lead text */
.neighborhood-ranking__lead {
  position: relative;
  min-height: 58px;
}

.neighborhood-ranking__lead p {
  position: absolute;
  top: 0;
  left: 0;
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  color: #191919;
  letter-spacing: 0.2px;
  white-space: nowrap;
}

.neighborhood-ranking__lead-light {
  font-weight: 500;
}

.neighborhood-ranking__lead-bold {
  font-weight: 600;
}

.neighborhood-ranking__lead-line {
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 1px;
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
  gap: 6px;
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
  line-height: normal;
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
  line-height: normal;
  color: #B7B7B7;
  text-align: center;
}
</style>
