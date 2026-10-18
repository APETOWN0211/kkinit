<script setup lang="ts">
/*
 * Restaurant Card — Figma 30:1079 / 30:1063 (탐색 - 메인, 최신)
 *  - 220 × 270, radius 16, border 1 #DBDBDB, shadow 0 1 8.2 rgba(0,0,0,0.04)
 *  - top image 218 × 128 (object-fit: cover)
 *  - body: padding 18 top / 14 x / 10 bottom, gap 10, height: auto (normal flow)
 *  - badge: absolute left 11.5, top 113
 *
 * 중요 (수정 사항):
 *  - 카드 내부 콘텐츠는 normal flow 로 배치 → 어떤 row 도 잘리지 않음
 *  - 모든 icon wrapper 는 정사각형 visual frame + flex-shrink:0 유지
 *  - 카드 자체는 flex: 0 0 220px + min-width 220px 로 carousel 에서 압축되지 않음
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
  <article class="restaurant-card" data-card-id="restaurant-card">
    <!-- image -->
    <div class="restaurant-card__image">
      <img
        :src="restaurant.image"
        :alt="restaurant.name"
        loading="lazy"
      />
    </div>

    <!-- body (normal flow) -->
    <div class="restaurant-card__body">
      <!-- category row: location + bookmark -->
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

      <!-- title -->
      <p class="restaurant-card__name">{{ restaurant.name }}</p>

      <!-- meta: distance + hours -->
      <div class="restaurant-card__info">
        <span class="restaurant-card__info-item">
          <span class="restaurant-card__info-icon restaurant-card__info-icon--distance" v-html="distanceIcon" />
          <span class="restaurant-card__info-text">{{ restaurant.distance }}</span>
        </span>
        <span class="restaurant-card__info-item">
          <span class="restaurant-card__info-icon restaurant-card__info-icon--time" v-html="timeIcon" />
          <span class="restaurant-card__info-text">{{ restaurant.hours }}</span>
        </span>
      </div>

      <!-- divider -->
      <div class="restaurant-card__divider" v-html="dividerIcon" />

      <!-- amenities footer -->
      <div class="restaurant-card__amenities">
        <span class="restaurant-card__amenities-icon" v-html="amenitiesIcon" />
        <span class="restaurant-card__amenities-text">{{ restaurant.amenities }}</span>
      </div>
    </div>

    <!-- badge (outside inner, absolute over image) -->
    <div
      v-if="restaurant.badge"
      class="restaurant-card__badge"
      :class="bookmarkVariant"
    >
      <span class="restaurant-card__badge-icon" v-html="restaurant.badge.icon ?? ''" />
      <span class="restaurant-card__badge-label">{{ restaurant.badge.label }}</span>
    </div>
  </article>
</template>

<style scoped>
/*
 * RestaurantCard — Figma 30:1079 (탐색 - 메인, 최신)
 *  - 220 × 270, border 1px #DBDBDB, radius 16, shadow 0 1 8.2 rgba(0,0,0,0.04)
 *  - image: 218 × 128 (top)
 *  - body: padding 18 top / 14 x / 10 bottom, gap 10, normal flow (height: auto)
 */
.restaurant-card {
  position: relative;
  z-index: 0;
  isolation: isolate;

  /* Carousel 에서 절대 압축되지 않도록 명시 */
  flex: 0 0 220px;
  width: 220px;
  min-width: 220px;

  /* outer surface (border + radius + shadow) */
  border: 1px solid #DBDBDB;
  border-radius: 16px;
  background: #FFFFFF;
  box-shadow: 0 1px 8.2px rgba(0, 0, 0, 0.04);

  display: flex;
  flex-direction: column;
  align-items: stretch;

  box-sizing: border-box;

  /*
   * overflow 는 카드 자체에는 두지 않는다.
   * - badge 가 absolute 로 이미지/본문 경계에 걸쳐서 떠 있어야 한다
   *   (Figma 30:1106, 8:450 등 — image top + 113px 위치).
   * - hidden 이면 badge 가 잘려서 "동네 인기 / 혼밥 인기" 같은 칩이
   *   안 보이는 현상이 생긴다.
   * - 둥근 모서리는 각 child (image, body) 가 따로 radius 처리.
   */
}

.restaurant-card__image {
  position: relative;

  width: 100%;
  height: 128px;
  flex-shrink: 0;

  /*
   * image 의 overflow:hidden 을 두면 badge 의 absolute (top 113 + height ~30 = 143,
   * image 끝 128 보다 15px 아래로 빠짐) 가 image 영역 밖에서 잘려서 사라진다.
   * image 의 img 자체에 object-fit:cover + radius 처리는 img 의 border-radius 로 하고,
   * image wrapper 는 overflow 를 visible 로 둔다.
   */
  overflow: visible;

  /* 카드 상단 둥근 모서리 (16px) — 카드 자체에 overflow:hidden 이 없으므로
   * 각 child 가 직접 처리. */
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  background: #F3F4F6;
}

.restaurant-card__image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;

  /* image 영역 자체의 둥근 모서리 (badge 와 무관, image 안쪽 클립용) */
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.restaurant-card__body {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;

  padding: 18px 14px 10px;

  /* Figma: body height 141 — 하지만 콘텐츠(특히 amenities)가 넘칠 때 잘리지 않도록
     normal flow + min-height 로 잡고, inner 가 min-width 220 을 보장. */
  min-height: 141px;
  flex: 1 1 auto;

  /* 카드 자체 overflow:hidden 제거에 따른 하단 둥근 모서리 보존 */
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  /* body 자체 배경은 두지 않는다 — article 의 background #FFFFFF 가 비쳐 보여
     둥근 모서리 안쪽까지 깨끗하게 채워진다. body 가 background 를 가지면
     badge 가 body 배경에 가려질 수 있다. */
  background: transparent;
  position: relative;
  z-index: 1;
}

/* ----- top row (location + bookmark) ----- */
.restaurant-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  width: 100%;
}

.restaurant-card__location {
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: normal;
  color: #6E6F72;

  flex: 0 1 auto;
  min-width: 0;
}

.restaurant-card__bookmark {
  display: flex;
  align-items: center;
  justify-content: center;

  /*
   * Figma 30:1086: bookmark wrapper = 16.842 × 20 (location row h 20).
   *  -> 명시적 고정 size + flex-shrink:0 으로 줄지 않도록.
   */
  width: 16.842px;
  height: 20px;
  min-width: 16.842px;
  flex-shrink: 0;
  flex-grow: 0;
  flex-basis: 16.842px;

  padding: 0;
  border: 0;
  background: transparent;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.restaurant-card__bookmark-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 16.842px;
  height: 20px;
  flex-shrink: 0;
}

.restaurant-card__bookmark-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/* ----- name ----- */
.restaurant-card__name {
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: normal;
  color: #191919;
  letter-spacing: 0.72px;

  /* 한 줄, 넘치면 ellipsis (Figma: 한 줄) */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ----- meta row (distance + hours) ----- */
.restaurant-card__info {
  display: flex;
  align-items: center;
  gap: 8px;

  width: 100%;
}

.restaurant-card__info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;

  flex-shrink: 0;
  min-width: 0;
}

/* distance icon: Figma 30:1090 = 11 × 13 (정사각형 visual frame X — 종횡비 보존) */
.restaurant-card__info-icon--distance {
  width: 11px;
  height: 13px;
  min-width: 11px;
  min-height: 13px;
  flex: 0 0 11px;
}

/* time icon: Figma 30:1093 = 14 × 14 (정사각형) */
.restaurant-card__info-icon--time {
  width: 14px;
  height: 14px;
  min-width: 14px;
  min-height: 14px;
  flex: 0 0 14px;
}

.restaurant-card__info-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  color: #4D5160;
}

.restaurant-card__info-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  flex-shrink: 0;
}

.restaurant-card__info-text {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: normal;
  color: #4D5160;
  white-space: nowrap;
}

.restaurant-card__info-item:nth-child(2) .restaurant-card__info-text {
  letter-spacing: -0.26px;
}

/* ----- divider ----- */
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

/* ----- amenities footer ----- */
.restaurant-card__amenities {
  display: flex;
  align-items: center;
  gap: 4px;

  width: 100%;
}

.restaurant-card__amenities-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  /* Figma 30:1101 / 30:1133 / 30:1164: amenities icon = 18 × 18 */
  width: 18px;
  height: 18px;
  min-width: 18px;
  min-height: 18px;
  flex: 0 0 18px;

  flex-shrink: 0;
}

.restaurant-card__amenities-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  flex-shrink: 0;
}

.restaurant-card__amenities-text {
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 11px;
  font-weight: 400;
  line-height: normal;
  color: #6E6F72;

  flex: 1 1 auto;
  min-width: 0;

  /* card inner 218 - padding 14x2 - icon 18 - gap 4 = 168px */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ----- Badge (absolute over image, Figma 30:1106 / 30:1138 / 30:1169 / 8:450) -----
   spec: top:113px, left:11.5px, orange #FE5531 / mint #70DDC5
   z-index 2 + isolation: isolate 로 body (z-index default) 위에 항상 떠 있어야 한다. */
article.restaurant-card .restaurant-card__badge {
  position: absolute;
  top: 113px;
  left: 11.5px;
  z-index: 2;
  isolation: isolate;

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
  min-width: 10.001px;
  flex: 0 0 10.001px;
}

.restaurant-card__badge--solo .restaurant-card__badge-icon {
  width: 10px;
  height: 12px;
  min-width: 10px;
  flex: 0 0 10px;
}

.restaurant-card__badge--green .restaurant-card__badge-icon {
  width: 8.357px;
  height: 11.62px;
  min-width: 8.357px;
  flex: 0 0 8.357px;
}

.restaurant-card__badge-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
  flex-shrink: 0;
}

.restaurant-card__badge-label {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 11px;
  font-weight: 500;
  line-height: normal;
  white-space: nowrap;
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
 * Figma 30:1169 (오브테이블, 동네 인기):
 *   bg #70DDC5, text #4D5160 11px Medium
 */
.restaurant-card__badge--green {
  background: #70DDC5;
  color: #4D5160;
}
</style>