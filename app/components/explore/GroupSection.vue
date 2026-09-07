<script setup lang="ts">
/*
 * Group Section — Figma 1:1751 (지금 인기있는 모임)
 *  - title row: padding 20px, pt 20, pb 10, Pretendard SemiBold 20px #191919
 *               + 더보기 Pretendard Regular 14px #9F9A9A tracking 0.5 + chevron-right 5×11
 *  - category tabs (1:1759): height 61, padding 20, gap 20, item height 41
 *  - list (1:1776): bg white, top border #DBDBDB, padding 20, gap 20
 */
import chipLocationIcon from '~/assets/icons/explore/chip-location.svg?raw'
import tabUnderline from '~/assets/icons/explore/tab-underline.svg?raw'
import chevronRight from '~/assets/icons/explore/chevron-right.svg?raw'

export type GroupCategory = 'all' | 'eat-together' | 'explore' | 'solo' | 'cafe' | 'drink'

export type GroupItem = {
  id: string
  thumbnail: string
  name: string
  members: number
  membersLabel: string        // e.g. "21명"
  time: string                // e.g. "1분 전"
  timeVariant: 'accent' | 'muted'  // "1분 전" = #FE5531, "방금 대화" = #FE5531 too in Figma
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
              class="group-section__tab-underline"
              v-html="tabUnderline"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Group list -->
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
            <span class="group-section__chip">
              <span class="group-section__chip-icon" v-html="chipLocationIcon" />
              <span>{{ g.locationChip }}</span>
            </span>
            <span class="group-section__chip">
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
 * Figma 1:1751-1:1776
 *  - title row: padding 20, pt 20, pb 10, font 20 SemiBold #191919
 *  - category tabs row: 61 tall, padding 20, gap 20, item 41 tall
 *      - active: 18 SemiBold #191919 + 4px underline (Line41)
 *      - inactive: 18 Medium #B7B7B7
 *  - list: bg white, top border #DBDBDB, padding 20, gap 20
 *      - item: gap 16, thumb 78×78 radius 12 + gradient overlay
 *              body col gap 8
 *                - name: 16 SemiBold #191919 tracking 0.32
 *                - meta row: gap 6, avatar stack 24 mr -6 border #E9E9E9 + 14 Medium #4D5160 (count) + "·" 18 SemiBold #4D5160 + 14 Regular #FE5531 (time)
 *                - chip row: gap 6, chip bg #E9E9E9 radius 4 padding 6×4, icon 10×8 + 12 Medium #4D5160
 */
.group-section {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: #FFFFFF;
}

.group-section__title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 20px 20px 10px;
}

.group-section__title {
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: normal;
  color: #191919;
}

.group-section__more {
  display: inline-grid;
  grid-template-columns: max-content;
  grid-template-rows: max-content;
  place-items: start;
  align-items: center;

  position: relative;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.group-section__more-label {
  grid-column: 1;
  grid-row: 1;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: normal;
  color: #9F9A9A;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.group-section__more-chevron {
  grid-column: 1;
  grid-row: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  width: 5px;
  height: 11px;
  margin-left: 44px;
  margin-top: 3.5px;
  transform: rotate(180deg);

  color: #9F9A9A;
}

.group-section__more-chevron :deep(svg) {
  display: block;
  width: 5px;
  height: 11px;
}

/* Tabs */
.group-section__tabs {
  height: 61px;
  width: 100%;
  overflow: hidden;
}

.group-section__tabs-scroller {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: clip;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.group-section__tabs-scroller::-webkit-scrollbar {
  display: none;
}

.group-section__tabs-track {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  height: 100%;
  padding: 20px;
}

.group-section__tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;

  height: 41px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  flex-shrink: 0;
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
  color: #191919;
  font-weight: 600;
}

.group-section__tab-underline {
  display: block;
  width: 100%;
  height: 4px;
  position: relative;
  margin-top: 4px;
}

.group-section__tab-underline :deep(svg) {
  display: block;
  width: 100%;
  height: 4px;
}

/* List */
.group-section__list {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 20px;

  padding: 20px;
  border-top: 1px solid #DBDBDB;
}

.group-section__item {
  display: flex;
  align-items: center;
  gap: 16px;

  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  overflow: hidden;
}

.group-section__thumb {
  position: relative;
  width: 78px;
  height: 78px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
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

.group-section__body {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
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

.group-section__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
}

.group-section__avatars {
  display: flex;
  align-items: center;
}

.group-section__avatar {
  display: block;
  width: 24px;
  height: 24px;
  border: 1px solid #E9E9E9;
  border-radius: 999px;
  overflow: hidden;
  flex-shrink: 0;
}

.group-section__avatar + .group-section__avatar {
  margin-left: -6px;
}

.group-section__avatar img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.group-section__members,
.group-section__dot,
.group-section__time {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  line-height: normal;
}

.group-section__members {
  font-weight: 500;
  color: #4D5160;
}

.group-section__dot {
  font-weight: 600;
  font-size: 18px;
  color: #4D5160;
  letter-spacing: 0.36px;
  line-height: 0;
}

.group-section__time {
  font-weight: 400;
  color: #FE5531;
}

.group-section__chips {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  overflow: hidden;
}

.group-section__chip {
  display: flex;
  align-items: center;
  gap: 3px;
  justify-content: center;

  padding: 4px 6px;
  border-radius: 4px;
  background: #E9E9E9;

  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: normal;
  color: #4D5160;
  white-space: nowrap;
}

.group-section__chip-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 8px;
  height: 10px;
  flex-shrink: 0;
}

.group-section__chip-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
