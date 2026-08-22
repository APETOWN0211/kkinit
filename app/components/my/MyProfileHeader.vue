<script setup lang="ts">
import gearIcon from '~/assets/icons/feed/gear.svg?raw'
import shareIcon from '~/assets/icons/feed/share.svg?raw'

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'share'): void
  (e: 'settings'): void
}>()

const onEdit = () => emit('edit')
const onShare = () => emit('share')
const onSettings = () => emit('settings')
</script>

<template>
  <header class="my-profile">
    <!-- Orange Cover -->
    <div class="my-profile-cover">
      <button
        type="button"
        class="my-profile-settings"
        aria-label="설정"
        @click="onSettings"
      >
        <span
          class="my-profile-settings__icon"
          v-html="gearIcon"
        />
      </button>
    </div>

    <!-- White Profile Content -->
    <div class="my-profile-content">
      <!-- Avatar -->
      <div class="my-profile-avatar">
        <img
          src="/images/my/avatar.png"
          alt="닮은살걀 프로필"
          class="my-profile-avatar__image"
        />
      </div>

      <!-- Stats -->
      <div class="my-profile-stats">
        <div class="my-profile-stat">
          <strong class="my-profile-stat__value">10</strong>
          <span class="my-profile-stat__label">게시글</span>
        </div>

        <div class="my-profile-stat">
          <strong class="my-profile-stat__value">209</strong>
          <span class="my-profile-stat__label">팔로워</span>
        </div>

        <div class="my-profile-stat">
          <strong class="my-profile-stat__value">51</strong>
          <span class="my-profile-stat__label">팔로잉</span>
        </div>
      </div>

      <!-- Profile Text -->
      <div class="my-profile-text">
        <h2 class="my-profile-nickname">
          닮은살걀
        </h2>

        <div class="my-profile-bio">
          <p>맛집 탐방을 좋아하는 30대 직장인 😋</p>
          <p>좋은 사람들과 나누는 걸 더 좋아해요.</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="my-profile-actions">
        <button
          type="button"
          class="my-profile-btn my-profile-btn--edit"
          @click="onEdit"
        >
          프로필 편집
        </button>

        <button
          type="button"
          class="my-profile-btn my-profile-btn--share"
          aria-label="공유"
          @click="onShare"
        >
          <span
            class="my-profile-btn__icon"
            v-html="shareIcon"
          />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.my-profile {
  position: relative;

  width: 100%;

  background: #ffffff;
}

/* =========================
   Orange Cover
   ========================= */

.my-profile-cover {
  position: relative;

  width: 100%;
  height: 100px;

  background: var(--color-chip-orange, #ff6940);
}

/* =========================
   Settings
   ========================= */

.my-profile-settings {
  position: absolute;

  top: 10px;
  right: 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 44px;
  height: 44px;

  padding: 0;

  border: 0;
  border-radius: 18px;

  background: #ffffff;

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.09);

  cursor: pointer;

  transition:
    transform 120ms ease,
    opacity 120ms ease;
}

.my-profile-settings:active {
  transform: scale(0.95);
  opacity: 0.88;
}

.my-profile-settings__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;

  color: #4d5160;
}

.my-profile-settings__icon :deep(svg) {
  display: block;

  width: 24px;
  height: 24px;
}

/* =========================
   White Content
   ========================= */

.my-profile-content {
  position: relative;
  z-index: 1;

  width: 100%;

  padding:
    0
    var(--page-padding, 20px)
    12px;

  background: #fafafa;
}

/* =========================
   Avatar
   ========================= */

.my-profile-avatar {
  position: absolute;
  z-index: 2;

  top: -32px;
  left: 20px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 82px;
  height: 82px;

  border-radius: 50%;

  overflow: hidden;

  /*
    기존 흰색 원형 backdrop 제거.
    프로필 이미지 자체에 4px 흰색 outline만 적용.
  */
  box-shadow: 0 0 0 8px #fafafa;
}

.my-profile-avatar__image {
  display: block;

  width: 100%;
  height: 100%;

  border-radius: 50%;

  object-fit: cover;
}

/* =========================
   Stats
   ========================= */

.my-profile-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  /*
    Avatar 영역을 비우고
    오른쪽에서 stats 시작
  */
  margin-left: 108px;

  /*
    avatar bottom = 40px
    stats 영역 bottom = 52px
    nickname margin-top = 12px
    nickname top = 64px

    따라서:
    avatar bottom → nickname = 24px
  */
  min-height: 52px;

  padding-top: 14px;
}

.my-profile-stat {
  display: flex;
  flex-direction: column;

  /* 숫자 / 라벨 좌정렬 */
  align-items: flex-start;

  min-width: 0;
}

.my-profile-stat__value {
  display: block;

  margin: 0;

  font-size: 24px;
  font-weight: 600;
  line-height: 1;

  color: #191919;
}

.my-profile-stat__label {
  display: block;

  /*
    숫자 ↔ 게시글/팔로워/팔로잉
    정확히 2px
  */
  margin-top: 6px;

  font-size: 16px;
  font-weight: 500;
  line-height: 1;

  color: #4d5160;

  white-space: nowrap;
}

/* =========================
   Nickname / Bio
   ========================= */

.my-profile-text {
  display: flex;
  flex-direction: column;

  /*
    Stats 영역 ↔ 닉네임
    정확히 12px
  */
  margin-top: 12px;
}

.my-profile-nickname {
  margin: 0;

  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;

  letter-spacing: -0.5px;

  color: #191919;
}

.my-profile-bio {
  display: flex;
  flex-direction: column;

  gap: 3px;

  margin-top: 10px;

  font-size: 15px;
  font-weight: 500;
  line-height: 1.45;

  letter-spacing: -0.2px;

  color: #191919;
}

.my-profile-bio p {
  margin: 0;
}

/* =========================
   Actions
   ========================= */

.my-profile-actions {
  display: flex;
  align-items: center;

  gap: 10px;

  margin-top: 12px;
}

.my-profile-btn {
  display: flex;
  align-items: center;
  justify-content: center;

  height: 40px;

  padding: 0;

  border: 0;

  background: #e9e9e9;
  color: #191919;

  font: inherit;

  cursor: pointer;

  transition:
    transform 110ms ease,
    opacity 110ms ease;
}

.my-profile-btn:active {
  transform: scale(0.97);
  opacity: 0.88;
}

.my-profile-btn--edit {
  min-width: 126px;

  padding: 0 22px;

  border-radius: 12px;

  font-size: 16px;
  font-weight: 500;
  line-height: 1;
}

.my-profile-btn--share {
  flex: 0 0 40px;

  width: 40px;
  height: 40px;

  border-radius: 50%;
}

.my-profile-btn__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 22px;
  height: auto;

  color: #4d5160;
}

.my-profile-btn__icon :deep(svg) {
  display: block;

  width: 22px;
  height: 22px;
}

/* =========================
   Reduced Motion
   ========================= */

@media (prefers-reduced-motion: reduce) {
  .my-profile-settings,
  .my-profile-btn {
    transition: none;
  }
}
</style>