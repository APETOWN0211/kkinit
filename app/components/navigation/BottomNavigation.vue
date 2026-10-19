<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import homeActive from '~/assets/icons/navicgation/home-active.svg?raw'
import homeInactive from '~/assets/icons/navicgation/home-inactive.svg?raw'
import exploreActive from '~/assets/icons/navicgation/explore-white.svg?raw'
import exploreInactive from '~/assets/icons/navicgation/explore-active.svg?raw'
import mapActive from '~/assets/icons/navicgation/map-white.svg?raw'
import mapInactive from '~/assets/icons/navicgation/map-active.svg?raw'
import chatActive from '~/assets/icons/navicgation/chat-white.svg?raw'
import chatInactive from '~/assets/icons/navicgation/chat-active.svg?raw'

const route = useRoute()
const { safeNavigate } = useSafeNavigation()

/*
 * New global floating bottom navigation (Figma 41:1897).
 *  - Home / Explore / Map / Chat 4 항목
 *  - 기존 My tab 은 이 nav 에서 제거.
 *  - My 진입점은 HomeTopBar 의 avatar 클릭.
 */
const menuItems = [
  { id: 'home',    label: '홈',  icon: { active: homeActive,    inactive: homeInactive },    route: '/',        iconClass: 'floating-bottom-nav__icon--home' },
  { id: 'explore', label: '탐색', icon: { active: exploreActive, inactive: exploreInactive }, route: '/explore', iconClass: 'floating-bottom-nav__icon--explore' },
  { id: 'map',     label: '지도', icon: { active: mapActive,     inactive: mapInactive },     route: '/map',     iconClass: 'floating-bottom-nav__icon--map' },
  { id: 'chat',    label: '채팅', icon: { active: chatActive,    inactive: chatInactive },    route: '/chat',    iconClass: 'floating-bottom-nav__icon--chat' },
] as const

type MenuId = typeof menuItems[number]['id']

/*
 * Active id 계산:
 *   /         → home
 *   /explore  → explore
 *   /map      → map
 *   /chat     → chat
 * (자세 매칭만 — /chat/[id] 는 app.vue 에서 nav 자체를 숨긴다.)
 */
const activeId = computed<MenuId>(() => {
  const path = route.path
  if (path === '/explore') return 'explore'
  if (path === '/map') return 'map'
  if (path === '/chat') return 'chat'
  return 'home'
})

const activeIndex = computed(() =>
  menuItems.findIndex(m => m.id === activeId.value)
)

/*
 * Sliding indicator (ChatFilterTabs 와 동일 패턴):
 *  - 각 button 의 offsetLeft / offsetWidth 를 측정해
 *    transform: translate3d(x, 0, 0) 로 위치를 이동.
 *  - 현재 Figma active icon 구조는 icon 자체가 white 로 swap 되므로
 *    white circle 을 새로 만들지 않는다.
 *    → indicator 는 투명 span 으로 두고 transition 위치 계산만 담당.
 */
type RefsMap = Partial<Record<MenuId, HTMLButtonElement | null>>
const buttonRefs = ref<RefsMap>({})

const indicatorStyle = ref<{ width: string; transform: string }>({
  width: '0px',
  transform: 'translate3d(0px, 0, 0)'
})

const measure = async (retries = 0) => {
  await nextTick()
  const el = buttonRefs.value[activeId.value]
  if (!el) {
    /*
     * mount 직후 / route 변경 직후 ref 가 아직 안 잡힌 경우
     * 최대 3 회까지 nextTick 으로 재시도. 그래도 안 잡히면
     * (다음 watch 가 다시 호출해줄 것) 그대로 둔다.
     */
    if (retries < 3) {
      measure(retries + 1)
    }
    return
  }
  indicatorStyle.value = {
    width: `${el.offsetWidth}px`,
    transform: `translate3d(${el.offsetLeft}px, 0, 0)`
  }
}

onMounted(() => {
  measure()
  window.addEventListener('resize', measure)
})

watch(activeId, () => {
  measure()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', measure)
})

const setRef = (id: MenuId) => (el: any) => {
  buttonRefs.value[id] = el as HTMLButtonElement | null
}

const setActive = (id: string) => {
  const item = menuItems.find(m => m.id === id)
  if (item) {
    safeNavigate(item.route)
  }
}
</script>

<template>
  <nav class="floating-bottom-nav" aria-label="메인 네비게이션">
    <div class="floating-bottom-nav__capsule">
      <!--
        Sliding indicator.
          - nav 전체 black pill 은 움직이지 않는다.
          - 그 안에서 이 indicator 만 translateX 로 좌우 이동.
          - Figma active icon 이 icon 자체 white 이므로 white circle 을
            그리지 않고 투명하게 유지 (위치 계산 / z-index / transition 용).
      -->
      <span
        class="floating-bottom-nav__indicator"
        :style="indicatorStyle"
        aria-hidden="true"
      />

      <button
        v-for="item in menuItems"
        :key="item.id"
        :ref="setRef(item.id)"
        class="floating-bottom-nav__item"
        :class="{ 'floating-bottom-nav__item--active': activeId === item.id }"
        :aria-label="item.label"
        :aria-current="activeId === item.id ? 'page' : undefined"
        @click="setActive(item.id)"
      >
        <span
          class="floating-bottom-nav__icon"
          :class="item.iconClass"
          v-html="activeId === item.id ? item.icon.active : item.icon.inactive"
        />
      </button>
    </div>
  </nav>
</template>

<style scoped>
/*
 * Figma 3:266 (네비게이션) — 홈 하단 floating nav
 *  - 위치: viewport 중앙 정렬 (left 50%, translate-x-1/2)
 *  - 크기: 206 × 56  (px 20, py 14, gap 18, icon 28 × 4)
 *  - top 763 → 하단에서 25px 위 (홈바 바로 위)
 *  - radius: 999 (full pill)
 *  - background: #1B1F22
 *  - shadow: 0 4 16 0 rgba(0,0,0,0.18)
 *  - active icon: #FFFFFF (white)
 *  - inactive icon: #73787E (gray)
 *
 * 이번 변경:
 *  - 위 모든 visual / size / radius / shadow / gap / icon size 은 절대 유지.
 *  - active 가 순간적으로 바뀌던 부분을 ChatFilterTabs 와 동일한
 *    "단일 indicator 가 translateX 로 이동" 패턴으로 부드럽게 전환.
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
   * Figma 3:266: nav 206 × 56, top 763
   *   → 844 - 763 - 56 = 25 (viewport 하단에서 25px 위)
   * 3:265 홈바(top 823) 바로 위(4px)에 nav 아래단이 오도록 맞춘 값.
   * 실제 iPhone safe-area 는 env() 로 더한다.
   */
  padding-bottom: calc(env(safe-area-inset-bottom) + 25px);
}

.floating-bottom-nav::before {
  content: none;
}

.floating-bottom-nav__capsule {
  pointer-events: auto;

  position: relative; /* indicator absolute 기준 */

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

/*
 * Sliding indicator.
 *  - nav 의 black pill 안에만 있는 투명 영역.
 *  - active tab 의 offsetLeft / offsetWidth 로 translate3d 이동.
 *  - white circle 은 만들지 않는다 (active icon 자체가 white SVG).
 *  - duration / easing 은 ChatFilterTabs 와 동일한
 *      280ms cubic-bezier(0.22, 1, 0.36, 1)
 *    를 사용해 "Chat 의 filter pill 이 전체→안읽음→모임 으로
 *    움직이는" 느낌과 통일.
 */
.floating-bottom-nav__indicator {
  position: absolute;
  top: 14px;            /* capsule padding-top */
  left: 0;              /* translate3d 가 button 의 offsetLeft 를 그대로 더함 */
  height: 28px;         /* item height 과 동일 */

  width: 28px;
  border-radius: 999px;

  background: transparent;

  z-index: 1;
  pointer-events: none;

  transition:
    transform 280ms cubic-bezier(0.22, 1, 0.36, 1),
    width     280ms cubic-bezier(0.22, 1, 0.36, 1);

  will-change: transform, width;
}

.floating-bottom-nav__item {
  position: relative;
  z-index: 2; /* indicator 위에 떠 있어야 active icon 이 정상적으로 보임 */

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

  /*
   * Icon micro animation:
   *  - 새 active tab 의 icon 이 매우 절제된 scale 로 들어오는 느낌.
   *  - 0.92 → 1.06 → 1.0 은 transition 두 단계로 표현하기 어렵기 때문에
   *    단순 cubic-bezier easing 으로 "작게 들어가서 살짝 커졌다가
   *    제자리" 느낌을 만든다.
   *  - 240ms 정도로 살짝 짧게 둬 nav 의 280ms 이동과 어긋나지 않게.
   */
  transition:
    transform 240ms cubic-bezier(0.34, 1.4, 0.4, 1);
}

.floating-bottom-nav__item:active {
  transform: scale(0.9);
}

/*
 * Active 진입 시 micro pop.
 *  - 비-spring, 비-튀는 느낌으로
 *    약간 작게 시작(0.92) → 살짝 커짐(1.06) → 1.0 으로 돌아오는 keyframe.
 *  - duration 은 indicator 이동(280ms)과 거의 맞춰 동시에 안착.
 *  - 처음 mount 시 active 가 미리 active 상태인 tab 도 부드럽게 들어오도록
 *    forward 가 아닌 in-place keyframe 으로 처리.
 */
@keyframes floating-bottom-nav-pop {
  0%   { transform: scale(0.92); }
  55%  { transform: scale(1.06); }
  100% { transform: scale(1); }
}

.floating-bottom-nav__item--active {
  animation: floating-bottom-nav-pop 260ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.floating-bottom-nav__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 28px;
  height: 28px;

  overflow: hidden;

  /*
   * Icon 자체:
   *  - active / inactive 는 SVG 자체 white / gray 가 다르므로
   *    v-html swap 이 발생한다.
   *  - swap 시 톡 끊기는 느낌을 줄이기 위해 opacity 도 같이 transition.
   *  - transform 은 부모 button 의 scale 과 합쳐져 자연스럽게 보임.
   */
  transition:
    opacity 180ms ease,
    transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.floating-bottom-nav__icon :deep(svg) {
  display: block;
  width: 28px;
  height: 28px;
}

/*
 * Explore icon 보정 (기존 주석 그대로 유지).
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

/* =========================
   Reduced motion
   ========================= */
@media (prefers-reduced-motion: reduce) {
  .floating-bottom-nav__indicator,
  .floating-bottom-nav__item,
  .floating-bottom-nav__icon {
    transition: none;
  }

  .floating-bottom-nav__item--active {
    animation: none;
  }
}
</style>
