<script setup lang="ts">
import heartPill from '~/assets/icons/feed/heart-pill.svg?raw'
import heartPillActive from '~/assets/icons/feed/heart-pill-active.svg?raw'
import commentPill from '~/assets/icons/feed/comment-pill.svg?raw'
import repostPill from '~/assets/icons/feed/repost-pill.svg?raw'
import repostPillActive from '~/assets/icons/feed/repost-pill-active.svg?raw'
import morePill from '~/assets/icons/feed/more-pill.svg?raw'
import followPlusIcon from '~/assets/icons/feed/follow-plus.svg?raw'
import followedIcon from '~/assets/icons/feed/followed.svg?raw'

interface ContentLine {
  text: string
  isChip?: boolean
  chipType?: 'lime' | 'orange' | 'gray' | 'teal'
}

export interface FeedPost {
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
  isLiked?: boolean
  isReposted?: boolean
}

const props = defineProps<{
  post: FeedPost
  activeTab?: 'nearby' | 'following'
  isOwnPost?: boolean
}>()

const isLiked = ref(props.post.isLiked ?? false)
const isReposted = ref(props.post.isReposted ?? false)
const isFollowing = ref(props.post.author.isFollowing ?? false)
const isFollowAnimating = ref(false)

// Animation states
const isLikeAnimating = ref(false)

// Toggle functions
const toggleLike = () => {
  isLiked.value = !isLiked.value
  if (isLiked.value) {
    isLikeAnimating.value = true
    setTimeout(() => {
      isLikeAnimating.value = false
    }, 320)
  }
}

const toggleRepost = () => {
  isReposted.value = !isReposted.value
}

const toggleFollow = () => {
  isFollowing.value = !isFollowing.value
  if (isFollowing.value) {
    isFollowAnimating.value = true
    setTimeout(() => {
      isFollowAnimating.value = false
    }, 280)
  }
}

const displayedReposts = computed(() => {
  return props.post.reposts + (isReposted.value ? 1 : 0)
})

const formatCount = (count: number): string => {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}
</script>

<template>
  <article class="feed-post">
    <div class="post-left">
      <div class="avatar-wrapper">
        <div class="avatar">
          <img
            :src="post.author.avatar"
            :alt="post.author.name"
            class="avatar-image"
          />
        </div>
        <button
          v-if="!isFollowing && activeTab !== 'following' && !isOwnPost"
          type="button"
          class="follow-button"
          :class="{ 'follow-button--animating': isFollowAnimating }"
          aria-label="팔로우"
          @click="toggleFollow"
        >
          <span class="follow-icon" v-html="followPlusIcon" />
        </button>
        <button
          v-else-if="isFollowing && activeTab !== 'following' && !isOwnPost"
          type="button"
          class="follow-button follow-button--followed"
          :class="{ 'follow-button--animating': isFollowAnimating }"
          aria-label="팔로잉"
          @click="toggleFollow"
        >
          <span class="follow-icon" v-html="followedIcon" />
        </button>
      </div>
    </div>

    <div class="post-content">
      <header class="post-header">
        <div class="header-text">
          <span class="author-name">{{ post.author.name }}</span>
          <span class="dot" aria-hidden="true" />
          <span class="post-time">{{ post.time }}</span>
        </div>
        <button
          type="button"
          class="more-button"
          aria-label="더보기"
        >
          <span class="more-icon" v-html="morePill" />
        </button>
      </header>

      <div class="post-body">
        <div class="content-lines">
          <p
            v-for="(line, lineIndex) in post.content"
            :key="lineIndex"
            class="content-line"
          >
            <template v-for="(segment, segIndex) in line" :key="segIndex">
              <span
                v-if="segment.isChip"
                class="chip"
                :class="`chip--${segment.chipType ?? 'gray'}`"
              >
                {{ segment.text }}
              </span>
              <span v-else class="content-text">{{ segment.text }}</span>
            </template>
          </p>
        </div>
      </div>

      <div v-if="post.images.length > 0" class="post-media">
        <!--
          Figma 41:1897:
          - 2장: 146 × 208 × 2, gap 10, radius 12
          - 1장: 298 × 208 × 1, radius 12
        -->
        <div
          v-if="post.images.length === 1"
          class="media-single"
        >
          <img
            :src="post.images[0]"
            :alt="`게시물 사진`"
            class="media-image"
          />
        </div>

        <div
          v-else
          class="media-pair"
        >
          <div
            v-for="(image, imgIndex) in post.images.slice(0, 2)"
            :key="imgIndex"
            class="media-item"
          >
            <img
              :src="image"
              :alt="`게시물 사진 ${imgIndex + 1}`"
              class="media-image"
            />
          </div>
        </div>

        <!--
          3장 이상은 Figma 디자인에 없는 케이스지만
          기존 horizontal scroll 기능을 유지한다.
        -->
        <div v-if="post.images.length > 2" class="media-scroll">
          <div
            v-for="(image, imgIndex) in post.images.slice(2)"
            :key="`s-${imgIndex}`"
            class="media-scroll-item"
          >
            <img
              :src="image"
              :alt="`게시물 사진 ${imgIndex + 3}`"
              class="media-image"
            />
          </div>
        </div>
      </div>

      <footer class="post-actions">
        <button
          type="button"
          class="action-pill like-pill"
          :class="{ 'like-pill--active': isLiked, 'is-like-animating': isLikeAnimating }"
          :aria-pressed="isLiked"
          :aria-label="isLiked ? '좋아요 취소' : '좋아요'"
          @click="toggleLike"
        >
          <span class="like-icon-wrapper">
            <span
              class="like-icon"
              v-html="isLiked ? heartPillActive : heartPill"
            />
          </span>
          <span class="action-count">{{ formatCount(post.likes + (isLiked ? 1 : 0)) }}</span>
        </button>

        <button
          type="button"
          class="action-pill"
          aria-label="댓글"
        >
          <span class="action-icon" v-html="commentPill" />
          <span class="action-count">{{ formatCount(post.comments) }}</span>
        </button>

        <button
          type="button"
          class="action-pill repost-pill"
          :class="{ 'repost-pill--active': isReposted }"
          :aria-pressed="isReposted"
          :aria-label="isReposted ? '리포스트 취소' : '리포스트'"
          @click="toggleRepost"
        >
          <span
            class="repost-icon"
            :class="{ 'repost-icon--active': isReposted }"
            v-html="isReposted ? repostPillActive : repostPill"
          />
          <span class="action-count">{{ formatCount(displayedReposts) }}</span>
        </button>
      </footer>
    </div>
  </article>
</template>

<style scoped>
/*
 * FeedPost — Figma 41:1897 source of truth.
 *
 * Figma spec:
 *  - post row: w 390, padding 20 left/right (좌 inset), 12 top/bottom
 *  - avatar 42 × 42 (rounded full)
 *  - gap avatar ↔ content = 10
 *  - header row: 38 high, more button is 38×38 circle, #F5F6F8 bg
 *  - body font 16 (Pretendard Medium), color #191919
 *  - chip 16 SemiBold, padding 2/7, radius 7
 *  - image: 146 × 208 × 2 (gap 10) | 298 × 208 × 1, radius 12
 *  - action pill: 38 high, padding 13.875 x, radius 1155, gap 6.938
 *  - icon 14 × 14, count 15 Regular color #73787E
 *  - pill bg: #F5F6F8 (inactive), like active = rgba(235, 73, 64, 0.1)
 *  - divider: full width, #E2E2E2 1px top
 */
.feed-post {
  display: flex;
  gap: 10px;
  width: 100%;
  padding: 12px var(--page-padding);
  box-sizing: border-box;
  background: var(--color-background);
  border-top: 1px solid #E2E2E2;
}

.feed-post:first-child {
  border-top: 0;
}

.post-left {
  flex-shrink: 0;
}

.avatar-wrapper {
  position: relative;
  width: 42px;
  height: 42px;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  overflow: hidden;
  background: #F5F6F8;
}

.avatar-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* =========================
   Follow button (avatar overlay)
   ========================= */
.follow-button {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 2px solid var(--color-background);
  border-radius: 20px;
  background: #699df9;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: background-color 140ms ease, transform 120ms ease;
}

.follow-button:active {
  transform: scale(0.9);
}

.follow-button--animating {
  animation: follow-pop 280ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.follow-button--followed {
  background: #C1F785;
}

.follow-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 8px;
  height: 8px;
}

.follow-icon :deep(svg) {
  width: 8px;
  height: 8px;
}

.follow-button:not(.follow-button--followed) .follow-icon :deep(svg) {
  color: white;
}

.follow-button--followed .follow-icon :deep(path) {
  fill: #191919 !important;
}

@keyframes follow-pop {
  0% { transform: scale(1); }
  25% { transform: scale(0.88); }
  50% { transform: scale(1.08); }
  75% { transform: scale(0.97); }
  100% { transform: scale(1); }
}

/* =========================
   Post content column
   ========================= */
.post-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* =========================
   Header (nickname · time · more)
   ========================= */
.post-header {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  height: 38px;
}

.header-text {
  flex: 1;
  min-width: 0;

  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-text-primary);
  letter-spacing: -0.36px;
}

.dot {
  display: inline-block;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #C7C3C3;
}

.post-time {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  color: var(--color-text-muted);
  letter-spacing: -0.28px;
}

.more-button {
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 38px;
  height: 38px;

  padding: 0;

  border: 0;
  border-radius: 999px;

  background: #F5F6F8;

  cursor: pointer;

  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, background-color 140ms ease;
}

.more-button:active {
  transform: scale(0.94);
  background: #ECEEF1;
}

.more-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 22px;
  height: 22px;
}

.more-icon :deep(svg) {
  display: block;
  width: 22px;
  height: 22px;
}

/* =========================
   Body text + chips
   ========================= */
.post-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.content-lines {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.content-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 3px;

  margin: 0;

  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--color-text-primary);
  letter-spacing: -0.32px;
}

.content-text {
  font: inherit;
  color: inherit;
}

.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  padding: 2px 7px;

  border-radius: 7px;

  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.32px;
  text-align: center;
  white-space: nowrap;
}

.chip--lime {
  background: var(--color-chip-lime);
  color: var(--color-text-primary);
}

.chip--orange {
  background: var(--color-chip-orange);
  color: var(--color-text-on-primary);
}

.chip--teal {
  background: #55C7AE;
  color: var(--color-text-on-primary);
}

.chip--gray {
  background: var(--color-chip-gray);
  color: var(--color-chip-gray-text);
}

/* =========================
   Media (single / pair / scroll)
   ========================= */
.post-media {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.media-single {
  width: 100%;
}

.media-pair {
  display: flex;
  align-items: center;
  gap: 10px;
}

.media-item {
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  overflow: hidden;
  background: #F5F6F8;
}

/*
 * Figma: 146 × 208 × 2.
 * 위/아래 padding 12, page padding 20, content row 의 우측 padding 0.
 * 컨테이너 폭 = 390 - 42(avatar) - 10(gap) - 20(right inset) - 12
 *            = 306. 미디어 폭 = (306 - 10) / 2 = 148.
 * 시각적으로 146 에 가깝게 미세 조정한다.
 */
.media-pair .media-item {
  flex: 1 1 0;
  width: auto;
  height: 208px;
  border-radius: 12px;
}

/*
 * Figma: 298 × 208 × 1
 */
.media-single .media-image,
.media-pair .media-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-single .media-image {
  height: 208px;
  border-radius: 12px;
}

/* 기존 horizontal scroll 기능 유지 */
.media-scroll {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.media-scroll::-webkit-scrollbar {
  display: none;
}

.media-scroll-item {
  flex: 0 0 180px;
  width: 180px;
  height: 240px;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #F5F6F8;
}

.media-scroll-item .media-image {
  width: 100%;
  height: 100%;
}

/* =========================
   Action pills (heart / comment / repost)
   ========================= */
.post-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.action-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  height: 38px;

  padding: 11.5px 14px;

  border: 0;
  border-radius: 999px;

  background: #F5F6F8;

  cursor: pointer;

  -webkit-tap-highlight-color: transparent;

  transition: transform 120ms ease, background 160ms ease;
}

.action-pill:active {
  transform: scale(0.97);
}

.like-pill--active {
  background-image: linear-gradient(90deg, rgba(235, 73, 64, 0.1), rgba(235, 73, 64, 0.1));
}

/*
 * Repost active.
 *  - Figma 의 repost 는 별도 active variant 가 없지만,
 *    디자인 의도상 heart Variant2 와 동일한 톤으로 active 표시.
 *  - 배경: rgba(235, 73, 64, 0.1) + #F5F6F8 linear-gradient
 *  - icon: 검정 stroke (#191919)
 *  - count: 검정 텍스트
 */
.repost-pill--active {
  background-image: linear-gradient(90deg, rgba(235, 73, 64, 0.1), rgba(235, 73, 64, 0.1));
}

.repost-pill--active .action-count {
  color: #191919;
}

.action-icon,
.like-icon,
.repost-icon {
  display: flex;
  align-items: center;
  justify-content: center;

  width: 14px;
  height: 14px;

  flex-shrink: 0;
}

.action-icon :deep(svg),
.like-icon :deep(svg),
.repost-icon :deep(svg) {
  display: block;
  width: 14px;
  height: 14px;
}

.action-count {
  display: inline-block;

  margin-left: 6.94px;

  font-size: 15px;
  font-weight: 400;
  line-height: 1.16;
  color: #73787E;
  letter-spacing: -0.3px;
}

/* Like animation */
@keyframes like-pop {
  0%   { transform: scale(1); }
  25%  { transform: scale(0.88); }
  55%  { transform: scale(1.18); }
  75%  { transform: scale(0.96); }
  100% { transform: scale(1); }
}

.like-pill.is-like-animating .like-icon {
  animation: like-pop 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes like-unlike {
  0%   { transform: scale(1); }
  100% { transform: scale(0.9); }
}

.like-pill:not(.is-like-animating):active .like-icon {
  animation: like-unlike 180ms ease forwards;
}

/* Repost active fill */
.repost-icon--active :deep(path) {
  stroke: var(--color-text-primary) !important;
}

/* =========================
   Reduced motion
   ========================= */
@media (prefers-reduced-motion: reduce) {
  .feed-post,
  .more-button,
  .action-pill,
  .follow-button,
  .like-icon,
  .repost-icon {
    transition: none;
  }

  .follow-button--animating,
  .like-pill.is-like-animating .like-icon {
    animation: none;
  }
}
</style>