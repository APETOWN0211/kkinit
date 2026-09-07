<script setup lang="ts">
/*
 * Home Side Drawer
 * Figma node 1:538 (마이탭 - 메인) actual values
 *
 * Layout:
 *   - drawer width : 300px
 *   - padding      : 30px x / 68px y
 *   - profile area : avatar 48px + handle 30px (top gap 18px from avatar)
 *   - gap profile -> main menu : 80px
 *   - main menu    : 4 items, item gap 24px, icon 32px, label 24px Medium
 *   - gap main menu -> bottom  : flex 1
 *   - bottom menu  : 2 items, item gap 34px, icon 24px, label 20px Medium
 */

import profileIcon from '~/assets/icons/drawer/profile.svg?raw'
import meetingIcon from '~/assets/icons/drawer/meeting.svg?raw'
import archiveIcon from '~/assets/icons/drawer/archive.svg?raw'
import historyIcon from '~/assets/icons/drawer/history.svg?raw'
import settingsIcon from '~/assets/icons/drawer/settings.svg?raw'
import logoutIcon from '~/assets/icons/drawer/logout.svg?raw'

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()

const handleProfile = () => {
  emit('close')
  router.push('/my')
}

const handleMeeting = () => {
  emit('close')
  // TODO: 모임 라우트 결정 시 router.push('/meetings') 등
}

const handleArchive = () => {
  emit('close')
  // TODO: 보관함 라우트
}

const handleHistory = () => {
  emit('close')
  // TODO: 방문기록 라우트
}

const handleSettings = () => {
  emit('close')
  router.push('/settings')
}

const handleLogout = () => {
  // TODO: 실제 auth logout 연결
  emit('close')
}
</script>

<template>
  <nav class="side-drawer" role="navigation" aria-label="사이드 메뉴">
    <!-- Top profile -->
    <div class="side-drawer__profile">
      <div class="side-drawer__avatar">
        <img
          src="/images/my/avatar.png"
          alt="내 프로필"
          class="side-drawer__avatar-img"
        />
      </div>
      <p class="side-drawer__handle">@boiled_egg</p>
    </div>

    <!-- Main menu -->
    <div class="side-drawer__menu">
      <button
        type="button"
        class="side-drawer__menu-item"
        aria-label="프로필"
        @click="handleProfile"
      >
        <span class="side-drawer__menu-icon" v-html="profileIcon" />
        <span class="side-drawer__menu-label">프로필</span>
      </button>

      <button
        type="button"
        class="side-drawer__menu-item"
        aria-label="모임"
        @click="handleMeeting"
      >
        <span class="side-drawer__menu-icon" v-html="meetingIcon" />
        <span class="side-drawer__menu-label">모임</span>
      </button>

      <button
        type="button"
        class="side-drawer__menu-item"
        aria-label="보관함"
        @click="handleArchive"
      >
        <span class="side-drawer__menu-icon" v-html="archiveIcon" />
        <span class="side-drawer__menu-label">보관함</span>
      </button>

      <button
        type="button"
        class="side-drawer__menu-item"
        aria-label="방문기록"
        @click="handleHistory"
      >
        <span class="side-drawer__menu-icon" v-html="historyIcon" />
        <span class="side-drawer__menu-label">방문기록</span>
      </button>
    </div>

    <!-- Bottom menu -->
    <div class="side-drawer__bottom">
      <button
        type="button"
        class="side-drawer__bottom-item"
        aria-label="설정"
        @click="handleSettings"
      >
        <span class="side-drawer__bottom-icon" v-html="settingsIcon" />
        <span class="side-drawer__bottom-label">설정</span>
      </button>

      <button
        type="button"
        class="side-drawer__bottom-item"
        aria-label="로그아웃"
        @click="handleLogout"
      >
        <span class="side-drawer__bottom-icon" v-html="logoutIcon" />
        <span class="side-drawer__bottom-label">로그아웃</span>
      </button>
    </div>
  </nav>
</template>

<style scoped>
/*
 * SideDrawer — Figma 1:538 actual
 *  width: 300px
 *  padding: 68px 30px 0
 *  gap profile -> menu: 80px
 *  menu item gap: 24px (between rows)
 *  menu icon: 32, label 24 / Medium
 *  bottom item gap: 34px
 *  bottom icon: 24, label 20 / Medium
 */
.side-drawer {
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 100%;
  padding: 68px 30px 0;
  background: #FFFFFF;
}

/* Profile (top): avatar 48 + handle 30 (top gap 18) */
.side-drawer__profile {
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  margin-bottom: 80px;
}

.side-drawer__avatar {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  overflow: hidden;
  flex-shrink: 0;
}

.side-drawer__avatar-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.side-drawer__handle {
  margin: 18px 0 0;
  font-size: 30px;
  font-weight: 600;
  line-height: 1;
  color: #000000;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Main menu: pushes bottom menu to screen bottom */
.side-drawer__menu {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex: 1;
}

.side-drawer__menu-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
}

.side-drawer__menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.side-drawer__menu-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.side-drawer__menu-label {
  font-size: 24px;
  font-weight: 500;
  line-height: 1;
  color: #191919;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Bottom: settings + logout */
.side-drawer__bottom {
  display: flex;
  flex-direction: column;
  gap: 34px;
  flex-shrink: 0;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.side-drawer__bottom-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
}

.side-drawer__bottom-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.side-drawer__bottom-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

.side-drawer__bottom-label {
  font-size: 20px;
  font-weight: 500;
  line-height: 1;
  color: #4D5160;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}
</style>
