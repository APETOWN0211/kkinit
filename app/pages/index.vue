<script setup lang="ts">
import HomeHeader from '~/components/home/HomeHeader.vue'
import FeedPost from '~/components/feed/FeedPost.vue'

const activeTab = ref<'nearby' | 'following'>('nearby')

const setTab = (tab: 'nearby' | 'following') => {
  activeTab.value = tab
}

interface ContentLine {
  text: string
  isChip?: boolean
  chipType?: 'lime' | 'orange' | 'gray'
}

interface FeedPost {
  id: number
  author: {
    name: string
    avatar: string
    isFollowing?: boolean
  }
  time: string
  content: ContentLine[][]
  images: string[]
  likes: number
  comments: number
  reposts: number
}

const feedPosts: FeedPost[] = [
  {
    id: 1,
    author: {
      name: '죠니월드',
      avatar: '/images/feed/profile-johnny.png',
      isFollowing: false
    },
    time: '방금',
    content: [
      [
        { text: '맵지 않은 ', isChip: true, chipType: 'lime' },
        { text: '동네 ' },
        { text: '닭발', isChip: true, chipType: 'orange' },
        { text: ' 맛집이야.' }
      ],
      [
        { text: '저녁에도 '},
        { text: '자리 ', isChip: true, chipType: 'gray' },
        { text: '넉넉해서 좋았어.' }
      ]
    ],
    images: [
      '/images/feed/post1-food1.png',
      '/images/feed/post1-food2.png'
    ],
    likes: 14,
    comments: 2,
    reposts: 2
  },
  {
    id: 2,
    author: {
      name: '쿠루미',
      avatar: '/images/feed/profile-kurumi.png',
      isFollowing: false
    },
    time: '12분 전',
    content: [
      [
        { text: '여기 진짜 ' },
        { text: '분위기 좋은데' }
      ],
      [
        { text: '웨이팅', isChip: true, chipType: 'gray' },
        { text: ' 1시간은 심했다.' }
      ],
      [
        { text: '다시 올지는 고민됨.' }
      ]
    ],
    images: [
      '/images/feed/post2-food1.png',
      '/images/feed/post2-food2.png'
    ],
    likes: 14,
    comments: 2,
    reposts: 2
  },
  {
    id: 3,
    author: {
      name: '덕덕고',
      avatar: '/images/feed/profile-deokdeokgo.png',
      isFollowing: true
    },
    time: '12분 전',
    content: [
      [
        { text: '다들 밤에 배고플 때' }
      ],
      [
        { text: '웨이팅', isChip: true, chipType: 'gray' }
      ],
      [
        { text: '다시 올지는 고민됨.' }
      ]
    ],
    images: [
      '/images/feed/post1-food1.png',
      '/images/feed/post1-food2.png'
    ],
    likes: 14,
    comments: 2,
    reposts: 2
  },
  {
    id: 4,
    author: {
      name: '쿠루미',
      avatar: '/images/feed/profile-kurumi.png',
      isFollowing: true
    },
    time: '12분 전',
    content: [
      [
        { text: '여기 진짜 ' },
        { text: '맛은 있는데' }
      ],
      [
        { text: '웨이팅', isChip: true, chipType: 'gray' },
        { text: ' 1시간은 심했다.' }
      ],
      [
        { text: '다시 올지는 고민됨.' }
      ]
    ],
    images: [
      '/images/feed/post2-food1.png',
      '/images/feed/post2-food2.png'
    ],
    likes: 14,
    comments: 2,
    reposts: 2
  }
]
</script>

<template>
  <div class="home-page">
    <HomeHeader @tab-change="setTab" :active-tab="activeTab" />
    <div class="feed-list">
      <FeedPost
        v-for="post in feedPosts"
        :key="post.id"
        :post="post"
      />
    </div>
  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
  min-height: 100%;
  background: var(--color-background);
  padding-bottom: calc(var(--bottom-nav-height) + env(safe-area-inset-bottom));
}

.feed-list {
  display: flex;
  flex-direction: column;
}
</style>
