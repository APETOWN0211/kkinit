<template>
  <div class="app-wrapper">
    <div class="app-shell">
      <NuxtRouteAnnouncer />
      <div class="app-content">
        <NuxtPage />
      </div>
      <NavigationBottomNavigation />
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
}

.app-content {
  flex: 1;
  overflow-y: auto;
  padding-bottom: env(safe-area-inset-bottom);
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
    overflow: hidden;
  }

  .app-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    max-height: calc(844px - env(safe-area-inset-bottom));
  }
}

/* Very small screens - ensure full width */
@media (max-width: 389px) {
  .app-shell {
    max-width: 100%;
  }
}
</style>
