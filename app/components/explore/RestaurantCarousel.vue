<script setup lang="ts">
/*
 * Restaurant Carousel — Figma 1:1655 (탐색 카드 horizontal scroll)
 *  - container: 390 wide, 280 tall, overflow-x:auto, overflow-y:clip
 *  - inner: gap 20, padding 20 x
 */
import RestaurantCard, { type Restaurant } from './RestaurantCard.vue'

defineProps<{
  restaurants: Restaurant[]
  userHandle: string
}>()
</script>

<template>
  <section class="restaurant-carousel" aria-label="추천 맛집">
    <div class="restaurant-carousel__title">
      <p>
        <span class="restaurant-carousel__highlight">{{ userHandle }}</span>
        <span class="restaurant-carousel__suffix">님에게 추천해요</span>
      </p>
    </div>

    <div class="restaurant-carousel__scroller">
      <div class="restaurant-carousel__track">
        <RestaurantCard
          v-for="r in restaurants"
          :key="r.id"
          :restaurant="r"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
/*
 * Figma 1:1653-1:1656
 *  - title row: padding 20/20/10, font Pretendard SemiBold 20px
 *  - nickname span: Pretendard Bold #FE5531
 *  - carousel container: 390 × 280, overflow-x:auto
 *  - inner track: gap 20, padding 20 x
 */
.restaurant-carousel {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;

  padding-bottom: 20px;

  background: #FFFFFF;
  position: relative;
  z-index: 0;
}

.restaurant-carousel__title {
  width: 100%;
  padding: 20px 0;
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  background: #FFFFFF;
}

.restaurant-carousel__title p {
  margin: 0;
  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  color: #191919;
  white-space: nowrap;
  overflow: visible;
  margin-left: 20px;
}

.restaurant-carousel__highlight {
  color: #FE5531;
  font-weight: 700;
}

.restaurant-carousel__suffix {
  color: #191919;
  font-weight: 600;
}

.restaurant-carousel__scroller {
  width: 100%;
  height: 280px;
  overflow-x: auto;
  overflow-y: clip;

  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.restaurant-carousel__scroller::-webkit-scrollbar {
  display: none;
}

.restaurant-carousel__track {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;

  height: 100%;
  padding: 0 20px;
}
</style>
