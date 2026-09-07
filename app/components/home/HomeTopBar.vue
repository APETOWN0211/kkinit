<script setup lang="ts">
import kkLeft from '~/assets/icons/home/kk-letter-left.svg?raw'
import kkRight from '~/assets/icons/home/kk-letter-right.svg?raw'
import kkChevron from '~/assets/icons/home/kk-chevron.svg?raw'
import notificationIcon from '~/assets/icons/home/notification.svg?raw'

const emit = defineEmits<{
  'avatar-click': []
}>()

const onAvatarClick = () => {
  emit('avatar-click')
}

const onKkDropdown = () => {
  /*
   * 현재 단계에서는 실제 dropdown 메뉴를 만들지 않는다.
   * Figma 41:1897 에서 dropdown interaction 이 따로 명시되어 있지 않으므로
   * press feedback 까지만 구현한다.
   */
}

const goToNotifications = () => {
  router.push('/notifications')
}
</script>

<template>
  <header class="home-top-bar">
    <!-- Left: 내 프로필 avatar (drawer toggle) -->
    <button
      type="button"
      class="home-top-bar__avatar"
      aria-label="사이드 메뉴 토글"
      @click.stop="onAvatarClick"
      @pointerdown.stop
    >
      <span class="home-top-bar__avatar-image">
        <img
          src="/images/my/avatar.png"
          alt="내 프로필"
        />
      </span>
    </button>

    <!-- Center: KK + chevron (실제 화면 중앙) -->
    <div class="home-top-bar__center">
      <button
        type="button"
        class="home-top-bar__kk"
        aria-label="끼닛 메뉴"
        @click="onKkDropdown"
      >
        <!--
          Figma 41:1897 의 KK 로고는
          두 개의 동일 K 글자 vector 를 가로로 나란히 배치.
          width 27.88 × 2 + gap ≈ 63.6.
        -->
        <span class="home-top-bar__kk-pair">
          <span class="home-top-bar__kk-letter" v-html="kkLeft" />
          <span class="home-top-bar__kk-letter" v-html="kkRight" />
        </span>
        <span class="home-top-bar__kk-chevron" v-html="kkChevron" />
      </button>
    </div>

    <!-- Right: notification bell -->
    <NuxtLink
      to="/notifications"
      class="home-top-bar__notif"
      aria-label="알림"
    >
      <span class="home-top-bar__notif-icon" v-html="notificationIcon" />
    </NuxtLink>
  </header>
</template>

<style scoped>
/*
 * Home Top Bar
 *  - Figma 41:1897 (헤더 frame): w 390 × h 103
 *  - 내부 row: h 50 (top 47), padding 0 20
 *  - 좌: avatar 36×36
 *  - 중: KK 로고 두 글자 ≈ 63.6 × 28 + chevron 9×4 (rotated -90)
 *  - 우: notification 32×32 + unread dot
 *
 *  실제 iPhone/PWA safe-area-inset-top 만큼 위쪽 여백을 그대로 사용.
 *  Desktop preview 에서는 env() 이 0 이라 추가 47px 같은 가짜 status bar
 *  영역을 만들지 않는다.
 */
.home-top-bar {
  position: sticky;
  top: 0;
  z-index: 10;

  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: calc(50px + env(safe-area-inset-top));
  padding-top: env(safe-area-inset-top);
  padding-left: var(--page-padding);
  padding-right: var(--page-padding);

  background: var(--color-background);
}

/* =========================
   Left avatar
   ========================= */
.home-top-bar__avatar {
  position: relative;

  flex: 0 0 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 36px;
  height: 36px;

  padding: 0;

  border: 0;
  border-radius: 50%;

  background: transparent;

  cursor: pointer;

  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease;
}

.home-top-bar__avatar:active {
  transform: scale(0.94);
}

.home-top-bar__avatar-image {
  display: block;

  width: 36px;
  height: 36px;

  border-radius: 50%;

  overflow: hidden;
}

.home-top-bar__avatar-image img {
  display: block;
  width: 100%;
  height: 100%;

  object-fit: cover;
}

/* =========================
   Center (KK + chevron)
   ========================= */
.home-top-bar__center {
  position: absolute;
  left: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  transform: translateX(-50%);
}

.home-top-bar__kk {
  display: flex;
  align-items: center;
  gap: 6px;

  padding: 6px 8px;

  border: 0;
  border-radius: 999px;

  background: transparent;

  cursor: pointer;

  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, opacity 120ms ease;
}

.home-top-bar__kk:active {
  transform: scale(0.94);
  opacity: 0.85;
}

/*
 * KK 두 글자.
 *  - Figma 에서는 두 K vector 사이 gap 3.7px (ml 31.6 - 27.88).
 *  - 두 span 모두 width 28, height 28.
 */
.home-top-bar__kk-pair {
  display: inline-flex;
  align-items: center;

  height: 28px;
}

.home-top-bar__kk-letter {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 28px;
  height: 28px;

  flex-shrink: 0;
}

.home-top-bar__kk-letter + .home-top-bar__kk-letter {
  margin-left: 3.7px;
}

.home-top-bar__kk-letter :deep(svg) {
  display: block;
  width: 28px;
  height: 28px;
}

.home-top-bar__kk-chevron {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 6px;
  height: 11px;

  margin-left: 4px;

  transform: rotate(-90deg);

  color: var(--color-icon-muted);
}

.home-top-bar__kk-chevron :deep(svg) {
  display: block;
  width: 6px;
  height: 11px;
}

/* =========================
   Right notification
   ========================= */
.home-top-bar__notif {
  position: relative;

  flex: 0 0 32px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;

  padding: 0;

  background: transparent;

  text-decoration: none;

  cursor: pointer;

  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease;
}

.home-top-bar__notif:active {
  transform: scale(0.94);
}

.home-top-bar__notif-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;
}

.home-top-bar__notif-icon :deep(svg) {
  display: block;
  width: 32px;
  height: 32px;
}
</style>