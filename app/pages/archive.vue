<script setup lang="ts">
import FeedPost, { type FeedPost as FeedPostType } from '~/components/feed/FeedPost.vue'
import ArchiveHeader from '~/components/archive/ArchiveHeader.vue'
import ArchiveTabs, { type ArchiveTab } from '~/components/archive/ArchiveTabs.vue'
import ArchivePlaceCard, { type ArchivePlace } from '~/components/archive/ArchivePlaceCard.vue'

/*
 * /archive — Figma 21:556 (이야기) / 21:667 (장소) actual
 *  - 단일 route, 내부 state 'story' | 'place' 로 콘텐츠만 전환
 *  - BottomNavigation / FAB 모두 비활성
 *  - 이야기: FeedPost[] 재사용
 *  - 장소 : ArchivePlaceCard[] (Figma 21:667 카드 디자인)
 *
 * Layout (Figma 두 frame 공통):
 *   - status bar   : 0 ~ 47
 *   - header       : 47 ~ 97 (50 tall)
 *   - tabs         : 97 ~ 149 (52 tall)
 *   - content      : 149 ~ (scroll)
 *
 * Figma 의 background:
 *   - 이야기: 21:556 bg-white
 *   - 장소  : 21:667 bg #F3F4F6 (cards 만 white)
 */

const activeTab = ref<ArchiveTab>('story')

const router = useRouter()

const onBack = () => {
  // ArchiveHeader 에서 이미 router.back() 호출, 이 핸들러는 placeholder.
}

const onEdit = () => {
  // 실제 편집 모드는 별도 작업. press feedback 만.
}

/*
 * 보관한 이야기 (Figma 21:556 의 3개 게시글).
 *
 * Figma 첫번째 post (21:565): 쿠루미 1분 전, 삼겹살/웨이팅 chip, 2 images.
 * Figma 두번째 post (21:596): 도기독 1분 전, 초밥/가족 chip, 2 images.
 * Figma 세번째 post (21:632): 조니 2일 전, 짜장면 chip, 2 images.
 *
 * 기존 Home (app/pages/index.vue) 의 첫번째 post 와 동일한 author/avatar/image path
 * 를 사용하고, 두번째/세번째는 재사용 가능한 feed 자산을 활용한다.
 */
const storyPosts: FeedPostType[] = [
  {
    id: 'a1',
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
  {
    id: 'a2',
    author: {
      name: '도기독',
      avatar: '/images/my/repost/dogidog-avatar.png',
      isFollowing: false
    },
    time: '1분 전',
    content: [
      [
        { text: '나만 알고싶은 ' },
        { text: '초밥', isChip: true, chipType: 'orange' },
        { text: ' 집..' }
      ],
      [
        { text: '가족', isChip: true, chipType: 'teal' },
        { text: ' 식사하기 좋아.' }
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
    id: 'a3',
    author: {
      name: '죠니월드',
      avatar: '/images/chat/profile-johnny.png',
      isFollowing: false
    },
    time: '2일 전',
    content: [
      [
        { text: '우리 학교 앞에 있는 중국집!!' }
      ],
      [
        { text: '친구들이랑 ' },
        { text: '짜장면', isChip: true, chipType: 'orange' },
        { text: ' 먹을 때 자주 옴.' }
      ]
    ],
    images: [
      '/images/feed/post2-food1.png',
      '/images/feed/post2-food2.png'
    ],
    likes: 149,
    comments: 2,
    reposts: 2
  }
]

/*
 * 보관한 장소 (Figma 21:667 의 4개 카드).
 * 첫 3개는 unique (우촌/오레노라멘/멕시코), 4번째는 우촌 반복(스크롤 영역 검증용).
 */
const places: ArchivePlace[] = [
  {
    id: 'p1',
    name: '숯불구이 우촌',
    address: '서울 마포구 포은로 27',
    hours: '08:00-20:30',
    locationChip: '망원동',
    categoryChip: '한식',
    thumbnail: '/images/archive/place-uchon.png',
    saved: true
  },
  {
    id: 'p2',
    name: '오레노라멘',
    address: '서울 마포구 독막로3길 16 1층',
    hours: '11:00-22:00',
    locationChip: '합정동',
    categoryChip: '일식',
    thumbnail: '/images/archive/place-orenoramen.png',
    saved: true
  },
  {
    id: 'p3',
    name: '멕시코식당',
    address: '서울 마포구 독막로2길 23',
    hours: '11:00-22:00',
    locationChip: '합정동',
    categoryChip: '멕시칸',
    thumbnail: '/images/archive/place-mexico.png',
    saved: true
  }
]
</script>

<template>
  <div class="archive-page">
    <!--
      Figma 21:785 (장소) 의 흰색 header band (h 149) 처럼,
      이야기/장소 둘 다 header + tabs 의 상단 149px 가 white 로 고정된다.
      (이야기 frame 도 같은 header 구조에 bg-white)
    -->
    <div class="archive-page__topbar">
      <ArchiveHeader
        @back="onBack"
        @edit="onEdit"
      />
      <ArchiveTabs v-model="activeTab" />
    </div>

    <div
      class="archive-page__body"
      :class="{
        'archive-page__body--place': activeTab === 'place'
      }"
    >
      <Transition name="archive-fade" mode="out-in">
        <div
          v-if="activeTab === 'story'"
          key="story"
          class="archive-page__story"
        >
          <FeedPost
            v-for="post in storyPosts"
            :key="post.id"
            :post="post"
            :show-bookmark="false"
          />
        </div>

        <div
          v-else
          key="place"
          class="archive-page__place"
        >
          <ArchivePlaceCard
            v-for="place in places"
            :key="place.id"
            :place="place"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
/*
 * /archive — Figma 21:556 / 21:667
 *
 *  - 상단 149px (status 47 + header 50 + tabs 52) 는 이야기/장소 공통으로 white.
 *  - 이야기 body: bg white (Figma 21:556 frame bg-white)
 *  - 장소 body  : bg #F3F4F6, cards white (Figma 21:667 frame bg + 21:669 cards)
 *  - scroll 은 .app-content (app.vue) 가 담당. archive-page 자체는 100% height
 *    만 가져서 중첩 scroll 을 만들지 않는다.
 */
.archive-page {
  display: flex;
  flex-direction: column;
  align-items: stretch;

  width: 100%;
  min-height: 100%;

  background: #ffffff;
}

.archive-page__topbar {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  background: #ffffff;
}

.archive-page__body {
  flex: 1 1 auto;
  min-height: 0;

  display: flex;
  flex-direction: column;
  align-items: stretch;

  width: 100%;

  background: #ffffff;
}

.archive-page__body--place {
  background: #f3f4f6;
}

.archive-page__story {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: 100%;
  background: #ffffff;
}

/*
 * Figma 21:556 (보관함 - 이야기) 의 frame bg-white.
 * Home/My 에서 FeedPost 는 --color-background (#FAFAFA) 위에 표시되도록
 * 그 자체의 background 가 #FAFAFA 이지만,
 * archive 의 이야기 탭은 Figma 와 동일하게 white 위에 post 가 표시되어야
 * 하므로 archive 안에서만 post 의 background 를 흰색으로 강제한다.
 * (Home/My 시각은 변하지 않음)
 */
.archive-page__story :deep(.feed-post) {
  background: #ffffff;
}

.archive-page__place {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
  background: #f3f4f6;
}

/* Tab content fade */
.archive-fade-enter-active,
.archive-fade-leave-active {
  transition: opacity 160ms cubic-bezier(0.22, 1, 0.36, 1);
}

.archive-fade-enter-from,
.archive-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .archive-fade-enter-active,
  .archive-fade-leave-active {
    transition: none;
  }
}
</style>
