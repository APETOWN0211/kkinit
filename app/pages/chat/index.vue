<script setup lang="ts">
import ChatHeader from '~/components/chat/ChatHeader.vue'
import ChatProfileStrip from '~/components/chat/ChatProfileStrip.vue'
import ChatFilterTabs from '~/components/chat/ChatFilterTabs.vue'
import ChatList from '~/components/chat/ChatList.vue'
import type { ChatFilter } from '~/components/chat/ChatFilterTabs.vue'
import { getStorageImageUrl, STORAGE_FOLDERS } from '~/utils/storage'

const activeFilter = ref<ChatFilter>('all')

const onEdit = () => {
  // 편집 동작 (현재 단계에서는 no-op)
}

const onCompose = () => {
  // 새 대화 작성 (현재 단계에서는 no-op)
}

interface ProfileItem {
  id: string
  name: string
  avatar: string
  ring: 'orange' | 'orange-short' | 'gray' | 'none'
  dimName?: boolean
  showFollowPlus?: boolean
}

const profiles: ProfileItem[] = [
  {
    id: 'dalm',
    name: '닮은살걀',
    avatar: getStorageImageUrl('profile-dalm.png', STORAGE_FOLDERS.chat),
    ring: 'none',
    showFollowPlus: true
  },
  {
    id: 'johnny',
    name: '죠니월드',
    avatar: getStorageImageUrl('profile-johnny.png', STORAGE_FOLDERS.chat),
    ring: 'orange'
  },
  {
    id: 'tiranori',
    name: '티라노리',
    avatar: getStorageImageUrl('profile-tiranori.png', STORAGE_FOLDERS.chat),
    ring: 'orange-short'
  },
  {
    id: 'kurumi',
    name: '쿠루미',
    avatar: getStorageImageUrl('profile-kurumi.png', STORAGE_FOLDERS.chat),
    ring: 'gray',
    dimName: true
  },
  {
    id: 'ominsu',
    name: '오민수',
    avatar: getStorageImageUrl('profile-ominsu.png', STORAGE_FOLDERS.chat),
    ring: 'gray',
    dimName: true
  },
  {
    id: 'deokdeokgo',
    name: '덕덕고',
    avatar: getStorageImageUrl('profile-deokdeokgo.png', STORAGE_FOLDERS.feed),
    ring: 'gray',
    dimName: true
  }
]

interface Conversation {
  /*
   * id = detail route slug.
   * 1:1 의 경우 profile id 와 같은 string 을 사용해
   *   /chat/tiranori, /chat/johnnyworld 등 readable URL 을 만든다.
   * group 의 경우 별도 slug 사용.
   */
  id: string
  type: 'direct' | 'group'
  name: string
  avatar?: string
  ring?: 'orange' | 'orange-short' | 'gray' | 'none'
  memberCount?: number
  members?: string[]
  sender?: string
  lastMessage: string
  time: string
  unreadCount?: number
  badgeColor?: 'orange' | 'teal'
  muted?: boolean
}

const conversations: Conversation[] = [
  {
    id: 'tiranori',
    type: 'direct',
    name: '티라노리',
    avatar: getStorageImageUrl('profile-tiranori.png', STORAGE_FOLDERS.chat),
    ring: 'orange-short',
    lastMessage: '그래 여기 한번 가보자',
    time: '20:11',
    unreadCount: 1,
    badgeColor: 'orange'
  },
  {
    id: 'johnny',
    type: 'direct',
    name: '죠니월드',
    avatar: getStorageImageUrl('profile-johnny-muted.png', STORAGE_FOLDERS.chat),
    ring: 'orange-short',
    lastMessage: '안녕하세요! 마포구에서 만두집을 운영중인 ㅇㅁㄹㄴㅇㄹ',
    time: '17:03',
    muted: true
  },
  {
    id: 'group-hapjeong-yasik',
    type: 'group',
    name: '합정 야식 모임',
    members: [
      getStorageImageUrl('group-member-1.png', STORAGE_FOLDERS.chat),
      getStorageImageUrl('group-member-2.png', STORAGE_FOLDERS.chat),
      getStorageImageUrl('group-member-3.png', STORAGE_FOLDERS.chat)
    ],
    memberCount: 6,
    sender: '도기도그',
    lastMessage: '오늘 모임 너무 재미있었습니다!',
    time: '어제',
    unreadCount: 2,
    badgeColor: 'teal'
  },
  {
    id: 'ominsu',
    type: 'direct',
    name: '오민수',
    avatar: getStorageImageUrl('profile-ominsu-2.png', STORAGE_FOLDERS.chat),
    ring: 'gray',
    lastMessage: '오케이, 그때 봐!',
    time: '3일 전'
  },
  {
    id: 'baramsae',
    type: 'direct',
    name: '바람새',
    avatar: getStorageImageUrl('profile-baramsae.png', STORAGE_FOLDERS.chat),
    ring: 'none',
    lastMessage: '식당 정보를 보냈어요.',
    time: '일주일',
    unreadCount: 2,
    badgeColor: 'orange'
  },
  {
    id: 'paran',
    type: 'direct',
    name: '파란하늘구름',
    avatar: getStorageImageUrl('profile-paran.png', STORAGE_FOLDERS.chat),
    ring: 'gray',
    lastMessage: "'합정 야식 모임' 모임 가입 요청을 보냈어요.",
    time: '2주 전'
  },
  {
    id: 'ominsu-2',
    type: 'direct',
    name: '오민수',
    avatar: getStorageImageUrl('profile-ominsu-3.png', STORAGE_FOLDERS.chat),
    ring: 'gray',
    lastMessage: '안녕하세요! 마포구에서 만두집을 운영중인',
    time: '1달 전'
  }
  /*
   * NOTE: ominsu-2 아래의 mock conversation (추가 오민수,
   * 닉네임9, 마포구 맛집 탐방, 하늘바라기, 지우, 햇살한점, 고양이 집사 모임,
   * 초록이, 별빛루나, 달빛사냥꾼, 코코넛, 주말 등산 모임, 맛집헌터) 은 모두 제거.
   *
   * 이유: /chat 의 mock conversation list 는 다음 7 건만 표시:
   *   1) 티라노리 (tiranori)
   *   2) 쵸니월드 (johnny)
   *   3) 합정 야식 모임 (group-hapjeong-yasik)
   *   4) 오민수 (ominsu)
   *   5) 바람새 (baramsae)
   *   6) 파란하늘구름 (paran)
   *   7) 오민수 (ominsu-2) ← 두 번째 오민수 (여기까지 유지)
   * "전체 / 안읽음 / 모임" 모든 filter 에서도 동일하게 위 7 건만 렌더.
   *
   * CSS (display:none, nth-child) 로 가리지 않고 data 자체를 제거했으므로
   * filter 분기 (`filteredConversations`) 도 자동으로 줄어든 7 건만 반환한다.
   */
]

const unreadCount = computed(() =>
  conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0)
)

const groupCount = computed(() =>
  conversations.filter(c => c.type === 'group').length
)

const filteredConversations = computed(() => {
  if (activeFilter.value === 'unread') {
    return conversations.filter(c => (c.unreadCount ?? 0) > 0)
  }
  if (activeFilter.value === 'group') {
    return conversations.filter(c => c.type === 'group')
  }
  return conversations
})
</script>

<template>
  <div class="chat-page">
    <div class="chat-scroll">
      <ChatHeader @edit="onEdit" @compose="onCompose" />
      <ChatProfileStrip :items="profiles" />
      <div class="filter-area">
        <ChatFilterTabs
          v-model="activeFilter"
          :unread-count="unreadCount"
          :group-count="groupCount"
        />
      </div>
      <ChatList :items="filteredConversations" :filter="activeFilter" />
    </div>
  </div>
</template>

<style scoped>
/*
 * /chat (Figma 11:244)
 *  - 배경: #FAFAFA (--color-background)
 *  - desktop preview 에서도 status bar 를 흉내내지 않는다.
 *  - 실제 iPhone/PWA 에서만 env(safe-area-inset-top) 으로 노치 영역 확보.
 *  - floating BottomNavigation 아래로 마지막 row 가 가려지지 않도록
 *    page padding-bottom (app.vue 의 app-content--with-bottom-nav) +
 *    본 페이지의 추가 여유분으로 확보.
 */
.chat-page {
  width: 100%;
  min-height: 100%;
  background: var(--color-background);
}

.chat-scroll {
  display: flex;
  flex-direction: column;
  width: 100%;
  /*
    * Floating nav (Figma 3:266) 가 nav 자체 padding-bottom:
    *   safe-area + 25px 만큼 띄워져 있다.
    * app-content 는 이미 nav height + 24px 만큼 padding-bottom 을
    * 갖지만, nav 가 fixed 라 마지막 row 의 time 영역은 nav 위에 정확히
    * 걸쳐도 자연스럽다. 본 page 에서는 추가 padding 을 두지 않는다.
    */
  padding-bottom: 0;
}

.filter-area {
  margin: 8px 0;
}
</style>