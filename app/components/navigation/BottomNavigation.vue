<script setup lang="ts">
import homeActive from '~/assets/icons/navicgation/home-active.svg?raw'
import homeInactive from '~/assets/icons/navicgation/home-inactive.svg?raw'
import exploreActive from '~/assets/icons/navicgation/explore-white.svg?raw'
import exploreInactive from '~/assets/icons/navicgation/explore-active.svg?raw'
import mapActive from '~/assets/icons/navicgation/map-white.svg?raw'
import mapInactive from '~/assets/icons/navicgation/map-active.svg?raw'
import chatActive from '~/assets/icons/navicgation/chat-white.svg?raw'
import chatInactive from '~/assets/icons/navicgation/chat-active.svg?raw'

const route = useRoute()

/*
 * New global floating bottom navigation (Figma 41:1897).
 *  - Home / Explore / Map / Chat 4 항목
 *  - 기존 My tab 은 이 nav 에서 제거.
 *  - My 진입점은 HomeTopBar 의 avatar 클릭.
 */
const menuItems = [
  { id: 'home',    label: '홈',  icon: { active: homeActive,    inactive: homeInactive },    route: '/',     iconClass: 'floating-bottom-nav__icon--home' },
  { id: 'explore', label: '탐색', icon: { active: exploreActive, inactive: exploreInactive }, route: '/explore', iconClass: 'floating-bottom-nav__icon--explore' },
  { id: 'map',     label: '지도', icon: { active: mapActive,     inactive: mapInactive },     route: '/map',     iconClass: 'floating-bottom-nav__icon--map' },
  { id: 'chat',    label: '채팅', icon: { active: chatActive,    inactive: chatInactive },    route: '/chat',    iconClass: 'floating-bottom-nav__icon--chat' },
]

const activeMenu = computed(() => {
  const match = menuItems.find(item => item.route === route.path)
  return match ? match.id : 'home'
})

const setActive = (id: string) => {
  const item = menuItems.find(m => m.id === id)
  if (item) {
    navigateTo(item.route)
  }
}
</script>

<template>
  <nav class="floating-bottom-nav" aria-label="메인 네비게이션">
    <div class="floating-bottom-nav__capsule">
      <button
        v-for="item in menuItems"
        :key="item.id"
        class="floating-bottom-nav__item"
        :class="{ 'floating-bottom-nav__item--active': activeMenu === item.id }"
        :aria-label="item.label"
        :aria-current="activeMenu === item.id ? 'page' : undefined"
        @click="setActive(item.id)"
      >
        <span
          class="floating-bottom-nav__icon"
          :class="item.iconClass"
          v-html="activeMenu === item.id ? item.icon.active : item.icon.inactive"
        />
      </button>
    </div>
  </nav>
</template>

<style scoped>
/*
 * Figma 41:1897 — 네비게이션-글작성 (네비게이션 바)
 *  - 위치: 가운데 정렬 (left 50%, translate-x-1/2)
 *  - top: 763 (홈 frame 1345h, FAB top 762, home indicator ~ 8px from bottom)
 *  - padding: 20 × 14, gap: 18
 *  - height: 28 + 28 = 56
 *  - icon: 28 × 28
 *  - radius: 999 (full pill)
 *  - background: #1B1F22
 *  - shadow: 0 4 16 0 rgba(0,0,0,0.18)
 *  - active icon: #FFFFFF (white)
 *  - inactive icon: #73787E (gray)
 */
.floating-bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 30;

  display: flex;
  justify-content: center;
  align-items: flex-end;

  pointer-events: none;

  /*
   * Nav 와 FAB 모두를 포함한다.
   * 실제 iPhone safe-area + Figma bottom offset (≈8px).
   */
  padding-bottom: calc(env(safe-area-inset-bottom) + 8px);
}

.floating-bottom-nav__capsule {
  pointer-events: auto;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 18px;

  height: 56px;
  padding: 14px 20px;

  border-radius: 999px;

  background: #1B1F22;

  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);

  -webkit-tap-highlight-color: transparent;
}

.floating-bottom-nav__item {
  flex: 0 0 auto;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 28px;
  height: 28px;

  padding: 0;

  border: 0;
  border-radius: 999px;

  background: transparent;

  cursor: pointer;

  transition: transform 120ms ease, opacity 120ms ease;
}

.floating-bottom-nav__item:active {
  transform: scale(0.9);
  opacity: 0.85;
}

.floating-bottom-nav__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 28px;
  height: 28px;

  overflow: hidden;
}

.floating-bottom-nav__icon :deep(svg) {
  display: block;
  width: 28px;
  height: 28px;
}

/*
 * Explore icon 보정.
 *
 * Figma 1:2222 (네비게이션 바) 의 두번째 슬롯 (탐색) 구조:
 *   - wrapper: 28×28, overflow: hidden
 *   - child:   34.6482×34.6482, position left: -3.5px, top: -3.5px
 *
 * Figma 에서 child 가 wrapper 보다 크게 (-3.5 오프셋) 들어가 있는 이유는
 * SVG 원본의 viewBox (0 0 34.6482 34.6482) 안에 path 가 약 22×22 (cx=17.32,
 * r=10.95 + stroke 2.6 → 약 24×24 visual bounds) 만 차지하고,
 * 나머지 영역이 빈 padding 이기 때문이다.
 *
 * Figma 의 의도는 wrapper 의 시각적 영역 (28×28) 안에서
 * 다른 아이콘 (home, map, chat) 의 visual size 와 동일한 glyph 크기로
 * 표시되는 것이다. child 가 wrapper 밖으로 살짝 나가지만, wrapper 의
 * overflow: hidden 으로 인해 실제로 보이는 영역은 wrapper 와 동일하다.
 *
 * 최종 결과:
 *   - wrapper: 28×28 (다른 아이콘 wrapper 와 동일, hit-area 동일)
 *   - SVG 시각 영역: 28×28 (wrapper 의 overflow: hidden 안에 들어감)
 *   - SVG viewBox 의 path bounds (≈22×22) 가 wrapper 안에 그대로 표시됨
 *
 * 구현:
 *   - SVG 의 width/height 를 wrapper 와 동일한 28×28 로 유지
 *   - viewBox 를 path bounds 에 가깝게 좁혀 (6 6 22.6 22.6)
 *     다른 아이콘의 glyph 점유율과 균형을 맞춤
 *   - 미세한 scale 은 SVG 의 outer size 와 wrapper size 가 같으므로 불필요
 *
 * 절대 변경하지 않는 것:
 *  - nav 전체 높이, capsule width/height/radius
 *  - 다른 아이콘 (home/map/chat) 의 sizing
 *  - FAB, nav gap
 */
.floating-bottom-nav__icon--explore :deep(svg) {
  display: block;
  width: 28px;
  height: 28px;
}

/* =========================
   Desktop preview
   ========================= */
@media (min-width: 768px) {
  .floating-bottom-nav {
    position: absolute;
  }
}
</style>