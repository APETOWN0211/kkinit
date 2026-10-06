import { ref } from 'vue'

/**
 * App launch splash (Figma 1:178 "첫진입").
 *
 * This is NOT a route. It is an app-level boot layer rendered on top of the
 * existing app shell, shown once per app launch / browser reload and then
 * removed. SPA route changes never re-trigger it.
 */

/** Figma 1:178 background — same value as --color-chip-orange. */
export const SPLASH_ORANGE = '#FF6940'

/** Minimum time the splash stays fully opaque (ms). */
export const SPLASH_HOLD_DURATION = 1100

/**
 * Fade out duration (ms).
 * Must stay in sync with the `transition` duration of `.app-splash` in
 * components/common/AppSplash.vue (250ms cubic-bezier(0.22, 1, 0.36, 1)).
 */
export const SPLASH_FADE_DURATION = 250

/*
 * Initial state is `true` on purpose: the very first render (SSR and client
 * hydration) must already be the splash so the underlying page never flashes
 * before the splash appears. Flipping it to `true` in onMounted would cause a
 * Home → Splash → Home flash.
 */
const isSplashVisible = ref(true)
const isSplashLeaving = ref(false)

export const useAppSplash = () => {
  let holdTimer: ReturnType<typeof setTimeout> | undefined
  let fadeTimer: ReturnType<typeof setTimeout> | undefined

  const clearSplashTimers = () => {
    if (holdTimer) {
      clearTimeout(holdTimer)
      holdTimer = undefined
    }
    if (fadeTimer) {
      clearTimeout(fadeTimer)
      fadeTimer = undefined
    }
  }

  /** Hold the splash, then fade it out and unmount it. */
  const startSplash = () => {
    clearSplashTimers()

    if (!import.meta.client) return

    holdTimer = window.setTimeout(() => {
      isSplashLeaving.value = true

      fadeTimer = window.setTimeout(() => {
        isSplashVisible.value = false
        holdTimer = undefined
        fadeTimer = undefined
      }, SPLASH_FADE_DURATION)
    }, SPLASH_HOLD_DURATION)
  }

  return {
    isSplashVisible,
    isSplashLeaving,
    startSplash,
    clearSplashTimers
  }
}
