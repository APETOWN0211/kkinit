<script setup lang="ts">
/*
 * HistoryMonthSelector — Figma 22:914 actual
 *  - flex row, gap 10, items-center, w 164 (intrinsic), shrink-0
 *  - 좌측 chevron btn (22:915): 24×24, bg white, rounded full, ri:more-fill 13.89×13.89 #73787E
 *  - 가운데 라벨 (22:916): "2026년 9월" Pretendard SemiBold 20 #191919, tracking -0.6, nowrap
 *  - 우측 chevron btn (22:917): 동일 SVG, rotate 180deg
 *
 * 클릭 시 좌/우 month 이동. local state ({ year, month }) 로 관리하고
 * month 가 0/13 경계를 넘으면 year 를 조정한다.
 */

import chevronLeftIcon from '~/assets/icons/history/chevron-left.svg?raw'

interface MonthState {
  year: number
  month: number  // 1-12
}

const props = defineProps<{
  modelValue: MonthState
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: MonthState): void
}>()

const label = computed(() => `${props.modelValue.year}년 ${props.modelValue.month}월`)

const shift = (delta: number) => {
  let { year, month } = props.modelValue
  month += delta
  if (month < 1) {
    month = 12
    year -= 1
  } else if (month > 12) {
    month = 1
    year += 1
  }
  emit('update:modelValue', { year, month })
}
</script>

<template>
  <div class="month-selector">
    <button
      type="button"
      class="month-selector__btn"
      aria-label="이전 달"
      @click="shift(-1)"
    >
      <span class="month-selector__icon" v-html="chevronLeftIcon" />
    </button>

    <p class="month-selector__label">{{ label }}</p>

    <button
      type="button"
      class="month-selector__btn"
      aria-label="다음 달"
      @click="shift(1)"
    >
      <span class="month-selector__icon month-selector__icon--right" v-html="chevronLeftIcon" />
    </button>
  </div>
</template>

<style scoped>
/*
 * HistoryMonthSelector — Figma 22:914 actual
 *  - flex row, gap 10, items-center
 *  - w 는 intrinsic (164px)
 */
.month-selector {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/*
 * Figma 22:915 / 22:917 — 24×24, bg white, rounded full, more-fill 13.89×13.89 #73787E.
 * SVG 안의 path 가 `<` 모양이라 그대로는 left chevron. 우측은 rotate(180deg) 으로 뒤집는다.
 */
.month-selector__btn {
  flex: 0 0 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  margin: 0;
  border: 0;
  border-radius: 999px;
  background: #ffffff;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, background 160ms ease;
}

.month-selector__btn:active {
  transform: scale(0.92);
  background: #f5f6f8;
}

.month-selector__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 13.89px;
  height: 13.89px;
}

.month-selector__icon--right {
  transform: rotate(180deg);
}

.month-selector__icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/*
 * Figma 22:916 — Pretendard SemiBold 20 #191919, tracking -0.6, whitespace-nowrap.
 */
.month-selector__label {
  margin: 0;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.6px;
  color: #191919;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  /* Reserved for future transitions. */
}
</style>
