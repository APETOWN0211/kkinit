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
      :style="{ left: `${idx * 13}px`, top: `${idx * 13}px`, zIndex: members.length - idx }"
    >
      <img :src="member" :alt="`멤버 ${idx + 1}`" />
    </div>
  </div>
</template>

<style scoped>
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
  border: 1px solid var(--color-chip-gray);
  border-radius: 999px;
  overflow: hidden;
  background: var(--color-background);
}

.group-avatar__layer img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>