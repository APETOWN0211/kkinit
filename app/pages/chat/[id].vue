<script setup lang="ts">
/*
 * /chat/[id] — 채팅 상세 화면.
 *
 * Figma 93:868 (메인) / 93:937 (header) / 93:919 (restaurant share card).
 *
 *  - header: ChatDetailHeader (이름 / lastSeen / avatar / back + unread badge)
 *  - body:   오늘 divider + message bubbles + restaurant share card + system text
 *  - input:  ChatMessageInput (4-grid + pill + send)
 *
 *  - BottomNavigation 은 app.vue 에서 /chat/[id] 라우트일 때 자동 hide.
 *  - Status bar 구현 X — actual iPhone / PWA safe-area 만 사용.
 *  - DB 연결 X. local mock message array.
 *
 * Message grouping (spec #15):
 *  - 같은 sender 가 연속인 경우 첫 row 에만 avatar 표시.
 *  - 여기서는 "직전 메시지의 sender" 와 비교하여 결정.
 *
 * System text (식당을 공유했어요) 는 오른쪽 정렬 회색 13px Medium.
 */
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import type { ChatMessage, ChatSender } from '~/composables/useChatConversation'
import {
  useChatConversation
} from '~/composables/useChatConversation'
import ChatDetailHeader from '~/components/chat/ChatDetailHeader.vue'
import ChatMessageBubble from '~/components/chat/ChatMessageBubble.vue'
import ChatRestaurantShareCard from '~/components/chat/ChatRestaurantShareCard.vue'
import ChatTodayDivider from '~/components/chat/ChatTodayDivider.vue'
import ChatMessageInput from '~/components/chat/ChatMessageInput.vue'

const route = useRoute()
const { getConversation } = useChatConversation()

const conversationId = computed(() => {
  const raw = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  return raw ?? ''
})

const conversation = computed(() => getConversation(conversationId.value))

/*
 * Local messages — useChatConversation 의 mock 을 shallow copy 해서
 * input 으로 보낸 텍스트를 push 할 수 있도록 한다.
 * spec #28: DB 연결 X. local array.
 */
const messages = ref<ChatMessage[]>([])
const isInitialized = ref(false)

watch(
  conversation,
  (conv) => {
    if (!conv) return
    if (!isInitialized.value) {
      messages.value = [...conv.messages]
      isInitialized.value = true
    }
  },
  { immediate: true }
)

/*
 * Sender 가 "연속 그룹의 첫 행" 인지 판단한다.
 * system 메시지는 avatar 그룹과 무관하므로 false (자체 row).
 */
const groupStartMap = computed(() => {
  const result: Record<number, boolean> = {}
  const arr = messages.value
  for (let i = 0; i < arr.length; i++) {
    const m = arr[i]
    if (m.type === 'system') {
      result[m.id] = true
      continue
    }
    const prev = arr[i - 1]
    if (!prev || prev.type === 'system' || prev.sender !== m.sender) {
      result[m.id] = true
    } else {
      result[m.id] = false
    }
  }
  return result
})

const draft = ref('')

/* spec #28: input text → send → push + scroll bottom. */
const onSend = (text: string) => {
  /*
   * 새 message 의 id 는 timestamp 기반 monotonically increasing.
   * (충분히 큰 정수라서 기존 1, 2, 3 ... 와 충돌 없음.)
   */
  const id = Date.now()
  messages.value = [
    ...messages.value,
    {
      id,
      type: 'text',
      sender: 'me',
      text,
      time: formatNowTime()
    }
  ]
  scrollToBottom()
}

const formatNowTime = () => {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}

/* =========================================
 * Spec #29: 진입 시 scroll bottom
 *  - 첫 mount: 다음 tick 후 메시지 영역의 scrollTop 을 max 로.
 *  - 새 message 추가 시에도 동일.
 * ========================================= */
const scrollEl = ref<HTMLElement | null>(null)
const scrollToBottom = () => {
  nextTick(() => {
    const el = scrollEl.value
    if (!el) return
    el.scrollTop = el.scrollHeight
  })
}

onMounted(() => {
  scrollToBottom()
})

watch(
  () => messages.value.length,
  () => {
    scrollToBottom()
  }
)

/*
 * 입력 bar 가 fixed 라서, body 의 padding-bottom 만큼 확보해
 * 마지막 메시지가 가려지지 않도록 한다.
 *
 * ChatMessageInput visual height: 50 (Figma 93:948).
 * Figma 93:868 (frame 844): composer y=754 + h=50 → bar bottom = 40.
 * Desktop preview 에서 safe-area-inset-bottom = 0 이므로
 * composer 는 viewport bottom 0 에서 시작.
 * Spacer 는 composer visual height(50) + 안전 마진(12) = 62.
 *
 * iPhone (safe-area ~34) 에서는 bar 가 safe-area 위로 떠 있고,
 * 그 위 영역(50) 만큼만 message body 가 가려지므로 62 로 충분.
 */
const INPUT_BAR_RESERVED = 62

/* =========================================
 * Template helpers
 *  - template 안에서 inline TS cast(<...>) 가 들어가면
 *    vue template parser 가 generic 으로 인식해 parsing error 가
 *    나기도 한다. 안전한 값만 추출해 template 으로 넘긴다.
 * ========================================= */
type TextMessage = Extract<ChatMessage, { type: 'text' }>

const textOf = (m: ChatMessage): string =>
  m.type === 'text' ? (m as TextMessage).text : ''

const senderOf = (m: ChatMessage): ChatSender =>
  m.type === 'text' ? (m as TextMessage).sender : 'me'

const timeOf = (m: ChatMessage): string =>
  m.type === 'text' ? (m as TextMessage).time : ''
</script>

<template>
  <div v-if="conversation" class="chat-detail" role="main">
    <!-- Header -->
    <ChatDetailHeader
      :name="conversation.name"
      :last-seen="conversation.lastSeen"
      :avatar="conversation.avatar"
      :unread-count="8"
    />

    <!-- Body (scroll) -->
    <div ref="scrollEl" class="chat-detail__body">
      <div class="chat-detail__messages">
        <ChatTodayDivider />

        <template v-for="msg in messages" :key="msg.id">
          <p
            v-if="msg.type === 'system'"
            class="chat-system"
          >{{ msg.text }}</p>

          <div
            v-else-if="msg.type === 'restaurant'"
            class="chat-row-restaurant"
          >
            <ChatRestaurantShareCard
              :restaurant="msg.restaurant"
            />
          </div>

          <ChatMessageBubble
            v-else-if="msg.type === 'text'"
            :sender="senderOf(msg)"
            :text="textOf(msg)"
            :time="timeOf(msg)"
            :avatar="conversation.avatar"
            :show-avatar="
              senderOf(msg) === 'other'
                ? !!groupStartMap[msg.id]
                : false
            "
          />
        </template>
      </div>
    </div>

    <!-- Input -->
    <ChatMessageInput
      v-model="draft"
      @send="onSend"
    />

    <!-- Input bar 가 fixed 라서 마지막 메시지 가림 방지용 spacer. -->
    <div class="chat-detail__input-spacer" :style="{ height: INPUT_BAR_RESERVED + 'px' }" aria-hidden="true" />
  </div>

  <div v-else class="chat-detail chat-detail--missing">
    <!--
      존재하지 않는 conversation id 일 때 placeholder.
      back 으로 자연스럽게 이전 페이지로 돌아갈 수 있도록 한다.
    -->
    <ChatDetailHeader
      name="대화를 찾을 수 없습니다"
      last-seen=""
      avatar=""
    />
    <div class="chat-detail__empty">
      <p>이 대화는 더 이상 사용할 수 없어요.</p>
    </div>
  </div>
</template>

<style scoped>
/*
 * Figma 93:868 — frame 390 × 844
 *  - background: #FAFAFA
 *  - header: Figma 93:937 spec
 *  - body: top 77px 기준, padding-x 20, max content width 350
 *  - vertical gap 10px between messages
 */
.chat-detail {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  background: #FAFAFA;
  box-sizing: border-box;
}

.chat-detail--missing {
  min-height: 100%;
}

.chat-detail__body {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.chat-detail__body::-webkit-scrollbar {
  display: none;
}

.chat-detail__messages {
  display: flex;
  flex-direction: column;
  gap: 10px;

  width: 100%;
  max-width: 390px;

  padding: 12px 20px 16px;

  box-sizing: border-box;
}

/*
 * System text — Figma 93:868 의 "식당을 공유했어요"
 *  - 13px Medium #9F9A9A
 *  - 오른쪽 정렬
 */
.chat-system {
  align-self: flex-end;
  margin: 8px 0 0;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  line-height: 16px;
  color: #9F9A9A;
  letter-spacing: -0.2px;
  text-align: right;
}

/*
 * Restaurant share card row — Figma 93:919 wrapper.
 *  - 오른쪽 정렬.
 *  - card 자체는 266px fixed width.
 *  - parent padding 20 + max-width 390 안에서 right edge 에 정렬.
 */
.chat-row-restaurant {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

/*
 * 빈 placeholder (id 가 없을 때)
 */
.chat-detail__empty {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;

  font-family: inherit;
  font-size: 15px;
  font-weight: 400;
  color: #9F9A9A;
  text-align: center;
}

/* 입력 spacer (ChatMessageInput 가 fixed 라서 body 마지막이 가려지지 않게) */
.chat-detail__input-spacer {
  width: 100%;
  flex-shrink: 0;
}
</style>
