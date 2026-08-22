<script setup lang="ts">
const route = useRoute()

const mainTabRoutes = [
  '/',
  '/explore',
  '/map',
  '/chat',
  '/my'
]

const showBottomNavigation = computed(() =>
  mainTabRoutes.includes(route.path)
)

const isNotificationsPage = computed(() =>
  route.path.startsWith('/notifications')
)
</script>

<template>
  <div class="app-wrapper">
    <div
      class="app-shell"
      :class="{ 'app-shell--notifications': isNotificationsPage }"
    >
      <NuxtRouteAnnouncer />
      <div
        class="app-content"
        :class="{
          'app-content--with-bottom-nav': showBottomNavigation,
          'app-content--no-scroll': isNotificationsPage
        }"
      >
        <NuxtPage />
      </div>
      <NavigationBottomNavigation v-if="showBottomNavigation" />
    </div>
  </div>
</template>

<style>
/* Mobile default */
.app-wrapper {
  width: 100%;
  height: 100dvh;
  min-height: 0;

  display: flex;
  justify-content: flex-start;

  overflow: hidden;
}

.app-shell {
  position: relative;

  display: flex;
  flex-direction: column;

  width: 100%;
  max-width: 390px;

  height: 100%;
  min-height: 0;

  background: var(--color-background);

  overflow: hidden;
}

/* .app-content is the scroll container for regular pages */
.app-content {
  position: relative;

  flex: 1 1 auto;
  min-height: 0;

  display: flex;
  flex-direction: column;

  overflow-x: hidden;
  overflow-y: auto;

  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.app-content::-webkit-scrollbar {
  display: none;
}

/* Bottom nav takes space at the bottom */
.app-content--with-bottom-nav {
  padding-bottom: 0;
}

/* Notifications page: disable app-content scroll */
.app-content--no-scroll {
  overflow-x: hidden !important;
  overflow-y: hidden !important;
}

.app-shell--notifications {
  background: var(--color-notifications-background);
}

/* Desktop preview */
@media (min-width: 768px) {
  html,
  body {
    overflow: auto;
  }

  .app-wrapper {
    width: 100%;
    height: auto;
    min-height: calc(844px + 40px);
    overflow: visible;
    justify-content: center;
  }

  .app-shell {
    width: 390px;
    height: 844px;
    max-width: 390px;
    min-height: 0;
    max-height: 844px;
    flex-shrink: 0;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    border-radius: 40px;
    overflow: hidden;
  }

  /* Same .app-content behavior on desktop */
  .app-content {
    position: relative;
    flex: 1 1 auto;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .app-content::-webkit-scrollbar {
    display: none;
  }

  .app-content--with-bottom-nav {
    padding-bottom: 0;
  }

  .app-content--no-scroll {
    overflow-x: hidden !important;
    overflow-y: hidden !important;
  }
}

/* Very small screens - ensure full width */
@media (max-width: 389px) {
  .app-shell {
    max-width: 100%;
  }
}
</style>