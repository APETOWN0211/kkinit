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
.create-post-fab {
  position: fixed;
  z-index: 31;

  right: 22px;
  bottom: calc(env(safe-area-inset-bottom) + 8px);

  display: flex;
  align-items: center;
  justify-content: center;

  width: 58px;
  height: 58px;

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

  width: 58px;
  height: 58px;
}

.create-post-fab__icon :deep(svg) {
  display: block;
  width: 58px;
  height: 58px;
}

@media (min-width: 768px) {
  .create-post-fab {
    position: absolute;
  }
}
</style>