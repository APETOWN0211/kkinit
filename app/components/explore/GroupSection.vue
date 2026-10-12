<script setup lang="ts">
/*
 * Group Section — Figma 30:1174 / 30:1063 (탐색 - 메인, 최신)
 *
 * 레이아웃 구조 (수정):
 *  - section root: transparent bg, min-height fixed (전체 섹션 높이 고정)
 *  - header (title + tabs): white bg, padding 20px, 내부 title + tabs
 *  - list container: flex-grow 1, list items scroll 가능, empty space 흰색
 *
 * Tab active indicator:
 *  - text "전체" (~32px) 에 맞춰 indicator width 32px 로 고정
 *  - tab button 안에서 centered 배치
 *
 * Section fixed height:
 *  - 전체 섹션 min-height = header 높이 + list 영역 고정 높이
 *  - category 변경 시 "10월 동네 랭킹" 섹션 y 위치 불변
 */
import chipLocationIcon from '~/assets/icons/explore/chip-location.svg?raw'
import chevronRight from '~/assets/icons/explore/chevron-right.svg?raw'

export type GroupCategory = 'all' | 'eat-together' | 'explore' | 'solo' | 'cafe' | 'drink'

export type GroupItem = {
  id: string
  thumbnail: string
  name: string
  members: number
  membersLabel: string
  time: string
  timeVariant: 'accent' | 'muted'
  locationChip: string
  categoryChip: string
  avatars: string[]
}

const props = defineProps<{
  groups: GroupItem[]
  categories: Array<{ id: GroupCategory; label: string }>
  activeCategory: GroupCategory
}>()

const emit = defineEmits<{
  'select-category': [id: GroupCategory]
  'see-more': []
  'open-group': [id: string]
}>()
</script>

<template>
  <section class="group-section">
    <!-- Header: title + tabs (고정 높이) -->
    <div class="group-section__header">
      <!-- Title row -->
      <div class="group-section__title-row">
        <p class="group-section__title">지금 인기있는 모임</p>
        <button
          type="button"
          class="group-section__more"
          aria-label="모임 더보기"
          @click="emit('see-more')"
        >
          <span class="group-section__more-label">더보기</span>
          <span class="group-section__more-chevron" v-html="chevronRight" />
        </button>
      </div>

      <!-- Category tabs -->
      <div class="group-section__tabs">
        <div class="group-section__tabs-scroller">
          <div class="group-section__tabs-track">
            <button
              v-for="cat in categories"
              :key="cat.id"
              type="button"
              class="group-section__tab"
              :class="{ 'group-section__tab--active': activeCategory === cat.id }"
              @click="emit('select-category', cat.id)"
            >
              <span class="group-section__tab-label">{{ cat.label }}</span>
              <span
                v-if="activeCategory === cat.id"
                class="group-section__tab-indicator"
              />
            </button>
          </div>
        </div>
        <!-- Bottom divider -->
        <div class="group-section__tabs-divider" />
      </div>
    </div>

    <!-- List container: flex-grow 1, 고정 높이 유지를 위한 min-height -->
    <div class="group-section__list">
      <button
        v-for="g in groups"
        :key="g.id"
        type="button"
        class="group-section__item"
        @click="emit('open-group', g.id)"
      >
        <div class="group-section__thumb">
          <img :src="g.thumbnail" :alt="g.name" loading="lazy" />
          <div class="group-section__thumb-overlay" />
        </div>

        <div class="group-section__body">
          <p class="group-section__name">{{ g.name }}</p>

          <div class="group-section__meta">
            <div class="group-section__avatars">
              <span
                v-for="(a, i) in g.avatars"
                :key="i"
                class="group-section__avatar"
              >
                <img :src="a" :alt="`member ${i + 1}`" loading="lazy" />
              </span>
            </div>
            <span class="group-section__members">{{ g.membersLabel }}</span>
            <span class="group-section__dot">·</span>
            <span class="group-section__time">{{ g.time }}</span>
          </div>

          <div class="group-section__chips">
            <span class="group-section__chip group-section__chip--location">
              <span class="group-section__chip-icon" v-html="chipLocationIcon" />
              <span>{{ g.locationChip }}</span>
            </span>
            <span class="group-section__chip group-section__chip--category">
              <span>{{ g.categoryChip }}</span>
            </span>
          </div>
        </div>
      </button>
    </div>
  </section>
</template>

<style scoped>
/*
 * Figma 30:1174 / 30:1063 (탐색 - 메인, 최신)
 *
 * Section root: flex column layout
 *  - fixed min-height: header (~95px) + list (~350px) = ~445px
 *  - category 변경 시 이 전체 높이가 고정 → 다음 섹션 위치 불변
 *
 * Header:
 *  - white bg, padding 20px
 *  - title row + tabs row
 *
 * List:
 *  - flex-grow 1, min-height fixed
 *  - background #FFFFFF
 */
.group-section {
  display: flex;
  flex-direction: column;
  align-items: stretch;

  /* 전체 섹션 고정 높이: header + list */
  min-height: 470px;

  background: transparent;
}

/* ----- Header: white, contains title + tabs ----- */
.group-section__header {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: #FFFFFF;
}

/* Title row */
.group-section__title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;

  padding: 20px 20px 10px;
}

.group-section__title {
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  color: #191919;
}

.group-section__more {
  display: inline-flex;
  align-items: center;
  gap: 0;

  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.group-section__more-label {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: normal;
  color: #9F9A9A;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.group-section__more-chevron {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 5px;
  height: 11px;
  margin-left: 5px;

  color: #9F9A9A;
  transform: rotate(180deg);
}

.group-section__more-chevron :deep(svg) {
  display: block;
  width: 5px;
  height: 11px;
  flex-shrink: 0;
}

/* ----- Tabs ----- */
.group-section__tabs {
  display: flex;
  flex-direction: column;
  align-items: stretch;

  /* Title row 와 tabs 사이 간격 (Figma spacing) */
  margin-top: 20px;
}

.group-section__tabs-scroller {
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.group-section__tabs-scroller::-webkit-scrollbar {
  display: none;
}

.group-section__tabs-track {
  display: flex;
  align-items: center;
  gap: 20px;

  padding: 0 20px;
}

/* Bottom divider */
.group-section__tabs-divider {
  height: 1px;
  width: 100%;
  background: #DBDBDB;
  flex-shrink: 0;
}

/* Tab button */
.group-section__tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  height: 41px;

  /* indicator 가 divider 와 직접 닿도록 padding 제거 */
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  flex: 0 0 auto;
  white-space: nowrap;
}

.group-section__tab-label {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 18px;
  line-height: 1;
  white-space: nowrap;
  color: #B7B7B7;
  font-weight: 500;
}

.group-section__tab--active .group-section__tab-label {
  color: #FE5531;
  font-weight: 600;
}

/*
 * Active indicator — Figma 30:1182:
 *  - width 32px (text "전체" 폭과 동일)
 *  - height 4px (Line 41 stroke-width 4)
 *  - border-radius 2px (round ends)
 *  - justify-content: space-between 으로 divider 와 직접 닿음
 */
.group-section__tab-indicator {
  display: block;
  width: 32px;
  height: 4px;
  border-radius: 2px;
  background: #FE5531;
  flex-shrink: 0;
}

/* ----- List container: flex-grow 1, 고정 높이 ----- */
.group-section__list {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 14px;

  flex: 1 1 auto;

  padding: 14px 20px 20px;
  background: #FFFFFF;
  border-top: 1px solid #DBDBDB;

  /* section min-height - header ~= 470 - 95 = 375 */
  min-height: 375px;
}

/* Group row */
.group-section__item {
  display: flex;
  align-items: center;
  gap: 14px;

  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  overflow: hidden;
}

/* Thumbnail: 80×80 */
.group-section__thumb {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  flex-grow: 0;
  background: #E9E9E9;
}

.group-section__thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.group-section__thumb-overlay {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.49) 0%,
    rgba(51, 51, 51, 0) 50%,
    rgba(102, 102, 102, 0.25) 100%
  );
  pointer-events: none;
}

/* Body */
.group-section__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;

  flex: 1;
  min-width: 0;
}

.group-section__name {
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: normal;
  color: #191919;
  letter-spacing: 0.32px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/* Meta row */
.group-section__meta {
  display: flex;
  align-items: center;
  gap: 5px;
  overflow: hidden;
}

.group-section__avatars {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.group-section__avatar {
  display: block;
  width: 22px;
  height: 22px;
  border: 1px solid #E9E9E9;
  border-radius: 999px;
  overflow: hidden;
  flex-shrink: 0;
  background: #F3F4F6;
}

.group-section__avatar + .group-section__avatar {
  margin-left: -5px;
}

.group-section__avatar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.group-section__members {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: normal;
  color: #4D5160;
  white-space: nowrap;
  flex-shrink: 0;
}

.group-section__dot {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: normal;
  color: #4D5160;
  flex-shrink: 0;
}

.group-section__time {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 13px;
  font-weight: 400;
  line-height: normal;
  color: #FE5531;
  white-space: nowrap;
  flex-shrink: 0;
}

/* Chips row */
.group-section__chips {
  display: flex;
  align-items: center;
  gap: 5px;
  overflow: hidden;
}

.group-section__chip {
  display: inline-flex;
  align-items: center;
  gap: 3px;

  padding: 4px 6px;
  border-radius: 4px;
  background: #E9E9E9;

  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: normal;
  color: #4D5160;
  white-space: nowrap;

  flex-shrink: 0;
}

.group-section__chip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.group-section__chip-icon :deep(svg) {
  display: block;
  width: 10px;
  height: 12px;
  flex-shrink: 0;
}

/*
 * Category chip: bg #67CFC1 (mint), text white
 */
.group-section__chip--category {
  background: #67CFC1;
  color: #FFFFFF;
}
</style>
