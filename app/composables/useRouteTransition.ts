import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

/**
 * Composable to track navigation direction for page transitions.
 * Returns 'forward' for new page pushes, 'back' for history navigation.
 */
export const useRouteTransition = () => {
  const router = useRouter()
  const direction = ref<'forward' | 'back'>('forward')

  // Track navigation direction
  router.afterEach((to, from) => {
    const toDepth = to.path.split('/').filter(Boolean).length
    const fromDepth = from.path.split('/').filter(Boolean).length

    if (toDepth > fromDepth || router.options.history === 'replace') {
      direction.value = 'forward'
    } else if (toDepth < fromDepth) {
      direction.value = 'back'
    } else {
      // Same depth - check if it's a browser back/forward
      const isBack = router.options.history === 'abstract'
        ? false
        : window.history.state?.position !== undefined &&
          window.history.state?.position < (window.history.state?.lastIndex ?? 0)
      direction.value = isBack ? 'back' : 'forward'
    }
  })

  return {
    direction
  }
}

/**
 * Check if the current route is a main tab route (bottom navigation tabs)
 */
export const useMainTabRoute = () => {
  const route = useRoute()

  const mainTabRoutes = [
    '/',
    '/explore',
    '/map',
    '/chat',
    '/my'
  ]

  const isMainTab = computed(() =>
    mainTabRoutes.includes(route.path)
  )

  return {
    isMainTab
  }
}
