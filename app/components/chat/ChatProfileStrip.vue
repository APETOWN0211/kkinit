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
          <!--
            Ring wrapper: 62x62 (Figma 11:256).
            내부 이미지는 padding 4 적용 → 54x54 표시.
            ring SVG 는 Figma 의 inset -2.02% (-1.25px) 와 동일하게
            살짝 박스 밖으로 나가게 둔다 (overflow: visible).
          -->
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
/*
 * Figma 11:253 — Profile strip
 *  - frame: 390 × 105
 *  - 내부 padding 12px (top/bottom), 20px (left/right)
 *  - inner list gap 12px
 *  - item: 62 × 81 (avatar 62 + name row)
 *  - name: 13px Pretendard Medium, line-height 13px
 *      색은 active #191919 / dim #9F9A9A
 *      top 74.5px (item 내 중앙 정렬)
 */
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

.profile-avatar-wrap {
  position: relative;
  width: 62px;
  height: 62px;
  flex-shrink: 0;
  border-radius: 999px;
}

.profile-ring {
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.profile-ring--none {
  display: none;
}

.profile-ring__svg {
  display: block;
  width: calc(100% + 2.5px);
  height: calc(100% + 2.5px);
  margin: -1.25px;
}

.profile-ring__svg :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/*
 * Avatar 이미지: padding 4 → 54×54
 */
.profile-avatar {
  position: absolute;
  inset: 4px;
  width: calc(100% - 8px);
  height: calc(100% - 8px);
  border-radius: 999px;
  object-fit: cover;
  z-index: 1;
}

/*
 * Figma 11:259 — follow button
 *  - 닮은살걀의 우하단 + 배지
 *  - follow button 자체 asset 크기 15.667×16, plus icon 8×8
 *  - 배경색: Figma 의 follow button asset color (mint teal #55C7AE 계열)
 *    첨부에서 민트로 보이는 색이므로 design token 사용.
 */
.profile-follow-badge {
  position: absolute;
  right: 2px;
  bottom: 14px;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-chip-teal);
  border: 2px solid var(--color-background);
  border-radius: 999px;
  box-sizing: border-box;
  z-index: 2;
}

.profile-name {
  position: absolute;
  left: 50%;
  top: 74.5px;
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