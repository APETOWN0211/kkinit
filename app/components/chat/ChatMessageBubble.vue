<script setup lang="ts">
/*
 * /chat/[id] — message bubble component.
 *
 * Figma 93:868 mock conversation 그대로:
 *  - 'me' (현재 사용자): 오른쪽 정렬.
 *      bubble bg #75BBAC, text #FFFFFF, 17px Medium, padding 8 12, radius 16.
 *      multi-line 지원 (white-space: pre-line).
 *  - 'other': 왼쪽 정렬.
 *      bubble bg #F5F6F8, text #4D5160.
 *      avatar (32×32): 첫 message 앞 group 시작에서만 노출.
 *
 * Grouping (spec #15):
 *  - 'showAvatar': 같은 sender 연속 시 첫 row 에만 avatar.
 *    부모 (chat detail page) 가 messages 를 미리 보고 결정해 prop 으로 넘긴다.
 *
 * Restaurant message: 본 컴포넌트는 text 만 다루고,
 * restaurant share card 는 별도 컴포넌트로 render.
 * 단, 시각적 위치(우측 정렬 + bubble feel) + timestamp 는 bubble 컴포넌트가 wrap 한다.
 */
import { computed, type PropType } from 'vue'
import type { ChatSender } from '~/composables/useChatConversation'
import { getStorageImageUrl, STORAGE_FOLDERS } from '~/utils/storage'

const props = defineProps({
  sender: { type: String as PropType<ChatSender>, required: true },
  text: { type: String, required: true },
  /*
   * 시각적 nuance:
   *  - sender=other 일 때 "연속 메시지 그룹의 첫 row" 인 경우에만 노출.
   *  - sender=me 일 때는 항상 hide (오른쪽 정렬이므로 avatar 자체 없음).
   */
  showAvatar: { type: Boolean, default: false },
  /*
   * sender=other 일 때만 의미. avatar 이미지 src.
   */
  avatar: { type: String, default: '' },
  /*
   * 메시지 옆 timestamp (Figma #13):
   *  - 11px Medium #9F9A9A
   *  - bubble 위/아래 어느 쪽이든 spec 에 명시 없음.
   *    Figma 93:868 을 보면 bubble 우측 하단에 답. →
   *    다른(sender) 의 경우 avatar 옆 bubble 아래에 작게.
   *    내(sender) 의 경우 bubble 좌측 아래(왼쪽 정렬 영역)에 작게.
   *  - 실용적으로는 row 의 right end 에 두는 게 일관됨.
   *  - bubble 과 같은 row 의 끝에 두지 않고, row 자체의 end (max-width 끝)에 둔다.
   */
  time: { type: String, default: '' }
})

const isMe = computed(() => props.sender === 'me')

/*
 * props.avatar 는 storage path (e.g. "chat/profile-tiranori.png") 또는
 * 절대 path. setup context 안에서 resolve.
 */
const resolvedAvatar = computed(() =>
  props.avatar
    ? getStorageImageUrl(props.avatar, STORAGE_FOLDERS.chat)
    : ''
)
</script>

<template>
  <div
    class="bubble-row"
    :class="[
      isMe ? 'bubble-row--me' : 'bubble-row--other',
      showAvatar && !isMe ? 'bubble-row--with-avatar' : ''
    ]"
  >
    <!-- 상대 avatar (32×32) — showAvatar true 일 때만 노출 -->
    <div v-if="!isMe" class="bubble-row__avatar-cell">
      <img
        v-if="showAvatar && props.avatar"
        :src="resolvedAvatar"
        :alt="''"
        class="bubble-row__avatar"
      />
      <span v-else class="bubble-row__avatar-spacer" aria-hidden="true" />
    </div>

    <div class="bubble-row__content">
      <div
        class="bubble"
        :class="isMe ? 'bubble--me' : 'bubble--other'"
      >
        <span class="bubble__text">{{ props.text }}</span>
      </div>
    </div>

    <!-- Timestamp (Figma 93:868 의 11:20, 11:23 등) -->
    <span
      v-if="props.time"
      class="bubble-row__time"
      :class="isMe ? 'bubble-row__time--me' : 'bubble-row__time--other'"
    >{{ props.time }}</span>
  </div>
</template>

<style scoped>
/*
 * Figma 93:868 의 bubble row.
 *  - max-width 75% 정도까지 grow.
 *  - 8px top / 4px bottom gap.
 */
.bubble-row {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  width: 100%;
  box-sizing: border-box;

  padding: 4px 0;
  min-height: 28px;
}

.bubble-row--me {
  justify-content: flex-end;
}

.bubble-row--other {
  justify-content: flex-start;
}

/* 상대 avatar cell: 32×32 고정 폭. showAvatar=false 면 spacer 만. */
.bubble-row__avatar-cell {
  flex: 0 0 auto;
  width: 32px;
  height: 32px;
  align-self: flex-end;
  display: flex;
  align-items: flex-end;
  justify-content: flex-center;
}

.bubble-row__avatar {
  display: block;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  object-fit: cover;
  flex-shrink: 0;
}

.bubble-row__avatar-spacer {
  display: block;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

/* Bubble content container */
.bubble-row__content {
  flex: 0 1 auto;
  min-width: 0;
  max-width: 75%;
  display: flex;
}

.bubble-row--me .bubble-row__content {
  justify-content: flex-end;
}

.bubble-row--other .bubble-row__content {
  justify-content: flex-start;
}

/* ========================================
 * Bubbles
 * ======================================== */
.bubble {
  display: inline-block;
  max-width: 100%;

  padding: 8px 12px;
  border-radius: 16px;

  font-family: inherit;
  font-size: 17px;
  font-weight: 500;
  line-height: 22px;
  letter-spacing: -0.3px;

  white-space: pre-line;
  word-break: keep-all;
  box-sizing: border-box;
}

.bubble--me {
  background: #75BBAC;
  color: #FFFFFF;
  border-bottom-right-radius: 4px;
}

.bubble--other {
  background: #F5F6F8;
  color: #4D5160;
  border-bottom-left-radius: 4px;
}

.bubble__text {
  display: inline-block;
}

/* Timestamp (Figma: 11px Medium #9F9A9A) */
.bubble-row__time {
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 500;
  line-height: 14px;
  color: #9F9A9A;
  letter-spacing: -0.23px;
  white-space: nowrap;
  align-self: flex-end;
  padding-bottom: 2px;
}
</style>
