<script setup lang="ts">
import HomeHeader from '~/components/home/HomeHeader.vue'
</script>

<template>
  <div class="home-page">
    <HomeHeader />
  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
  min-height: 100%;
  background: var(--color-background);
  padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom));
}
</style>
