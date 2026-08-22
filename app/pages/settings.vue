<script setup lang="ts">
import chevronIcon from '~/assets/icons/common/chevron-right.svg?raw'
import backIcon from '~/assets/icons/common/back.svg?raw'

// Settings data
const settings = ref({
  notifications: true,
  onlineStatus: false,
  chatNotifications: true,
})

// Navigation
const router = useRouter()
const goBack = () => router.back()
</script>

<template>
  <div class="settings-page">
    <!-- Header -->
    <header class="settings-header">
      <button class="settings-back-btn" @click="goBack" aria-label="뒤로 가기">
        <span v-html="backIcon" class="back-icon" />
      </button>
      <h1 class="settings-title">설정</h1>
      <div class="settings-placeholder" />
    </header>

    <!-- Settings Content -->
    <div class="settings-content">
      <!-- Notifications Section -->
      <section class="settings-section">
        <div class="settings-card">
          <div class="settings-row">
            <span class="settings-row-title">알림</span>
            <button
              class="toggle-switch"
              :class="{ 'toggle-switch--on': settings.notifications }"
              @click="settings.notifications = !settings.notifications"
              :aria-pressed="settings.notifications"
            >
              <span class="toggle-track">
                <span class="toggle-thumb" />
              </span>
            </button>
          </div>
          <div class="settings-row settings-row--last">
            <span class="settings-row-title">온라인 상태 표시</span>
            <button
              class="toggle-switch"
              :class="{ 'toggle-switch--on': settings.onlineStatus }"
              @click="settings.onlineStatus = !settings.onlineStatus"
              :aria-pressed="settings.onlineStatus"
            >
              <span class="toggle-track">
                <span class="toggle-thumb" />
              </span>
            </button>
          </div>
        </div>
      </section>

      <!-- Account Section -->
      <section class="settings-section">
        <div class="settings-card">
          <div class="settings-card-header">
            <span class="settings-card-title">계정</span>
          </div>
          <div class="settings-row">
            <span class="settings-row-title">연결된 계정</span>
            <span v-html="chevronIcon" class="row-chevron" />
          </div>
          <div class="settings-row settings-row--last">
            <span class="settings-row-title">비밀번호 · 로그인</span>
            <span v-html="chevronIcon" class="row-chevron" />
          </div>
        </div>
      </section>

      <!-- Service Section -->
      <section class="settings-section">
        <div class="settings-card">
          <div class="settings-card-header">
            <span class="settings-card-title">서비스 설정</span>
          </div>
          <div class="settings-row">
            <span class="settings-row-title">위치 서비스</span>
            <span class="row-value row-value--active">켜짐</span>
          </div>
          <div class="settings-row settings-row--last">
            <span class="settings-row-title">정확한 위치 공개</span>
            <span class="row-value row-value--active">팔로워만</span>
          </div>
        </div>
      </section>

      <!-- Chat Section -->
      <section class="settings-section">
        <div class="settings-card">
          <div class="settings-card-header">
            <span class="settings-card-title">채팅</span>
          </div>
          <div class="settings-row">
            <span class="settings-row-title">채팅 알림</span>
            <button
              class="toggle-switch"
              :class="{ 'toggle-switch--on': settings.chatNotifications }"
              @click="settings.chatNotifications = !settings.chatNotifications"
              :aria-pressed="settings.chatNotifications"
            >
              <span class="toggle-track">
                <span class="toggle-thumb" />
              </span>
            </button>
          </div>
          <div class="settings-row">
            <span class="settings-row-title">메시지를 보낼 수 있는 사람</span>
            <span class="row-value row-value--active">모두</span>
          </div>
          <div class="settings-row settings-row--last">
            <span class="settings-row-title">차단한 사용자</span>
            <span v-html="chevronIcon" class="row-chevron" />
          </div>
        </div>
      </section>

      <!-- Support Section -->
      <section class="settings-section">
        <div class="settings-card">
          <div class="settings-card-header">
            <span class="settings-card-title">고객지원</span>
          </div>
          <div class="settings-row">
            <span class="settings-row-title">약관 및 이용동의</span>
            <span v-html="chevronIcon" class="row-chevron" />
          </div>
          <div class="settings-row">
            <span class="settings-row-title">언어</span>
            <span class="row-value row-value--active">한국어</span>
          </div>
          <div class="settings-row settings-row--last">
            <span class="settings-row-title">버전정보</span>
            <span class="row-value row-value--muted">0.2.3</span>
          </div>
        </div>
      </section>

      <!-- Account Actions -->
      <section class="settings-section">
        <div class="settings-card">
          <button class="settings-action-btn settings-action-btn--logout">
            <span class="settings-action-title">로그아웃</span>
            <span v-html="chevronIcon" class="row-chevron" />
          </button>
          <button class="settings-action-btn settings-action-btn--withdraw">
            <span class="settings-action-title">회원탈퇴</span>
            <span v-html="chevronIcon" class="row-chevron" />
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #F3F4F6;
}

/* Header */
.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 50px;
  padding: 0 20px;
  background-color: #F3F4F6;
}

.settings-back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.back-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon :deep(svg) {
  width: 24px;
  height: auto;
}

.settings-title {
  font-size: 20px;
  font-weight: 500;
  color: #191919;
  letter-spacing: 0;
}

.settings-placeholder {
  width: 24px;
}

/* Content */
.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.settings-content::-webkit-scrollbar {
  display: none;
}

/* Section */
.settings-section {
  display: flex;
  flex-direction: column;
}

/* Card */
.settings-card {
  background-color: #FFFFFF;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Card Header (Section Title) */
.settings-card-header {
  margin-bottom: 0;
}

.settings-card-title {
  font-size: 18px;
  font-weight: 600;
  color: #191919;
}

/* Row */
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  padding: 0;
  border: none;
  background: transparent;
}

.settings-row-title {
  font-size: 16px;
  font-weight: 500;
  color: #4D5160;
  letter-spacing: 0.5px;
}

.settings-row--last {
  /* Last row in card - no additional styles needed for divider removal */
}

/* Chevron */
.row-chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.row-chevron :deep(svg) {
  width: 6px;
  height: 11px;
}

/* Row Value */
.row-value {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: -0.5px;
}

.row-value--active {
  color: #699DF9;
}

.row-value--muted {
  color: #9F9A9A;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  width: 51px;
  height: 31px;
  padding: 4px;
  border: none;
  border-radius: 999px;
  background-color: #4D5160;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.toggle-switch--on {
  background-color: #FF6940;
}

.toggle-track {
  display: block;
  width: 100%;
  height: 100%;
}

.toggle-thumb {
  display: block;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: #FFFFFF;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s ease;
}

.toggle-switch--on .toggle-thumb {
  transform: translateX(20px);
}

/* Action Buttons */
.settings-action-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 0;
}

.settings-action-title {
  font-size: 18px;
  font-weight: 500;
  color: #4D5160;
  letter-spacing: 0.5px;
}

/* Press feedback */
.settings-row:active,
.settings-action-btn:active {
  opacity: 0.7;
}
</style>
