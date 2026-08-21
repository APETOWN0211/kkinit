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
      :class="{
        'app-shell--notifications': isNotificationsPage,
        'app-shell--no-scroll': isNotificationsPage
      }"
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
  min-height: 100dvh;
  display: flex;
  justify-content: center;
}

.app-shell {
  width: 100%;
  max-width: 390px;
  min-height: 100dvh;
  background: var(--color-background);
  position: relative;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

/* .app-content is the scroll container: fills remaining height below header */
.app-content {
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Bottom nav takes space at the bottom */
.app-content--with-bottom-nav {
  padding-bottom: 0;
}

/* Notifications page: no external scroll, page handles its own scroll */
.app-content--no-scroll {
  overflow: hidden;
}

.app-shell--notifications {
  background: var(--color-notifications-background);
}

.app-shell--no-scroll {
  overflow: hidden;
}

/* Desktop preview */
@media (min-width: 768px) {
  .app-wrapper {
    align-items: flex-start;
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .app-shell {
    width: 390px;
    height: 844px;
    max-width: 390px;
    min-height: 844px;
    max-height: 844px;
    flex-shrink: 0;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    border-radius: 40px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* Same .app-content behavior on desktop */
  .app-content {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .app-content--with-bottom-nav {
    padding-bottom: 0;
  }
}

/* Very small screens - ensure full width */
@media (max-width: 389px) {
  .app-shell {
    max-width: 100%;
  }
}
</style>