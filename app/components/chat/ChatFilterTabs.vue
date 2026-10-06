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
      <!--
        Figma 11:305 — 묶음 (filter container)
          - width 362 (= 390 - 14 × 2), 위치 left 14, top 206
          - padding 3px, radius 296px (full pill)
          - shadow 0 4 18.9 rgba(0,0,0,0.09)
          - 배경: 화이트 + mix-blend 다층. 본 구현에서는 단색 #FFFFFF 사용.
      -->

      <!--
        Active pill (Figma 11:302)
          - bg #55C7AE (chip-teal)
          - height 35, radius 20
          - 좌측 3px padding 안에서 활성화된 tab 의 offsetLeft/offsetWidth 로
          translate3d + width 만 변경 (GPU friendly).
      -->
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
          class="filter-tab__mark filter-tab__mark--teal"
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

.filter-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 41px; /* padding 3 × 2 + pill height 35 */
  padding: 3px;
  background: #FFFFFF;
  border-radius: 296px;
  box-shadow: 0 4px 18.9px rgba(0, 0, 0, 0.09);
  box-sizing: border-box;
  overflow: hidden;
}

/*
 * Active indicator: Figma 11:302 (1번 pill)
 *  - top 3, left 3, height 35
 *  - width 는 측정된 active tab 의 폭
 *  - bg --color-chip-teal (#55C7AE)
 *  - radius 20
 */
.filter-active-pill {
  position: absolute;
  top: 3px;
  left: 0;
  height: 35px;
  background: var(--color-chip-teal);
  border-radius: 20px;
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
  height: 35px;
  padding: 0 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: transparent;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  transition: transform 110ms ease;
}

.filter-tab:active {
  transform: scale(0.97);
}

/*
 * Figma 11:303 / 11:304 (2, 3번)
 *  - inactive: 글자 Pretendard Medium 16, color #191919
 *  - active:   SemiBold 16, color #FFFFFF
 */
.filter-tab__label {
  font-size: 16px;
  font-weight: 500;
  line-height: 18px;
  color: #191919;
  letter-spacing: -0.08px;
  transition: color 180ms ease, font-weight 180ms ease;
}

.filter-tab--active .filter-tab__label {
  color: #FFFFFF;
  font-weight: 600;
}

/*
 * Figma 11:303 (안읽음 Mark): bg #E9E9E9, color #4D5160
 * Figma 11:304 (모임 Mark):    bg #55C7AE, color #FFFFFF
 *
 * 두 마크 모두 동일 형태:
 *  - padding 0 4, min-width 18, max-width 34
 *  - height 18, radius 23
 *  - font 14 Regular
 */
.filter-tab__mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  max-width: 34px;
  height: 18px;
  padding: 0 4px;
  border-radius: 23px;
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;
  letter-spacing: -0.08px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filter-tab__mark--gray {
  background: #E9E9E9;
  color: #4D5160;
}

.filter-tab__mark--teal {
  background: var(--color-chip-teal);
  color: #FFFFFF;
}

/*
 * 모임 tab 이 active 일 때 (mint 배경 pill) 에는 mark 배경을 흰색으로,
 * 글자 색은 이전 배경색인 chip-teal 로 두어 mint 배경 pill 위에서도 가독성을 유지.
 * (Figma 11:304 active 모임 기준)
 */
.filter-tab--active .filter-tab__mark--teal {
  background: #FFFFFF;
  color: var(--color-chip-teal);
}
</style>