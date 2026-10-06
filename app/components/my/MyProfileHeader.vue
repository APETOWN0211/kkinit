<script setup lang="ts">
import backIcon from '~/assets/icons/my/back.svg?raw'
import moreIcon from '~/assets/icons/my/more.svg?raw'

const router = useRouter()

const onBack = () => {
  if (import.meta.client) {
    router.back()
  }
}

const onMore = () => {
  // Press feedback only — actual menu implementation out of scope.
}
</script>

<template>
  <header class="my-profile">
    <!--
      Figma 18:631 / 18:750 / 18:905
        top: 47, h: 50, px: 20, py: 3, justify-between
        - left  : back 44x44 white circle + shadow
        - right : more 44x44 white circle + shadow
      Note: top: 47 is for an iPhone whose status bar height = 47. Project
      treats safe-area via the existing wrapper; we use the same value Figma
      shows so the top bar lines up with the avatar and profile text below.
    -->
    <div class="my-profile__topbar">
      <button
        type="button"
        class="my-profile__icon-button"
        aria-label="뒤로 가기"
        @click="onBack"
      >
        <span class="my-profile__icon" v-html="backIcon" />
      </button>
      <button
        type="button"
        class="my-profile__icon-button"
        aria-label="더보기"
        @click="onMore"
      >
        <span class="my-profile__icon" v-html="moreIcon" />
      </button>
    </div>

    <!--
      Figma 18:554 / 18:637 / 18:759 (Profile header)
        top: 96, h: 163, pt: 10, px: 20
        - 18:555 flex col gap 6
            - 18:556 row justify-between
                - left  (18:557) col gap 4 (w 111)
                    - 닉네임 24 Bold #191919
                    - 핸들   16 Medium #73787E
                - right (18:560 / 18:643) 68x68 circular avatar
            - 18:562 bio 15 Medium #191919 line-height 1.6
        - 18:563 row gap 8 (followers/following)
            - Regular 16 #73787E
            - separator dot 3x3
    -->
    <div class="my-profile__info">
      <div class="my-profile__info-top">
        <div class="my-profile__text">
          <p class="my-profile__name">닮은살걀</p>
          <p class="my-profile__handle">@boiled_egg</p>
        </div>
        <div class="my-profile__avatar">
          <img
            src="/images/my/avatar.png"
            alt="내 프로필"
            class="my-profile__avatar-img"
          />
        </div>
      </div>
      <p class="my-profile__bio">
        맛있는 음식만 먹고싶은<br />
        고등학생
      </p>
    </div>

    <div class="my-profile__stats">
      <span class="my-profile__stats-item">팔로워 701</span>
      <span class="my-profile__stats-dot" aria-hidden="true" />
      <span class="my-profile__stats-item">팔로잉 142</span>
    </div>
  </header>
</template>

<style scoped>
/*
 * My profile header — Figma 18:553 / 18:636 / 18:758 (Profile area).
 *  - top bar  : top 47, h 50, px 20, py 3
 *  - info gap : name-row ↔ bio = 6px
 *  - bio ↔ stats = 12px
 *  - stats ↔ 프로필 편집 (다음 컴포넌트) = 20px
 *  - name 24 Bold #191919
 *  - handle 16 Medium #73787E
 *  - bio 15 Medium #191919 line-height 1.6 (2-line break)
 *  - avatar 68x68 circle
 *  - stats 16 Regular #73787E, separator dot 3x3
 */
.my-profile {
  position: relative;

  display: flex;
  flex-direction: column;

  width: 100%;

  background: #ffffff;
}

/* =========================================
   Top bar (back / more)
   ========================================= */
.my-profile__topbar {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: 50px;
  padding: 3px 20px;
}

.my-profile__icon-button {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 44px;
  height: 44px;
  padding: 0;

  border: 0;
  border-radius: 999px;

  background: #ffffff;
  box-shadow: 0 2.316px 8.916px rgba(0, 0, 0, 0.09);

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, opacity 120ms ease;
}

.my-profile__icon-button:active {
  transform: scale(0.94);
  opacity: 0.85;
}

.my-profile__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 26px;
  height: 26px;

  color: #73787e;
}

.my-profile__icon :deep(svg) {
  display: block;
  width: 26px;
  height: 26px;
}

/* =========================================
   Profile info (name / handle / bio / avatar)
   ========================================= */
.my-profile__info {
  display: flex;
  flex-direction: column;
  gap: 6px;

  width: 100%;
  padding: 10px 20px 0;
  box-sizing: border-box;
}

.my-profile__info-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;
}

.my-profile__text {
  display: flex;
  flex-direction: column;
  gap: 4px;

  width: 111px;
  flex-shrink: 0;
}

.my-profile__name {
  margin: 0;

  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.5px;

  color: #191919;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

.my-profile__handle {
  margin: 0;

  font-size: 16px;
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: -0.3px;

  color: #73787e;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

.my-profile__avatar {
  flex-shrink: 0;

  width: 68px;
  height: 68px;

  border-radius: 999px;
  overflow: hidden;

  background: #f5f6f8;
}

.my-profile__avatar-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.my-profile__bio {
  margin: 0;

  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  letter-spacing: -0.3px;

  color: #191919;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* =========================================
   Followers / Following stats
   bio 와의 거리는 12px (Figma 18:553/636/758).
   ========================================= */
.my-profile__stats {
  display: flex;
  align-items: center;
  gap: 8px;

  width: 100%;
  margin-top: 12px;
  padding: 0 20px;
  box-sizing: border-box;
}

.my-profile__stats-item {
  font-size: 16px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: -0.3px;

  color: #73787e;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: nowrap;
}

.my-profile__stats-dot {
  display: block;
  width: 3px;
  height: 3px;
  border-radius: 999px;
  background: #73787e;
  flex-shrink: 0;
}

/* =========================================
   Reduced motion
   ========================================= */
@media (prefers-reduced-motion: reduce) {
  .my-profile__icon-button {
    transition: none;
  }
}
</style>
