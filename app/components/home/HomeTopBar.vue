<script setup lang="ts">
import kkLeft from '~/assets/icons/home/kk-letter-left.svg?raw'
import kkRight from '~/assets/icons/home/kk-letter-right.svg?raw'
import kkChevron from '~/assets/icons/home/kk-chevron.svg?raw'
import notificationIcon from '~/assets/icons/home/notification.svg?raw'

/*
 * Home header — Figma node 3:170 › 3:269 "Frame 665".
 *
 *  - header frame  : 390 × 103
 *      = status bar 47 (OS 가 그림) + row 50 + 6 breathing room
 *  - row 3:270     : h 50, top 47, px 20, 좌 avatar / 중앙 KK / 우 notification
 *  - avatar 3:271  : 36 × 36, rounded full, x 20, y 47 + 7
 *  - KK    3:281   : KK wordmark 59.52 (27.884 + 3.7 gap + 27.922) + chevron 9 × 4
 *  - chevron       : 4 × 9 vector 를 -90° 회전 → 시각상 9 × 4
 *  - notif 3:292   : 32 × 32 (asset 안에 #FF6940 unread dot 포함)
 *
 * 좌우 버튼 폭과 무관하게 KK 가 항상 화면 정중앙에 오도록
 * 중앙 블록만 absolute 로 뺀다.
 *
 * Status bar(9:41 / signal / wifi / battery)은 OS 가 그리므로 만들지 않는다.
 * desktop preview 에서도 가짜 status bar 여백을 만들지 않고 env() 만 쓴다.
 */

const emit = defineEmits<{
  'avatar-click': []
}>()

const onAvatarClick = () => {
  emit('avatar-click')
}

/*
 * 현재 단계에서는 실제 dropdown 메뉴를 만들지 않는다.
 * Figma 3:170 에도 dropdown interaction 이 명시되어 있지 않으므로
 * press feedback 까지만 구현한다.
 */
const onKkDropdown = () => {}
</script>

<template>
  <header class="home-top-bar">
    <!-- Left: 내 프로필 avatar (Side Drawer toggle) -->
    <button
      type="button"
      class="home-top-bar__avatar"
      aria-label="사이드 메뉴 토글"
      @click.stop="onAvatarClick"
      @pointerdown.stop
    >
      <span class="home-top-bar__avatar-image">
        <img
          src="/images/home/header-avatar.png"
          alt="내 프로필"
        />
      </span>
    </button>

    <!-- Center: KK wordmark + chevron (viewport 정중앙 고정) -->
    <div class="home-top-bar__center">
      <button
        type="button"
        class="home-top-bar__kk"
        aria-label="끼닛 메뉴"
        @click="onKkDropdown"
      >
        <span class="home-top-bar__kk-pair">
          <span class="home-top-bar__kk-letter" v-html="kkLeft" />
          <span class="home-top-bar__kk-letter" v-html="kkRight" />
        </span>
        <span class="home-top-bar__kk-chevron" v-html="kkChevron" />
      </button>
    </div>

    <!-- Right: notification bell (unread dot 은 asset 에 포함) -->
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
 * Figma 3:269 = status bar 47 + row 50 + 6.
 * 실제 기기에서 status bar 높이는 env(safe-area-inset-top) 이므로 그것을 쓰고,
 * 그 아래 row 50 과 하단 여백 6 만 고정한다.
 */
.home-top-bar {
  position: sticky;
  top: 0;
  z-index: 10;

  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: calc(50px + 6px + env(safe-area-inset-top));
  padding-top: env(safe-area-inset-top);
  padding-left: var(--page-padding);
  padding-right: var(--page-padding);

  background: var(--color-background);
}

/* =========================
   Left avatar — 3:271
   -------------------------
   Figma 3:271: 이미지 36 × 36, stroke (outside) 4.
   stroke 까지 합친 외곽 = 40 × 40.
   흰 테두리는 asset 에 없으므로 CSS 레이어로 구현한다.
     - button (흰 원) : 40 × 40, background #FFFFFF, padding 2px
     - inner (이미지) : 36 × 36, border-radius 50% + overflow hidden
   ========================= */
.home-top-bar__avatar {
  position: relative;

  flex: 0 0 40px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;

  /* 흰 링 두께 = 2px (총 4px = Figma stroke outside 4) */
  padding: 2px;

  border: 0;
  border-radius: 50%;

  background: #FFFFFF;

  cursor: pointer;

  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease;
}

.home-top-bar__avatar:active {
  transform: scale(0.94);
}

.home-top-bar__avatar-image {
  display: block;

  /* 이미지 자체 크기 = 36 × 36 */
  width: 36px;
  height: 36px;

  border-radius: 50%;

  overflow: hidden;
}

/*
 * asset 은 정사각형이라 36px box 안에서 원형 마스크로 잘린다.
 * (border-radius 50% + overflow hidden)
 */
.home-top-bar__avatar-image img {
  display: block;
  width: 100%;
  height: 100%;

  object-fit: cover;
}

/* =========================
   Center (KK + chevron) — 3:281
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

  /* Figma: KK 59.52 → chevron 시작까지 8 */
  gap: 8px;

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
 * KK 두 글자: 27.884 + 3.7 + 27.922 = 59.52 (Figma Group 324).
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

/*
 * chevron: 원본 asset 은 6 × 11 이지만 Figma 3:291 은 9 × 4
 * (= 4 × 9 vector 를 -90° 회전). wrapper 를 9 × 4 로 잡고
 * inner 를 4 × 9 로 회전시켜 실제 크기를 맞춘다.
 */
.home-top-bar__kk-chevron {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 9px;
  height: 4px;

  flex-shrink: 0;
}

.home-top-bar__kk-chevron :deep(svg) {
  display: block;
  width: 4px;
  height: 9px;

  transform: rotate(-90deg);
}

/* =========================
   Right notification — 3:292 (32 × 32)
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
