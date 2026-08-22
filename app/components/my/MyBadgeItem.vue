<script setup lang="ts">
defineProps<{
  name: string
  imageSrc: string
  variant?: 'default' | 'gradient-border'
}>()
</script>

<template>
  <div class="my-badge-item" :class="{ 'my-badge-item--gradient': variant === 'gradient-border' }">
    <div class="my-badge-item__image">
      <img :src="imageSrc" :alt="name" />
    </div>
    <p class="my-badge-item__name">{{ name }}</p>
  </div>
</template>

<style scoped>
.my-badge-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 90px;
}

.my-badge-item__image {
  width: 90px;
  height: 90px;
  overflow: hidden;
  filter: drop-shadow(0 3px 13.95px rgba(0, 0, 0, 0.1));
}

.my-badge-item__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 동네 한바퀴 badge: CSS gradient border */
.my-badge-item--gradient .my-badge-item__image {
  background: linear-gradient(209deg, #005a1e 4.8%, #94daac 52.7%, #005a1e 100.6%);
  padding: 7px;
  box-sizing: border-box;
}

.my-badge-item--gradient .my-badge-item__image img {
  border-radius: 115px;
  border: 1px solid #b6e8cf;
}

.my-badge-item__name {
  font-size: 14px;
  font-weight: 400;
  line-height: normal;
  color: var(--color-text-primary);
  text-align: center;
  margin: 0;
}
</style>
