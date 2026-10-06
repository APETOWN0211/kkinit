<script setup lang="ts">
defineProps<{
  members: string[]
}>()
</script>

<template>
  <div class="group-avatar">
    <div
      v-for="(member, idx) in members"
      :key="idx"
      class="group-avatar__layer"
      :style="{
        left: `${idx * 13}px`,
        top: `${idx * 13}px`,
        zIndex: members.length - idx
      }"
    >
      <img :src="member" :alt="`멤버 ${idx + 1}`" />
    </div>
  </div>
</template>

<style scoped>
/*
 * Figma 11:341 — group avatar wrapper
 *  - size 62 × 62
 *  - 첫번째 멤버: left 0,  top 0,  size 36, radius 26
 *  - 두번째 멤버: left 13, top 13, size 36, radius 22
 *  - 세번째 멤버: left 26, top 26, size 36, radius 31
 *  - border: 1px solid #E2E2E2 (--color-divider)
 */
.group-avatar {
  position: relative;
  width: 62px;
  height: 62px;
  flex-shrink: 0;
  overflow: visible;
}

.group-avatar__layer {
  position: absolute;
  width: 36px;
  height: 36px;
  border: 1px solid var(--color-divider);
  border-radius: 999px;
  overflow: hidden;
  background: #FFFFFF;
}

.group-avatar__layer img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>