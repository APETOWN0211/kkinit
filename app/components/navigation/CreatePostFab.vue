<script setup lang="ts">
import fabPlus from '~/assets/icons/home/fab-plus.svg?raw'

const router = useRouter()

const onClick = () => {
  /*
   * 현재 프로젝트에는 별도의 create/post route 가 없다.
   * 따라서 이번 단계에서는 press feedback 만 구현한다.
   */
}
</script>

<template>
  <button
    type="button"
    class="create-post-fab"
    aria-label="게시글 작성"
    @click="onClick"
  >
    <span class="create-post-fab__icon" v-html="fabPlus" />
  </button>
</template>

<style scoped>
/*
 * Figma 41:1897 — 네비게이션-글작성 (FAB)
 *  - size 58 × 58
 *  - background: #FF6940 (orange = primary)
 *  - + icon: white, size 24 (asset 자체가 24 path)
 *  - 위치: nav 의 우측에 독립 (Figma left:306, top:762)
 *  - shadow: SVG 자체에 포함된 drop-shadow filter 활용.
 */
/*
 * Figma 3:267: 58 × 58 circle, left 306, top 762
 *   (390 - 306 - 58 = 26 → right 26,  844 - 762 - 58 = 24 → bottom 24)
 *
 * 이 wrapper 는 90 × 90 asset 안의 원(58)을 그대로 받쳐주기 위한
 * hit area 이다. 원의 중심이 wrapper 정중앙이 되도록
 * 아래 offset 을 준다 (asset 의 원 위치 (16, 12) 를 반전).
 */
.create-post-fab {
  position: fixed;
  z-index: 31;

  right: 10px;
  bottom: calc(env(safe-area-inset-bottom) + 4px);

  display: flex;
  align-items: center;
  justify-content: center;

  width: 90px;
  height: 90px;

  padding: 0;

  border: 0;
  border-radius: 50%;

  background: transparent;

  cursor: pointer;

  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease;
}

.create-post-fab:active {
  transform: scale(0.94);
}

.create-post-fab__icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 90px;
  height: 90px;
}

/*
 * Figma 3:267 (네비게이션-글작성) 의 asset 은 90 × 90 이고,
 * 그 안에 원형 버튼 58 × 58 이 (16, 12) 에 들어있다 (shadow 포함).
 *
 * wrapper 를 90 × 90 으로 두면
 *   - 원 58px 가 정확히 1:1 로 그려지고
 *   - SVG 내부 drop shadow 까지 Figma 그대로 살아난다.
 *
 * (이전처럼 wrapper 를 58 × 58 로 두면 90 → 58 로 눌려
 *  원이 약 37px 로 작아지고 위치도 틀어진다.)
 */
.create-post-fab__icon :deep(svg) {
  display: block;
  width: 90px;
  height: 90px;
}

@media (min-width: 768px) {
  .create-post-fab {
    position: absolute;
  }
}
</style>