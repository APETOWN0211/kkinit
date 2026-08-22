<script setup lang="ts">
interface DistanceFilter {
  id: string
  label: string
}

defineProps<{
  options: DistanceFilter[]
}>()
</script>

<template>
  <section class="distance-section">
    <h2 class="distance-title">주변에서 찾기</h2>
    <div class="distance-filters">
      <button
        v-for="option in options"
        :key="option.id"
        type="button"
        class="distance-chip"
      >
        {{ option.label }}
      </button>
    </div>
  </section>
</template>

<style scoped>
.distance-section {
  padding: 0 var(--page-padding);
}

.distance-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.distance-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.distance-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  padding: 0 14px;
  background: var(--color-chip-gray);
  color: var(--color-text-primary);
  border: none;
  border-radius: var(--radius-full);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.15s ease;
}

.distance-chip:hover {
  background: #DCDCDC;
}

.distance-chip:active {
  background: #D2D2D2;
}
</style>