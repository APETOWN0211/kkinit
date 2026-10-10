<script setup lang="ts">
import tabUnderline from '~/assets/icons/explore/tab-underline.svg?raw'

/*
 * ArchiveTabs — Figma 21:557 (이야기 active) / 21:791 (장소 active)
 *  - 위치: top 97 (status bar 47 + header 50), h 52
 *  - px 20, pt 20, gap 20
 *  - 탭: 18px Pretendard, flex-1 (탭 영역의 1/2)
 *      - active: SemiBold #FF6940 + imgLine41 underline (4px stroke, tab width 절반)
 *      - inactive: Medium #B7B7B7
 *  - indicator 는 Figma 의 imgLine41 (32×4 stroke #FF6940) 를 tab width 의 100% 로 stretch.
 *    Figma 21:560/21:797 의 imgLine41 wrapper 가 `w-full` (= tab width 절반) 라
 *    underline 이 활성 탭의 전체 width 를 차지한다.
 *  - 한 element 만 translate3d 로 좌우 이동 (이야기 ↔ 장소).
 *
 * viewport 390px 기준 (.archive-tabs padding 20 20):
 *  - inner area = 350px, 각 indicator = 175px (= 50%)
 *  - story: indicator 가 viewport 20–195
 *  - place: indicator 가 viewport 195–370  (우측 20px inset)
 *  - translateX 100% 만으로 inner area 의 절반 너머로 이동.
 *    + 20px 가 들어가면 track 우측 padding edge 를 20px 넘어 viewport 끝까지 붙음.
 */

export type ArchiveTab = 'story' | 'place'

const props = defineProps<{
  modelValue: ArchiveTab
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ArchiveTab): void
}>()

const indicatorTransform = computed(() => {
  return props.modelValue === 'place'
    ? 'translate3d(calc(100%), 0, 0)'
    : 'translate3d(0, 0, 0)'
})

const select = (value: ArchiveTab) => {
  if (value === props.modelValue) return
  emit('update:modelValue', value)
}

const labels: Record<ArchiveTab, string> = {
  story: '이야기',
  place: '장소'
}
</script>

<template>
  <div class="archive-tabs">
    <div class="archive-tabs__track">
      <span
        class="archive-tabs__indicator"
        :style="{ transform: indicatorTransform }"
        aria-hidden="true"
      >
        <span class="archive-tabs__indicator-svg" v-html="tabUnderline" />
      </span>

      <button
        type="button"
        class="archive-tab archive-tab--story"
        :class="{ 'archive-tab--active': modelValue === 'story' }"
        :aria-label="labels.story"
        :aria-current="modelValue === 'story' ? 'page' : undefined"
        @click="select('story')"
      >
        <span class="archive-tab__label">{{ labels.story }}</span>
      </button>

      <button
        type="button"
        class="archive-tab archive-tab--place"
        :class="{ 'archive-tab--active': modelValue === 'place' }"
        :aria-label="labels.place"
        :aria-current="modelValue === 'place' ? 'page' : undefined"
        @click="select('place')"
      >
        <span class="archive-tab__label">{{ labels.place }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/*
 * ArchiveTabs — Figma 21:557 / 21:791 actual
 *  - bg white, h 52, px 20, pt 20, gap 20
 *  - 탭 2개가 flex-1 로 영역을 균등 분할
 *  - Figma 21:558/21:561 의 flex-1_0_0 min-w-px
 */
.archive-tabs {
  position: relative;

  display: flex;
  align-items: stretch;
  justify-content: flex-start;

  width: 100%;
  height: 52px;
  padding: 0 20px;
  box-sizing: border-box;

  background: #ffffff;
  overflow: hidden;
}

.archive-tabs__track {
  position: relative;

  display: flex;
  align-items: flex-start;
  gap: 20px;

  width: 100%;
  height: 100%;
  padding-top: 20px;
}

/*
 * Indicator = 두 viewport 20px inset 안의 inner area (= 350px) 에서
 * 175px 너비(= 50%) 의 단일 element. translateX 0 ↔ 100% 로 좌우 이동.
 *  - 0%   = track 좌측 edge → viewport 20 – 195 (story)
 *  - 100% = track 좌측 + 175px → viewport 195 – 370 (place, 우측 20px inset)
 *
 * width 50% 는 inner area 의 절반. button 의 flex-1 1/2 + gap 20 은 button box
 * 안에서만 적용되며 indicator 는 그 시각적 영역을 따라가지 않으므로
 * + 20px 보정 없이 translateX 100% 만으로 양쪽 indicator 가 정확히 20px inset 안에
 * 175px씩 채운다.
 */
.archive-tabs__indicator {
  position: absolute;
  left: 0;
  bottom: 0;

  display: block;
  width: 50%;
  height: 4px;

  background: #ff6940;
  border-radius: 999px;

  pointer-events: none;
  z-index: 2;

  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.archive-tab {
  position: relative;

  flex: 1 1 0;
  min-width: 0;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  height: 18px;
  padding: 0;

  border: 0;
  background: transparent;

  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 18px;
  font-weight: 500;
  line-height: 1;

  color: #b7b7b7;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  z-index: 1;

  transition: color 160ms ease, font-weight 160ms ease;
}

.archive-tab--active {
  color: #ff6940;
  font-weight: 600;
}

.archive-tab__label {
  display: inline-block;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .archive-tabs__indicator,
  .archive-tab {
    transition: none;
  }
}
</style>

