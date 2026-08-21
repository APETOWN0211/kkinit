<script setup lang="ts">
import notificationIcon from '~/assets/icons/notification.svg?raw'

const activeTab = ref<'nearby' | 'following'>('nearby')

const setTab = (tab: 'nearby' | 'following') => {
  activeTab.value = tab
}
</script>

<template>
  <header class="home-header">
    <div class="header-left">
      <nav class="tab-group" aria-label="피드 탭">
        <button
          class="home-tab"
          :class="{ 'home-tab--active': activeTab === 'nearby' }"
          @click="setTab('nearby')"
        >
          <span class="home-tab__label">근처</span>
        </button>
        <button
          class="home-tab"
          :class="{ 'home-tab--active': activeTab === 'following' }"
          @click="setTab('following')"
        >
          <span class="home-tab__label">팔로잉</span>
        </button>
      </nav>
    </div>

    <div class="header-right">
      <NuxtLink to="/notifications" class="notification-button" aria-label="알림">
        <span class="notification-icon" v-html="notificationIcon" />
        <span class="notification-badge">1</span>
      </NuxtLink>
    </div>
  </header>
</template>

<style scoped>
.home-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px var(--page-padding);
  padding-top: calc(12px + env(safe-area-inset-top));
  background: var(--color-background);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
}

.tab-group {
  display: flex;
  gap: 18px;
}

.home-tab {
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.home-tab__label {
  position: relative;
  display: inline-block;
  font-size: 28px;
  font-weight: 500;
  color: var(--color-text-inactive);
  transition: color 0.2s ease;
}

.home-tab--active .home-tab__label {
  font-weight: 700;
  color: var(--color-text-primary);
}

.home-tab--active .home-tab__label::after {
  content: '';
  position: absolute;
  left: 0;
  top: calc(100% + 6px);
  width: 100%;
  height: 4px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
}

.header-right {
  display: flex;
  align-items: center;
}

.notification-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-icon-muted);
  text-decoration: none;
}

.notification-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-icon :deep(svg) {
  display: block;
  width: 32px;
  height: 32px;
}

.notification-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-on-primary);
  background: var(--color-primary);
  border-radius: var(--radius-full);
  line-height: 1;
}
</style>
