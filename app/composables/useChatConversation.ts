/*
 * /chat/[id] (chat detail) mock data source.
 *
 * Spec:
 *  - 하드코딩된 message 배열을 template 처럼 반복하지 않는다.
 *  - 각 message 는 { id, type, sender, time, ... } 형태의 plain object.
 *  - Figma 93:868 의 mock conversation 을 그대로 따른다.
 *
 * Sender:
 *  - 'me'      = 현재 사용자 (닮은살걀). 오른쪽 bubble, #75BBAC.
 *  - 'other'   = 상대 (e.g. 티라노리). 왼쪽 bubble, #F5F6F8.
 *
 * Type:
 *  - 'text'        : 일반 텍스트 bubble
 *  - 'restaurant'  : 식당 공유 카드
 *  - 'system'      : 시스템 텍스트 (오른쪽 정렬, 회색, 13px Medium)
 *
 * IMPORTANT:
 *  - 이 모듈은 모듈-스코프에서 import 되는 plain TS 모듈이다.
 *  - 그러므로 Nuxt instance 가 아직 없는 시점 (module init) 에서
 *    안전하게 evaluate 되어야 한다.
 *  - 따라서 `getStorageImageUrl` / `useRuntimeConfig` 같은
 *    Nuxt composable 을 여기서 호출하면 안 된다.
 *  - image_path 는 storage path (e.g. "map/uchon-1.png") 또는
 *    절대 path (e.g. "/images/map/uchon-1.png") 만 보관하고,
 *    컴포넌트 측에서 `getStorageImageUrl` 로 resolve 한다.
 */
export type ChatSender = 'me' | 'other'

export interface ChatTextMessage {
  id: number
  type: 'text'
  sender: ChatSender
  text: string
  time: string
}

export interface ChatRestaurantMessage {
  id: number
  type: 'restaurant'
  sender: ChatSender
  time: string
  restaurant: ChatRestaurant
}

export interface ChatSystemMessage {
  id: number
  type: 'system'
  text: string
}

export type ChatMessage = ChatTextMessage | ChatRestaurantMessage | ChatSystemMessage

export interface ChatRestaurant {
  id: string
  name: string
  address: string
  distance: string
  /*
   * Storage path 또는 절대 path. 컴포넌트에서
   * `getStorageImageUrl(restaurant.image, STORAGE_FOLDERS.map)` 로
   * 실제 URL 로 resolve 한다.
   */
  image: string
  /*
   * /map 에서 selectable id.
   * - 공유 카드에서 "지도에서 확인하기" 클릭 시 /map 의
   *   selectedPlace state 와 연결하기 위한 key.
   * - 없으면 단순히 /map 으로만 이동 (현재 mock).
   */
  mapPlaceId?: string
}

export interface ChatConversation {
  id: string
  name: string
  /*
   * 상대 avatar 의 storage path 또는 절대 path.
   * 컴포넌트에서 `getStorageImageUrl` 로 resolve.
   */
  avatar: string
  lastSeen: string
  messages: ChatMessage[]
}

/* =========================================
 * Static mock conversations
 * ========================================= */

const tiranoriMessages: ChatMessage[] = [
  {
    id: 1,
    type: 'text',
    sender: 'me',
    text: '오늘 저녁 뭐먹을래?',
    time: '11:20'
  },
  {
    id: 2,
    type: 'text',
    sender: 'other',
    text: '아무거나 괜찮은데',
    time: '11:23'
  },
  {
    id: 3,
    type: 'text',
    sender: 'other',
    text: '너 뭐 땡김?',
    time: '11:30'
  },
  {
    id: 4,
    type: 'text',
    sender: 'me',
    text: '국밥은 좀 아니고\n매운거 땡김',
    time: '11:32'
  },
  {
    id: 5,
    type: 'text',
    sender: 'other',
    text: '그럼 마라탕?',
    time: '11:34'
  },
  {
    id: 6,
    type: 'text',
    sender: 'me',
    text: '어제 먹음ㅋㅋ',
    time: '11:35'
  },
  {
    id: 7,
    type: 'text',
    sender: 'me',
    text: '닭발어떰?',
    time: '11:35'
  },
  {
    id: 8,
    type: 'text',
    sender: 'other',
    text: '오 좋다',
    time: '11:36'
  },
  {
    id: 9,
    type: 'system',
    text: '식당을 공유했어요'
  },
  {
    id: 10,
    type: 'restaurant',
    sender: 'me',
    time: '11:36',
    restaurant: {
      id: 'seoul-dakbal',
      name: '서울닭발',
      address: '서울 마포구 독막로2길 23',
      distance: '17km · 합정동',
      image: 'map/uchon-1.png',
      mapPlaceId: 'uchon'
    }
  },
  {
    id: 11,
    type: 'text',
    sender: 'me',
    text: '여기로 와!',
    time: '11:36'
  }
]

const conversations: Record<string, ChatConversation> = {
  tiranori: {
    id: 'tiranori',
    name: '티라노리',
    avatar: 'chat/profile-tiranori.png',
    lastSeen: '1시간 전 접속',
    messages: tiranoriMessages
  }
}

/* =========================================
 * Public API
 * ========================================= */

export const useChatConversation = () => {
  /**
   * conversation id 로 mock conversation 을 가져온다.
   * 없으면 null 을 반환한다.
   */
  const getConversation = (id: string): ChatConversation | null => {
    return conversations[id] ?? null
  }

  return {
    getConversation
  }
}
