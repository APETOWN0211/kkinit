<script setup lang="ts">
import HomeTopBar from '~/components/home/HomeTopBar.vue'
import FeedPost, { type FeedPost as FeedPostType } from '~/components/feed/FeedPost.vue'

/*
 * Figma 1:261 / 1:538 기반 Home.
 *
 *  - drawer state는 app.vue에서 provide/inject로 공유
 *  - main content slide animation은 index.vue에서 직접 관리
 *  - overlay는 app.vue에서 fixed로 렌더링
 *  - app-content scroll은 그대로 유지
 */
interface FeedPostItem extends FeedPostType {}

const feedPosts: FeedPostItem[] = [
  {
    id: 1,
    author: {
      name: '쿠루미',
      avatar: '/images/feed/profile-kurumi.png',
      isFollowing: false
    },
    time: '1분 전',
    content: [
      [
        { text: '우리 동네 유명한 ' },
        { text: '삼겹살', isChip: true, chipType: 'orange' },
        { text: ' 집인데' }
      ],
      [
        { text: '저녁에는 ' },
        { text: '웨이팅', isChip: true, chipType: 'teal' },
        { text: ' 30분 정도 걸림..' }
      ]
    ],
    images: [
      '/images/feed/post1-food1.png',
      '/images/feed/post1-food2.png'
    ],
    likes: 149,
    comments: 2,
    reposts: 2
  },
  {
    id: 2,
    author: {
      name: '티라노리',
      avatar: '/images/feed/profile-tiranori.png',
      isFollowing: false
    },
    time: '2시간 전',
    content: [
      [
        { text: '유명한 빵집 줄 서기 싫어서 들어갔는데 ' }
      ],
      [
        { text: '오히려 여기가 좋았음.' }
      ],
      [
        { text: '소금빵', isChip: true, chipType: 'orange' },
        { text: ' 은 포장하고 바로드셈' }
      ]
    ],
    images: [
      '/images/feed/post2-food1.png'
    ],
    likes: 14,
    comments: 2,
    reposts: 2
  },
  {
    id: 3,
    author: {
      name: '쿠루미',
      avatar: '/images/feed/profile-kurumi.png',
      isFollowing: false
    },
    time: '1분 전',
    content: [
      [
        { text: '우리 동네 유명한 ' },
        { text: '삼겹살', isChip: true, chipType: 'orange' },
        { text: ' 집인데' }
      ],
      [
        { text: '저녁에는 ' },
        { text: '웨이팅', isChip: true, chipType: 'teal' },
        { text: ' 30분 정도 걸림..' }
      ]
    ],
    images: [
      '/images/feed/post1-food1.png',
      '/images/feed/post1-food2.png'
    ],
    likes: 14,
    comments: 2,
    reposts: 2
  }
]

// Get drawer state from app.vue provide/inject
const drawerState = inject<{ isOpen: Ref<boolean>; open: () => void; close: () => void; toggle: () => void }>('drawer')

const onAvatarClick = () => {
  drawerState?.toggle()
}
</script>

<template>
  <div class="home-page">
    <HomeTopBar @avatar-click="onAvatarClick" />
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
/*
 * Home page: fills .app-content scroll container.
 * app-content is the scroll container (overflow-y:auto).
 * .home-page is flex-col, height:100% so it fills app-content.
 * .feed-list has its own scroll.
 */
.home-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  background: #FFFFFF;
}

.feed-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  background: #FFFFFF;
}

.feed-list::-webkit-scrollbar {
  display: none;
}
</style>
