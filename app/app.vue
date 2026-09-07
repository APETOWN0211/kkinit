<script setup lang="ts">
import SideDrawer from '~/components/navigation/SideDrawer.vue'

const route = useRoute()

/*
 * Route-specific theme colors.
 */
const themeColor = computed(() => {
  if (route.path === '/') {
    return '#FFFFFF'
  }
  if (route.path === '/my') {
    return '#FF6940'
  }
  if (route.path.startsWith('/notifications')) {
    return '#F3F4F6'
  }
  return '#FAFAFA'
})

// Update theme-color when route changes
watchEffect(() => {
  if (import.meta.client) {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor.value)
    }
  }
})

useHead({
  meta: [
    {
      name: 'theme-color',
      content: themeColor.value
    }
  ]
})

const mainTabRoutes = ['/', '/explore', '/map', '/chat']

const showBottomNavigation = computed(() =>
  mainTabRoutes.includes(route.path)
)

/*
 * FAB는 Figma 1:1639 (탐색 - 메인) 기준,
 * 탐색 화면에는 보이지 않는다.
 * 다른 메인 탭 (Home/Map/Chat) 에서만 노출.
 */
const showCreatePostFab = computed(() => {
  if (route.path === '/explore') return false
  return mainTabRoutes.includes(route.path)
})

const isNotificationsPage = computed(() =>
  route.path.startsWith('/notifications')
)

// Page transition state
const isTransitioning = ref(false)
const transitionDirection = ref<'forward' | 'back'>('forward')
const isTabSwitch = ref(false)

const router = useRouter()
let lastPath = route.path

router.afterEach((to, from) => {
  const toDepth = to.path.split('/').filter(Boolean).length
  const fromDepth = from.path.split('/').filter(Boolean).length
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

const pageTransition = computed(() => ({
  name: isTabSwitch.value ? 'tab-fade' : 'page-slide',
  mode: 'out-in',
  onBeforeEnter: () => { isTransitioning.value = true },
  onAfterEnter: () => { isTransitioning.value = false },
  onBeforeLeave: () => { isTransitioning.value = true },
  onAfterLeave: () => { isTransitioning.value = false }
}))

/* =========================================
   DRAWER STATE & GESTURE (app-level)
   ========================================= */
const DRAWER_WIDTH = 300
const EDGE_THRESHOLD = 24

// Drawer state
const isDrawerOpen = ref(false)
const isDragging = ref(false)
const dragX = ref(0)
const startX = ref(0)
const lastX = ref(0)
const lastTime = ref(0)
const velocity = ref(0)

const openDrawer = () => { isDrawerOpen.value = true }
const closeDrawer = () => { isDrawerOpen.value = false }
const toggleDrawer = () => { isDrawerOpen.value = !isDrawerOpen.value }

const clamp = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max)

// Provide drawer state to pages
provide('drawer', {
  isOpen: isDrawerOpen,
  open: openDrawer,
  close: closeDrawer,
  toggle: toggleDrawer
})

// Gesture tracking
const onPointerDown = (e: PointerEvent) => {
  if (isDrawerOpen.value) {
    // Drawer open: close on swipe left from anywhere except drawer itself
    const target = e.target as HTMLElement
    if (target.closest('.side-drawer')) return
  } else {
    // Drawer closed: only start from left edge
    if (e.clientX > EDGE_THRESHOLD) return
  }

  isDragging.value = true
  startX.value = e.clientX
  lastX.value = e.clientX
  lastTime.value = performance.now()
  velocity.value = 0

  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

const onPointerMove = (e: PointerEvent) => {
  if (!isDragging.value) return

  const now = performance.now()
  const dt = now - lastTime.value
  if (dt > 0) velocity.value = (e.clientX - lastX.value) / dt
  lastX.value = e.clientX
  lastTime.value = now

  const delta = e.clientX - startX.value
  if (isDrawerOpen.value) {
    // Was open: left-swipe closes, right-swipe stays open
    dragX.value = clamp(DRAWER_WIDTH - delta, 0, DRAWER_WIDTH)
  } else {
    // Was closed: right-swipe opens
    dragX.value = clamp(delta, 0, DRAWER_WIDTH)
  }
}

const onPointerUp = () => {
  if (!isDragging.value) return
  isDragging.value = false

  const shouldOpen = dragX.value >= DRAWER_WIDTH * 0.5 || velocity.value > 0.5
  isDrawerOpen.value = shouldOpen
  dragX.value = 0
  velocity.value = 0
}

const onPointerCancel = () => {
  if (!isDragging.value) return
  isDragging.value = false
  dragX.value = 0
  velocity.value = 0
}

const onBackdropClick = () => { closeDrawer() }

// Keyboard: Escape
const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isDrawerOpen.value) closeDrawer()
}

watch(isDrawerOpen, (open) => {
  if (import.meta.client) {
    if (open) {
      document.addEventListener('keydown', onKeyDown)
    } else {
      document.removeEventListener('keydown', onKeyDown)
    }
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener('keydown', onKeyDown)
  }
})

// Computed main slide transform
const mainTransform = computed(() => {
  if (isDrawerOpen.value) return `translate3d(${DRAWER_WIDTH}px, 0, 0)`
  if (isDragging.value && dragX.value > 0) return `translate3d(${dragX.value}px, 0, 0)`
  return 'translate3d(0, 0, 0)'
})

const mainTransition = computed(() => {
  if (isDragging.value) return 'none'
  return 'transform 280ms cubic-bezier(0.22, 1, 0.36, 1)'
})

// App shell rounded-left when open
const shellClass = computed(() => ({
  'app-shell--drawer-open': isDrawerOpen.value || (isDragging.value && dragX.value > 0)
}))

const drawerVisible = computed(() => isDrawerOpen.value || isDragging.value)
</script>

<template>
  <div
    class="app-wrapper"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
  >
    <!-- App shell: slides right when drawer open -->
    <div
      class="app-shell"
      :class="[shellClass, { 'app-shell--notifications': isNotificationsPage }]"
      :style="{
        transform: mainTransform,
        transition: mainTransition
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
        <NuxtPage :transition="pageTransition" />
      </div>
      <NavigationBottomNavigation v-if="showBottomNavigation" />
      <NavigationCreatePostFab v-if="showCreatePostFab" />
    </div>

    <!-- Drawer overlay (sits inside app-wrapper so desktop preview aligns with 390px shell) -->
    <div
      v-if="drawerVisible"
      class="drawer-overlay"
      :class="{ 'drawer-overlay--active': isDrawerOpen || isDragging }"
    >
      <SideDrawer @close="closeDrawer" />
    </div>
  </div>
</template>

<style>
/* Mobile default */
.app-wrapper {
  position: relative;
  width: 100%;
  height: 100dvh;
  min-height: 0;
  display: flex;
  justify-content: flex-start;
  overflow: hidden;
  /* Prevent browser overscroll */
  overscroll-behavior: none;
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
  z-index: 1;
  will-change: transform;
  backface-visibility: hidden;
}

/* When drawer is open: left side has 30px radius */
.app-shell--drawer-open {
  border-radius: 30px 0 0 0;
}

.app-content {
  position: relative;
  z-index: 1;
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
  padding-bottom: calc(56px + 24px + env(safe-area-inset-bottom));
}

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
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 180ms cubic-bezier(0.22, 1, 0.36, 1);
}

.tab-fade-enter-from,
.tab-fade-leave-to {
  opacity: 0;
}

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

/* ========================================
   Drawer Overlay
   ======================================== */
.drawer-overlay {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 300px;
  z-index: 100;
  visibility: hidden;
  pointer-events: none;
}

.drawer-overlay--active {
  visibility: visible;
  pointer-events: auto;
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

  .app-shell--drawer-open {
    border-radius: 0;
  }

  /*
   * Desktop preview: app-shell is centered in viewport with width 390px.
   * Drawer-overlay must align to the LEFT edge of that 390px shell,
   * which is viewport center - 195px.
   */
  .drawer-overlay {
    left: 50%;
    margin-left: -195px;
  }

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
    padding-bottom: calc(56px + 24px + env(safe-area-inset-bottom));
  }

  .app-content--no-scroll {
    overflow-x: hidden !important;
    overflow-y: hidden !important;
  }
}

@media (max-width: 389px) {
  .app-shell {
    max-width: 100%;
  }
}

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
