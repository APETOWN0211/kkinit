<script setup lang="ts">
/*
 * /map 페이지.
 *
 * 현재 단계에서는 Figma 41:1897 의 nav 구성에 맞춰
 * placeholder 형식의 minimal 페이지만 제공한다.
 * 지도 UI 자체는 별도 작업으로 진행한다.
 */
</script>

<template>
  <div class="map-page">
    <div class="map-placeholder">
      <p class="map-placeholder__title">
        지도
      </p>
      <p class="map-placeholder__desc">
        지도 화면 준비 중입니다.
      </p>
    </div>
  </div>
</template>

<style scoped>
.map-page {
  width: 100%;
  min-height: 100%;
  background: var(--color-background);
  padding-top: calc(8px + env(safe-area-inset-top));
}

.map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  width: 100%;
  min-height: 360px;

  padding: 24px var(--page-padding);

  text-align: center;
}

.map-placeholder__title {
  margin: 0;

  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.44px;
}

.map-placeholder__desc {
  margin: 12px 0 0;

  font-size: 15px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--color-text-muted);
  letter-spacing: -0.3px;
}
</style>