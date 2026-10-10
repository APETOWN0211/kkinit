<script setup lang="ts">
/*
 * HistoryFilters — Figma 22:918 / 22:919 / 22:922 actual
 *  - flex row, gap 10, items-start
 *  - chip (22:919 / 22:922):
 *      - bg #FFFFFF
 *      - drop-shadow 0px 0px 1.25px rgba(0,0,0,0.04)
 *      - p 10, gap 8, items-center, justify-center
 *      - radius 8
 *      - "시간대" Pretendard Medium 16 #73787E + chevron (5.79×10.5 #73787E)
 *  - 두 chip 이 22:918 안에서 gap 10 으로 배치.
 *
 * 현재 단계: local state + simple popover. 외부 page 에서 v-model 로 받는다.
 * Figma 에 popover 가 정의돼 있지 않으므로 local minimal popover 만 구현한다.
 */

import chevronRightIcon from '~/assets/icons/common/chevron-right.svg?raw'

export type TimeFilter = 'all' | 'morning' | 'lunch' | 'dinner'
export type PartyFilter = 'all' | '1' | '2' | '3-4' | '5+'

interface FilterOption<V extends string> {
  value: V
  label: string
}

const props = defineProps<{
  timeFilter: TimeFilter
  partyFilter: PartyFilter
}>()

const emit = defineEmits<{
  (e: 'update:timeFilter', value: TimeFilter): void
  (e: 'update:partyFilter', value: PartyFilter): void
}>()

const timeOptions: FilterOption<TimeFilter>[] = [
  { value: 'all', label: '전체' },
  { value: 'morning', label: '아침' },
  { value: 'lunch', label: '점심' },
  { value: 'dinner', label: '저녁' }
]

const partyOptions: FilterOption<PartyFilter>[] = [
  { value: 'all', label: '전체' },
  { value: '1', label: '1명' },
  { value: '2', label: '2명' },
  { value: '3-4', label: '3~4명' },
  { value: '5+', label: '5명 이상' }
]

const timeLabel = computed(
  () => timeOptions.find(o => o.value === props.timeFilter)?.label ?? '전체'
)
const partyLabel = computed(
  () => partyOptions.find(o => o.value === props.partyFilter)?.label ?? '전체'
)

const openPopover = ref<'time' | 'party' | null>(null)

const togglePopover = (which: 'time' | 'party') => {
  openPopover.value = openPopover.value === which ? null : which
}

const closePopover = () => {
  openPopover.value = null
}

const selectTime = (value: TimeFilter) => {
  emit('update:timeFilter', value)
  openPopover.value = null
}

const selectParty = (value: PartyFilter) => {
  emit('update:partyFilter', value)
  openPopover.value = null
}

onMounted(() => {
  document.addEventListener('click', closePopover)
})
onUnmounted(() => {
  document.removeEventListener('click', closePopover)
})
</script>

<template>
  <div class="filters">
    <div class="filters__chip-wrap">
      <button
        type="button"
        class="filters__chip"
        :aria-expanded="openPopover === 'time'"
        @click.stop="togglePopover('time')"
      >
        <span class="filters__chip-label">{{ timeLabel }}</span>
        <span class="filters__chip-chevron" v-html="chevronRightIcon" />
      </button>
      <div
        v-if="openPopover === 'time'"
        class="filters__popover"
        @click.stop
      >
        <button
          v-for="opt in timeOptions"
          :key="opt.value"
          type="button"
          class="filters__popover-item"
          :class="{ 'filters__popover-item--active': opt.value === timeFilter }"
          @click="selectTime(opt.value)"
        >{{ opt.label }}</button>
      </div>
    </div>

    <div class="filters__chip-wrap">
      <button
        type="button"
        class="filters__chip"
        :aria-expanded="openPopover === 'party'"
        @click.stop="togglePopover('party')"
      >
        <span class="filters__chip-label">{{ partyLabel }}</span>
        <span class="filters__chip-chevron" v-html="chevronRightIcon" />
      </button>
      <div
        v-if="openPopover === 'party'"
        class="filters__popover"
        @click.stop
      >
        <button
          v-for="opt in partyOptions"
          :key="opt.value"
          type="button"
          class="filters__popover-item"
          :class="{ 'filters__popover-item--active': opt.value === partyFilter }"
          @click="selectParty(opt.value)"
        >{{ opt.label }}</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
 * HistoryFilters — Figma 22:918 actual
 *  - flex row, gap 10, items-start
 */
.filters {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 10px;
}

.filters__chip-wrap {
  position: relative;
  flex: 0 0 auto;
}

/*
 * Figma 22:919 / 22:922 — bg #FFFFFF, drop-shadow 0 0 1.25 rgba(0,0,0,0.04),
 * p 10, gap 8, radius 8, items-center, justify-center.
 */
.filters__chip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  box-sizing: border-box;

  border: 0;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 0 1.25px rgba(0, 0, 0, 0.04);
  color: #73787e;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, opacity 120ms ease;
}

.filters__chip:active {
  transform: scale(0.97);
  opacity: 0.85;
}

.filters__chip-label {
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0;
  color: #73787e;
  white-space: nowrap;
}

.filters__chip-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 6px;
  height: 11px;
  flex-shrink: 0;
  transform: rotate(90deg);
}

.filters__chip-chevron :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/*
 * Local popover (Figma 에 정의 X). chip 아래로 펼쳐지는 minimal dropdown.
 */
.filters__popover {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 30;

  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 100%;
  padding: 4px;
  box-sizing: border-box;

  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 1px 8.2px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.04);
}

.filters__popover-item {
  display: block;
  width: 100%;
  padding: 8px 12px;
  box-sizing: border-box;

  border: 0;
  border-radius: 6px;
  background: transparent;

  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;
  color: #4d5160;
  text-align: left;
  white-space: nowrap;

  cursor: pointer;
}

.filters__popover-item--active {
  background: #f5f6f8;
  color: #191919;
  font-weight: 600;
}
</style>
