<script setup lang="ts">
/*
 * /map canvas.
 *
 * Figma 25:707 / 25:906 actual (지도 background):
 *  - container : bg #f9f8f9, full screen
 *  - main-road : main-road svg (25:714/25:913) + 8 road labels + 2 profile avatars
 *  - sm lines  : sm lines bg + sm lines 1 (25:709-25:712 / 25:908-25:911)
 *  - secondary roads : vector 41 / 42
 *
 * 우측 control buttons:
 *  - Figma 25:700 (profile, 38px), 25:797 (locate, 38px)
 *  - left = calc(75% + 39.5px) (≈ 332.5 px)
 *  - profile top 351 (base) / 316 (selected)
 *  - locate  top 397 (base) / 362 (selected)
 *
 * 이번 작업 범위:
 *  - 실제 map SDK 사용 안 함
 *  - background click 으로 selection 해제 처리만 emit
 */

import locateIcon from '~/assets/icons/common/map-locate.svg?raw'
import profileIcon from '~/assets/icons/common/map-profile.svg?raw'

const props = defineProps<{
  showLocateTop: 'base' | 'selected'
}>()

defineEmits<{
  backgroundclick: []
  locateclick: []
  profileclick: []
}>()

const profileTop = computed(() => (props.showLocateTop === 'selected' ? 316 : 351))
const locateTop = computed(() => (props.showLocateTop === 'selected' ? 362 : 397))

const onBgClick = () => emit('backgroundclick')
const onProfile = (e: Event) => {
  e.stopPropagation()
  emit('profileclick')
}
const onLocate = (e: Event) => {
  e.stopPropagation()
  emit('locateclick')
}
</script>

<template>
  <!--
    Map background container. Figma 25:707 / 25:906 actual.
    background click 으로 selection 해제 처리.
  -->
  <button
    type="button"
    class="map-canvas"
    aria-label="지도 배경"
    @click="onBgClick"
  >
    <!--
      sm lines (back layer).
      Figma 25:709-25:712 actual: sm lines bg 가 가장 큰 svg.
    -->
    <span class="map-canvas__sm-lines" aria-hidden="true">
      <img src="/images/map/bg-lines.svg" alt="" draggable="false" />
    </span>

    <!--
      secondary roads (vector 41 / 42).
      Figma 25:708/25:907 + 25:713/25:912 actual.
    -->
    <span class="map-canvas__road-secondary" aria-hidden="true">
      <img src="/images/map/bg-vector42.svg" alt="" draggable="false" />
    </span>
    <span class="map-canvas__road-secondary map-canvas__road-secondary--alt" aria-hidden="true">
      <img src="/images/map/bg-vector41.svg" alt="" draggable="false" />
    </span>

    <!--
      main road (vector 43) + road name labels.
      Figma 25:714/25:913 actual.
    -->
    <span class="map-canvas__road-main" aria-hidden="true">
      <img src="/images/map/bg-vector43.svg" alt="" draggable="false" />
    </span>

    <span class="map-canvas__road-label map-canvas__road-label--purnima" aria-hidden="true">
      <span>PURNIMA EDUCATION</span>
      <span>PRIMARY SCHOOL</span>
    </span>
    <span class="map-canvas__road-label map-canvas__road-label--dokmang" aria-hidden="true">독막로 8길</span>
    <span class="map-canvas__road-label map-canvas__road-label--10" aria-hidden="true">망원로10길</span>
    <span class="map-canvas__road-label map-canvas__road-label--16" aria-hidden="true">망원로16길</span>
    <span class="map-canvas__road-label map-canvas__road-label--14" aria-hidden="true">망원로14길</span>
    <span class="map-canvas__road-label map-canvas__road-label--main" aria-hidden="true">망원로</span>
    <span class="map-canvas__road-label map-canvas__road-label--18" aria-hidden="true">망원로18길</span>

    <!--
      Right side controls (Figma 25:946/25:797, 25:945/25:700).
      클릭 시 background click 으로 처리되면 selection 이 풀리므로
      button 으로 별도 emit + stopPropagation.
    -->
    <button
      type="button"
      class="map-canvas__control map-canvas__control--profile"
      :style="{ top: profileTop + 'px' }"
      aria-label="내 프로필"
      @click="onProfile"
    >
      <span class="map-canvas__control-icon" v-html="profileIcon" />
    </button>
    <button
      type="button"
      class="map-canvas__control map-canvas__control--locate"
      :style="{ top: locateTop + 'px' }"
      aria-label="현재 위치로"
      @click="onLocate"
    >
      <span class="map-canvas__control-icon" v-html="locateIcon" />
    </button>
  </button>
</template>

<style scoped>
/*
 * Figma 25:707 / 25:906 actual:
 *  - container : bg #f9f8f9
 *  - 390 x viewport height, overflow hidden
 *
 * button element 로 두는 이유는 background click 으로 selection 해제를
 * 처리하기 위함. visual 은 일반 div 처럼 보이고, click 만 받는다.
 */
.map-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;

  display: block;
  width: 100%;
  height: 100%;

  padding: 0;
  margin: 0;
  border: 0;

  background: #F9F8F9;

  cursor: pointer;

  overflow: hidden;

  /*
   * button 의 default font/text-align 등을 초기화.
   */
  font-family: inherit;
  text-align: left;
}

/*
 * sm lines (back layer).
 * Figma 25:709-25:712 actual:
 *   sm lines bg : 873.944 × 916.302, left -219.43, top -2.92
 *
 * 화면 안에 도로 grid 가 깔리도록 preserveAspectRatio: xMidYMid slice 로
 * 화면을 가득 채운다.
 */
.map-canvas__sm-lines,
.map-canvas__road-secondary,
.map-canvas__road-main {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.map-canvas__sm-lines img,
.map-canvas__road-secondary img,
.map-canvas__road-main img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  user-select: none;
  -webkit-user-drag: none;
}

.map-canvas__sm-lines {
  z-index: 1;
}

.map-canvas__road-secondary {
  z-index: 2;
}

.map-canvas__road-secondary--alt {
  /* 동일 z-index, vector 42 와 vector 41 이 겹쳐 자연스러운 도로 레이어 형성 */
}

.map-canvas__road-main {
  z-index: 3;
}

/*
 * Road name labels (Figma 25:722-25:729 / 25:921-25:928).
 * - black text 10.4px Inter SemiBold
 * - 위치/회전은 Figma actual 그대로 (selected frame 의 13.78px 등 스케일은
 *   container 비율이 다르므로 1:1 매핑은 생략하고, base frame 의 좌표를
 *   그대로 둔다. 두 frame 의 road label 위치는 base 기준이 canonical).
 */
.map-canvas__road-label {
  position: absolute;
  z-index: 4;

  font-family: 'Inter', 'Pretendard Variable', sans-serif;
  font-size: 10px;
  font-weight: 600;
  line-height: 1;
  color: #000000;
  letter-spacing: 0;
  white-space: nowrap;

  transform: translateX(-50%);

  pointer-events: none;
}

/*
 * PURNIMA EDUCATION / PRIMARY SCHOOL (Figma 25:722).
 * size 20.053px, two-line block.
 */
.map-canvas__road-label--purnima {
  left: 116.66px;
  top: 127.65px;

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;

  font-size: 14px;
  font-weight: 700;
  text-align: center;
  line-height: 1.1;
}

/* 독막로 8길 (Figma 25:723). rotate 14.45deg. */
.map-canvas__road-label--dokmang {
  left: 376.52px;
  top: 145.29px;
  width: 50px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateX(-50%) rotate(14.45deg);
}

/* 망원로10길 (Figma 25:724). */
.map-canvas__road-label--10 {
  left: 326.25px;
  top: 260.99px;
}

/* 망원로16길 (Figma 25:725). */
.map-canvas__road-label--16 {
  left: 549.01px;
  top: 479.76px;
}

/* 망원로14길 (Figma 25:726). rotate -46.89deg. */
.map-canvas__road-label--14 {
  left: 553.03px;
  top: 321.99px;
  width: 44px;
  height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateX(-50%) rotate(-46.89deg);
}

/* 망원로 (Figma 25:727). rotate -88.6deg. */
.map-canvas__road-label--main {
  left: 277.44px;
  top: 460.78px;
  width: 14px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateX(-50%) rotate(-88.6deg);
}

/* 망원로18길 (Figma 25:729). rotate 33.82deg. */
.map-canvas__road-label--18 {
  left: 360.17px;
  top: 625.2px;
  width: 50px;
  height: 39px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateX(-50%) rotate(33.82deg);
}

/*
 * Right side control buttons (Figma 25:700 / 25:797).
 *  - 38×38 circle, white, shadow 0 3 12 rgba(0,0,0,0.15)
 *  - left = calc(75% + 39.5px) (≈ 332.5 px on 390 width)
 */
.map-canvas__control {
  position: absolute;
  z-index: 6;

  right: 18.5px; /* 390 - 332.5 - 38 = 19.5, 살짝 조정 */
  width: 38px;
  height: 38px;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0;
  border: 0;
  border-radius: 999px;

  background: #FFFFFF;

  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.15);

  cursor: pointer;

  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, opacity 120ms ease;
}

.map-canvas__control:active {
  transform: scale(0.94);
  opacity: 0.85;
}

.map-canvas__control-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;

  color: #191919;
}

.map-canvas__control-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>