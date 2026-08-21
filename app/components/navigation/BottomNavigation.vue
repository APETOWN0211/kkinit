<script setup lang="ts">
import homeIcon from '~/assets/icons/navicgation/home.svg?raw'
import exploreIcon from '~/assets/icons/navicgation/explore.svg?raw'
import mapIcon from '~/assets/icons/navicgation/map.svg?raw'
import chatIcon from '~/assets/icons/navicgation/chat.svg?raw'
import myIcon from '~/assets/icons/navicgation/my.svg?raw'

const menuItems = [
  { id: 'home', label: '홈', icon: homeIcon },
  { id: 'explore', label: '탐색', icon: exploreIcon },
  { id: 'map', label: '지도', icon: mapIcon },
  { id: 'chat', label: '채팅', icon: chatIcon },
  { id: 'my', label: '마이', icon: myIcon },
]

const activeMenu = ref('home')

const setActive = (id: string) => {
  activeMenu.value = id
}
</script>

<template>
  <nav class="bottom-navigation">
    <button
      v-for="item in menuItems"
      :key="item.id"
      class="nav-item"
      :class="{ active: activeMenu === item.id }"
      @click="setActive(item.id)"
      :aria-label="item.label"
    >
      <span class="nav-icon" v-html="item.icon" />
    </button>
  </nav>
</template>

<style scoped>
/* Mobile: fixed to viewport bottom */
.bottom-navigation {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: var(--color-nav-background);
  border-radius: 28px 28px 0 0;
  padding: 12px 40px calc(12px + env(safe-area-inset-bottom));
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-bottom-navigation);
  z-index: 20;
}

/* Desktop preview: within app-shell */
@media (min-width: 768px) {
  .bottom-navigation {
    position: absolute;
    left: 0;
    right: 0;
  }
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-nav-inactive);
  transition: color 0.2s ease;
}

.nav-item.active {
  color: var(--color-primary);
}

.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-icon :deep(svg) {
  display: block;
  width: 32px;
  height: 32px;
}
</style>
