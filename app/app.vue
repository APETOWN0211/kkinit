<script setup lang="ts">
const route = useRoute()

// Route-specific theme colors
const themeColor = computed(() => {
  if (route.path === '/my') {
    return '#FF6940'
  }
  if (route.path.startsWith('/notifications')) {
    return '#F3F4F6'
  }
  return '#FAFAFA'
})

useHead({
  meta: [
    {
      name: 'theme-color',
      content: themeColor.value
    }
  ]
})

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

// Page transition state
const isTransitioning = ref(false)
const transitionDirection = ref<'forward' | 'back'>('forward')
const isTabSwitch = ref(false)

// Track navigation for transitions
const router = useRouter()
let lastPath = route.path

router.afterEach((to, from) => {
  const toDepth = to.path.split('/').filter(Boolean).length
  const fromDepth = from.path.split('/').filter(Boolean).length

  // Check if moving between main tabs
  const fromIsTab = mainTabRoutes.includes(from.path)
  const toIsTab = mainTabRoutes.includes(to.path)
  isTabSwitch.value = fromIsTab && toIsTab && from.path !== to.path

  if (toDepth > fromDepth || (toDepth === fromDepth && to.path !== lastPath)) {
    transitionDirection.value = 'forward'
  } else {
    transitionDirection.value = 'back'
  }

  lastPath = to.path
})

// Page transition props for NuxtPage
const pageTransition = computed(() => ({
  name: isTabSwitch.value ? 'tab-fade' : 'page-slide',
  mode: 'out-in',
  onBeforeEnter: () => {
    isTransitioning.value = true
  },
  onAfterEnter: () => {
    isTransitioning.value = false
  },
  onBeforeLeave: () => {
    isTransitioning.value = true
  },
  onAfterLeave: () => {
    isTransitioning.value = false
  }
}))
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
        <NuxtPage :transition="pageTransition" />
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

/* ========================================
   Page Transition Styles
   ======================================== */

/* Tab switch - fade only (between main nav tabs) */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
}

/* Page slide - hierarchical navigation */
.page-slide-enter-active {
  transition: opacity 280ms cubic-bezier(0.22, 1, 0.36, 1),
              transform 280ms cubic-bezier(0.22, 1, 0.36, 1);
}

.page-slide-leave-active {
  transition: opacity 220ms cubic-bezier(0.22, 1, 0.36, 1),
              transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.page-slide-enter-from {
  opacity: 0;
  transform: translate3d(16px, 0, 0);
}

.page-slide-leave-to {
  opacity: 0;
  transform: translate3d(-8px, 0, 0);
}

/* Desktop preview */
@media (min-width: 768px) {
  html,
  body {
    overflow: auto;
  }

  .app-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    min-height: 100vh;
    overflow: visible;
    background: var(--color-text-secondary);
  }

  .app-shell {
    width: 390px;
    height: 844px;
    max-width: 390px;
    max-height: 844px;
    flex-shrink: 0;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
    border-radius: 0;
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

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  .tab-fade-enter-active,
  .tab-fade-leave-active,
  .page-slide-enter-active,
  .page-slide-leave-active {
    transition: none;
    transform: none;
  }

  .tab-fade-enter-from,
  .tab-fade-leave-to,
  .page-slide-enter-from,
  .page-slide-leave-to {
    opacity: 1;
    transform: none;
  }
}
</style>