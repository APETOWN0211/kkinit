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
import { getStorageImageUrl, STORAGE_FOLDERS } from '~/utils/storage'

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
      <img :src="getStorageImageUrl('handle.svg', STORAGE_FOLDERS.map)" alt="" draggable="false" />
    </span>

    <!--
      Image row (Figma 25:1001 actual).
      horizontal scroll 가능, padding 10 top / 20 bottom / 20 x
      - bottom padding 20 으로 title 시작까지 20px 시각적 간격 확보.
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
              <img :src="getStorageImageUrl('icon-distance.svg', STORAGE_FOLDERS.map)" alt="" draggable="false" />
            </span>
            <span>{{ place.distance }}</span>
          </span>
          <span class="map-place-preview__meta-item">
            <span class="map-place-preview__meta-icon">
              <img :src="getStorageImageUrl('icon-clock.svg', STORAGE_FOLDERS.map)" alt="" draggable="false" />
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
          <img :src="getStorageImageUrl('action-share.svg', STORAGE_FOLDERS.map)" alt="" draggable="false" />
        </button>
        <button
          type="button"
          class="map-place-preview__action"
          :aria-label="isSaved ? '저장 취소' : '저장'"
          :aria-pressed="isSaved"
          @click="onBookmarkClick"
        >
          <img :src="getStorageImageUrl('action-bookmark.svg', STORAGE_FOLDERS.map)" alt="" draggable="false" />
        </button>
      </div>
    </div>

    <!--
      Description (Figma 25:1029-25:1031 actual).
      - header 의 형제 row 로 두고 sheet content 의 좌우 padding 과 정렬.
      - title/meta row 와 세로로 겹치지 않으며, action button column 의
        폭에 영향 받지 않고 카드 전체 폭을 사용.
      - white-space: normal + word-break: keep-all 로 한국어 자연스러운 줄바꿈.
    -->
    <p class="map-place-preview__description">{{ place.description }}</p>
  </section>
</template>

<style scoped>
/*
 * Figma 44:1019 selected state 의 preview bottom sheet.
 *  - 390 wide, top radius 24, white, shadow 0 -2 15 rgba(0,0,0,0.09)
 *  - 기본 (MapOverviewPanel) 과 동일한 top 457 으로 맞춰 일관성 유지.
 *  - pb 28 / pt 14
 *
 * position: fixed 로 AppShell (390×844) 기준 457 부터 bottom 까지 채움.
 * (MapOverviewPanel 과 동일 방식)
 */
.map-place-preview {
  position: fixed;
  top: 457px;
  left: 0;
  right: 0;
  bottom: 0;

  width: 100%;
  max-width: 390px;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0;

  padding: 14px 0 calc(28px + env(safe-area-inset-bottom));

  background: #FFFFFF;

  border-top-left-radius: 24px;
  border-top-right-radius: 24px;

  box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.09);

  z-index: 7;

  cursor: default;

  box-sizing: border-box;

  overflow-y: auto;
  overflow-x: hidden;

  /*
   * 등장 animation (Figma 요구):
   *  translateY(20) + opacity 0 → translateY(0) + opacity 1
   *  260ms cubic-bezier(0.22, 1, 0.36, 1)
   *
   * contain: layout paint; + will-change: transform, opacity
   *  - 이 element 의 transform/opacity animation 으로 인해
   *    viewport 의 다른 layer (특히 .map-surface 배경 이미지) 가
   *    reflow/repaint 되는 것을 차단.
   *  - GPU layer 를 명시적으로 분리해 background 의 cover crop 이
   *    흔들리는 현상 제거.
   */
  contain: layout paint;
  will-change: transform, opacity;

  animation: map-place-preview-enter 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

@keyframes map-place-preview-enter {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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

  align-self: center;
}

.map-place-preview__handle img {
  display: block;
  width: 32px;
  height: 4px;
}

/*
 * Image row (Figma 25:1001 actual).
 *  - horizontal scroll 가능, padding 10 top / 20 bottom / 20 x
 *  - 각 image 208×144, radius 12, gap 10
 *  - bottom padding 20 으로 header 시작까지의 시각적 간격 확보.
 */
.map-place-preview__images {
  display: flex;
  align-items: stretch;
  gap: 10px;

  width: 100%;
  padding: 10px 20px 20px;

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
 *  - left col (info): title row + meta row
 *  - right col (actions): 2 × 42×42 action buttons, gap 13.263
 *  - justify-between 으로 info / actions 분리.
 *  - padding-x 20 → sheet content 의 좌우 padding 과 정렬.
 *  - 아래 description row 와의 간격은 description 의 margin-top (20) 이 담당.
 */
.map-place-preview__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;

  gap: 12px;

  width: 100%;
  padding: 0 20px;

  box-sizing: border-box;

  flex-shrink: 0;
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

  flex-wrap: nowrap;
  min-width: 0;
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

  flex: 0 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
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

  flex-shrink: 0;
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

/*
 * Meta icon wrapper.
 *
 * distance icon (icon-distance.svg) 은 Figma 원본 그대로 세로로 긴 pin
 * (intrinsic 13.5385 × 16, viewBox 0 0 13.5385 16) 이다.
 * SVG 내부에 preserveAspectRatio="none" 이 박혀 있어 wrapper 가 정사각형이면
 * 가로로 눌려서 찌그러진다.
 *
 * → 16×16 정사각형 frame 안에 그대로 두고 img 에
 *   object-fit: contain 으로 SVG 비율을 유지시킨다.
 *   (위/아래 또는 좌/우에 자연스러운 여백이 생기지만 pin 본래 비율은 보존됨)
 *
 * clock icon (icon-clock.svg) 은 정사각형 (15.5429 × 15.5429) 이라 영향 없음.
 */
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
  object-fit: contain;
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
 *  - meta row 와의 20px 간격으로 시각적 분리.
 *  - sheet content 의 좌우 padding 20 과 정렬 (header 와 동일 edge).
 *  - action button column 의 폭에 영향 받지 않고 카드 전체 폭 사용.
 *  - 한국어 자연스러운 줄바꿈 (word-break: keep-all).
 */
.map-place-preview__description {
  margin: 20px 0 0;

  width: 100%;
  padding: 0 20px;

  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.55;
  color: #6E6F72;
  letter-spacing: 0.3px;

  white-space: normal;
  word-break: keep-all;

  box-sizing: border-box;
}
</style>