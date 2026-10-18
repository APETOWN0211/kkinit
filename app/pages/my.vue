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
import MyPostEditSheet from '~/components/my/MyPostEditSheet.vue'
import { getStorageImageUrl, STORAGE_FOLDERS } from '~/utils/storage'
import { formatRelativeTime } from '~/utils/relative-time'

/*
 * 프로필 편집 route 가 아직 없다면 그대로 stay.
 */
const onEditProfile = () => {
  safeNavigate('/profile/edit')
}

const activeTab = ref<MyTab>('feed')

/* =========================
 * Current user (single source of truth)
 * =========================
 *
 * Feed 탭의 모든 게시글 author 는 이 객체를 그대로 사용한다.
 * 상단 MyProfileHeader 가 렌더링하는 avatar / name 과
 * 100% 같은 데이터 — 절대 따로 하드코딩하지 않는다.
 *
 * - avatar: MyProfileHeader 가 쓰는 '/images/my/avatar.png' 와 동일한 path.
 *           (이전에는 '/images/my/post-author.png' 였는데, 그 파일이 다른
 *            avatar (duck) 로 매핑되어 있어 상단과 불일치했음 → 통일.)
 */
const currentUser = {
  id: 'boiled-egg',
  displayName: '닮은살걀',
  username: 'boiled_egg',
  avatar: getStorageImageUrl('avatar.png', STORAGE_FOLDERS.my)
}

/* =========================
   Feed tab data (Figma 18:553)
   ========================= */
const myPosts = ref<FeedPostType[]>([
  {
    id: 1,
    author: {
      name: currentUser.displayName,
      avatar: currentUser.avatar,
      isFollowing: true
    },
    time: '1일 전',
    createdAt: new Date(Date.now() - 30 * 60_000).toISOString(),
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
      getStorageImageUrl('post-img1.png', STORAGE_FOLDERS.my),
      getStorageImageUrl('post-img2.png', STORAGE_FOLDERS.my)
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
      name: currentUser.displayName,
      avatar: currentUser.avatar,
      isFollowing: true
    },
    time: '2일 전',
    createdAt: new Date(Date.now() - 25 * 60_000).toISOString(),
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
      getStorageImageUrl('post-img1.png', STORAGE_FOLDERS.my),
      getStorageImageUrl('post-img2.png', STORAGE_FOLDERS.my)
    ],
    likes: 10,
    comments: 0,
    reposts: 1,
    isLiked: true,
    isBookmarked: false,
    isReposted: false
  }
])

/*
 * 정렬된 내 게시글 — createdAt DESC (1분 전이 항상 위).
 * createdAt 이 없는 항목은 가장 뒤로 (fallback).
 */
const sortedMyPosts = computed(() => {
  return [...myPosts.value].sort((a, b) => {
    if (a.createdAt && b.createdAt) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
    if (a.createdAt) return -1
    if (b.createdAt) return 1
    return b.id - a.id
  })
})

/*
 * Edit sheet state.
 *  - editingPost 가 null 이면 시트 닫힘.
 *  - onMore() 가 emit('edit', post) 보내면 여기서 잡아서 시트 오픈.
 *  - 저장 시: myPosts 의 해당 id 의 content/time 갱신.
 */
const editingPost = ref<FeedPostType | null>(null)
const isEditSheetOpen = ref(false)
const _nowTick = ref(Date.now())
let _tickHandle: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  _tickHandle = setInterval(() => {
    _nowTick.value = Date.now()
  }, 60_000)
})
onBeforeUnmount(() => {
  if (_tickHandle) clearInterval(_tickHandle)
})

const onEditPost = (post: FeedPostType) => {
  // repost posts should never come here because isOwnPost=false,
  // but guard anyway.
  if (activeTab.value !== 'feed') return
  editingPost.value = post
  isEditSheetOpen.value = true
}

const onCloseEdit = () => {
  isEditSheetOpen.value = false
  // keep editingPost for a moment so the slide-out transition can play
  setTimeout(() => {
    editingPost.value = null
  }, 220)
}

const onSaveEdit = (payload: { id: number; content: string; createdAt: string }) => {
  const target = myPosts.value.find(p => p.id === payload.id)
  if (!target) return

  /*
   * content textarea plain text → ContentLine[][] 변환.
   *  - 비어있지 않은 줄만 line 으로.
   *  - 한 줄 안의 단어들은 단순 공백 split.
   *  - 기존에 chip 이 있었던 단어는 chip 으로 복원 (단어 매칭).
   *  - 줄 전체가 "<keyword>" 인 경우 chip 으로 (orange 기본).
   */
  const oldChips: Array<{ text: string; chipType: 'lime' | 'orange' | 'gray' | 'teal' }> = []
  for (const line of target.content) {
    for (const seg of line) {
      if (seg.isChip && seg.chipType) {
        oldChips.push({ text: seg.text, chipType: seg.chipType })
      }
    }
  }

  const newLines = payload.content
    .split('\n')
    .map(raw => raw.trim())
    .filter(raw => raw.length > 0)
    .map(raw => {
      const tokens = raw.split(/\s+/).filter(Boolean)
      return tokens.map(tok => {
        const match = oldChips.find(c => c.text === tok)
        if (match) {
          return { text: tok, isChip: true, chipType: match.chipType }
        }
        // '#' or '@' prefix 가 있으면 teal chip
        if (tok.startsWith('#') || tok.startsWith('@')) {
          return { text: tok, isChip: true, chipType: 'teal' as const }
        }
        return { text: tok, chipType: undefined }
      })
    })

  target.content = newLines
  target.createdAt = payload.createdAt
  target.time = formatRelativeTime(payload.createdAt)
  onCloseEdit()
}

/* =========================
   Repost tab data (Figma 18:636)
   ========================= */
const repostedPosts: FeedPostType[] = [
  {
    id: 11,
    author: {
      name: '쿠루미',
      avatar: getStorageImageUrl('profile-kurumi.png', STORAGE_FOLDERS.chat),
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
      getStorageImageUrl('my-repost-kurumi-1.png', STORAGE_FOLDERS.root),
      getStorageImageUrl('my-repost-kurumi-2.png', STORAGE_FOLDERS.root)
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
      avatar: getStorageImageUrl('my-repost-dogidog-avatar.png', STORAGE_FOLDERS.root),
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
      getStorageImageUrl('my-repost-dogidog-1.png', STORAGE_FOLDERS.root),
      getStorageImageUrl('my-repost-dogidog-2.png', STORAGE_FOLDERS.root)
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
      avatar: getStorageImageUrl('my-repost-johny-avatar.png', STORAGE_FOLDERS.root),
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
      getStorageImageUrl('my-repost-johny-1.png', STORAGE_FOLDERS.root),
      getStorageImageUrl('my-repost-johny-2.png', STORAGE_FOLDERS.root)
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
  { name: '첫 끼', imageSrc: getStorageImageUrl('my-badges-first-meal.svg', STORAGE_FOLDERS.root) },
  { name: '동네 한바퀴', imageSrc: getStorageImageUrl('my-badges-neighborhood.svg', STORAGE_FOLDERS.root) },
  { name: '야식 출동', imageSrc: getStorageImageUrl('my-badges-late-night.svg', STORAGE_FOLDERS.root) },
  { name: '같이 먹자', imageSrc: getStorageImageUrl('my-badges-eat-together.svg', STORAGE_FOLDERS.root) }
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
    <MyContentTabs v-model="activeTab" @edit="onEditProfile" />

    <!--
      Tab content.
      Profile Header / Tabs 가 위쪽에 고정된 채
      content 만 swap 된다 (route reload 없음).
    -->
    <div class="my-content">
      <Transition name="my-tab-fade" mode="out-in">
        <div v-if="activeTab === 'feed'" key="feed" class="my-feed">
          <FeedPost
            v-for="post in sortedMyPosts"
            :key="post.id"
            :post="post"
            :is-own-post="true"
            :show-bookmark="false"
            @edit="onEditPost"
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

    <!--
      내 게시글 수정 bottom sheet.
      editingPost 가 null 이면 mount 되지 않음.
    -->
    <MyPostEditSheet
      v-if="editingPost"
      :post="editingPost"
      :open="isEditSheetOpen"
      @close="onCloseEdit"
      @save="onSaveEdit"
    />
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
