<script setup lang="ts">
import ChatListItem from '~/components/chat/ChatListItem.vue'
import type { ConversationItem } from '~/components/chat/ChatListItem.vue'

defineProps<{
  items: ConversationItem[]
}>()
</script>

<template>
  <div class="chat-list">
    <ChatListItem
      v-for="(item, idx) in items"
      :key="item.id"
      :item="{ ...item, showDivider: idx > 0 }"
    />
  </div>
</template>

<style scoped>
.chat-list {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>