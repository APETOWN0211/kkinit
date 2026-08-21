<script setup lang="ts">
import backIcon from '~/assets/icons/common/back.svg?raw'
import badgeUnlockIcon from '~/assets/icons/notifications/badge-unlock.svg?raw'
import noticeIcon from '~/assets/icons/notifications/notice.svg?raw'
import signUpIcon from '~/assets/icons/notifications/sign_up.svg?raw'
import chevronRightIcon from '~/assets/icons/common/chevron-right.svg?raw'

const router = useRouter()

useHead({
  meta: [
    {
      name: 'theme-color',
      content: '#F3F4F6'
    }
  ]
})

const goBack = () => {
  router.back()
}
</script>

<template>
  <div class="notifications-page">
    <header class="notifications-header">
      <button
        class="back-button"
        type="button"
        aria-label="뒤로 가기"
        @click="goBack"
      >
        <span
          class="back-icon"
          v-html="backIcon"
        />
      </button>

      <h1 class="header-title">
        알림
      </h1>

      <div class="header-right" />
    </header>

    <div class="notifications-scroll-area">
      <div class="notifications-list">
        <!-- 첫 번째 알림: 배지 잠금 해제 -->
        <div class="notification-card">
          <span class="unread-dot" />

          <div class="notification-main">
            <div class="notification-icon">
              <span
                class="badge-icon"
                v-html="badgeUnlockIcon"
              />
            </div>

            <div class="notification-content">
              <div class="notification-meta">
                <span class="notification-title">
                  배지 잠금 해제!
                </span>

                <span class="notification-time">
                  1일 전
                </span>
              </div>

              <p class="notification-message">
                '야식 출동' 배지를 받았어요.
              </p>
            </div>
          </div>

          <button
            type="button"
            class="notification-detail"
          >
            <span class="detail-text">
              자세히 보기
            </span>

            <span
              class="detail-icon"
              v-html="chevronRightIcon"
            />
          </button>
        </div>

        <!-- 두 번째 알림: 로그인 알림 -->
        <div class="notification-card">
          <div class="notification-main">
            <div class="notification-icon">
              <span
                class="badge-icon"
                v-html="noticeIcon"
              />
            </div>

            <div class="notification-content">
              <div class="notification-meta">
                <span class="notification-title">
                  새로운 기기에서 로그인 되었어요.
                </span>

                <span class="notification-time">
                  4일 전
                </span>
              </div>

              <p class="notification-message">
                이전 기기에서는 로그아웃 됩니다.
              </p>
            </div>
          </div>
        </div>

        <!-- 세 번째 알림: 회원가입 완료 -->
        <div class="notification-card">
          <div class="notification-main">
            <div class="notification-icon">
              <span
                class="badge-icon"
                v-html="signUpIcon"
              />
            </div>

            <div class="notification-content">
              <div class="notification-meta">
                <span class="notification-title">
                  회원가입이 완료되었어요.
                </span>

                <span class="notification-time">
                  7일 전
                </span>
              </div>

              <p class="notification-message">
                닮은살걀님, 가입을 축하해요!
              </p>
            </div>
          </div>

          <div class="notification-action">
            <NuxtLink
              to="/"
              class="action-link"
            >
              <span class="detail-text">
                홈으로
              </span>

              <span
                class="detail-icon"
                v-html="chevronRightIcon"
              />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Page container */
.notifications-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--color-notifications-background);
}

/* Header: fixed outside scroll flow */
.notifications-header {
  flex-shrink: 0;
  z-index: 10;

  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;

  padding: 13px var(--page-padding);
  padding-top: calc(13px + env(safe-area-inset-top));

  background: var(--color-notifications-background);
}

.back-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;

  width: fit-content;

  margin: 0;
  padding: 0;

  border: none;
  background: transparent;

  color: var(--color-text-secondary);

  cursor: pointer;
}

.back-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon :deep(svg) {
  display: block;

  width: 27px;
  height: 24px;
}

.header-title {
  margin: 0;

  color: var(--color-text-primary);

  font-size: 20px;
  font-weight: 500;
  line-height: 1.2;
  text-align: center;
}

.header-right {
  width: 100%;
}

/* Scroll area: fills remaining space below header */
.notifications-scroll-area {
  position: absolute;
  top: calc(26px + env(safe-area-inset-top));
  right: 0;
  bottom: 0;
  left: 0;

  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

/* Notification List */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  width: 100%;

  padding: 16px var(--page-padding) 20px;
}

/* Notification Card */
.notification-card {
  position: relative;

  width: 100%;

  padding: 20px;

  background: #FFFFFF;

  border-radius: var(--radius-lg);
}

.unread-dot {
  position: absolute;

  top: 10px;
  right: 10px;

  width: 8px;
  height: 8px;

  background: var(--color-primary);

  border-radius: var(--radius-full);
}

/* Main */
.notification-main {
  display: flex;
  align-items: flex-start;
  gap: 14px;
}

.notification-icon {
  flex: 0 0 28px;

  width: 28px;
  height: 28px;
}

.badge-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 28px;
  height: 28px;
}

.badge-icon :deep(svg) {
  display: block;

  width: 28px;
  height: 28px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  width: 100%;
}

.notification-title {
  min-width: 0;

  color: var(--color-text-secondary);

  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
}

.notification-time {
  flex-shrink: 0;

  color: var(--color-text-muted);

  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
}

.notification-message {
  margin: 4px 0 0;

  color: var(--color-text-primary);

  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
}

/* Detail / Action */
.notification-detail {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;

  width: fit-content;

  margin: 16px 0 0 auto;
  padding: 0;

  border: none;
  background: transparent;

  font: inherit;

  cursor: pointer;
}

.notification-action {
  display: flex;
  justify-content: flex-end;

  width: 100%;

  margin-top: 16px;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  color: var(--color-text-secondary);

  text-decoration: none;
}

.detail-text {
  color: var(--color-text-secondary);

  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
}

.detail-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  color: var(--color-text-secondary);
}

.detail-icon :deep(svg) {
  display: block;

  width: 6px;
  height: 11px;
}
</style>