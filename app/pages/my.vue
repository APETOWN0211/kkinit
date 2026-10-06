<script setup lang="ts">
/*
 * /my (MyPage) — Figma 18:553 (Feed) / 18:636 (Repost) / 18:758 (Badge).
 *
 *  - Single /my route, tab state via v-model.
 *  - Profile header (MyProfileHeader) is shared across all 3 tabs.
 *  - Tab content swaps between Feed posts / Repost posts / Badge grid.
 *  - No BottomNavigation, white theme-color (#FFFFFF), white background.
 */
import MyProfileHeader from '~/components/my/MyProfileHeader.vue'
import MyContentTabs, { type MyTab } from '~/components/my/MyContentTabs.vue'
import MyBadgeGrid from '~/components/my/MyBadgeGrid.vue'
import FeedPost from '~/components/feed/FeedPost.vue'
import type { FeedPost as FeedPostType } from '~/components/feed/FeedPost.vue'

const activeTab = ref<MyTab>('feed')

/* =========================
   Feed tab data (Figma 18:553)
   ========================= */
const myPosts: FeedPostType[] = [
  {
    id: 1,
    author: {
      name: '죠니월드',
      avatar: '/images/my/post-author.png',
      isFollowing: true
    },
    time: '1일 전',
    content: [
      [
        { text: '우리 학교 앞에 있는 중국집!!', chipType: undefined }
      ],
      [
        { text: '친구들이랑', chipType: undefined },
        { text: '짜장면', isChip: true, chipType: 'orange' },
        { text: '먹을 때 자주 옴.', chipType: undefined }
      ]
    ],
    images: [
      '/images/my/post-img1.png',
      '/images/my/post-img2.png'
    ],
    likes: 148,
    comments: 2,
    reposts: 1,
    isLiked: true,
    isBookmarked: false,
    isReposted: false
  },
  {
    id: 2,
    author: {
      name: '죠니월드',
      avatar: '/images/my/post-author.png',
      isFollowing: true
    },
    time: '2일 전',
    content: [
      [
        { text: '우리 학교 앞에 있는 중국집!!', chipType: undefined }
      ],
      [
        { text: '친구들이랑', chipType: undefined },
        { text: '짜장면', isChip: true, chipType: 'orange' },
        { text: '먹을 때 자주 옴.', chipType: undefined }
      ]
    ],
    images: [
      '/images/my/post-img1.png',
      '/images/my/post-img2.png'
    ],
    likes: 148,
    comments: 2,
    reposts: 1,
    isLiked: true,
    isBookmarked: false,
    isReposted: false
  }
]

/* =========================
   Repost tab data (Figma 18:636)
   ========================= */
const repostedPosts: FeedPostType[] = [
  {
    id: 11,
    author: {
      name: '쿠루미',
      avatar: '/images/my/repost/kurumi-avatar.png',
      isFollowing: false
    },
    time: '1분 전',
    content: [
      [
        { text: '우리 동네 유명한', chipType: undefined },
        { text: '삼겹살', isChip: true, chipType: 'orange' },
        { text: '집인데', chipType: undefined }
      ],
      [
        { text: '저녁에는', chipType: undefined },
        { text: '웨이팅', isChip: true, chipType: 'teal' },
        { text: '30분 정도 걸림..', chipType: undefined }
      ]
    ],
    images: [
      '/images/my/repost/kurumi-1.png',
      '/images/my/repost/kurumi-2.png'
    ],
    likes: 149,
    comments: 2,
    reposts: 2,
    isLiked: false,
    isBookmarked: false,
    isReposted: false
  },
  {
    id: 12,
    author: {
      name: '도기도그',
      avatar: '/images/my/repost/dogidog-avatar.png',
      isFollowing: false
    },
    time: '1분 전',
    content: [
      [
        { text: '나만 알고싶은', chipType: undefined },
        { text: '초밥', isChip: true, chipType: 'orange' },
        { text: '집..', chipType: undefined }
      ],
      [
        { text: '가족', isChip: true, chipType: 'teal' },
        { text: '식사하기 좋아.', chipType: undefined }
      ]
    ],
    images: [
      '/images/my/repost/dogidog-1.png',
      '/images/my/repost/dogidog-2.png'
    ],
    likes: 149,
    comments: 2,
    reposts: 2,
    isLiked: false,
    isBookmarked: false,
    isReposted: false
  },
  {
    id: 13,
    author: {
      name: '죠니월드',
      avatar: '/images/my/repost/johny-avatar.png',
      isFollowing: true
    },
    time: '2일 전',
    content: [
      [
        { text: '우리 학교 앞에 있는 중국집!!', chipType: undefined }
      ],
      [
        { text: '친구들이랑', chipType: undefined },
        { text: '짜장면', isChip: true, chipType: 'orange' },
        { text: '먹을 때 자주 옴.', chipType: undefined }
      ]
    ],
    images: [
      '/images/my/repost/johny-1.png',
      '/images/my/repost/johny-2.png'
    ],
    likes: 149,
    comments: 2,
    reposts: 2,
    isLiked: true,
    isBookmarked: false,
    isReposted: true
  }
]

/* =========================
   Badge tab data (Figma 18:758)
   ========================= */
const badges = [
  { name: '첫 끼', imageSrc: '/images/my/badges/first-meal.svg' },
  { name: '동네 한바퀴', imageSrc: '/images/my/badges/neighborhood.svg' },
  { name: '야식 출동', imageSrc: '/images/my/badges/late-night.svg' },
  { name: '같이 먹자', imageSrc: '/images/my/badges/eat-together.svg' }
]
</script>

<template>
  <div class="my-page">
    <!--
      Profile header (back / more / nickname / handle / avatar / bio / stats)
      는 세 tab 에서 동일하게 유지된다 (Figma 18:553/636/758 공통).
    -->
    <MyProfileHeader />

    <!--
      프로필 편집 + Feed/Repost/Badge 탭.
      프로필 편집은 Figma 18:567/753/772 의 full-width button.
    -->
    <MyContentTabs v-model="activeTab" />

    <!--
      Tab content.
      Profile Header / Tabs 가 위쪽에 고정된 채
      content 만 swap 된다 (route reload 없음).
    -->
    <div class="my-content">
      <Transition name="my-tab-fade" mode="out-in">
        <div v-if="activeTab === 'feed'" key="feed" class="my-feed">
          <FeedPost
            v-for="post in myPosts"
            :key="post.id"
            :post="post"
            :is-own-post="true"
            :show-bookmark="false"
          />
        </div>

        <div v-else-if="activeTab === 'repost'" key="repost" class="my-repost">
          <FeedPost
            v-for="post in repostedPosts"
            :key="post.id"
            :post="post"
            :is-own-post="false"
            :show-bookmark="false"
          />
        </div>

        <div v-else-if="activeTab === 'badge'" key="badge" class="my-badge">
          <MyBadgeGrid :badges="badges" />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.my-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100%;
  background: #ffffff;
}

.my-content {
  flex: 1;
  min-height: 0;
  background: var(--color-background);
}

/* Tab content transition */
.my-tab-fade-enter-active,
.my-tab-fade-leave-active {
  transition: opacity 150ms ease, transform 150ms ease;
}

.my-tab-fade-enter-from,
.my-tab-fade-leave-to {
  opacity: 0.75;
  transform: translateY(3px);
}
</style>
