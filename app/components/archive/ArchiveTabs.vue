<script setup lang="ts">
import tabUnderline from '~/assets/icons/explore/tab-underline.svg?raw'

/*
 * ArchiveTabs — Figma 21:557 (이야기 active) / 21:791 (장소 active)
 *
 * 탭 button 의 layout (flex 1/2 + gap 20) 은 변경하지 않는다.
 * Figma 21:558/21:561 의 flex-1_0_0 으로 이야기/장소 tab 이 각각
 * 165px (= (390-40-20)/2) 씩 차지.
 *
 * orange active indicator 만 별도 overlay 로, viewport 좌우 20px inset
 * 안의 inner area (= 350px) 에서 정확히 절반(175px)씩 차지.
 *  - 이야기: left 20px,  width 175px → 20–195
 *  - 장소  : left 195px, width 175px → 195–370
 *  - 0%/100% translateX 만으로 한 element 가 좌우로 이동.
 *
 * CSS custom property `--active-index` (0 | 1) 가 한 indicator 의 위치를 결정.
 *  - 0 = 이야기: translateX(0%)
 *  - 1 = 장소  : translateX(100%)
 * translateX 100% 는 element 자기 width(= 175) 기준이므로
 * inner area 350px 의 정확히 절반 너머로 이동 → left 195–370.
 *
 * gray divider 같은 background bar 는 추가하지 않는다 (기존 header/tabs 의
 * 시각 디자인에 이미 충분한 분리감). orange active indicator 만 좌우 이동.
 */

export type ArchiveTab = 'story' | 'place'

const props = defineProps<{
  modelValue: ArchiveTab
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ArchiveTab): void
}>()

const activeIndex = computed(() => (props.modelValue === 'place' ? 1 : 0))

const indicatorStyle = computed(() => ({
  '--active-index': activeIndex.value
}))

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
    <!--
      Indicator overlay. .archive-tabs 자체의 padding 20 안쪽의 inner area
      안에서 left 0 (= viewport 20px) 에서 시작. translateX 100% 는 element width
      (= 175px) 만큼 이동하므로 한 element 가 이야기↔장소 사이를 자연스럽게
      슬라이드한다.
    -->
    <span
      class="archive-tabs__indicator"
      :style="indicatorStyle"
      aria-hidden="true"
    />

    <div class="archive-tabs__track">
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
 *  - 탭 2개가 flex-1 로 영역을 균등 분할 (button box layout, Figma 21:558/21:561)
 *  - orange active indicator 는 .archive-tabs 의 padding 20 안쪽 (= inner area 350px)
 *    에서 정확히 175px (= 50% of inner area) 씩 차지한다.
 */
.archive-tabs {
  position: relative;

  display: block;

  width: 100%;
  height: 52px;
  box-sizing: border-box;

  background: #ffffff;
  overflow: hidden;
}

.archive-tabs__track {
  position: relative;
  z-index: 1;

  display: flex;
  align-items: flex-start;
  gap: 20px;

  width: 100%;
  height: 100%;
  padding: 20px 20px 0;
  box-sizing: border-box;
}

/*
 * Orange active indicator.
 *  - .archive-tabs 의 padding-box (390 × 52) 안에서, padding 20 을 통과한
 *    inner area (350 × 12) 의 left:0 (≡ viewport 20px) 에서 시작.
 *  - width: calc((100% - 40px) / 2) = (350) / 2 = 175px.
 *  - translateX var(--active-index) (0 | 1):
 *      · 0 = 이야기: left 20,  끝 195.
 *      · 1 = 장소  : left 195, 끝 370.
 *  - 부모 (.archive-tabs) 의 padding-box 기준 left:0 이므로 indicator 의
 *    시각적 left edge 는 정확히 viewport 20px. 100% translateX 는 element
 *    width 175px 기준이므로 inner area 350 의 정확히 절반 너머로 이동.
 */
.archive-tabs__indicator {
  position: absolute;
  /*
   * .archive-tabs 의 padding-box 좌상단 (≡ viewport 20, 149+52=97+52) 기준.
   * top: padding-top 0 → indicator 의 top edge 는 tabs top (= viewport 97).
   * bottom: 0 → tabs 의 bottom edge (height 52) 에 정확히 붙음.
   *  - Figma 의 underline stroke 4 가 h 4 인데, 우리 indicator 도 h 3 으로
   *    Figma 의 stroke 4px 시각 영역과 동일하게 표시.
   */
  left: 20px;
  bottom: 0;

  display: block;
  width: calc((100% - 40px) / 2);
  height: 3px;

  background: #ff6940;
  border-radius: 999px;

  pointer-events: none;
  z-index: 2;

  transform: translate3d(
    calc(var(--active-index, 0) * 100%),
    0,
    0
  );

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

