<script setup lang="ts">
import composeIcon from '~/assets/icons/chat/compose.svg?raw'

const emit = defineEmits<{
  (e: 'edit'): void
  (e: 'compose'): void
}>()

const onEdit = () => emit('edit')
const onCompose = () => emit('compose')
</script>

<template>
  <header class="chat-header">
    <button
      type="button"
      class="header-button header-button--text"
      aria-label="편집"
      @click="onEdit"
    >
      <span class="header-button__label">편집</span>
    </button>

    <h1 class="chat-title">대화</h1>

    <button
      type="button"
      class="header-button header-button--icon"
      aria-label="새 대화"
      @click="onCompose"
    >
      <span class="header-icon" v-html="composeIcon" />
    </button>
  </header>
</template>

<style scoped>
/*
 * Desktop preview 에서는 padding-top 이 0 이므로
 * Figma 의 iPhone status bar 영역을 흉내내지 않는다.
 * 실제 iPhone/PWA 에서만 env() 가 노치 높이를 반환한다.
 */
.chat-header {
  position: sticky;
  top: 0;
  z-index: 5;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: calc(50px + env(safe-area-inset-top));
  padding: env(safe-area-inset-top) var(--page-padding) 3px;
  box-sizing: border-box;
  background: var(--color-background);
}

.header-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 10px;
  background: #FFFFFF;
  border: none;
  border-radius: 18px;
  box-shadow: 0 2px 3.85px rgba(0, 0, 0, 0.09);
  cursor: pointer;
  transition: transform 120ms ease, opacity 120ms ease;
}

.header-button:active {
  transform: scale(0.96);
  opacity: 0.85;
}

.header-button--text {
  justify-self: start;
}

.header-button--icon {
  justify-self: end;
  width: 44px;
}

.header-button__label {
  display: inline-block;
  font-size: 17px;
  font-weight: 400;
  line-height: normal;
  color: var(--color-text-secondary);
  text-align: center;
  white-space: nowrap;
}

.header-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.header-icon :deep(svg) {
  display: block;
  width: 18px;
  height: 18px;
}

.chat-title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  line-height: normal;
  color: var(--color-text-primary);
  white-space: nowrap;
  text-align: center;
}
</style>