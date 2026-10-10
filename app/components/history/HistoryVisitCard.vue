<script setup lang="ts">
/*
 * HistoryVisitCard — Figma 22:930 / 22:963 / 22:995 / 22:1028 / 22:1061 actual
 *  - card          : flex 1, bg #FFFFFF, radius 12, p 16, gap 10
 *                     (이야기 작성 CTA 가 있는 카드는 gap 12)
 *  - shadow        : 0 1px 8.2px rgba(0,0,0,0.04)  (Figma actual)
 *  - card inner row: gap 10, w 287 (overflow 가 아니라 inner 의 intrinsic)
 *    - left col  (22:932): flex col gap 10
 *      - place row: Pretendard SemiBold 18 #191919 + Pretendard Regular 14 #6E6F72 "지역 · 카테고리"
 *      - time row: clock icon 12×12 (#55C7AE) + "HH:MM" Medium 14 #4D5160
 *                  + dot 3×3 (#9F9A9A) + "N번째 방문" Regular 12 #6E6F72
 *      - payment row: won icon 12×9.84 (#FF6940) + "NNN,NNN원" Medium 14 #4D5160
 *                     + dot 3×3 + "카드결제" Regular 12 #6E6F72
 *    - more btn  (22:955): 26×26, bg #F5F6F8, rounded full, ri:more-fill 15×15 #73787E
 *  - memo divider : 287×1 line #E2E2E2, full inner width
 *  - memo         : Pretendard Medium 14 #191919, 1줄 ellipsis
 *  - 이야기 작성 CTA: 22:989
 *    - bg #D9F3ED, radius 8, w-full, px 53, py 10
 *    - Pretendard SemiBold 14 #238878 (center)
 *
 * 이야기 작성 CTA 가 있는 카드는 card 의 gap 을 12 로, time/payment block 은 그대로 두고
 * CTA 가 card 의 마지막 자식으로 들어간다 (memo / divider 자리 대신 CTA).
 */

import clockIcon from '~/assets/icons/history/clock.svg?raw'
import wonIcon from '~/assets/icons/history/won.svg?raw'
import moreIcon from '~/assets/icons/history/more.svg?raw'
import dividerIcon from '~/assets/icons/history/divider.svg?raw'

export interface HistoryVisit {
  id: string
  placeName: string
  location: string      // 동네
  category: string      // 일식/패스트푸드 등
  time: string          // "13:00"
  visitType: string     // "두번째 방문"
  amount: string        // "143,000원"
  payment: string       // "카드결제"
  memo?: string         // 생략 시 이야기 작성 CTA 표시
}

const props = defineProps<{
  visit: HistoryVisit
}>()

const emit = defineEmits<{
  more: [id: string]
  writeStory: [id: string]
}>()

const hasStory = computed(() => !!props.visit.memo)
</script>

<template>
  <article
    class="visit-card"
    :class="{ 'visit-card--with-cta': !hasStory }"
  >
    <div class="visit-card__head">
      <div class="visit-card__head-left">
        <!--
          Figma 22:934 — flex row gap 8, items-center, not-italic, whitespace-nowrap.
          실제 카드에서 place + location 이 1줄로 옆에 붙고, 너무 길면 자연 줄바꿈
          (Figma 의 실제 카드에서 두 줄이 되지 않도록 nowrap 유지하고
           overflow 시 ellipsis 처리하지 않고 두 줄로 fallback).
        -->
        <p class="visit-card__place-name">{{ visit.placeName }}</p>
        <p class="visit-card__location">{{ visit.location }} · {{ visit.category }}</p>
      </div>

      <button
        type="button"
        class="visit-card__more"
        aria-label="더보기"
        @click="emit('more', visit.id)"
      >
        <span class="visit-card__more-icon" v-html="moreIcon" />
      </button>
    </div>

    <div class="visit-card__rows">
      <div class="visit-card__row">
        <span class="visit-card__row-icon" v-html="clockIcon" />
        <span class="visit-card__row-text">{{ visit.time }}</span>
        <span class="visit-card__row-dot" aria-hidden="true" />
        <span class="visit-card__row-suffix">{{ visit.visitType }}</span>
      </div>

      <div class="visit-card__row">
        <span class="visit-card__row-icon visit-card__row-icon--won" v-html="wonIcon" />
        <span class="visit-card__row-text">{{ visit.amount }}</span>
        <span class="visit-card__row-dot" aria-hidden="true" />
        <span class="visit-card__row-suffix">{{ visit.payment }}</span>
      </div>
    </div>

    <!--
      memo 가 있으면 divider + memo preview (Figma 22:956, 22:958, 22:1021, 22:1023, ...).
      memo 가 없으면 이야기 작성 CTA (Figma 22:989).
      같은 자리에 둘 중 하나만 표시한다.
    -->
    <template v-if="hasStory">
      <span class="visit-card__divider" aria-hidden="true" v-html="dividerIcon" />
      <p class="visit-card__memo">{{ visit.memo }}</p>
    </template>

    <button
      v-else
      type="button"
      class="visit-card__cta"
      @click="emit('writeStory', visit.id)"
    >
      이야기 작성
    </button>
  </article>
</template>

<style scoped>
/*
 * HistoryVisitCard — Figma 22:930 actual
 *  - bg #FFFFFF, p 16, radius 12
 *  - flex col, gap 10
 *  - shadow 0 1px 8.2px rgba(0, 0, 0, 0.04)
 *  - overflow: hidden (memo 가 padding 을 뚫고 나가지 않게)
 *  - 이야기 작성 CTA 카드만 gap 12 (Figma 22:963)
 */
.visit-card {
  flex: 1 1 0;
  min-width: 0;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 10px;

  padding: 16px;
  box-sizing: border-box;

  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 8.2px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.visit-card--with-cta {
  gap: 12px;
}

/*
 * Figma 22:931 — flex row gap 10, items-start, w 287.
 * left col (22:932) 가 flex 1, right col (more btn 22:955) 가 26px.
 * inner row 자체에 width 를 주지 않고 left col 의 flex:1 + right col 의 fixed 26 로
 * 자연스럽게 287 = (350 - 40 padding) - 10 gap - 26 - ? 에 맞추면
 * left col 의 intrinsic width 가 287 - 10 - 26 = 251 정도가 되지만
 * Figma 는 left col 에 w-full 을 둬 inner row 의 287 안에 stretch 한다.
 * → inner row 의 폭은 card 의 100% (= 350 - 40 = 310 - 16*2 = ? ).
 *  → 실제: card padding 16 each = card 의 inner width 318 (= 350 - 32).
 *    inner row 폭 = 287 (Figma fixed width). 그래서 left col 이 287-26-10=251.
 *  → 우리 구현: inner row 폭을 287 로 두지 않고 card 안에서 stretch 시키면
 *    left col 은 자연 100%, right col 26 fixed.
 *  → 시각적 차이 없음 (left col 의 text 만 row 폭을 따라감).
 */
.visit-card__head {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
}

.visit-card__head-left {
  flex: 1 1 0;
  min-width: 0;

  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

/*
 * Figma 22:935 — Pretendard SemiBold 18 #191919, leading normal.
 */
.visit-card__place-name {
  margin: 0;

  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0;
  color: #191919;
  white-space: nowrap;
}

/*
 * Figma 22:936 — Pretendard Regular 14 #6E6F72, flex col justify-center.
 */
.visit-card__location {
  margin: 0;

  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0;
  color: #6e6f72;
  white-space: nowrap;
}

/*
 * Figma 22:955 — 26×26, bg #F5F6F8, rounded full, more-fill #73787E 15.05×15.05
 * centered at 5.47,5.47. (Figma actual icon color = #73787E, #B7B7B7 아님.)
 */
.visit-card__more {
  flex: 0 0 26px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 26px;
  height: 26px;
  padding: 0;
  margin: 0;

  border: 0;
  border-radius: 999px;
  background: #f5f6f8;
  color: #73787e;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, background 160ms ease;
}

.visit-card__more:active {
  transform: scale(0.92);
}

.visit-card__more-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 15.05px;
  height: 15.05px;
}

.visit-card__more-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/*
 * Figma 22:937 — flex col gap 8, items-start.
 *  - 22:938 time row
 *  - 22:948 payment row
 */
.visit-card__rows {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
  width: 100%;
}

.visit-card__row {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 4px;
}

.visit-card__row-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.visit-card__row-icon--won {
  height: 9.84px;
}

.visit-card__row-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/*
 * Figma 22:945 — Pretendard Medium 14 #4D5160, leading normal, whitespace-nowrap.
 */
.visit-card__row-text {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
  color: #4d5160;
  white-space: nowrap;
}

/*
 * Figma 22:946 — 3×3 ellipse #9F9A9A, Figma 의 fill rect 와 동일하게 inline image.
 * 디자인 시스템 token 의 --color-action-text (#9F9A9A) 와 일치.
 */
.visit-card__row-dot {
  display: inline-block;
  width: 3px;
  height: 3px;
  border-radius: 999px;
  background: #9f9a9a;
  flex-shrink: 0;
}

/*
 * Figma 22:947 — Pretendard Regular 12 #6E6F72.
 */
.visit-card__row-suffix {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0;
  color: #6e6f72;
  white-space: nowrap;
}

/*
 * Figma 22:956 / 22:1021 — 287×1 line #E2E2E2.
 * svg 의 viewBox 가 287×1 이고 stroke 가 #E2E2E2 이라 그대로 사용.
 * width 100% 로 두면 card 의 100% (= 318) 가 되어 Figma 의 287 보다 길어진다.
 * → Figma actual 은 inner row 의 폭 (287) 기준이므로 card inner (= 318 - 16*2) 와
 *   다르다. Figma 의 287 = (350 - 40) - 10 - 26 - 10 - 7.5 (??).
 * 실제로 divider 는 card padding 16 안의 폭 = 318 = card width - 32 와 거의 같다.
 * Figma fixed width 287 의 의미는 동일 card width 기준에서 1px 줄였을 뿐.
 * → 우리 구현은 card 의 100% 로 두고 자연 폭을 따른다 (visual 동일).
 */
.visit-card__divider {
  display: block;
  width: 100%;
  height: 1px;
  overflow: hidden;
}

.visit-card__divider :deep(svg) {
  display: block;
  width: 100%;
  height: 1px;
}

/*
 * Figma 22:958 — Pretendard Medium 14 #191919, 1줄 ellipsis.
 * Figma 의 width [min-content] + min-w-full = 카드 폭.
 */
.visit-card__memo {
  margin: 0;
  width: 100%;

  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
  color: #191919;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/*
 * Figma 22:989 — 이야기 작성 CTA
 *  - bg #D9F3ED
 *  - radius 8
 *  - w-full, px 53, py 10, justify-center
 *  - Pretendard SemiBold 14 #238878, center
 */
.visit-card__cta {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px 53px;
  box-sizing: border-box;

  border: 0;
  border-radius: 8px;
  background: #d9f3ed;

  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0;
  color: #238878;
  text-align: center;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, opacity 120ms ease;
}

.visit-card__cta:active {
  transform: scale(0.98);
  opacity: 0.85;
}
</style>
