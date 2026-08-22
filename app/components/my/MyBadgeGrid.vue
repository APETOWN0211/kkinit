<script setup lang="ts">
import MyBadgeItem from '~/components/my/MyBadgeItem.vue'

interface Badge {
  name: string
  imageSrc: string
  variant?: 'default' | 'gradient-border'
}

defineProps<{
  badges: Badge[]
}>()
</script>

<template>
  <div class="my-badge-grid">
    <div
      class="my-badge-grid__row"
      v-for="(row, rowIdx) in (() => {
        const result = []
        for (let i = 0; i < badges.length; i += 3) {
          result.push(badges.slice(i, i + 3))
        }
        return result
      })()"
      :key="rowIdx"
    >
      <MyBadgeItem
        v-for="badge in row"
        :key="badge.name"
        :name="badge.name"
        :image-src="badge.imageSrc"
        :variant="badge.variant ?? 'default'"
      />
    </div>
  </div>
</template>

<style scoped>
.my-badge-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  padding: 20px 30px;
}

.my-badge-grid__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
}
</style>
