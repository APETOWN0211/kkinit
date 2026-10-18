<script setup lang="ts">
import HomeTopBar from '~/components/home/HomeTopBar.vue'
import FeedPost from '~/components/feed/FeedPost.vue'
import { useFeedPosts } from '~/composables/useFeedPosts'

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
 *
 * spec #28 — Home feed 는 Supabase (posts / profiles / post_images / post_tags) 에서
 * 가져온다. mock array 의존 제거.
 * spec #33 / #34 — loading skeleton, empty state, error state.
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

const { posts, loading, error, reload } = useFeedPosts()
</script>

<template>
  <div class="home-page">
    <HomeTopBar @avatar-click="onAvatarClick" />

    <div class="feed-list">
      <!-- spec #32 — loading skeleton -->
      <div v-if="loading" class="feed-skeleton" aria-hidden="true">
        <div v-for="n in 3" :key="n" class="feed-skeleton__item">
          <div class="feed-skeleton__avatar" />
          <div class="feed-skeleton__body">
            <div class="feed-skeleton__line feed-skeleton__line--short" />
            <div class="feed-skeleton__line" />
            <div class="feed-skeleton__line" />
            <div class="feed-skeleton__media" />
          </div>
        </div>
      </div>

      <template v-else>
        <FeedPost
          v-for="post in posts"
          :key="post.id"
          :post="post"
          :show-bookmark="false"
        />

        <!-- spec #34 — empty state -->
        <div v-if="posts.length === 0 && !error" class="feed-empty">
          <p>아직 올라온 이야기가 없어요.</p>
          <button class="feed-empty__retry" @click="reload">새로고침</button>
        </div>

        <!-- spec #33 — error state -->
        <div v-if="error" class="feed-error">
          <p>게시글을 불러오지 못했어요.</p>
          <p class="feed-error__msg">{{ error }}</p>
          <button class="feed-empty__retry" @click="reload">다시 시도</button>
        </div>
      </template>
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

/* ===========================================================
 * spec #32 — Loading skeleton
 * =========================================================== */
.feed-skeleton {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px var(--page-padding);
}
.feed-skeleton__item {
  display: flex;
  gap: 10px;
  padding: 12px 0;
  border-top: 1px solid var(--color-divider);
}
.feed-skeleton__item:first-child { border-top: 0; }
.feed-skeleton__avatar {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: #ECEEF1;
  flex-shrink: 0;
  animation: feed-skeleton-pulse 1.2s ease-in-out infinite;
}
.feed-skeleton__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.feed-skeleton__line {
  height: 12px;
  background: #ECEEF1;
  border-radius: 4px;
  width: 100%;
  animation: feed-skeleton-pulse 1.2s ease-in-out infinite;
}
.feed-skeleton__line--short { width: 35%; }
.feed-skeleton__media {
  height: 208px;
  background: #ECEEF1;
  border-radius: 12px;
  animation: feed-skeleton-pulse 1.2s ease-in-out infinite;
}
@keyframes feed-skeleton-pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 0.9; }
}

/* ===========================================================
 * spec #33 / #34 — empty / error state
 * =========================================================== */
.feed-empty,
.feed-error {
  padding: 60px 24px;
  text-align: center;
  color: #73787E;
  font-size: 14px;
}
.feed-error__msg {
  margin-top: 4px;
  font-size: 12px;
  color: #A0A4AB;
}
.feed-empty__retry {
  margin-top: 12px;
  height: 36px;
  padding: 0 16px;
  border: 0;
  border-radius: 8px;
  background: #F5F6F8;
  color: #4D5160;
  font-size: 13px;
  cursor: pointer;
  font-family: inherit;
}
.feed-empty__retry:hover { background: #ECEEF1; }
</style>
