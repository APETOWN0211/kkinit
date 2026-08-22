<script setup lang="ts">
interface MoodOption {
  id: string
  label: string
}

defineProps<{
  options: MoodOption[]
  modelValue?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const selectOption = (id: string) => {
  emit('update:modelValue', id)
}
</script>

<template>
  <section class="mood-section">
    <div class="mood-card">
      <h2 class="mood-title">지금 뭐가 끌려?</h2>
      <div class="mood-chips">
        <button
          v-for="option in options"
          :key="option.id"
          type="button"
          class="mood-chip"
          :class="{ 'mood-chip--active': modelValue === option.id }"
          @click="selectOption(option.id)"
        >
          {{ option.label }}
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mood-section {
  padding: 0 var(--page-padding);
}

.mood-card {
  background: #F3F4F6;
  border-radius: var(--radius-md);
  padding: 18px 20px;
}

.mood-title {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.mood-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.mood-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 34px;
  padding: 0 14px;
  background: var(--color-background);
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.mood-chip:hover {
  background: var(--color-chip-gray);
}

.mood-chip--active {
  background: var(--color-primary);
  color: var(--color-text-on-primary);
}

.mood-chip--active:hover {
  background: var(--color-primary);
}
</style>