<script setup lang="ts">
import storyRingOrange from '~/assets/icons/chat/story-ring-orange.svg?raw'
import storyRingOrangeShort from '~/assets/icons/chat/story-ring-orange-short.svg?raw'
import storyRingGray from '~/assets/icons/chat/story-ring-gray.svg?raw'

type RingKind = 'orange' | 'orange-short' | 'gray' | 'none'

interface ProfileItem {
  id: string
  name: string
  avatar: string
  ring: RingKind
  dimName?: boolean
  showFollowPlus?: boolean
}

defineProps<{
  items: ProfileItem[]
}>()
</script>

<template>
  <div class="profile-strip">
    <div class="profile-list">
      <button
        v-for="item in items"
        :key="item.id"
        type="button"
        class="profile-item"
      >
        <span class="profile-avatar-wrap">
          <span
            class="profile-ring"
            :class="`profile-ring--${item.ring}`"
            aria-hidden="true"
          >
            <span
              v-if="item.ring === 'orange'"
              class="profile-ring__svg"
              v-html="storyRingOrange"
            />
            <span
              v-else-if="item.ring === 'orange-short'"
              class="profile-ring__svg"
              v-html="storyRingOrangeShort"
            />
            <span
              v-else-if="item.ring === 'gray'"
              class="profile-ring__svg"
              v-html="storyRingGray"
            />
          </span>
          <img
            :src="item.avatar"
            :alt="item.name"
            class="profile-avatar"
          />
          <span
            v-if="item.showFollowPlus"
            class="profile-follow-badge"
            aria-hidden="true"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <path d="M4 1.5V6.5M1.5 4H6.5" stroke="white" stroke-width="1.3" stroke-linecap="round" />
            </svg>
          </span>
        </span>
        <span
          class="profile-name"
          :class="{ 'profile-name--dim': item.dimName }"
        >{{ item.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.profile-strip {
  width: 100%;
  height: 105px;
  overflow: hidden;
}

.profile-list {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  height: 100%;
  padding: 12px var(--page-padding);
  box-sizing: border-box;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
}

.profile-list::-webkit-scrollbar {
  display: none;
}

.profile-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 0 0 62px;
  width: 62px;
  height: 81px;
  flex-shrink: 0;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
}

/*
 * Avatar wrapper 는 Figma 와 같이 정확히 62x62.
 * box-sizing: border-box + width/height 픽스로
 * ring/absolute 자식들이 박스 밖으로 새지 않게 한다.
 */
.profile-avatar-wrap {
  position: relative;
  width: 62px;
  height: 62px;
  flex-shrink: 0;
}

.profile-ring {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible; /* Figma 의 -2.02% inset (-1.25px 새나감) 표현 */
}

.profile-ring--none {
  display: none;
}

.profile-ring__svg {
  display: block;
  width: 100%;
  height: 100%;
}

.profile-ring__svg :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.profile-avatar {
  position: absolute;
  inset: 4px;
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  border-radius: 999px;
  object-fit: cover;
}

.profile-follow-badge {
  position: absolute;
  right: 0;
  bottom: 12px; /* name row 위에 걸치도록 */
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #699DF9;
  border: 2px solid var(--color-background);
  border-radius: 999px;
  box-sizing: border-box;
}

.profile-name {
  position: absolute;
  left: 50%;
  top: 74px;
  transform: translate(-50%, -50%);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: -0.43px;
  line-height: 13px;
  color: var(--color-text-primary);
  text-align: center;
  white-space: nowrap;
}

.profile-name--dim {
  color: #9F9A9A;
}
</style>