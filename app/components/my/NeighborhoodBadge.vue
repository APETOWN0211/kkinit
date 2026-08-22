<script setup lang="ts">
defineProps<{
  name: string
}>()
</script>

<template>
  <div class="neighborhood-badge">
    <!-- Outer: gradient background circle -->
    <div class="neighborhood-badge__outer">
      <!-- Inner: green gradient circle -->
      <div class="neighborhood-badge__inner">
        <!-- Star top-left -->
        <div class="neighborhood-badge__star neighborhood-badge__star--tl">
          <img src="/images/my/badges/star6.png" alt="" />
        </div>
        <!-- Star bottom-right -->
        <div class="neighborhood-badge__star neighborhood-badge__star--br">
          <img src="/images/my/badges/star7.png" alt="" />
        </div>
        <!-- Location icon -->
        <div class="neighborhood-badge__location">
          <img src="/images/my/badges/location.svg" alt="" />
        </div>
      </div>
    </div>
    <p class="neighborhood-badge__name">{{ name }}</p>
  </div>
</template>

<style scoped>
.neighborhood-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 90px;
}

/* Outer circle with gradient */
.neighborhood-badge__outer {
  width: 90px;
  height: 90px;
  border-radius: 122px;
  background: linear-gradient(209deg, #005a1e 4.8%, #94daac 52.7%, #005a1e 100.6%);
  padding: 2px;
  box-shadow: 0 3px 13.95px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

/* Inner green gradient circle */
.neighborhood-badge__inner {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 115px;
  background: linear-gradient(to bottom, #11ba55 0%, #005a1e 100%);
  border: 1px solid #b6e8cf;
  overflow: hidden;
}

/* Stars */
.neighborhood-badge__star {
  position: absolute;
}

.neighborhood-badge__star--tl {
  left: 5px;
  top: 14px;
  width: 18px;
  height: 18px;
}

.neighborhood-badge__star--br {
  left: 55px;
  top: 26px;
  width: 15px;
  height: 15px;
}

.neighborhood-badge__star img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

/* Location icon */
.neighborhood-badge__location {
  position: absolute;
  left: 16px;
  top: 7px;
  width: 44px;
  height: 44px;
}

.neighborhood-badge__location img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.neighborhood-badge__name {
  font-size: 14px;
  font-weight: 400;
  line-height: normal;
  color: var(--color-text-primary);
  text-align: center;
  margin: 0;
}
</style>
