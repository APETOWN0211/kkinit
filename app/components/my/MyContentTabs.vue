<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

import feedActive from '~/assets/icons/my/feed-active.svg?raw'
import feedInactive from '~/assets/icons/my/feed-inactive.svg?raw'
import repostActive from '~/assets/icons/my/repost-active.svg?raw'
import repostInactive from '~/assets/icons/my/repost-inactive.svg?raw'
import badgeActive from '~/assets/icons/my/badge-active.svg?raw'
import badgeInactive from '~/assets/icons/my/badge-inactive.svg?raw'

export type MyTab = 'feed' | 'repost' | 'badge'

const props = defineProps<{
  modelValue: MyTab
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: MyTab): void
}>()

const tabOrder: MyTab[] = ['feed', 'repost', 'badge']

/*
 * Figma 18:553/636/758 (Frame703/704/705).
 *  - Feed   : 21 × 24 inner bg + 10 × 12 lines (icon centered at 14.5, 13)
 *  - Repost : 22.2 × 24.3 inner (repost cycle)
 *  - Badge  : 21 × 24 inner (badge mark)
 *  - Active : orange #FF6940 tint on icon + 4px orange line at tab bottom
 *
 * Outer wrapper is 50 × 50 (Frame70x) and indicator line is 50 × 4 (imgLine38)
 * centered at the bottom of the 50x50 box, drawn as the .my-tab-pill.
 */
const tabIcons = (active: boolean): Record<MyTab, string> => ({
  feed: active ? feedActive : feedInactive,
  repost: active ? repostActive : repostInactive,
  badge: active ? badgeActive : badgeInactive
})

const tabRefs = ref<Partial<Record<MyTab, HTMLButtonElement | null>>>({
  feed: null,
  repost: null,
  badge: null
})

const pillStyle = ref({
  transform: 'translate3d(0px, 0, 0)'
})

/*
 * Figma 18:511 (Frame703) indicator: width 50, h 4 (drawn 4px above bottom of
 * 50x50 frame so it visually sits at the tab bottom edge).  We size pill
 * width 50 to match the active icon frame width and let it center under the
 * active tab.
 */
const INDICATOR_WIDTH = 50

const measure = async () => {
  await nextTick()

  const el = tabRefs.value[props.modelValue]
  if (!el) return

  const targetLeft =
    el.offsetLeft + (el.offsetWidth - INDICATOR_WIDTH) / 2

  pillStyle.value = {
    transform: `translate3d(${targetLeft}px, 0, 0)`
  }
}

onMounted(() => {
  measure()
  window.addEventListener('resize', measure)
})

watch(
  () => props.modelValue,
  () => {
    measure()
  }
)

onBeforeUnmount(() => {
  window.removeEventListener('resize', measure)
})

const setRef = (key: MyTab) => (el: any) => {
  tabRefs.value[key] = el as HTMLButtonElement | null
}

const select = (value: MyTab) => {
  if (value === props.modelValue) return
  emit('update:modelValue', value)
}

const ariaLabels: Record<MyTab, string> = {
  feed: '피드',
  repost: '리포스트',
  badge: '배지'
}
</script>

<template>
  <div class="my-content-tabs">
    <!--
      Figma 18:567/753/772 — "프로필 편집" full-width button.
      Sits between the profile info and the content tabs.
    -->
    <div class="my-content-tabs__edit">
      <button
        type="button"
        class="my-content-tabs__edit-button"
        @click="$emit('edit')"
      >
        프로필 편집
      </button>
    </div>

    <!--
      Figma 18:570/650/775 — Tabs row.
        top: 318 (in 844 viewport), w: 390, px: 40, py: 10, justify-between
        Three 50 × 50 icon frames.
    -->
    <div class="my-content-tabs__row">
      <span
        class="my-tab-pill"
        :style="pillStyle"
        aria-hidden="true"
      />

      <button
        v-for="tab in tabOrder"
        :key="tab"
        :ref="setRef(tab)"
        type="button"
        class="my-tab"
        :class="{ 'my-tab--active': modelValue === tab }"
        :aria-label="ariaLabels[tab]"
        @click="select(tab)"
      >
        <span class="my-tab-frame">
          <span
            class="my-tab-icon"
            v-html="tabIcons(modelValue === tab)[tab]"
          />
        </span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.my-content-tabs {
  position: relative;

  display: flex;
  flex-direction: column;

  width: 100%;

  background: #ffffff;
}

/* =========================================
   "프로필 편집" full-width button
   stats 와의 거리는 20px (Figma 18:553/636/758).
   ========================================= */
.my-content-tabs__edit {
  display: flex;
  width: 100%;
  margin-top: 20px;
  padding: 0 20px;
  box-sizing: border-box;
}

.my-content-tabs__edit-button {
  flex: 1;

  display: flex;
  align-items: center;
  justify-content: center;

  height: 46px;
  padding: 0 53px;

  border: 0;
  border-radius: 12px;

  background: #f5f6f8;

  color: #73787e;

  font: inherit;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.3px;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, opacity 120ms ease;
}

.my-content-tabs__edit-button:active {
  transform: scale(0.99);
  opacity: 0.88;
}

/* =========================================
   Tab row
   ========================================= */
.my-content-tabs__row {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: 50px;
  padding: 0 40px;
  box-sizing: border-box;
}

/* =========================================
   Active Indicator (4px line under active tab)
   ========================================= */
.my-tab-pill {
  position: absolute;

  left: 0;
  bottom: 0;

  width: 50px;
  height: 4px;

  background: #ff6940;
  border-radius: 999px 999px 0 0;

  pointer-events: none;
  z-index: 2;

  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

/* =========================================
   Tab button
   ========================================= */
.my-tab {
  position: relative;

  flex: 0 0 50px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 50px;
  height: 50px;

  padding: 0;

  border: 0;

  background: transparent;

  color: #c3c3c3;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  z-index: 1;
}

/* =========================================
   50 × 50 Icon Frame
   ========================================= */
.my-tab-frame {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  flex: 0 0 50px;

  width: 50px;
  height: 50px;

  transition: transform 100ms ease;
}

.my-tab:active .my-tab-frame {
  transform: scale(0.94);
}

/* =========================================
   Icon
   ========================================= */
.my-tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  line-height: 0;
}

.my-tab-icon :deep(svg) {
  display: block;
  width: 24px;
  height: 24px;
}

/* =========================================
   Reduced Motion
   ========================================= */
@media (prefers-reduced-motion: reduce) {
  .my-tab-pill,
  .my-tab-frame,
  .my-content-tabs__edit-button {
    transition: none;
  }
}
</style>
