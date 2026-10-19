<script setup lang="ts">
/*
 * /chat/[id] — 식당 공유 카드 (Figma 93:919).
 *
 *  - Figma actual spec:
 *      card: 266 wide, bg #F5F6F8, radius 18, padding 14 12, gap 10,
 *            shadow 0 1.193 9.781 rgba(0,0,0,0.04)
 *      image: 64×64, radius 8
 *      name (15px SemiBold #191919)
 *      address (12px Medium #191919)
 *      meta (12px Regular #4D5160)
 *      CTA "지도에서 확인하기": width 100%, height 38, bg #FE5531, white,
 *        13px SemiBold, radius ~9.5px
 *  - spec #22:
 *      CTA 클릭 → /map 으로 이동.
 *      가능하면 shared place 와 연결되어 selectedPlace state 도 set.
 *      현재 /map 은 useMapSelection 의 mapPlaceId → MapPlace.find 매핑 지원 X.
 *      단순 /map 이동 (over-engineering 금지).
 */
import { computed, type PropType } from 'vue'
import type { ChatRestaurant } from '~/composables/useChatConversation'
import { getStorageImageUrl, STORAGE_FOLDERS } from '~/utils/storage'

const props = defineProps({
  restaurant: { type: Object as PropType<ChatRestaurant>, required: true },
  /*
   * CTA 클릭 핸들러 (선택). 없으면 기본 동작 = /map 이동.
   * 외부에서 navigate 로직을 주입할 수 있도록 escape hatch 제공.
   */
  onCtaClick: { type: Function as PropType<() => void>, default: null }
})

/*
 * restaurant.image 는 storage path (e.g. "map/uchon-1.png") 또는
 * 절대 path. setup context 안에서 resolve.
 */
const resolvedImage = computed(() =>
  props.restaurant.image
    ? getStorageImageUrl(props.restaurant.image, STORAGE_FOLDERS.map)
    : ''
)

const router = useRouter()

const onCtaClick = () => {
  if (props.onCtaClick) {
    props.onCtaClick()
    return
  }
  /*
   * spec #22:
   *  - /map 자체로 이동.
   *  - selected place 사전 연결은 기존 구조에 매핑 helper 가 없으므로
   *    안전한 default = /map 으로 push.
   */
  router.push('/map')
}
</script>

<template>
  <article class="share-card" :aria-label="restaurant.name + ' 카드'">
    <div class="share-card__row">
      <!-- image 64×64 -->
      <div class="share-card__image">
        <img
          :src="resolvedImage"
          :alt="restaurant.name + ' 사진'"
        />
      </div>

      <!-- text column -->
      <div class="share-card__text">
        <div class="share-card__name">{{ restaurant.name }}</div>
        <div class="share-card__address">{{ restaurant.address }}</div>
        <div class="share-card__meta">{{ restaurant.distance }}</div>
      </div>
    </div>

    <!-- CTA: 지도에서 확인하기 -->
    <button
      type="button"
      class="share-card__cta"
      @click="onCtaClick"
    >지도에서 확인하기</button>
  </article>
</template>

<style scoped>
/*
 * Figma 93:919 card:
 *  - 266 wide
 *  - bg #F5F6F8
 *  - radius 18
 *  - padding 14 12
 *  - gap 10
 *  - shadow 0 1.193 9.781 rgba(0,0,0,0.04)
 */
.share-card {
  width: 266px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  padding: 14px 12px;
  background: #F5F6F8;
  border-radius: 18px;

  box-shadow: 0 1.193px 9.781px rgba(0, 0, 0, 0.04);

  box-sizing: border-box;

  flex-shrink: 0;
}

.share-card__row {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* image 64×64, radius 8 */
.share-card__image {
  flex: 0 0 auto;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  background: #E2E2E2;
}

.share-card__image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.share-card__text {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* name (15px SemiBold #191919) */
.share-card__name {
  font-family: inherit;
  font-size: 15px;
  font-weight: 600;
  line-height: 18px;
  letter-spacing: -0.3px;
  color: #191919;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* address (12px Medium #191919) */
.share-card__address {
  font-family: inherit;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  letter-spacing: -0.2px;
  color: #191919;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* distance (12px Regular #4D5160) */
.share-card__meta {
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  letter-spacing: -0.2px;
  color: #4D5160;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/*
 * CTA "지도에서 확인하기":
 *  - width 100%, height 38
 *  - bg #FE5531
 *  - white text, 13px SemiBold
 *  - radius 9.5px
 */
.share-card__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 38px;
  padding: 0;

  background: #FE5531;
  color: #FFFFFF;

  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.2px;

  border: 0;
  border-radius: 9.5px;

  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, opacity 120ms ease, background-color 120ms ease;
}

.share-card__cta:active {
  transform: scale(0.97);
  opacity: 0.9;
}
</style>
