<script setup lang="ts">
import HomeTopBar from '~/components/home/HomeTopBar.vue'
import FeedPost, { type FeedPost as FeedPostType } from '~/components/feed/FeedPost.vue'

/*
 * Home — Figma node 3:170 (홈 - 메인) source of truth.
 *
 *  - frame        : 390 × 844, background #FFFFFF
 *  - header 3:269 : h 103 (status bar 47 + row 50 + 6)
 *  - feed  3:172 : y 103 부터 시작
 *      post 1 3:173 : y 0    (page y 103)
 *      post 2 3:236 : y 394  (page y 497)  ← divider 는 3:204 가 대신 담당
 *      post 3 3:204 : y 807  (page y 910)
 *  - nav    3:266 : 206 × 56, x 92, y 763  → viewport bottom 에 floating
 *  - FAB    3:267 : 58 × 58, x 306, y 762
 *
 * 기존 기능 유지:
 *  - 좌상단 프로필 버튼 → Side Drawer toggle (inject)
 *  - header / feed / nav / FAB 는 모두 .app-shell 내부라
 *    drawer open 시 함께 오른쪽으로 이동한다.
 */

/* Drawer state (app.vue provide/inject) — swipe 는 app.vue 레벨. */
const drawerState = inject<{
  isOpen: Ref<boolean>
  open: () => void
  close: () => void
  toggle: () => void
}>('drawer')

const onAvatarClick = () => {
  drawerState?.toggle()
}

interface FeedPostItem extends FeedPostType {}

const feedPosts: FeedPostItem[] = [
  /* ---- 3:173 쿠루미 (2 images) ---- */
  {
    id: 1,
    author: {
      name: '쿠루미',
      avatar: '/images/chat/profile-kurumi.png',
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
      '/images/feed/kurumi-samgyeopsal.png',
      '/images/feed/kurumi-storefront.png'
    ],
    likes: 149,
    comments: 2,
    reposts: 2
  },

  /* ---- 3:236 티라노리 (1 large image) ---- */
  {
    id: 2,
    author: {
      name: '티라노리',
      avatar: '/images/chat/profile-tiranori.png',
      isFollowing: false
    },
    time: '2시간 전',
    content: [
      [
        { text: '유명한 빵집 줄 서기 싫어서 들어갔는데' }
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
      '/images/feed/tiranori-bakery.png'
    ],
    likes: 14,
    comments: 2,
    reposts: 2
  },

  /* ---- 3:204 쿠루미 (heart already active) ---- */
  {
    id: 3,
    author: {
      name: '쿠루미',
      avatar: '/images/chat/profile-kurumi.png',
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
      '/images/feed/kurumi-samgyeopsal-alt.png'
    ],
    likes: 149,
    comments: 2,
    reposts: 2,
    isLiked: true
  }
]
</script>

<template>
  <div class="home-page">
    <HomeTopBar @avatar-click="onAvatarClick" />

    <div class="feed-list">
      <FeedPost
        v-for="post in feedPosts"
        :key="post.id"
        :post="post"
        :show-bookmark="false"
      />

      <!--
        Figma 의도: nav 가 두 번째 게시글 이미지 위에 뜬다
        (3:266 y 763 = 두 번째 post 3:259 이미지 y 612~820 위쪽).
        그래서 feed 를 nav 높이만큼 위로 밀지 않는다.
        마지막 게시글이 nav 뒤에 영원히 가려지지 않는 여유는
        app.vue 의 .app-content--with-bottom-nav
        (nav 56 + 여유 24 + safe-area) 이 담당한다.
      -->
    </div>
  </div>
</template>

<style scoped>
/*
 * Home page — Figma 3:170
 *  - background #FFFFFF (3:170 bg-white)
 *  - .feed-list 가 .app-content 안의 scroll container
 */
.home-page {
  display: flex;
  flex-direction: column;

  width: 100%;

  /*
   * Figma 3:170 bg-white.
   *
   * 앱 전역 하단 여백 (.app-content--with-bottom-nav 의 padding-bottom) 이
   * flex 컨테이너 (.app-content) 안에서 여백으로 계산되면, 이 배경이 그
   * 여백까지 채우는 대신 natural height 로 남게 된다.
   * 그결과 홈 피드 끝 아래에 .app-shell 의 #FAFAFA 가 그대로 드러나
   * "흰색 띠" 로 보이는 현상이 생긴다.
   *
   * flex: 1 + box-sizing: border-box 로 컨테이너 높이를 꽉 채워
   * 하단 여백까지 이 배경색(#FFFFFF)이 덮도록 한다.
   */
  flex: 1 1 auto;
  box-sizing: border-box;

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
