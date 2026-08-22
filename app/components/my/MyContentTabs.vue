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
</template>

<style scoped>
.my-content-tabs {
  position: relative;

  display: flex;
  align-items: flex-end;

  width: 100%;
  height: 50px;

  background: #fafafa;

  border-bottom: 1px solid var(--color-border);
}

/* ========================================
   Active Indicator
   ======================================== */

   .my-tab-pill {
  position: absolute;

  left: 0;
  bottom: 0;

  width: 50px;
  height: 3px;

  background: var(--color-primary);

  border-radius: 999px 0 0;

  pointer-events: none;

  z-index: 2;

  transition:
    transform 260ms cubic-bezier(0.22, 1, 0.36, 1);

  will-change: transform;
}

/* ========================================
   Tab
   ======================================== */

.my-tab {
  position: relative;

  flex: 1;

  display: flex;
  align-items: center;
  justify-content: center;

  height: 100%;

  padding: 0;

  border: 0;

  background: transparent;

  color: var(--color-text-secondary);

  cursor: pointer;

  z-index: 1;
}

/* ========================================
   50 × 50 Icon Frame
   ======================================== */

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
  transform: scale(0.96);
}

/* ========================================
   Icon
   ======================================== */

.my-tab-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  line-height: 0;
}

.my-tab-icon :deep(svg) {
  display: block;
}

/* ========================================
   Reduced Motion
   ======================================== */

@media (prefers-reduced-motion: reduce) {
  .my-tab-pill,
  .my-tab-frame {
    transition: none;
  }
}
</style>