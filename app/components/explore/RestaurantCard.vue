<script setup lang="ts">
/*
 * Restaurant Card — Figma 8:422 / 8:455 / 8:486 (탐색 - 메인)
 *  - 220 × 270, radius 16, border 1 #DBDBDB, shadow 0 1 8.2 rgba(0,0,0,0.04)
 *  - top image 218 × 128
 *  - body 218 × 141, padding 18 / 14 / 10, gap 10
 *  - badge 8:450 / 8:483 / 8:514: absolute left 11.5, top 113,
 *    padding 6 / 8, radius 8, gap 6, h 25
 *
 * node 8:404 의 정확한 좌표:
 *  - card  x 20,  y 0    (track 안에서)
 *  - image  x 1,   y 1    → 218 × 128
 *  - body   x 1,   y 129  → 218 × 141
 *  - location row  y 18 (card 기준)  → 12px, h 20 (bookmark row height)
 *  - name         y 41
 *  - info row     y 72
 *  - divider      y 98
 *  - amenities    y 108, h 18
 */
import bookmarkIcon from '~/assets/icons/explore/bookmark.svg?raw'
import distanceIcon from '~/assets/icons/explore/distance.svg?raw'
import timeIcon from '~/assets/icons/explore/time.svg?raw'
import dividerIcon from '~/assets/icons/explore/divider.svg?raw'
import amenitiesIcon from '~/assets/icons/explore/amenities.svg?raw'

export type Restaurant = {
  id: string
  image: string
  location: string       // e.g. 망원동 · 일식
  name: string           // 유메노키
  distance: string       // 1.2km
  hours: string          // 08:00-20:30
  amenities: string      // 무선 인터넷, 유아의자, 단체 이용 가능
  badge?: {
    label: string
    variant: 'orange' | 'green' | 'solo'
    icon?: string
  }
}

const props = defineProps<{
  restaurant: Restaurant
}>()

const emit = defineEmits<{
  'bookmark-toggle': [id: string]
}>()

const isSaved = ref(false)

const onBookmarkClick = (e: Event) => {
  e.stopPropagation()
  isSaved.value = !isSaved.value
  emit('bookmark-toggle', props.restaurant.id)
}

const bookmarkVariant = computed(() => {
  if (props.restaurant.badge?.variant === 'green') return 'badge--green'
  if (props.restaurant.badge?.variant === 'solo') return 'badge--solo'
  return 'badge--orange'
})
</script>

<template>
  <article class="restaurant-card">
    <div class="restaurant-card__inner">
      <!-- image -->
      <div class="restaurant-card__image">
        <img
          :src="restaurant.image"
          :alt="restaurant.name"
          loading="lazy"
        />
      </div>

      <!-- body -->
      <div class="restaurant-card__body">
        <div class="restaurant-card__top">
          <p class="restaurant-card__location">{{ restaurant.location }}</p>
          <button
            type="button"
            class="restaurant-card__bookmark"
            :aria-label="isSaved ? '저장 취소' : '저장'"
            :aria-pressed="isSaved"
            @click="onBookmarkClick"
          >
            <span class="restaurant-card__bookmark-icon" v-html="bookmarkIcon" />
          </button>
        </div>

        <p class="restaurant-card__name">{{ restaurant.name }}</p>

        <div class="restaurant-card__info">
          <span class="restaurant-card__info-item">
            <span class="restaurant-card__info-icon" v-html="distanceIcon" />
            <span>{{ restaurant.distance }}</span>
          </span>
          <span class="restaurant-card__info-item">
            <span class="restaurant-card__info-icon" v-html="timeIcon" />
            <span>{{ restaurant.hours }}</span>
          </span>
        </div>

        <div class="restaurant-card__divider" v-html="dividerIcon" />

        <div class="restaurant-card__amenities">
          <span class="restaurant-card__amenities-icon" v-html="amenitiesIcon" />
          <span class="restaurant-card__amenities-text">{{ restaurant.amenities }}</span>
        </div>
      </div>
    </div>

    <!-- badge (outside inner for absolute positioning) -->
    <div
      v-if="restaurant.badge"
      class="restaurant-card__badge"
      :class="bookmarkVariant"
    >
      <span
        v-if="restaurant.badge.variant === 'solo' || restaurant.badge.variant === 'green'"
        class="restaurant-card__badge-icon"
        v-html="restaurant.badge.icon ?? ''"
      />
      <span
        v-else
        class="restaurant-card__badge-icon"
        v-html="restaurant.badge.icon ?? ''"
      />
      <span>{{ restaurant.badge.label }}</span>
    </div>
  </article>
</template>

<style scoped>
/*
 * RestaurantCard — Figma 1:1658
 *  - 220 × 270, border 1px #DBDBDB, radius 16, shadow 0 1 8.2 rgba(0,0,0,0.04)
 *  - image: 218 × 128 (top)
 *  - body: padding 18 top / 14 x / 10 bottom, gap 10, height 141
 */
.restaurant-card {
  position: relative;
  flex: 0 0 auto;

  width: 220px;
  height: 270px;

  flex-shrink: 0;
}

.restaurant-card__inner {
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between;

  padding-bottom: 18px;

  border: 1px solid #DBDBDB;
  border-radius: 16px;
  background: #FFFFFF;
  box-shadow: 0 1px 8.2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.restaurant-card__image {
  position: relative;

  width: 218px;
  height: 128px;
  overflow: hidden;
  flex-shrink: 0;
}

.restaurant-card__image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.restaurant-card__body {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;

  height: 141px;
  padding: 18px 14px 10px;
  overflow: hidden;
}

.restaurant-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.restaurant-card__location {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: normal;
  color: #6E6F72;
}

.restaurant-card__bookmark {
  display: flex;
  align-items: center;
  justify-content: flex-start;

  /*
   * Figma 8:429 Vector = 16.842 × 20 (location row 8:427 이 h 20).
   * 이전 asset 은 13.4 × 15.4 로 더 작았고, 최신 asset 은
   * 18.8245 × 21.9823 이라 wrapper 를 Figma vector box 에 맞춘다.
   */
  width: 16.842px;
  height: 20px;

  padding: 0;
  border: 0;
  background: transparent;

  cursor: pointer;

  -webkit-tap-highlight-color: transparent;

  flex-shrink: 0;
}

.restaurant-card__bookmark-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 16.842px;
  height: 20px;
}

.restaurant-card__bookmark-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.restaurant-card__name {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: normal;
  color: #191919;
  letter-spacing: 0.72px;
}

.restaurant-card__info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.restaurant-card__info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
}

.restaurant-card__info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #4D5160;
}

.restaurant-card__info-item:nth-child(1) .restaurant-card__info-icon {
  width: 11px;
  height: 13px;
}

.restaurant-card__info-item:nth-child(2) .restaurant-card__info-icon {
  width: 14px;
  height: 14px;
}

.restaurant-card__info-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.restaurant-card__info-item > span:last-child {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: normal;
  color: #4D5160;
}

.restaurant-card__info-item:nth-child(2) > span:last-child {
  letter-spacing: -0.26px;
}

.restaurant-card__divider {
  height: 1px;
  width: 100%;
  flex-shrink: 0;
  position: relative;
}

.restaurant-card__divider :deep(svg) {
  display: block;
  width: 100%;
  height: 1px;
}

.restaurant-card__amenities {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
}

.restaurant-card__amenities-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 18px;
  height: 18px;

  flex-shrink: 0;
}

.restaurant-card__amenities-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.restaurant-card__amenities-text {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 11px;
  font-weight: 400;
  line-height: normal;
  color: #6E6F72;

  width: 168px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Badge — absolute over the card image, Figma top:113 left:11.5 */
.restaurant-card__badge {
  position: absolute;
  top: 113px;
  left: 11.5px;

  display: flex;
  align-items: center;
  gap: 6px;

  padding: 6px 8px;
  border-radius: 8px;

  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.02));
}

.restaurant-card__badge-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.restaurant-card__badge--orange .restaurant-card__badge-icon {
  width: 10.001px;
  height: 12px;
}

.restaurant-card__badge--solo .restaurant-card__badge-icon {
  width: 10px;
  height: 12px;
}

.restaurant-card__badge--green .restaurant-card__badge-icon {
  width: 8.357px;
  height: 11.62px;
}

.restaurant-card__badge-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.badge--orange,
.restaurant-card__badge--orange {
  background: #FE5531;
  color: #FFFFFF;
}

.restaurant-card__badge--solo {
  background: #FE5531;
  color: #FFFFFF;
}

/*
 * node 8:514 (오브테이블, 동네 인기):
 *   bg #70DDC5, icon 8.357 × 11.62, text #4D5160 11px Medium
 */
.restaurant-card__badge--green {
  background: #70DDC5;
  color: #4D5160;
}

.restaurant-card__badge > span:last-child {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 11px;
  font-weight: 500;
  line-height: normal;
}
</style>
