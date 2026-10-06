<script setup lang="ts">
import clockIcon from '~/assets/icons/explore/time.svg?raw'
import chipLocationIcon from '~/assets/icons/explore/chip-location.svg?raw'
import bookmarkIcon from '~/assets/icons/explore/bookmark.svg?raw'

/*
 * ArchivePlaceCard — Figma 21:669 actual
 *  - card        : 350 × 178, bg #FFFFFF, radius 12, shadow 0 1 8.2 rgba(0,0,0,0.04)
 *  - inner       : 310 × 138 (card padding 20 all sides)
 *      - left col  : 159 × 138
 *          - name    : Pretendard SemiBold 20 #191919 tracking 0.4 (y 0, h 24)
 *          - address : Pretendard Medium 18 #4D5160 (y 34, h 21, gap 10)
 *          - hours group (21:674) : 112 × 73, y 65
 *              - hours row (21:676) : 112 × 19, y 9
 *                  - clock 14×14 (x 0, y 2.5) + text "08:00-20:30" (x 18, y 0, h 19)
 *              - chips row (21:683) : 109.46 × 25, y 48 (relative to hours group)
 *                  ↳ gap 20 between hours and chips
 *      - right col : 80 × 138
 *          - bookmark wrapper 41.263 × 41.916 (x 38.737, y 0) — right-aligned
 *          - thumbnail 80 × 80 (y 58) — bottom-aligned
 */

export interface ArchivePlace {
  id: string
  name: string
  address: string
  hours: string
  locationChip: string
  categoryChip: string
  thumbnail: string
  saved: boolean
}

const props = defineProps<{
  place: ArchivePlace
}>()

const isSaved = ref(props.place.saved)

const onToggleBookmark = (e: Event) => {
  e.stopPropagation()
  isSaved.value = !isSaved.value
}
</script>

<template>
  <article class="place-card">
    <div class="place-card__inner">
      <div class="place-card__left">
        <p class="place-card__name">{{ place.name }}</p>
        <p class="place-card__address">{{ place.address }}</p>

        <div class="place-card__hours">
          <span class="place-card__hours-icon" v-html="clockIcon" />
          <span class="place-card__hours-text">{{ place.hours }}</span>
        </div>

        <div class="place-card__chips">
          <span class="place-card__chip place-card__chip--location">
            <span class="place-card__chip-icon" v-html="chipLocationIcon" />
            <span>{{ place.locationChip }}</span>
          </span>
          <span class="place-card__chip">
            <span>{{ place.categoryChip }}</span>
          </span>
        </div>
      </div>

      <div class="place-card__right">
        <!--
          Figma 21:695 "홈 게시글 - 더보기" wrapper 41.263 × 41.916, x 38.737 (right-aligned).
          vector (21:696) 13.26×15.92 centered.
        -->
        <button
          type="button"
          class="place-card__bookmark"
          :class="{ 'place-card__bookmark--saved': isSaved }"
          :aria-label="isSaved ? '저장 취소' : '저장'"
          :aria-pressed="isSaved"
          @click="onToggleBookmark"
        >
          <span class="place-card__bookmark-icon" v-html="bookmarkIcon" />
        </button>

        <!--
          Figma 21:697 thumbnail 80×80, y 58 → bottom edge = 138 (= inner height).
          → right col height 138 의 bottom 에 정확히 붙음.
        -->
        <div class="place-card__thumb">
          <img
            :src="place.thumbnail"
            :alt="place.name"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
/*
 * ArchivePlaceCard — Figma 21:669 actual
 *  - card width 100% (Figma 350 = 390 - 40), height 178 (= inner 138 + padding 40)
 *  - inner padding 20, radius 12, bg #FFFFFF,
 *    shadow 0 1px 8.2px rgba(0, 0, 0, 0.04)
 *  - inner layout:
 *      - left col  (21:671) : 159 × 138, gap 10 (name ↔ address, address ↔ hours group)
 *      - right col (21:694) : 80 × 138, items-end, justify-between
 *  - hours group (21:674) 내부:
 *      - hours row  (21:676) : 19
 *      - gap 20
 *      - chips row  (21:683) : 25
 *  - chip 사이 gap (21:684 의 두 chip): 8 (= 72.16 - 64.16)
 */
.place-card {
  display: flex;
  width: 100%;
  height: 178px;

  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 8.2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  box-sizing: border-box;
}

.place-card__inner {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  width: 100%;

  padding: 20px;
  box-sizing: border-box;
  gap: 16px;
}

.place-card__left {
  flex: 1 1 auto;
  min-width: 0;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  /*
   * Figma 21:671 left col children:
   *  - name      y 0  h 24
   *  - address   y 34 h 21  (gap 10)
   *  - hours grp y 65 h 73  (gap 10)
   */
  gap: 10px;
}

.place-card__name {
  margin: 0;

  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.4px;

  color: #191919;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.place-card__address {
  margin: 0;

  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;

  color: #4d5160;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

/*
 * Figma 21:674 hours group (h 73):
 *  - hours row (21:676) y 9  h 19
 *  - chips row (21:683) y 48 h 25
 *  → hours ↔ chips 사이 gap 20 (margin-top)
 */
.place-card__hours {
  display: flex;
  align-items: center;
  gap: 4px;
}

.place-card__hours-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.place-card__hours-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.place-card__hours-text {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.32px;
  color: #4d5160;
  white-space: nowrap;
}

/*
 * Figma 21:683 chips row (h 25, y 48 relative to hours group = 20 gap from hours).
 * 21:685 (location) w 64.16 + 8 gap + 21:690 (category) w 37.31 = 109.47 ≈ Figma 109.46.
 */
.place-card__chips {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex-wrap: nowrap;
  margin-top: 20px;
}

/*
 * Figma 21:685 / 21:690 chip:
 *  - bg #f5f6f8, radius 4, h 25
 *  - location chip (21:685): icon x 6 y 6.25 (11.16×12.5), text x 21.16 y 4
 *      → effective left padding 6 (icon), icon-text gap 4, text 37, right padding ≈ 12
 *  - category chip (21:690): icon 0.3×0.25 (invisible), text x 6.31 y 4
 *      → effective left padding 6, right padding 6
 *
 * 구현 단순화: 둘 다 padding 4px 6px (vertical 4, horizontal 6) 로 두 chip 의
 * text 14px Medium #4D5160 를 동일 chip 안에서 일관되게 표시한다.
 * Figma 의 비대칭 padding (location chip right 12) 은 visual 영향 미미.
 */
.place-card__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  justify-content: center;

  height: 25px;
  padding: 4px 6px;
  border-radius: 4px;
  background: #f5f6f8;

  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;

  color: #4d5160;
  white-space: nowrap;
}

.place-card__chip-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12.5px;
  height: 11.157px;
  flex-shrink: 0;
}

.place-card__chip-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/* Right column: bookmark (y 0) + thumbnail (y 58) bottom-aligned. */
.place-card__right {
  flex: 0 0 80px;

  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;

  height: 138px;
}

/*
 * Figma 21:695 bookmark wrapper 41.263 × 41.916, right-aligned (x 38.737 from right col left).
 * vector (21:696) 13.26×15.92 centered → wrapper bg 는 Figma actual #f5f6f8 + 1px stroke #191919/0.1
 * (explore bookmark icon 과 동일).
 */
.place-card__bookmark {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 41.263px;
  height: 41.916px;
  padding: 0;
  border: 0;
  border-radius: 999px;

  background: #f5f6f8;
  color: #4d5160;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, background 160ms ease, color 160ms ease;
}

.place-card__bookmark:active {
  transform: scale(0.92);
}

.place-card__bookmark--saved {
  background: rgba(85, 199, 174, 0.12);
  color: #55c7ae;
}

.place-card__bookmark-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
}

.place-card__bookmark-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/*
 * Figma 21:697 thumbnail 80×80, y 58 (= 138 - 80, bottom align).
 * justify-content: space-between + height 138 + bottom row 가 height 80 라
 * 21:694 의 마지막 item 이 자동으로 bottom 으로 정렬되지만, 명시적으로
 * bottom 위치만 보장해도 동일하다. margin-top: auto 로 처리.
 */
.place-card__thumb {
  flex: 0 0 80px;
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  background: #f5f6f8;
}

.place-card__thumb img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
