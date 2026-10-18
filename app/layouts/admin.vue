<!--
  app/layouts/admin.vue

  Admin CMS layout. Bypasses the mobile AppShell entirely.

  - No BottomNavigation
  - No SideDrawer
  - No FAB
  - No splash
  - No mobile 390px shell — full desktop width
  - White background, #FE5531 primary accent, 12px radius
-->
<template>
  <div class="admin-layout">
    <slot />
  </div>
</template>

<style>
/*
 * Reset the mobile shell so this layout renders in a desktop browser.
 * Page width is full viewport.
 */
.admin-layout {
  position: relative;

  display: block;

  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;

  background: #F3F4F6;
  color: #191919;
  font-family: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, sans-serif;
}

.admin-layout *,
.admin-layout *::before,
.admin-layout *::after {
  box-sizing: border-box;
}
</style>
