<!--
  Figma 93:868 의 가운데 "오늘" 텍스트 + 양쪽 line.
   - text 14px, Pretendard Regular, #9F9A9A.
   - line 색 rgba(159,154,154,0.41), 두께 1px.
   - 가운데 텍스트 width 만큼 line 이 끊김.
-->
<template>
  <div class="chat-today" role="separator" aria-label="오늘">
    <span class="chat-today__line" aria-hidden="true" />
    <span class="chat-today__text">오늘</span>
    <span class="chat-today__line" aria-hidden="true" />
  </div>
</template>

<style scoped>
.chat-today {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 12px 0;
  box-sizing: border-box;
}

.chat-today__line {
  flex: 1 1 auto;
  height: 1px;
  background: rgba(159, 154, 154, 0.41);
}

.chat-today__text {
  flex: 0 0 auto;
  font-family: inherit;
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;
  color: #9F9A9A;
  letter-spacing: -0.2px;
  white-space: nowrap;
}
</style>
