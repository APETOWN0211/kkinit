<script setup lang="ts">
import ChatListItem from '~/components/chat/ChatListItem.vue'
import type { ChatFilter } from '~/components/chat/ChatFilterTabs.vue'
import type { ConversationItem } from '~/components/chat/ChatListItem.vue'

defineProps<{
  items: ConversationItem[]
  filter?: ChatFilter
}>()
</script>

<template>
  <Transition name="chat-list-fade" mode="out-in">
    <div class="chat-list" :key="filter ?? 'static'">
      <ChatListItem
        v-for="(item, idx) in items"
        :key="item.id"
        :item="{ ...item, showDivider: idx > 0 }"
      />
    </div>
  </Transition>
</template>

<style scoped>
.chat-list {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.chat-list-fade-enter-active,
.chat-list-fade-leave-active {
  transition: opacity 140ms ease;
}

.chat-list-fade-enter-from,
.chat-list-fade-leave-to {
  opacity: 0.65;
}
</style>