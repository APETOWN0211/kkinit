<script setup lang="ts">
/*
 * /map 기본 상태 bottom panel (Figma 25:730 actual).
 *
 * Layout:
 *  - panel        : 390×388 (실제 height 는 내용에 따라 자연스럽게,
 *                    handle 4 + padding 13 top + content + pb 28)
 *  - top radius   : 24 24 0 0
 *  - background   : white
 *  - shadow       : 0 -2 15 0 rgba(0,0,0,0.09)
 *  - left/right   : 0 / 0 (full width 390)
 *  - bottom y     : 388px (panel 이 viewport 아래쪽에 위치)
 *
 * 내부 layout (Figma 25:732):
 *  - handle  : 32x4 (Figma 25:731), center
 *  - title row (25:733): pin + '마포구 망원동'
 *  - quick cards (25:737): 3 cards 128×94, gap 10
 *  - event row (25:752): 67px height, 27/APR + 웨얼이즈누들 망원본점 + 오늘/오후7:00
 *  - recent visits header (25:766)
 *  - recent visit cards (25:771): 3 cards 128×99 + last 94, gap 10
 */
import handleIcon from '~/assets/icons/common/sheet-handle.svg?raw'
import chevronIcon from '~/assets/icons/explore/chevron-right.svg?raw'
import pinIcon from '~/assets/icons/map/pin.svg?raw'

import {
  MAP_QUICK_CARDS,
  MAP_TODAY_EVENT,
  MAP_RECENT_VISITS
} from '~/composables/useMapData'

const emit = defineEmits<{
  /* panel 자체 클릭은 배경 click 으로 처리하지 않도록 stopPropagation 만 한다. */
}>()
</script>

<template>
  <!--
    Figma 25:730 actual:
      - 390 wide, top radius 24, white, shadow 0 -2 15 rgba(0,0,0,0.09)
      - handle 은 padding 13 top 안에 위치 (Figma 25:731 의 32x4)
    height 는 Figma 의 388px 을 그대로 따른다.
  -->
  <section
    class="map-overview-panel"
    role="region"
    aria-label="마포구 망원동 정보"
    @click.stop
  >
    <!-- handle (Figma 25:731 actual: 32×4) -->
    <span class="map-overview-panel__handle" aria-hidden="true">
      <img src="/images/map/handle.svg" alt="" draggable="false" />
    </span>

    <!--
      Title block (Figma 25:733 actual: top inner, gap 20)
        - 위치 row (25:734): pin + '마포구 망원동'
    -->
    <div class="map-overview-panel__title-row">
      <span class="map-overview-panel__pin" aria-hidden="true">
        <img src="/images/map/pin.svg" alt="" draggable="false" />
      </span>
      <p class="map-overview-panel__title">마포구 망원동</p>
    </div>

    <!--
      Quick cards row (Figma 25:737 actual).
        3 cards × 128×94, gap 10, padding-left/right 20
    -->
    <div class="map-overview-panel__quick-cards">
      <div
        v-for="card in MAP_QUICK_CARDS"
        :key="card.id"
        class="map-overview-panel__quick-card"
        :style="{ background: card.bg }"
      >
        <div class="map-overview-panel__quick-card-top">
          <template v-if="card.id === 'friends'">
            <span
              v-for="(avatar, idx) in card.avatars"
              :key="idx"
              class="map-overview-panel__quick-avatar"
              :style="{ marginLeft: idx === 0 ? '0' : '-6.857px', zIndex: 10 - idx }"
            >
              <img :src="avatar" alt="" draggable="false" />
            </span>
          </template>
          <img
            v-else-if="card.icon"
            :src="card.icon"
            class="map-overview-panel__quick-icon"
            alt=""
            draggable="false"
          />
        </div>
        <p class="map-overview-panel__quick-text">
          <template v-if="card.id === 'friends'">
            {{ card.text[0] }}<br>{{ card.text[1] }}
          </template>
          <template v-else-if="card.id === 'event'">
            <span>{{ card.text[0] }}</span>{{ card.text[1]
            }}<span class="map-overview-panel__quick-bold" :style="{ color: card.accent }">{{ card.text[2] }}</span>
          </template>
          <template v-else>
            <span>{{ card.text[0] }}</span><br>{{ card.text[1]
            }}<span class="map-overview-panel__quick-bold" :style="{ color: card.accent }">{{ card.text[2] }}</span>
          </template>
        </p>
      </div>
    </div>

    <!--
      Today event row (Figma 25:752 actual).
        - height 67px, gap 12, items center, justify between
        - date card  : 50w x 50h, radius 12, border rgba(0,0,0,0.1), padding 10
          - 27 (28px SemiBold #FF6940)
          - APR (16px Regular #39AC92 tracking -0.48)
        - title column 182w, gap 6, padding y 6
          - '웨얼이즈누들 망원본점' 18px SemiBold #191919 tracking 0.36
          - '오늘 · 오후 7:00' row 16px Medium (오늘 #191919, · 3×3 dot, 오후 7:00 Regular #9F9A9A tracking 0.32)
        - chevron (Frame734) 5.333×40
    -->
    <div class="map-overview-panel__event">
      <div class="map-overview-panel__event-left">
        <div class="map-overview-panel__event-date">
          <span class="map-overview-panel__event-day">27</span>
          <span class="map-overview-panel__event-month">APR</span>
        </div>
        <div class="map-overview-panel__event-info">
          <p class="map-overview-panel__event-title">{{ MAP_TODAY_EVENT.title }}</p>
          <div class="map-overview-panel__event-time">
            <span>{{ MAP_TODAY_EVENT.time1 }}</span>
            <span class="map-overview-panel__event-dot" aria-hidden="true" />
            <span class="map-overview-panel__event-time2">{{ MAP_TODAY_EVENT.time2 }}</span>
          </div>
        </div>
      </div>
      <span class="map-overview-panel__event-chevron" aria-hidden="true">
        <img src="/images/map/chevron-right.svg" alt="" draggable="false" />
      </span>
    </div>

    <!--
      Recent visits header (Figma 25:766 actual).
        - h 21, justify between, items center
        - title '최근 방문지' 18px SemiBold #191919 tracking 0.36
        - '방문 기록 >' row 16px Medium #73787E tracking 0.32, gap 8
    -->
    <div class="map-overview-panel__recent-header">
      <p class="map-overview-panel__recent-title">최근 방문지</p>
      <button
        type="button"
        class="map-overview-panel__recent-link"
        aria-label="방문 기록 페이지로 이동"
      >
        <span>방문 기록</span>
        <span class="map-overview-panel__recent-chevron" v-html="chevronIcon" />
      </button>
    </div>

    <!--
      Recent visit cards (Figma 25:771 actual).
        - flex row, gap 10, w full
        - 128×99 + 128×99 + 94×99, padding 12, radius 12,
          border rgba(0,0,0,0.05), gap inside 8
    -->
    <div class="map-overview-panel__recent-cards">
      <div
        v-for="visit in MAP_RECENT_VISITS"
        :key="visit.id"
        class="map-overview-panel__visit-card"
        :class="{ 'map-overview-panel__visit-card--last': visit.id === 'v3' }"
      >
        <p class="map-overview-panel__visit-date" :style="{ color: visit.dateColor }">{{ visit.date }}</p>
        <p class="map-overview-panel__visit-name">{{ visit.name }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
/*
 * Figma 25:730 actual:
 *  - 390×388, top radius 24, white, shadow 0 -2 15 rgba(0,0,0,0.09)
 *  - padding 13 top / 28 bottom / 20 x
 *  - gap 10 (위에서 아래로)
 *
 * position: absolute, bottom 0 으로 viewport 에 붙인다.
 */
.map-overview-panel {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;

  padding: 13px 20px calc(28px + env(safe-area-inset-bottom));

  background: #FFFFFF;

  border-top-left-radius: 24px;
  border-top-right-radius: 24px;

  box-shadow: 0 -2px 15px rgba(0, 0, 0, 0.09);

  z-index: 7;

  cursor: default;

  box-sizing: border-box;
}

/*
 * Handle (Figma 25:731 actual: 32×4, center)
 */
.map-overview-panel__handle {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 4px;
  flex-shrink: 0;
}

.map-overview-panel__handle img {
  display: block;
  width: 32px;
  height: 4px;
}

/*
 * Title row (Figma 25:734 actual).
 *  - flex row, gap 4, padding-x 4 (실제 위치), items center
 *  - pin 14×15.685
 *  - title SemiBold 16 #191919
 */
.map-overview-panel__title-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  width: 100%;
  padding: 8px 4px 0;

  box-sizing: border-box;
}

.map-overview-panel__pin {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 14px;
  height: 15.685px;
  flex-shrink: 0;
}

.map-overview-panel__pin img {
  display: block;
  width: 100%;
  height: 100%;
}

.map-overview-panel__title {
  margin: 0;

  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  color: #191919;
  letter-spacing: 0;
  text-align: center;
  white-space: nowrap;
}

/*
 * Quick cards (Figma 25:737 actual).
 *  - flex row, gap 10, w 370 (panel 내부에서 padding 20씩 빼면 350)
 *  - card 128×94, radius 12, padding 12, justify-between
 */
.map-overview-panel__quick-cards {
  display: flex;
  align-items: stretch;
  gap: 10px;

  width: 100%;
  flex-shrink: 0;
}

.map-overview-panel__quick-card {
  flex: 1 1 0;
  min-width: 0;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;

  height: 94px;
  padding: 12px;

  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;

  overflow: hidden;

  box-sizing: border-box;
}

.map-overview-panel__quick-card-top {
  display: flex;
  align-items: center;
  height: 24px;
  flex-shrink: 0;
}

.map-overview-panel__quick-avatar {
  display: block;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 1px solid #E2E2E2;
  overflow: hidden;
  flex-shrink: 0;
}

.map-overview-panel__quick-avatar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.map-overview-panel__quick-icon {
  display: block;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.map-overview-panel__quick-text {
  margin: 0;

  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  color: #191919;
  letter-spacing: 0;
}

.map-overview-panel__quick-bold {
  font-weight: 700;
}

/*
 * Today event row (Figma 25:752 actual).
 *  - 67 height, justify-between, items center
 *  - left : date card 50×50 + info column 182
 *  - right: chevron 5.333×40
 */
.map-overview-panel__event {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: 67px;
  flex-shrink: 0;
}

.map-overview-panel__event-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1 1 auto;
  min-width: 0;
}

.map-overview-panel__event-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 50px;
  height: 50px;

  padding: 10px;

  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;

  background: #FFFFFF;

  box-sizing: border-box;
}

.map-overview-panel__event-day {
  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 24px;
  font-weight: 600;
  line-height: 1;
  color: #FF6940;
  letter-spacing: 0;
}

.map-overview-panel__event-month {
  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1;
  color: #39AC92;
  letter-spacing: -0.42px;
  margin-top: 2px;
}

.map-overview-panel__event-info {
  display: flex;
  flex-direction: column;
  gap: 6px;

  flex: 1 1 auto;
  min-width: 0;

  padding: 6px 0;
}

.map-overview-panel__event-title {
  margin: 0;

  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  color: #191919;
  letter-spacing: 0.36px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-overview-panel__event-time {
  display: flex;
  align-items: center;
  gap: 8px;

  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  color: #191919;
  letter-spacing: 0;
}

.map-overview-panel__event-time2 {
  font-weight: 400;
  color: #9F9A9A;
  letter-spacing: 0.32px;
}

.map-overview-panel__event-dot {
  display: block;
  width: 3px;
  height: 3px;
  border-radius: 999px;
  background: #9F9A9A;
  flex-shrink: 0;
}

.map-overview-panel__event-chevron {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 6px;
  height: 40px;
  flex-shrink: 0;
}

.map-overview-panel__event-chevron img {
  display: block;
  width: 100%;
  height: 100%;
}

/*
 * Recent visits header (Figma 25:766 actual).
 *  - h 21, justify-between
 */
.map-overview-panel__recent-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: 21px;
  flex-shrink: 0;
}

.map-overview-panel__recent-title {
  margin: 0;

  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 1;
  color: #191919;
  letter-spacing: 0.36px;
  white-space: nowrap;
}

.map-overview-panel__recent-link {
  display: flex;
  align-items: center;
  gap: 8px;

  padding: 0;
  border: 0;
  background: transparent;

  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1;
  color: #73787E;
  letter-spacing: 0.32px;
  white-space: nowrap;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.map-overview-panel__recent-chevron {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 6px;
  height: 12px;

  color: #73787E;
  transform: rotate(180deg);
}

.map-overview-panel__recent-chevron :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/*
 * Recent visit cards (Figma 25:771 actual).
 *  - flex row, gap 10, w full
 *  - 128×99 + 128×99 + 94×99
 */
.map-overview-panel__recent-cards {
  display: flex;
  align-items: stretch;
  gap: 10px;

  width: 100%;
  flex-shrink: 0;
}

.map-overview-panel__visit-card {
  flex: 1 1 0;
  min-width: 0;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;

  height: 99px;
  padding: 12px;

  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 12px;

  background: #FFFFFF;

  box-sizing: border-box;
}

.map-overview-panel__visit-card--last {
  flex: 0 0 94px;
}

.map-overview-panel__visit-date {
  margin: 0;

  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.28px;
  white-space: nowrap;
}

.map-overview-panel__visit-name {
  margin: 0;

  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.1;
  color: #191919;
  letter-spacing: -0.4px;

  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
</style>