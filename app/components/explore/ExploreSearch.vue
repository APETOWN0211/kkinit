<script setup lang="ts">
import searchIcon from '~/assets/icons/common/search.svg?raw'

const props = withDefaults(
  defineProps<{
    placeholder?: string
    modelValue?: string
  }>(),
  {
    placeholder: '음식, 식당, 지역, 사람 검색',
    modelValue: ''
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="explore-search">
    <span class="search-icon" v-html="searchIcon" aria-hidden="true" />
    <input
      type="text"
      class="search-input"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-label="placeholder"
      @input="onInput"
    />
  </div>
</template>

<style scoped>
.explore-search {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  height: 44px;
  padding: 0 14px;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  box-sizing: border-box;
  transition: border-color 0.15s ease;
}

.explore-search:focus-within {
  border-color: var(--color-primary);
}

.search-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--color-icon-muted);
}

.search-icon :deep(svg) {
  display: block;
  width: 20px;
  height: 20px;
}

.search-input {
  flex: 1 1 auto;
  min-width: 0;
  height: 100%;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  font-size: 15px;
  font-weight: 400;
  color: var(--color-text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--color-text-inactive);
  font-weight: 400;
}
</style>