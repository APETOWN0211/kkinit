<script setup lang="ts">
export type ChatFilter = 'all' | 'unread' | 'group'

defineProps<{
  modelValue: ChatFilter
  unreadCount: number
  groupCount: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ChatFilter): void
}>()

const select = (value: ChatFilter) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="filter-wrapper">
    <div class="filter-container">
      <button
        type="button"
        class="filter-tab"
        :class="{ 'filter-tab--active': modelValue === 'all' }"
        @click="select('all')"
      >
        <span class="filter-tab__label">전체</span>
      </button>

      <button
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
  display: flex;
  align-items: center;
  width: 100%;
  height: 44px;
  padding: 4px;
  background: #FFFFFF;
  border-radius: 296px;
  box-shadow: 0 4px 18.9px rgba(0, 0, 0, 0.09);
  box-sizing: border-box;
}

.filter-tab {
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
  transition: background-color 160ms ease, color 160ms ease;
  white-space: nowrap;
}

.filter-tab--active {
  background: #FE5531;
}

.filter-tab__label {
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
  color: var(--color-text-primary);
  letter-spacing: -0.4px;
}

.filter-tab--active .filter-tab__label {
  font-weight: 600;
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