<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'

export type ChatFilter = 'all' | 'unread' | 'group'

const props = defineProps<{
  modelValue: ChatFilter
  unreadCount: number
  groupCount: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ChatFilter): void
}>()

const buttonRefs = ref<Partial<Record<ChatFilter, HTMLButtonElement | null>>>({
  all: null,
  unread: null,
  group: null
})

const pillStyle = ref<{ width: string; transform: string }>({
  width: '0px',
  transform: 'translate3d(0px, 0, 0)'
})

const measure = async () => {
  await nextTick()
  const el = buttonRefs.value[props.modelValue]
  if (!el) return
  pillStyle.value = {
    width: `${el.offsetWidth}px`,
    transform: `translate3d(${el.offsetLeft}px, 0, 0)`
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

const setRef = (key: ChatFilter) => (el: any) => {
  buttonRefs.value[key] = el as HTMLButtonElement | null
}

const select = (value: ChatFilter) => {
  if (value === props.modelValue) return
  measure()
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="filter-wrapper">
    <div class="filter-container">
      <span
        class="filter-active-pill"
        :style="pillStyle"
        aria-hidden="true"
      />

      <button
        :ref="setRef('all')"
        type="button"
        class="filter-tab"
        :class="{ 'filter-tab--active': modelValue === 'all' }"
        @click="select('all')"
      >
        <span class="filter-tab__label">전체</span>
      </button>

      <button
        :ref="setRef('unread')"
        type="button"
        class="filter-tab"
        :class="{ 'filter-tab--active': modelValue === 'unread' }"
        @click="select('unread')"
      >
        <span class="filter-tab__label">안읽음</span>
        <span
          v-if="unreadCount > 0"
          class="filter-tab__mark filter-tab__mark--gray"
        >{{ unreadCount }}</span>
      </button>

      <button
        :ref="setRef('group')"
        type="button"
        class="filter-tab"
        :class="{ 'filter-tab--active': modelValue === 'group' }"
        @click="select('group')"
      >
        <span class="filter-tab__label">모임</span>
        <span
          v-if="groupCount > 0"
          class="filter-tab__mark filter-tab__mark--lime"
        >{{ groupCount }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.filter-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 0 14px;
  box-sizing: border-box;
}

/*
 * Figma filter-container 외관은 white 기반 블렌드 레이어 합성.
 * 요구사항에 따라 단색 background 로 명시한다.
 */
.filter-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 44px;
  padding: 4px;
  background: #FFFFFF;
  border-radius: 296px;
  box-shadow: 0 4px 18.9px rgba(0, 0, 0, 0.09);
  box-sizing: border-box;
  overflow: hidden;
}

/*
 * 오렌지 active indicator. 버튼 아래에 깔리고,
 * 현재 선택된 tab 의 offsetLeft/offsetWidth 로
 * translate3d + width 만 GPU friendly 하게 변한다.
 */
.filter-active-pill {
  position: absolute;
  top: 4px;
  left: 0;
  height: 36px;
  background: #FE5531;
  border-radius: 24px;
  z-index: 0;
  pointer-events: none;
  transition:
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
    width 280ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, width;
}

.filter-tab {
  position: relative;
  z-index: 1;
  flex: 1 1 0;
  min-width: 0;
  height: 36px;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: transparent;
  border: none;
  border-radius: 24px;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 110ms ease;
}

.filter-tab:active {
  transform: scale(0.97);
}

.filter-tab__label {
  font-size: 16px;
  font-weight: 600;
  line-height: 20px;
  color: #191919;
  letter-spacing: -0.4px;
  transition: color 180ms ease;
}

.filter-tab--active .filter-tab__label {
  color: #FFFFFF;
}

.filter-tab__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: -0.2px;
  white-space: nowrap;
}

.filter-tab__mark--gray {
  background: var(--color-chip-gray);
  color: var(--color-chip-gray-text);
}

.filter-tab__mark--lime {
  background: var(--color-chip-lime);
  color: var(--color-text-primary);
}
</style>