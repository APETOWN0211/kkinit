<script setup lang="ts">
import mutedIcon from '~/assets/icons/chat/muted.svg?raw'
import storyRingOrange from '~/assets/icons/chat/story-ring-orange.svg?raw'
import storyRingOrangeShort from '~/assets/icons/chat/story-ring-orange-short.svg?raw'
import storyRingGray from '~/assets/icons/chat/story-ring-gray.svg?raw'
import GroupAvatar from '~/components/chat/GroupAvatar.vue'

type RingKind = 'orange' | 'orange-short' | 'gray' | 'none'
type BadgeColor = 'orange' | 'lime'

interface ConversationItem {
  id: string
  type: 'direct' | 'group'
  name: string
  avatar?: string
  ring?: RingKind
  memberCount?: number
  members?: string[]
  sender?: string
  lastMessage: string
  time: string
  unreadCount?: number
  badgeColor?: BadgeColor
  muted?: boolean
  showDivider?: boolean
}

defineProps<{
  item: ConversationItem
}>()
</script>

<template>
  <article
    class="chat-row"
    :class="{
      'chat-row--group': item.type === 'group',
      'chat-row--divider': item.showDivider,
    }"
  >
    <div class="chat-row__avatar">
      <template v-if="item.type === 'group' && item.members">
        <GroupAvatar :members="item.members" />
      </template>
      <template v-else>
        <div class="conversation-avatar">
          <span
            class="conversation-avatar__ring"
            :class="`conversation-avatar__ring--${item.ring || 'none'}`"
            aria-hidden="true"
          >
            <span
              v-if="item.ring === 'orange'"
              class="conversation-avatar__ring-svg"
              v-html="storyRingOrange"
            />
            <span
              v-else-if="item.ring === 'orange-short'"
              class="conversation-avatar__ring-svg"
              v-html="storyRingOrangeShort"
            />
            <span
              v-else-if="item.ring === 'gray'"
              class="conversation-avatar__ring-svg"
              v-html="storyRingGray"
            />
          </span>
          <img
            v-if="item.avatar"
            :src="item.avatar"
            :alt="item.name"
            class="conversation-avatar__img"
          />
        </div>
      </template>
    </div>

    <div class="chat-row__body">
      <div class="chat-row__inner">
        <div class="chat-row__text">
          <div class="chat-row__title">
            <span class="chat-row__name">{{ item.name }}</span>
            <span
              v-if="item.memberCount"
              class="chat-row__member-count"
            >{{ item.memberCount }}</span>
            <span
              v-if="item.muted"
              class="chat-row__muted"
              aria-label="음소거"
              v-html="mutedIcon"
            />
          </div>
          <p
            v-if="item.sender"
            class="chat-row__sender"
          >{{ item.sender }}</p>
          <p class="chat-row__message">{{ item.lastMessage }}</p>
        </div>

        <div class="chat-row__meta">
          <span class="chat-row__time">{{ item.time }}</span>
          <span
            v-if="item.unreadCount && item.unreadCount > 0"
            class="chat-row__badge"
            :class="`chat-row__badge--${item.badgeColor || 'orange'}`"
          >{{ item.unreadCount }}</span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
/*
 * Chat row — Figma node 0:3833 정확값
 * - row width 390, height 78, padding top/bottom 8, left/right 20
 * - avatar wrapper 62, inner image 54 (ring 4)
 * - row 시작 = avatar column 62 (left padding 20) + text column
 * - grid: 62px | minmax(0,1fr) | auto
 */
.chat-row {
  position: relative;
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr) auto;
  align-items: center;
  width: 100%;
  height: 78px;
  padding: 8px 20px;
  box-sizing: border-box;
  background: transparent;
  column-gap: 0;
}

/*
 * Divider 는 row 의 위쪽에만 존재한다.
 * 길이는 row_body column 의 폭에 맞춰진다 (avatar col 아래로
 * 그어지지 않음). 시작 = row padding-left 20 + avatar col 62,
 * 끝 = row right padding 20 직전.
 */
.chat-row--divider::before {
  content: '';
  position: absolute;
  top: 0;
  left: 82px;
  right: 20px;
  height: 1px;
  background: var(--color-chip-gray);
}

.chat-row--group {
  align-items: stretch;
  height: auto;
  min-height: 78px;
  padding: 8px 20px;
}

.chat-row--group .chat-row__avatar {
  align-self: center;
}

.chat-row__avatar {
  flex-shrink: 0;
  width: 62px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  overflow: hidden;
}

.conversation-avatar {
  position: relative;
  width: 62px;
  height: 62px;
  flex-shrink: 0;
  border-radius: 999px;
  box-sizing: border-box;
}

.conversation-avatar__ring {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.conversation-avatar__ring--none {
  display: none;
}

.conversation-avatar__ring-svg {
  display: block;
  width: 100%;
  height: 100%;
}

.conversation-avatar__ring-svg :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.conversation-avatar__img {
  position: absolute;
  inset: 4px;
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  border-radius: 999px;
  object-fit: cover;
}

.chat-row__body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 10px 0 0 10px;
}

.chat-row__inner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  width: 100%;
  min-width: 0;
}

.chat-row__text {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow: hidden;
}

.chat-row__title {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.chat-row__name {
  font-size: 18px;
  font-weight: 600;
  line-height: 22px;
  color: var(--color-text-primary);
  letter-spacing: -0.4px;
  white-space: nowrap;
}

.chat-row__member-count {
  font-size: 18px;
  font-weight: 500;
  line-height: 22px;
  color: var(--color-text-muted);
  letter-spacing: -0.4px;
}

.chat-row__muted {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 12px;
  height: 13px;
}

.chat-row__muted :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.chat-row__sender {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 18px;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-row__message {
  margin: 0;
  font-size: 16px;
  font-weight: 400;
  line-height: 22px;
  color: var(--color-text-secondary);
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.chat-row__meta {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 8px;
}

.chat-row__time {
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;
  color: var(--color-text-muted);
  letter-spacing: -0.2px;
  white-space: nowrap;
}

.chat-row__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 7px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
  letter-spacing: -0.2px;
}

.chat-row__badge--orange {
  background: #FE5531;
  color: #FFFFFF;
}

.chat-row__badge--lime {
  background: var(--color-chip-lime);
  color: var(--color-text-primary);
}
</style>