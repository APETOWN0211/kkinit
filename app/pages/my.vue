<script setup lang="ts">
import MyProfileHeader from '~/components/my/MyProfileHeader.vue'
import MyContentTabs, { type MyTab } from '~/components/my/MyContentTabs.vue'
import MyBadgeGrid from '~/components/my/MyBadgeGrid.vue'
import FeedPost from '~/components/feed/FeedPost.vue'
import type { FeedPost as FeedPostType } from '~/components/feed/FeedPost.vue'

const activeTab = ref<MyTab>('feed')

// Mock data: my posts (Feed tab)
const myPosts: FeedPostType[] = [
  {
    id: 1,
    author: {
      name: '죠니월드',
      avatar: '/images/my/post-author.png',
      isFollowing: true
    },
    time: '12분 전',
    content: [
      [
        { text: '멀지 않은', isChip: true, chipType: 'lime' },
        { text: '동네', chipType: undefined },
        { text: '닭발', isChip: true, chipType: 'orange' },
        { text: '맛집이야.', chipType: undefined }
      ],
      [
        { text: '저녁에도', chipType: undefined },
        { text: '주차 자리', isChip: true, chipType: 'gray' },
        { text: '넉넉해서 좋았어.', chipType: undefined }
      ]
    ],
    images: ['/images/my/post-img1.png', '/images/my/post-img2.png'],
    likes: 14,
    comments: 2,
    reposts: 2,
    isLiked: false,
    isBookmarked: false,
    isReposted: false
  }
]

// Mock data: reposted posts (Repost tab)
const repostedPosts: FeedPostType[] = [
  {
    id: 2,
    author: {
      name: '죠니월드',
      avatar: '/images/my/post-author.png',
      isFollowing: true
    },
    time: '12분 전',
    content: [
      [
        { text: '멀지 않은', isChip: true, chipType: 'lime' },
        { text: '동네', chipType: undefined },
        { text: '닭발', isChip: true, chipType: 'orange' },
        { text: '맛집이야.', chipType: undefined }
      ],
      [
        { text: '저녁에도', chipType: undefined },
        { text: '주차 자리', isChip: true, chipType: 'gray' },
        { text: '넉넉해서 좋았어.', chipType: undefined }
      ]
    ],
    images: ['/images/my/post-img1.png', '/images/my/post-img2.png'],
    likes: 14,
    comments: 2,
    reposts: 2,
    isLiked: false,
    isBookmarked: false,
    isReposted: false
  }
]

// Mock data: badges
const badges = [
  { name: '첫 끼', imageSrc: '/images/my/badges/first-meal.svg' },
  { name: '동네 한바퀴', imageSrc: '/images/my/badges/neighborhood.svg' },
  { name: '야식 출동', imageSrc: '/images/my/badges/late-night.svg' },
  { name: '같이 먹자', imageSrc: '/images/my/badges/eat-together.svg' }
]

const onEdit = () => {}
const onShare = () => {}
const onSettings = () => navigateTo('/settings')
</script>

<template>
  <div class="my-page">
    <MyProfileHeader
      @edit="onEdit"
      @share="onShare"
      @settings="onSettings"
    />
    <MyContentTabs v-model="activeTab" />

    <div class="my-content">
      <Transition name="my-tab-fade" mode="out-in">
        <div v-if="activeTab === 'feed'" key="feed" class="my-feed">
          <FeedPost
            v-for="post in myPosts"
            :key="post.id"
            :post="post"
            :is-own-post="true"
          />
        </div>

        <div v-else-if="activeTab === 'repost'" key="repost" class="my-repost">
          <FeedPost
            v-for="post in repostedPosts"
            :key="post.id"
            :post="post"
            :is-own-post="true"
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
}

.my-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
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
