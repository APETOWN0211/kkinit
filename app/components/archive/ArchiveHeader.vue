<script setup lang="ts">
import backIcon from '~/assets/icons/common/back.svg?raw'

/*
 * ArchiveHeader — Figma 21:660 (이야기) / 21:786 (장소) actual
 *  - top: 47, h: 50
 *  - px: 20
 *  - justify-between
 *    - left   : 24×24 back icon
 *    - center : "보관함" Pretendard Medium 20 #191919 (exact center)
 *    - right  : "편집" Pretendard Regular 17 #4D5160
 *
 * Figma frame 의 색은 이야기 #FFFFFF, 장소 #FFFFFF 둘 다 white.
 */

const emit = defineEmits<{
  back: []
  edit: []
}>()

const router = useRouter()

const onBack = () => {
  emit('back')
  if (import.meta.client) {
    router.back()
  }
}

const onEdit = () => {
  emit('edit')
}
</script>

<template>
  <header class="archive-header">
    <button
      type="button"
      class="archive-header__back"
      aria-label="뒤로 가기"
      @click="onBack"
    >
      <span class="archive-header__back-icon" v-html="backIcon" />
    </button>

    <!--
      Figma 21:663 / 21:789: 보관함 Medium 20 #191919.
      우측 편집 element width 와 무관하게 viewport 정중앙에 위치하도록
      absolute + translate-x(-50%) 로 fixed center.
    -->
    <h1 class="archive-header__title">보관함</h1>

    <button
      type="button"
      class="archive-header__edit"
      aria-label="편집"
      @click="onEdit"
    >
      편집
    </button>
  </header>
</template>

<style scoped>
/*
 * ArchiveHeader — Figma 21:660 / 21:786 actual
 *  - h 50, px 20, bg white, justify-between
 *  - 좌 back 24×24 icon, 중앙 title absolute-center, 우 "편집" 17 Regular
 */
.archive-header {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: 50px;
  padding: 0 20px;
  box-sizing: border-box;

  background: #ffffff;
}

.archive-header__back {
  flex: 0 0 24px;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;
  padding: 0;
  margin: 0;

  border: 0;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, opacity 120ms ease;
}

.archive-header__back:active {
  transform: scale(0.9);
  opacity: 0.7;
}

.archive-header__back-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;
}

.archive-header__back-icon :deep(svg) {
  display: block;
  width: 100%;
  height: 100%;
}

/*
 * Figma 21:663 / 21:789: 보관함 Medium 20 #191919.
 * absolute center: left 50% + translateX(-50%) so it stays visually centered
 * regardless of the back / edit button widths.
 */
.archive-header__title {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  margin: 0;

  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 20px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0;

  color: #191919;
  white-space: nowrap;
}

.archive-header__edit {
  flex: 0 0 auto;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  height: 24px;
  padding: 0;
  margin: 0;

  border: 0;
  background: transparent;

  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 17px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0;

  color: #4d5160;
  white-space: nowrap;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, opacity 120ms ease;
}

.archive-header__edit:active {
  transform: scale(0.94);
  opacity: 0.6;
}
</style>
