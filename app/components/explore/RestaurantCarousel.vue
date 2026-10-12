<script setup lang="ts">
/*
 * Restaurant Carousel — Figma 30:1075 / 30:1063 (탐색 - 메인, 최신)
 *  - band background: #F3F4F6
 *  - inner white card: w 390, p 20, gap 20
 *  - title row: Pretendard SemiBold 20px #191919, 닉네임 span #FE5531 Bold
 *  - carousel container: 390 × 280, overflow-x:auto (scrollbar hidden)
 *  - inner track: gap 20, padding 20 x (좌우 inset)
 *    - 첫 카드는 좌측 padding(20px)부터 완전히 표시
 *    - justify-content: flex-start (center 정렬 X)
 *    - 스크롤 초기 위치는 scrollLeft = 0 (브라우저 default)
 *  - CTA: w 350, padding 16x20, radius 12, bg #FE5531, white 16 SemiBold
 *
 * 수정 사항:
 *  - track justify-content: center → flex-start
 *  - track 에 initial scrollLeft 코드는 없음 (DOM 마운트 시 scrollLeft=0 이 기본)
 *  - scroll-snap-align: start (center 아님)
 */
import RestaurantCard, { type Restaurant } from './RestaurantCard.vue'

defineProps<{
  restaurants: Restaurant[]
  userHandle: string
}>()

const emit = defineEmits<{
  'map-click': []
}>()

const onMapClick = () => emit('map-click')

/*
 * Scroller ref — 외부에서 carousel 조작이 필요할 때 사용 가능하도록 노출.
 * 현재는 DOM 마운트 시 scrollLeft=0 이 보장되므로 별도 초기화 없음.
 */
// const scrollerRef = ref<HTMLElement | null>(null)
// onMounted(() => {
//   if (scrollerRef.value) scrollerRef.value.scrollLeft = 0
// })
</script>

<template>
  <section class="restaurant-carousel" aria-label="추천 맛집">
    <div class="restaurant-carousel__title">
      <p>
        <span class="restaurant-carousel__highlight">{{ userHandle }}</span>
        <span class="restaurant-carousel__suffix">님에게 추천해요</span>
      </p>
    </div>

    <div class="restaurant-carousel__scroller" role="region" aria-label="추천 맛집 가로 스크롤">
      <div class="restaurant-carousel__track">
        <RestaurantCard
          v-for="r in restaurants"
          :key="r.id"
          :restaurant="r"
        />
      </div>
    </div>

    <button
      type="button"
      class="restaurant-carousel__cta"
      aria-label="지도에서 확인하기"
      @click="onMapClick"
    >
      <span class="restaurant-carousel__cta-label">지도에서 확인하기</span>
    </button>
  </section>
</template>

<style scoped>
/*
 * Figma 30:1075 (탐색 - 메인)
 *  - container: bg white, w 390, p 20, gap 20 (between title / scroller / CTA)
 *  - title: Pretendard SemiBold 20px #191919
 *  - nickname: Pretendard Bold #FE5531
 *  - scroller: w 390, h 280, overflow-x:auto, overflow-y:clip
 *  - track: gap 20, padding 0 20, justify-content: flex-start
 *           (첫 카드는 padding 20px 위치에서 시작)
 *  - CTA: w 350, p 16/20, radius 12, bg #FE5531, white 16 SemiBold
 */
.restaurant-carousel {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 20px;

  width: 100%;
  padding: 20px;

  background: #FFFFFF;
  box-sizing: border-box;
}

.restaurant-carousel__title {
  width: 100%;
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
}

.restaurant-carousel__highlight {
  color: #FE5531;
  font-weight: 700;
}

.restaurant-carousel__suffix {
  color: #191919;
  font-weight: 600;
}

/*
 * Scroller — 가로 스크롤 컨테이너
 *  - Figma actual: w 390, h 280
 *  - overflow-x: auto, overflow-y: clip
 *  - 첫 카드는 scroller 의 left 0 + track padding-left 20 에서 시작
 */
.restaurant-carousel__scroller {
  width: 100%;
  height: 280px;

  overflow-x: auto;
  overflow-y: clip;

  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  /*
   * scroll-snap-type: x proximity
   *  - 첫 카드가 가운데로 점프하지 않도록 proximity 사용
   *  - center 강제 X
   */
  scroll-snap-type: x proximity;

  box-sizing: border-box;
}

.restaurant-carousel__scroller::-webkit-scrollbar {
  display: none;
}

/*
 * Track — 실제 카드를 배치하는 flex row
 *  - padding 0 20 → 첫 카드 left = 20, 마지막 카드 right = 20
 *  - justify-content: flex-start (center 사용 X — 첫 카드가 가운데로 밀리는 원인)
 *  - gap 20 (카드 사이)
 */
.restaurant-carousel__track {
  display: flex;
  align-items: stretch;
  justify-content: flex-start;

  gap: 20px;

  height: 100%;
  padding: 0 0;

  box-sizing: border-box;
}

/* ----- CTA — Figma 30:1172/30:1173 ----- */
.restaurant-carousel__cta {
  align-self: center;

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

.restaurant-carousel__cta-label {
  font: inherit;
  color: inherit;
}

.restaurant-carousel__cta:active {
  opacity: 0.92;
  transform: scale(0.99);
}
</style>