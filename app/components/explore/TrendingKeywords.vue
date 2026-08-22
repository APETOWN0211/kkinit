<script setup lang="ts">
interface TrendingKeyword {
  id: string
  rank: number
  label: string
}

defineProps<{
  items: TrendingKeyword[]
}>()
</script>

<template>
  <section class="trending-section">
    <h2 class="trending-title">요즘 많이 검색</h2>
    <ol class="trending-list">
      <li
        v-for="item in items"
        :key="item.id"
        class="trending-item"
      >
        <span class="trending-rank">{{ item.rank }}</span>
        <span class="trending-label">{{ item.label }}</span>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.trending-section {
  padding: 0 var(--page-padding);
}

.trending-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.trending-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.trending-item {
  display: flex;
  align-items: baseline;
  gap: 14px;
  cursor: pointer;
}

.trending-rank {
  flex-shrink: 0;
  width: 18px;
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary);
  line-height: 1.2;
  text-align: center;
}

.trending-label {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.2;
}
</style>