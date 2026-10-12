<script setup lang="ts">
/*
 * /map selected place preview bottom sheet.
 *
 * Figma 25:999 actual (식당 미리보기):
 *  - 390 wide, top y 455 (selected 상태에서), h 389
 *  - top radius 24, white, shadow 0 -2 15 rgba(0,0,0,0.09)
 *  - padding: 14 top / 28 bottom (no x padding on container, internal padding)
 *  - 내부 gap 10
 *
 * 내부 structure (Figma 25:999 → 25:1000/25:1031):
 *  - handle 32×4 (25:1000)
 *  - image row (25:1001): horizontal scroll, 2 images × 208×144, gap 10,
 *    padding 10 top / 4 bottom / 20 x
 *  - header row (25:1004): justify-between, padding-x 20
 *    - left col:
 *       - title row (25:1007): '숯불구이 우촌' SemiBold 22 #191919 + 영업중 badge
 *         - badge: bg rgba(255,105,64,0.2), padding 4 5, radius 6
 *       - info row (25:1011): gap 8, items center
 *         - distance: 16px, group img 16, '1.2km' Medium 16 #4D5160
 *         - hours: 16px, clock 16, '08:00-20:30' Medium 16 #4D5160 tracking -0.32
 *    - right col (25:1023): 2 action buttons 42×42, gap 13.263
 *  - description (25:1030): py 4, Regular 15 #6E6F72, line-height 1.4,
 *    tracking 0.3, w 350
 *
 * 등장 animation:
 *  - translateY(20px) + opacity 0 → translateY(0) + opacity 1
 *  - 260ms cubic-bezier(0.22, 1, 0.36, 1)
 */
import type { MapPlace } from '~/composables/useMapData'

const props = defineProps<{
  place: MapPlace
}>()

const isSaved = ref(false)
const onBookmarkClick = (e: Event) => {
  e.stopPropagation()
  isSaved.value = !isSaved.value
}
const onShareClick = (e: Event) => {
  e.stopPropagation()
}
</script>

<template>
  <!--
    Figma 25:999 actual:
      - 390×389, top y 455
      - top radius 24, white, shadow 0 -2 15 rgba(0,0,0,0.09)
      - pb 28 / pt 14 / (no x padding on container 자체, 내부에서 처리)
  -->
  <section
    class="map-place-preview"
    role="region"
    :aria-label="place.name + ' 미리보기'"
    @click.stop
  >
    <!-- handle (Figma 25:1000 actual: 32×4) -->
    <span class="map-place-preview__handle" aria-hidden="true">
      <img src="/images/map/handle.svg" alt="" draggable="false" />
    </span>

    <!--
      Image row (Figma 25:1001 actual).
      horizontal scroll 가능, padding 10 top / 4 bottom / 20 x
    -->
    <div v-if="place.images.length > 0" class="map-place-preview__images">
      <div
        v-for="(src, idx) in place.images"
        :key="idx"
        class="map-place-preview__image"
      >
        <img :src="src" :alt="place.name + ' 사진 ' + (idx + 1)" draggable="false" />
      </div>
    </div>

    <!--
      Header row (Figma 25:1004 actual).
      - left col: title row + info row
      - right col: action buttons (2 × 42×42, gap 13.263)
    -->
    <div class="map-place-preview__header">
      <div class="map-place-preview__info">
        <div class="map-place-preview__title-row">
          <h2 class="map-place-preview__title">{{ place.name }}</h2>
          <span v-if="place.badge" class="map-place-preview__badge">{{ place.badge }}</span>
        </div>
        <div class="map-place-preview__meta">
          <span class="map-place-preview__meta-item">
            <span class="map-place-preview__meta-icon">
              <img src="/images/map/icon-distance.svg" alt="" draggable="false" />
            </span>
            <span>{{ place.distance }}</span>
          </span>
          <span class="map-place-preview__meta-item">
            <span class="map-place-preview__meta-icon">
              <img src="/images/map/icon-clock.svg" alt="" draggable="false" />
            </span>
            <span class="map-place-preview__meta-hours">{{ place.hours }}</span>
          </span>
        </div>
      </div>

      <div class="map-place-preview__actions">
        <button
          type="button"
          class="map-place-preview__action"
          aria-label="공유"
          @click="onShareClick"
        >
          <img src="/images/map/action-share.svg" alt="" draggable="false" />
        </button>
        <button
          type="button"
          class="map-place-preview__action"
          :aria-label="isSaved ? '저장 취소' : '저장'"
          :aria-pressed="isSaved"
          @click="onBookmarkClick"
        >
          <img src="/images/map/action-bookmark.svg" alt="" draggable="false" />
        </button>
      </div>
    </div>

    <!--
      Description (Figma 25:1029-25:1031 actual).
      - py 4, Regular 15 #6E6F72, line-height 1.4, tracking 0.3, w 350
    -->
    <p class="map-place-preview__description">{{ place.description }}</p>
  </section>
</template>

<style scoped>
/*
 * Figma 25:999 actual:
 *  - 390×389
 *  - top radius 24, white, shadow 0 -2 15 rgba(0,0,0,0.09)
 *  - pb 28 / pt 14
 *  - center x = 50% (Figma -translate-x-1/2)
 */
.map-place-preview {
  position: absolute;
  left: 50%;
  bottom: 0;

  transform: translateX(-50%);

  width: 100%;
  max-width: 390px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  padding: 14px 0 calc(28px + env(safe-area-inset-bottom));

  background: #FFFFFF;

  border-top-left-radius: 24px;
  border-top-right-radius: 24px;

  box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.09);

  z-index: 7;

  cursor: default;

  box-sizing: border-box;

  /*
   * 등장 animation (Figma 요구):
   *  translateY(20) + opacity 0 → translateY(0) + opacity 1
   *  260ms cubic-bezier(0.22, 1, 0.36, 1)
   */
  animation: map-place-preview-enter 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes map-place-preview-enter {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* handle (Figma 25:1000 actual: 32×4) */
.map-place-preview__handle {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 4px;
  flex-shrink: 0;
}

.map-place-preview__handle img {
  display: block;
  width: 32px;
  height: 4px;
}

/*
 * Image row (Figma 25:1001 actual).
 *  - horizontal scroll 가능, padding 10 top / 4 bottom / 20 x
 *  - 각 image 208×144, radius 12, gap 10
 */
.map-place-preview__images {
  display: flex;
  align-items: stretch;
  gap: 10px;

  width: 100%;
  padding: 10px 20px 4px;

  overflow-x: auto;
  overflow-y: hidden;

  scrollbar-width: none;
  -ms-overflow-style: none;

  box-sizing: border-box;
}

.map-place-preview__images::-webkit-scrollbar {
  display: none;
}

.map-place-preview__image {
  flex: 0 0 auto;

  display: block;
  width: 208px;
  height: 144px;

  border-radius: 12px;
  overflow: hidden;

  background: #F5F6F8;
}

.map-place-preview__image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/*
 * Header row (Figma 25:1004 actual).
 *  - padding-x 20
 *  - justify-between
 */
.map-place-preview__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 12px;

  width: 100%;
  padding: 0 20px;

  box-sizing: border-box;
}

.map-place-preview__info {
  display: flex;
  flex-direction: column;
  gap: 10px;

  flex: 1 1 auto;
  min-width: 0;
}

/*
 * Title row (Figma 25:1007 actual).
 *  - '숯불구이 우촌' SemiBold 22 #191919
 *  - 영업중 badge bg rgba(255,105,64,0.2) padding 4 5 radius 6 SemiBold 14 #FF6940
 */
.map-place-preview__title-row {
  display: flex;
  align-items: center;
  gap: 8px;

  flex-wrap: wrap;
}

.map-place-preview__title {
  margin: 0;

  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.1;
  color: #191919;
  letter-spacing: 0;
  white-space: nowrap;
}

.map-place-preview__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 4px 5px;
  border-radius: 6px;

  background: rgba(255, 105, 64, 0.2);

  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  color: #FF6940;
  letter-spacing: 0;
  white-space: nowrap;
}

/*
 * Meta row (Figma 25:1011 actual).
 *  - gap 8, items center
 *  - '1.2km' / '08:00-20:30' Medium 16 #4D5160 (hours: tracking -0.32)
 */
.map-place-preview__meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.map-place-preview__meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: center;
}

.map-place-preview__meta-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 16px;
  height: 16px;

  flex-shrink: 0;
}

.map-place-preview__meta-icon img {
  display: block;
  width: 100%;
  height: 100%;
}

.map-place-preview__meta-item > span:last-child {
  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  color: #4D5160;
  letter-spacing: 0;
  white-space: nowrap;
}

.map-place-preview__meta-hours {
  letter-spacing: -0.32px !important;
}

/*
 * Action buttons (Figma 25:1023-25:1027 actual).
 *  - 42×42, gap 13.263
 */
.map-place-preview__actions {
  display: flex;
  align-items: center;
  gap: 13.263px;

  flex-shrink: 0;
}

.map-place-preview__action {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 42px;
  height: 42px;

  padding: 0;
  border: 0;
  border-radius: 999px;

  background: transparent;

  cursor: pointer;

  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, opacity 120ms ease;
}

.map-place-preview__action:active {
  transform: scale(0.92);
  opacity: 0.85;
}

.map-place-preview__action img {
  display: block;
  width: 42px;
  height: 42px;
}

/*
 * Description (Figma 25:1029-25:1031 actual).
 *  - py 4, Regular 15 #6E6F72, line-height 1.4, tracking 0.3, w 350
 */
.map-place-preview__description {
  margin: 0;

  width: 100%;
  max-width: 350px;

  padding: 4px 20px 0;

  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.4;
  color: #6E6F72;
  letter-spacing: 0.3px;

  box-sizing: border-box;
}
</style>