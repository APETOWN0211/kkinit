<script setup lang="ts">
import ChatHeader from '~/components/chat/ChatHeader.vue'
import ChatProfileStrip from '~/components/chat/ChatProfileStrip.vue'
import ChatFilterTabs from '~/components/chat/ChatFilterTabs.vue'
import ChatList from '~/components/chat/ChatList.vue'
import type { ChatFilter } from '~/components/chat/ChatFilterTabs.vue'

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
    avatar: '/images/chat/profile-dalm.png',
    ring: 'none',
    showFollowPlus: true
  },
  {
    id: 'johnny',
    name: '죠니월드',
    avatar: '/images/chat/profile-johnny.png',
    ring: 'orange'
  },
  {
    id: 'tiranori',
    name: '티라노리',
    avatar: '/images/chat/profile-tiranori.png',
    ring: 'orange-short'
  },
  {
    id: 'kurumi',
    name: '쿠루미',
    avatar: '/images/chat/profile-kurumi.png',
    ring: 'gray',
    dimName: true
  },
  {
    id: 'ominsu',
    name: '오민수',
    avatar: '/images/chat/profile-ominsu.png',
    ring: 'gray',
    dimName: true
  },
  {
    id: 'deokdeokgo',
    name: '덕덕고',
    avatar: '/images/feed/profile-deokdeokgo.png',
    ring: 'gray',
    dimName: true
  }
]

interface Conversation {
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
  badgeColor?: 'orange' | 'lime'
  muted?: boolean
}

const conversations: Conversation[] = [
  {
    id: 'c1',
    type: 'direct',
    name: '티라노리',
    avatar: '/images/chat/profile-tiranori.png',
    ring: 'orange-short',
    lastMessage: '그래 여기 한번 가보자',
    time: '20:11',
    unreadCount: 1,
    badgeColor: 'orange'
  },
  {
    id: 'c2',
    type: 'direct',
    name: '죠니월드',
    avatar: '/images/chat/profile-johnny-muted.png',
    ring: 'orange-short',
    lastMessage: '안녕하세요! 마포구에서 만두집을 운영중인 ㅇㅁㄹㄴㅇㄹ',
    time: '17:03',
    muted: true
  },
  {
    id: 'c3',
    type: 'group',
    name: '합정 야식 모임',
    members: [
      '/images/chat/group-member-1.png',
      '/images/chat/group-member-2.png',
      '/images/chat/group-member-3.png'
    ],
    memberCount: 6,
    sender: '도기도그',
    lastMessage: '오늘 모임 너무 재미있었습니다!',
    time: '어제',
    unreadCount: 2,
    badgeColor: 'lime'
  },
  {
    id: 'c4',
    type: 'direct',
    name: '오민수',
    avatar: '/images/chat/profile-ominsu-2.png',
    ring: 'gray',
    lastMessage: '오케이, 그때 봐!',
    time: '3일 전'
  },
  {
    id: 'c5',
    type: 'direct',
    name: '바람새',
    avatar: '/images/chat/profile-baramsae.png',
    ring: 'none',
    lastMessage: '식당 정보를 보냈어요.',
    time: '일주일',
    unreadCount: 2,
    badgeColor: 'orange'
  },
  {
    id: 'c6',
    type: 'direct',
    name: '파란하늘구름',
    avatar: '/images/chat/profile-paran.png',
    ring: 'gray',
    lastMessage: "'합정 야식 모임' 모임 가입 요청을 보냈어요.",
    time: '2주 전'
  },
  {
    id: 'c7',
    type: 'direct',
    name: '오민수',
    avatar: '/images/chat/profile-ominsu-3.png',
    ring: 'gray',
    lastMessage: '안녕하세요! 마포구에서 만두집을 운영중인',
    time: '한달 전'
  },
  {
    id: 'c8',
    type: 'direct',
    name: '오민수',
    avatar: '/images/chat/profile-ominsu-2.png',
    ring: 'gray',
    lastMessage: '안녕하세요! 마포구에서 만두집을 운영중인',
    time: '1일 전'
  },
  {
    id: 'c9',
    type: 'direct',
    name: '닉네임9',
    avatar: '/images/chat/profile-nickname9.png',
    ring: 'orange-short',
    lastMessage: '내일 같이 가요!',
    time: '12:42'
  },
  {
    id: 'c10',
    type: 'group',
    name: '마포구 맛집 탐방',
    members: [
      '/images/chat/group-member-1.png',
      '/images/chat/group-member-2.png',
      '/images/chat/group-member-3.png'
    ],
    memberCount: 8,
    sender: '바람새',
    lastMessage: '여기 진짜 맛있어요 추천!',
    time: '오늘',
    unreadCount: 3,
    badgeColor: 'lime'
  },
  {
    id: 'c11',
    type: 'direct',
    name: '하늘바라기',
    avatar: '/images/chat/profile-sky.png',
    ring: 'none',
    lastMessage: '사진 잘 봤어요 :)',
    time: '오늘'
  },
  {
    id: 'c12',
    type: 'direct',
    name: '지우',
    avatar: '/images/chat/profile-jiwoo.png',
    ring: 'gray',
    lastMessage: '주말에 시간 되세요?',
    time: '어제'
  },
  {
    id: 'c13',
    type: 'direct',
    name: '햇살한점',
    avatar: '/images/chat/profile-sun.png',
    ring: 'orange',
    lastMessage: '답장 고마워요!',
    time: '2일 전',
    unreadCount: 1,
    badgeColor: 'orange'
  },
  {
    id: 'c14',
    type: 'group',
    name: '고양이 집사 모임',
    members: [
      '/images/chat/group-member-2.png',
      '/images/chat/group-member-3.png',
      '/images/chat/group-member-4.png'
    ],
    memberCount: 12,
    sender: '냥냥이',
    lastMessage: '새로운 사진 공유합니다 🐱',
    time: '3일 전',
    muted: true
  },
  {
    id: 'c15',
    type: 'direct',
    name: '초록이',
    avatar: '/images/chat/profile-green.png',
    ring: 'none',
    lastMessage: '카페에서 만나요',
    time: '4일 전'
  },
  {
    id: 'c16',
    type: 'direct',
    name: '별빛루나',
    avatar: '/images/chat/profile-luna.png',
    ring: 'orange-short',
    lastMessage: '내일 일정 변경 가능할까요?',
    time: '5일 전',
    unreadCount: 4,
    badgeColor: 'orange'
  },
  {
    id: 'c17',
    type: 'direct',
    name: '달빛사냥꾼',
    avatar: '/images/chat/profile-moon.png',
    ring: 'gray',
    lastMessage: '알겠어요 :)',
    time: '6일 전'
  },
  {
    id: 'c18',
    type: 'direct',
    name: '코코넛',
    avatar: '/images/chat/profile-coco.png',
    ring: 'none',
    lastMessage: '재밌는 영상 보냈어요!',
    time: '일주일 전'
  },
  {
    id: 'c19',
    type: 'group',
    name: '주말 등산 모임',
    members: [
      '/images/chat/group-member-1.png',
      '/images/chat/group-member-3.png',
      '/images/chat/group-member-4.png'
    ],
    memberCount: 5,
    sender: '산꾼',
    lastMessage: '이번 주 토요일 북한산 어때요?',
    time: '2주 전',
    unreadCount: 1,
    badgeColor: 'lime'
  },
  {
    id: 'c20',
    type: 'direct',
    name: '맛집헌터',
    avatar: '/images/chat/profile-hunter.png',
    ring: 'orange',
    lastMessage: '신규 맛집 리뷰 올렸어요!',
    time: '한달 전'
  }
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
 * Desktop preview 에서는 Figma 의 iPhone status bar 영역을
 * 인위적으로 만들지 않는다.
 * 실제 iPhone/PWA 에서만 env(safe-area-inset-top) 이
 * 0 이 아닌 값을 반환하며, 이때만 위쪽 여백이 생긴다.
 */
.chat-page {
  width: 100%;
  min-height: 100%;
  background: var(--color-background);
  padding-top: 0;
  padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom));
}

.chat-scroll {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.filter-area {
  margin: 8px 0;
}
</style>