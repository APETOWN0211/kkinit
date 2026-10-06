<script setup lang="ts">
import mutedIcon from '~/assets/icons/chat/muted.svg?raw'
import storyRingOrange from '~/assets/icons/chat/story-ring-orange.svg?raw'
import storyRingOrangeShort from '~/assets/icons/chat/story-ring-orange-short.svg?raw'
import storyRingGray from '~/assets/icons/chat/story-ring-gray.svg?raw'
import GroupAvatar from '~/components/chat/GroupAvatar.vue'

type RingKind = 'orange' | 'orange-short' | 'gray' | 'none'
type BadgeColor = 'orange' | 'teal'

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
  /*
   * Badge color variant
   *   - 'orange': primary unread (#FF6940)
   *   - 'teal':   group unread (#55C7AE)
   * 미지정 시 default 'orange' (1:1 unread 와 동일 처리).
   */
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
    <!--
      Figma 11:309 등 모든 row 의 avatar 영역.
      Avatar wrapper 자체 크기는 62 × 62 이지만 row height 78 안에서
      위/아래 여백을 위해 row padding 10 (top/bottom) 으로 들어간다.
    -->
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

    <!--
      Figma 11:315 — body column
        - width 288 (text + meta)
        - padding-left 10, padding-y 10
        - height 78 (row 와 동일)
        - 내부: name (17 Medium) ↔ time/empty 우측 (14 Regular)
                message (15 Regular)  ↔ badge (20×20)
        - 첫 row 가 아니면 border-top 1px #E2E2E2 (avatar 아래로 그어지지 않음)
    -->
    <div
      class="chat-row__body"
      :class="{ 'chat-row__body--divider': item.showDivider }"
    >
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
 * Figma 11:308 (row 1) — base row
 *  - width 390, height 78
 *  - padding: 20 좌우, 10 위아래 (avatar 가 좌상단에서 약간 내려옴)
 *  - grid: 62px avatar | text col 290 | 0 (auto)
 *    (실제 Figma 의 avatar col 62 + body col 288 + auto)
 */
.chat-row {
  position: relative;
  display: grid;
  grid-template-columns: 62px 288px auto;
  align-items: stretch;
  width: 100%;
  height: 78px;
  padding: 10px 20px;
  background: transparent;
  box-sizing: border-box;
}

/*
 * Avatar cell 은 Figma 의 62×62 그대로 두지만, row padding-top 10 안에서
 * 약간의 위쪽 정렬이 필요하므로 align-items: center.
 */
.chat-row__avatar {
  flex-shrink: 0;
  width: 62px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  align-self: center;
  overflow: visible;
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
  width: calc(100% + 2.5px);
  height: calc(100% + 2.5px);
  margin: -1.25px;
}

.conversation-avatar__ring-svg :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/* Figma 와 동일하게 avatar inner 이미지 = 54×54 (padding 4) */
.conversation-avatar__img {
  position: absolute;
  inset: 4px;
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  border-radius: 999px;
  object-fit: cover;
  z-index: 1;
}

/*
 * Body column — Figma 11:315/11:331/11:348 …
 *  - width 288, padding-left 10, padding-y 10
 *  - divider 는 body 시작선 (row padding-left 20 + avatar 62) 부터
 *    body 의 우측 끝까지 (=right 20).
 */
.chat-row__body {
  position: relative;
  width: 288px;
  min-width: 0;
  padding: 10px 0 10px 10px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.chat-row__body--divider::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: -20px; /* row 의 right padding 20 까지 */
  height: 1px;
  background: var(--color-divider);
}

.chat-row__inner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  min-width: 0;
}

.chat-row__text {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden;
}

.chat-row__title {
  display: flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

/*
 * Figma 11:318 (1:1 row name)
 *  - Pretendard Medium 17
 *  - color #191919
 *  - line-height 22
 */
.chat-row__name {
  font-size: 17px;
  font-weight: 500;
  line-height: 22px;
  color: var(--color-text-primary);
  letter-spacing: -0.43px;
  white-space: nowrap;
}

.chat-row__member-count {
  font-size: 17px;
  font-weight: 500;
  line-height: 22px;
  color: #9F9A9A;
  letter-spacing: -0.43px;
}

.chat-row__muted {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 11px;
  height: 12px;
}

.chat-row__muted :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/*
 * Figma 11:353 (group sender)
 *  - Regular 14, color #000
 *  - group row 의 name 다음 줄 (line 24px)
 */
.chat-row__sender {
  margin: 2px 0 0;
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;
  color: #000000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/*
 * Figma 11:319 / 11:337 (message)
 *  - Pretendard Regular 15
 *  - color #4D5160
 *  - line-height 22
 *  - 첫 row (top 26px) / 그 외 (top 26px 도 동일) — 즉, 행 안에서
 *    일정한 line-height 22 의 2번째 줄.
 */
.chat-row__message {
  margin: 0;
  font-size: 15px;
  font-weight: 400;
  line-height: 22px;
  color: var(--color-text-secondary);
  letter-spacing: -0.43px;
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
  justify-content: space-between;
  gap: 10px;
  align-self: stretch;
  padding-top: 0;
}

/*
 * Figma 11:321 / 11:339 / 11:356 등 모든 time
 *  - Regular 14, color #9F9A9A
 *  - text-align right
 */
.chat-row__time {
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  color: #9F9A9A;
  letter-spacing: -0.23px;
  white-space: nowrap;
}

/*
 * Figma 11:322 / 11:357 / 11:386 — badge
 *  - 20 × 20 circle (size 20)
 *  - bg #FF6940 (orange variant) / #55C7AE (teal variant)
 *  - Pretendard Medium 15, white
 *  - line-height 20
 *  - 직접 padding 10 을 빼서 glyph 가 중앙에 위치 (Figma padding 10 적용)
 */
.chat-row__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: -0.23px;
  color: #FFFFFF;
}

.chat-row__badge--orange {
  background: #FF6940;
}

.chat-row__badge--teal {
  background: var(--color-chip-teal);
}
</style>