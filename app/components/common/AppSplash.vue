<script setup lang="ts">
import kkinitWordmark from '~/assets/branding/kkinit-wordmark.svg?raw'

/*
 * App launch splash — Figma 1:178 "첫진입".
 *
 *  - frame: 390 × 844, background #FF6940 (= --color-chip-orange)
 *  - logo (Group 323): x 69.0, y 400.0, 260 × 52.5694, white vector wordmark
 *  - logo center: (199.00, 426.28) vs frame center (195, 422)
 *    → real Figma offset is +4px right / +4.28px down
 *  - status bar / home indicator are painted by the real OS, never in HTML
 *
 * This is an app boot layer, not a route. It is rendered on top of the app
 * shell once per launch / reload and removed after 1100ms + a 250ms fade.
 */

const {
  isSplashVisible,
  isSplashLeaving,
  startSplash,
  clearSplashTimers
} = useAppSplash()

const root = ref<HTMLElement | null>(null)

/*
 * Paint the document background orange from the very first frame, before Vue
 * has hydrated. Without this the browser could paint the reset.css
 * #FAFAFA body background for a frame and flash white before the splash.
 *
 * The flag is on <html> and is emitted during SSR too, so server and client
 * markup match and there is no hydration mismatch.
 */
useHead({
  htmlAttrs: {
    /*
     * Computed (not a plain `.value` read) so the attribute is actually
     * reactive: it is emitted during SSR, matches the client hydration render,
     * and is removed the moment the splash unmounts.
     */
    'data-app-booting': computed(() => (isSplashVisible.value ? '' : undefined))
  }
})

/*
 * Consume wheel / touch gestures on the splash surface so the feed behind it
 * cannot be scrolled or panned while the splash is up. `passive: false` is
 * required for preventDefault, and both listeners are removed on unmount so
 * the body / document scroll structure is never permanently altered.
 */
const onWheel = (event: WheelEvent) => {
  if (isSplashVisible.value) event.preventDefault()
}

const onTouchMove = (event: TouchEvent) => {
  if (isSplashVisible.value) event.preventDefault()
}

onMounted(() => {
  root.value?.addEventListener('wheel', onWheel, { passive: false })
  root.value?.addEventListener('touchmove', onTouchMove, { passive: false })

  startSplash()
})

onBeforeUnmount(() => {
  clearSplashTimers()

  root.value?.removeEventListener('wheel', onWheel)
  root.value?.removeEventListener('touchmove', onTouchMove)
})
</script>

<template>
  <div
    v-if="isSplashVisible"
    ref="root"
    class="app-splash"
    :class="{ 'app-splash--leaving': isSplashLeaving }"
    aria-hidden="true"
    @pointerdown.stop
    @pointermove.stop
    @pointerup.stop
    @pointercancel.stop
    @touchstart.stop
    @touchmove.stop
    @touchend.stop
    @contextmenu.prevent
  >
    <div class="app-splash__logo" v-html="kkinitWordmark" />
  </div>
</template>

<style scoped>
/*
 * Splash layer — absolutely positioned inside `.app-shell`, which is
 * `position: relative`. This makes the covered area exactly the app viewport:
 *  - mobile: shell is 100% × 100dvh → covers the safe areas too
 *  - desktop: shell is the centered 390 × 844 preview, so the surrounding
 *    desktop background is intentionally left untouched
 *
 * z-index 200 is above the floating bottom nav (30), the FAB (31) and the
 * drawer overlay (100), so no app UI can flicker above the splash.
 */
.app-splash {
  position: absolute;
  inset: 0;
  z-index: 200;

  display: flex;
  align-items: center;
  justify-content: center;

  background: var(--color-chip-orange);

  /* Owns the whole surface: no taps, no drags, no scroll bleed-through. */
  pointer-events: auto;
  touch-action: none;
  overscroll-behavior: none;
  -webkit-user-select: none;
  user-select: none;
}

.app-splash--leaving {
  opacity: 0;
  pointer-events: none;
  transition: opacity 250ms cubic-bezier(0.22, 1, 0.36, 1);
}

/*
 * KKINIT wordmark.
 *
 * The SVG's own width/height attributes (260 × 52.5694) are preserved; only
 * the wrapper is transformed. Flex centering places the logo at the frame
 * center, so the Figma offset is reproduced as a translate rather than a
 * hard-coded top/left pair.
 */
.app-splash__logo {
  --splash-logo-scale: 1;

  flex: 0 0 auto;

  transform: translate(4px, 4.2847px) scale(var(--splash-logo-scale));

  animation: app-splash-logo-in 200ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.app-splash__logo :deep(svg) {
  display: block;

  width: 260px;
  height: 52.5694px;

  /* reset.css caps svg at max-width: 100%; scaling is handled by transform. */
  max-width: none;
}

/* Below 390px the shell tracks the viewport, so scale instead of overflow. */
@media (max-width: 389px) {
  .app-splash__logo {
    --splash-logo-scale: calc(100vw / 390);
  }
}

@keyframes app-splash-logo-in {
  from {
    opacity: 0;
    transform: translate(4px, 4.2847px) scale(calc(var(--splash-logo-scale) * 0.98));
  }

  to {
    opacity: 1;
    transform: translate(4px, 4.2847px) scale(var(--splash-logo-scale));
  }
}

/*
 * Reduced motion: keep the splash itself, drop the motion.
 */
@media (prefers-reduced-motion: reduce) {
  .app-splash--leaving {
    transition: opacity 1ms linear;
  }

  .app-splash__logo {
    animation: none;
  }
}
</style>

<style>
/*
 * Global, unscoped: marks "the app has not finished booting".
 * Applied to <html> during SSR and while the splash is visible so the very
 * first paint is already the splash orange instead of the reset.css #FAFAFA.
 * Removed the moment the splash unmounts.
 */
html[data-app-booting] {
  background: var(--color-chip-orange);
}
</style>
