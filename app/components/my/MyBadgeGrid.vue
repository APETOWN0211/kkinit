<script setup lang="ts">
/*
 * My Badge Grid — Figma 18:758 (홈 - 프로필 리포스트)
 *  - Container: top 378, w 390, px 30, py 20, flex col gap 20
 *  - First row: 3 badges (첫 끼, 동네 한바퀴, 야식 출동)
 *  - Second row: 1 badge  (같이 먹자) — left aligned
 *  - Each badge: 90 × 90 image + 14px label, gap 12
 *  - Item drop-shadow: 0 3px 13.95px rgba(0, 0, 0, 0.1)
 *  - Layout: row items stretch to 90px width each
 */
defineProps<{
  badges: Array<{
    name: string
    imageSrc: string
  }>
}>()
</script>

<template>
  <div class="my-badge-grid">
    <div
      v-for="(row, rowIdx) in (() => {
        const result: typeof badges[] = []
        for (let i = 0; i < badges.length; i += 3) {
          result.push(badges.slice(i, i + 3))
        }
        return result
      })()"
      :key="rowIdx"
      class="my-badge-grid__row"
    >
      <div
        v-for="badge in row"
        :key="badge.name"
        class="my-badge-grid__item"
      >
        <div class="my-badge-grid__image">
          <img :src="badge.imageSrc" :alt="badge.name" />
        </div>
        <p class="my-badge-grid__name">{{ badge.name }}</p>
      </div>
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
  box-sizing: border-box;
  background: #ffffff;
}

.my-badge-grid__row {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 30px;
  width: 100%;
}

.my-badge-grid__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 90px;
  flex-shrink: 0;
}

.my-badge-grid__image {
  width: 90px;
  height: 90px;
  filter: drop-shadow(0 3px 13.95px rgba(0, 0, 0, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
}

.my-badge-grid__image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.my-badge-grid__name {
  margin: 0;

  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.3px;

  color: #191919;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  text-align: center;
  white-space: nowrap;
}
</style>
