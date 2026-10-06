<script setup lang="ts">
/*
 * Home Side Drawer
 * Figma node 16:301 (마이탭 - 메인) actual values
 *
 * Layout:
 *   - drawer width : 300px
 *   - padding      : 68px top/bottom, 30px left/right
 *   - profile area : top inner flex column gap 20 (avatar 48 -> handle 30 -> stats 18)
 *   - avatar        : 48 x 48, rounded full
 *   - handle        : @boiled_egg, SemiBold 30, #191919
 *   - stats         : 팔로워 701 · 팔로잉 142, Medium 18, #73787e, dot separator 3x3
 *   - top inner -> main menu : space-between (top block height 221, justify-between)
 *   - main menu     : 4 items, item gap 24px, icon 32x32, label 24 Medium #191919
 *   - bottom menu   : 2 items, item gap 34px, icon 24x24, label 20 Medium #4D5160
 *   - main menu <-> bottom : justify-between (drawer height 844, content 708)
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
  // 모임 라우트 결정 시 router.push('/meetings') 등
}

const handleArchive = () => {
  emit('close')
  router.push('/archive')
}

const handleHistory = () => {
  emit('close')
  // 방문기록 라우트
}

const handleSettings = () => {
  emit('close')
  router.push('/settings')
}

const handleLogout = () => {
  // 실제 auth logout 연결
  emit('close')
}
</script>

<template>
  <nav class="side-drawer" role="navigation" aria-label="사이드 메뉴">
    <!--
      Figma 16:303 (top block, height 221)
      flex column justify-between
        - 16:304 (top inner, flex col gap 20)
            - avatar 48
            - @boiled_egg SemiBold 30 #191919
            - 팔로워 701 · 팔로잉 142 (Medium 18 #73787e)
        - 16:311 (menu block) - menu 시작 위치
    -->
    <div class="side-drawer__top">
      <!--
        Figma 16:304 (top inner, profile)
        flex col gap 20
          - avatar 48 x 48 (button → /my)
          - @boiled_egg SemiBold 30 #191919
          - 팔로워 701 · 팔로잉 142 (Medium 18 #73787e)
      -->
      <div class="side-drawer__profile">
        <button
          type="button"
          class="side-drawer__profile-button"
          aria-label="프로필 화면으로 이동"
          @click="handleProfile"
        >
          <div class="side-drawer__avatar">
            <img
              src="/images/my/avatar.png"
              alt="내 프로필"
              class="side-drawer__avatar-img"
            />
          </div>
        </button>
        <p class="side-drawer__handle">@boiled_egg</p>
        <div class="side-drawer__stats" aria-label="팔로워/팔로잉">
          <span class="side-drawer__stats-item">팔로워 701</span>
          <span class="side-drawer__stats-dot" aria-hidden="true" />
          <span class="side-drawer__stats-item">팔로잉 142</span>
        </div>
      </div>

      <!--
        Figma 16:311 (menu block) - 16:303 안에서 justify-between 으로
        16:304 아래쪽 끝에 배치되며, 실제 menu items (16:312) 는
        absolute left 0 top 0 으로 menu block 의 시작부터 펼쳐진다.
      -->
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
    </div>

    <!--
      Figma 16:330 (bottom block, flex col gap 34)
      drawer 의 justify-between 으로 화면 하단에 위치.
    -->
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
 * SideDrawer — Figma 16:301 actual
 *  width: 300px
 *  height: 844px (full app height)
 *  padding: 68px (top/bottom) 30px (left/right)
 *  background: #FFFFFF
 *  layout: flex column justify-between
 *    - top block (profile + main menu) — Figma 16:303 (height 221)
 *    - bottom block (settings + logout) — Figma 16:330 (flex col gap 34)
 */
.side-drawer {
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  width: 100%;
  height: 100%;
  padding: 68px 30px calc(68px + env(safe-area-inset-bottom, 0px));

  background: #FFFFFF;
  box-sizing: border-box;
}

/*
 * Top block — Figma 16:303
 *  height: 221px
 *  flex column, gap 42
 *    - top inner (profile) — 16:304, flex col gap 20
 *    - main menu          — 16:311, flex col gap 24
 */
.side-drawer__top {
  display: flex;
  flex-direction: column;
  gap: 42px;
  flex: 0 0 auto;
}

/*
 * Profile (top inner) — Figma 16:304
 *  flex col gap 20
 *    - avatar 48 x 48 (button → /my)
 *    - handle SemiBold 30 #191919
 *    - stats (Medium 18 #73787e)
 */
.side-drawer__profile {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;
}

/*
 * Profile avatar button (Figma 16:305)
 * avatar 자체 (48x48) 만 clickable, 누르면 /my 로 이동.
 * button의 default style 제거.
 */
.side-drawer__profile-button {
  display: block;
  width: 48px;
  height: 48px;
  padding: 0;
  margin: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
  transition: transform 120ms ease, opacity 120ms ease;
}

.side-drawer__profile-button:active {
  transform: scale(0.94);
  opacity: 0.85;
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
  margin: 0;
  font-size: 30px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.43px;
  color: #191919;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

/*
 * Stats — Figma 16:307
 *  flex row gap 8, items center
 *    - 팔로워 701 (Medium 18 #73787e)
 *    - separator dot 3 x 3
 *    - 팔로잉 142 (Medium 18 #73787e)
 */
.side-drawer__stats {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.side-drawer__stats-item {
  font-size: 18px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -0.43px;
  color: #73787e;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: nowrap;
}

.side-drawer__stats-dot {
  display: block;
  width: 3px;
  height: 3px;
  border-radius: 999px;
  background: #73787e;
  flex-shrink: 0;
}

/*
 * Main menu — Figma 16:311 / 16:312
 *  flex col, gap 24
 *  item: flex row gap 16, items center
 *    - icon 32 x 32
 *    - label Medium 24 #191919
 */
.side-drawer__menu {
  display: flex;
  flex-direction: column;
  gap: 24px;
  flex-shrink: 0;
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
  letter-spacing: -0.43px;
  color: #191919;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: nowrap;
}

/*
 * Bottom — Figma 16:330
 *  flex col, gap 34
 *  item: flex row gap 16, items center
 *    - icon 24 x 24 (color baked-in #4D5160 in asset)
 *    - label Medium 20 #4D5160
 */
.side-drawer__bottom {
  display: flex;
  flex-direction: column;
  gap: 34px;
  flex-shrink: 0;
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
  letter-spacing: -0.43px;
  color: #4D5160;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: nowrap;
}
</style>
