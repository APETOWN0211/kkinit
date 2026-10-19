<script setup lang="ts">
import { computed } from 'vue'
import backIcon from '~/assets/icons/chat-detail/header-back.svg?raw'
import { getStorageImageUrl, STORAGE_FOLDERS } from '~/utils/storage'

/*
 * /chat/[id] 의 header (Figma 93:937).
 *
 *  - Figma frame: 390 × (50 + 3*2 = 56)
 *      - visual row 50px
 *      - vertical padding 3px (top/bottom)
 *  - left  : back button pill (white, radius 18, shadow) + unread badge "8"
 *  - center: floating white pill (radius 18, shadow) with name / last seen
 *  - right : avatar pill (white, 999, shadow)
 *
 *  - 실제 iPhone / PWA safe-area 만 상단 padding 으로 반영.
 *  - 가짜 iPhone 상태바(9:41 영역) 은 만들지 않는다.
 *  - back button 클릭 시 router.back() 호출.
 */
const props = defineProps<{
  name: string
  lastSeen: string
  avatar: string
  unreadCount?: number
}>()

/*
 * props.avatar 는 storage path (e.g. "chat/profile-tiranori.png") 또는
 * 절대 path. 컴포넌트 진입 시점에 getStorageImageUrl 로 실제 URL 로 resolve.
 * (이 컴포넌트는 setup function 안에서 실행되므로 useRuntimeConfig 안전.)
 */
const resolvedAvatar = computed(() =>
  props.avatar
    ? getStorageImageUrl(props.avatar, STORAGE_FOLDERS.chat)
    : ''
)

const router = useRouter()
const onBack = () => {
  /*
   * Spec #6: hard-coded /chat 이 아니라 router.back() 사용.
   * history 가 없는 첫 진입 (deep link 등) 의 경우 그대로 stay.
   */
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/chat')
  }
}

const DEFAULT_AVATAR = '/images/chat/default-avatar.svg'
const onAvatarError = (e: Event) => {
  const img = e.target as HTMLImageElement
  if (!img || img.dataset.fallbackApplied === '1') return
  img.dataset.fallbackApplied = '1'
  img.src = DEFAULT_AVATAR
}
</script>

<template>
  <header class="chat-detail-header" role="banner">
    <div class="chat-detail-header__row">
      <div class="chat-detail-header__left">
        <button
          type="button"
          class="back-button"
          aria-label="뒤로가기"
          @click="onBack"
        >
          <span class="back-button__icon" v-html="backIcon" />
          <span
            v-if="props.unreadCount && props.unreadCount > 0"
            class="back-button__badge"
            :aria-label="`읽지 않은 메시지 ${props.unreadCount}개`"
          >{{ props.unreadCount }}</span>
        </button>
      </div>

      <div class="chat-detail-header__center">
        <div class="profile-pill">
          <div class="profile-name">{{ props.name }}</div>
          <div class="profile-status">{{ props.lastSeen }}</div>
        </div>
      </div>

      <div class="chat-detail-header__right">
        <span class="avatar">
          <img
            :src="resolvedAvatar"
            :alt="props.name"
            class="avatar__img"
            @error="onAvatarError"
          />
        </span>
      </div>
    </div>
  </header>
</template>

<style scoped>
/*
 * Figma 93:937 — frame 390 × (50 + 6 padding)
 *  - 좌우 padding 20
 *  - 상하 padding 3
 *  - 내부 row height 50
 *  - background: 흰 → 투명 gradient (살짝)
 *  - safe-area 는 상단만 padding-top 으로 반영
 *
 * 가짜 iPhone 상태바 9:41 영역은 HTML 로 만들지 않음.
 * (AppShell 의 safe-area 만 그대로 사용.)
 */
.chat-detail-header {
  position: relative;
  z-index: 5;

  width: 100%;
  padding: env(safe-area-inset-top) 20px 0;
  box-sizing: border-box;

  /*
   * Figma 93:937 — background: 흰 → 투명 (살짝) vertical gradient.
   * 0%: #FFFFFF, 100%: rgba(255,255,255,0). 과하지 않게.
   */
  background: linear-gradient(
    to bottom,
    #FFFFFF 0%,
    rgba(255, 255, 255, 0) 100%
  );

  flex-shrink: 0;
}

.chat-detail-header__row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: 50px;
  padding: 3px 0;
  box-sizing: border-box;
  gap: 12px;
}

/* ========================================
 * Left: back button
 * ========================================
 * Figma 93:938 — back pill
 *  - 44 × 44, white, radius 999 (원형), shadow 0 2 3.85 rgba(0,0,0,0.09)
 *  - 내부 중앙에 back arrow (9 × 24, Figma frame 그대로)
 *  - "8" badge 는 arrow 우상단에 살짝 걸침 (absolute)
 */
.back-button {
  position: relative;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 44px;
  height: 44px;
  padding: 0;

  background: #FFFFFF;
  border: none;
  border-radius: 999px;
  box-shadow: 0 2px 3.85px rgba(0, 0, 0, 0.09);
  box-sizing: border-box;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, opacity 120ms ease;
}

.back-button:active {
  transform: scale(0.94);
  opacity: 0.85;
}

.back-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  /*
   * 44 정원 중앙에 9px arrow 가 오면, Figma 93:938 에서는 arrow 가
   * "정원 중심에서 살짝 왼쪽" 으로 치우친 시각. 이는 Figma 에서
   * arrow frame 이 back button 의 수평 center 가 아니라
   * icon-area 의 left edge 기준 정렬이기 때문.
   * 2px 만큼 왼쪽으로 옮겨 Figma visual 과 일치시킴.
   */
  padding-left: 2px;
}

/*
 * Back arrow.
 *  - Figma 93:938 의 arrow frame: 9 × 24.
 *  - asset (header-back.svg) 은 preserveAspectRatio="none" + overflow="visible"
 *    이고 viewBox 0 0 12.0015 24, stroke 3px, color #4D5160.
 *  - height 만 24 로 고정하고 width 는 viewBox 비율(12.0015) 로 두면
 *    asset 의 원본 chevron 형태가 그대로 보임.
 *  - 임의 scaleX/scaleY transform 금지.
 */
.back-button__icon :deep(svg) {
  display: block;
  height: 24px;
}

/*
 * Unread badge — Figma 93:938 의 회색 "8" 캡슐.
 *  - background: #4D5160
 *  - color:      #E9E9E9
 *  - font-size:  14px / line-height 18
 *  - padding:    0 4
 *  - min-width:  18
 *  - radius:     23 (full pill)
 *  - border 없음
 */
.back-button__badge {
  position: absolute;
  top: -2px;
  right: -2px;

  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  box-sizing: border-box;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  background: #4D5160;
  color: #E9E9E9;

  border: none;
  border-radius: 999px;

  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  line-height: 14px;
  letter-spacing: 0;

  pointer-events: none;
}

/* ========================================
 * Center: floating profile pill (Figma 93:943)
 * ========================================
 *  - 44 × 가변너비 (텍스트 길이)
 *  - white background
 *  - padding 2 16
 *  - radius 999 (가로/세로 동일 비율 → 양 끝이 둥근 캡슐)
 *  - shadow 0 2px 7.7px rgba(0,0,0,0.09)
 *  - column (name / status), center
 *  - gap 2
 */
.chat-detail-header__center {
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;

  min-width: 0;
  max-width: 100%;

  height: 44px;
  padding: 2px 16px;
  box-sizing: border-box;

  background: #FFFFFF;
  border-radius: 999px;
  box-shadow: 0 2px 7.7px rgba(0, 0, 0, 0.09);
}

/*
 * 닉네임 — Figma 93:943
 *  - Pretendard SemiBold 15 / 18
 *  - letter-spacing 0.5
 *  - color #000000
 */
.profile-name {
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  line-height: 18px;
  letter-spacing: 0.5px;
  color: #000000;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

/*
 * 접속 상태 — Figma 93:943
 *  - 12px Regular / 12
 *  - color #9F9A9A
 */
.profile-status {
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 12px;
  color: #9F9A9A;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ========================================
 * Right: avatar (Figma 93:946)
 * ========================================
 *  - outer frame 44 × 44
 *  - white background
 *  - padding 4
 *  - radius 999 (원형)
 *  - shadow 0 2px 7.7px rgba(0,0,0,0.09)
 *  - inner avatar 100% × 100% (실질 36×36), radius 999, object-fit cover
 */
.chat-detail-header__right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.avatar {
  position: relative;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 44px;
  height: 44px;
  padding: 4px;
  box-sizing: border-box;

  background: #FFFFFF;
  border-radius: 999px;
  box-shadow: 0 2px 7.7px rgba(0, 0, 0, 0.09);
  overflow: hidden;
}

.avatar__img {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 999px;
  object-fit: cover;
}
</style>
