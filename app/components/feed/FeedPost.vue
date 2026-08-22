<script setup lang="ts">
import heartIcon from '~/assets/icons/feed/heart.svg?raw'
import commentIcon from '~/assets/icons/feed/comment.svg?raw'
import repostIcon from '~/assets/icons/feed/repost.svg?raw'
import bookmarkIcon from '~/assets/icons/feed/bookmark.svg?raw'
import moreIcon from '~/assets/icons/feed/more.svg?raw'
import followPlusIcon from '~/assets/icons/feed/follow-plus.svg?raw'

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
  isLiked?: boolean
  isBookmarked?: boolean
}

const props = defineProps<{
  post: FeedPost
}>()

const isLiked = ref(props.post.isLiked ?? false)
const isBookmarked = ref(props.post.isBookmarked ?? false)

// 좋아요 수 local state
const likeCount = ref(props.post.likes)

// 좋아요 애니메이션 상태
const isAnimating = ref(false)
const isBookmarkAnimating = ref(false)

const toggleLike = () => {
  isLiked.value = !isLiked.value
  likeCount.value += isLiked.value ? 1 : -1

  if (isLiked.value) {
    isAnimating.value = true
    setTimeout(() => {
      isAnimating.value = false
    }, 360)
  }
}

const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value

  if (isBookmarked.value) {
    isBookmarkAnimating.value = true
    setTimeout(() => {
      isBookmarkAnimating.value = false
    }, 300)
  }
}

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
          v-if="!post.author.isFollowing"
          type="button"
          class="follow-button"
          aria-label="팔로우"
        >
          <span class="follow-icon" v-html="followPlusIcon" />
        </button>
      </div>
    </div>

    <div class="post-content">
      <header class="post-header">
        <div class="header-left">
          <span class="author-name">{{ post.author.name }}</span>
          <span class="post-time">{{ post.time }}</span>
        </div>
        <button type="button" class="more-button" aria-label="더보기">
          <span class="more-icon" v-html="moreIcon" />
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
                :class="`chip--${segment.chipType}`"
              >
                {{ segment.text }}
              </span>
              <span v-else>{{ segment.text }}</span>
            </template>
          </p>
        </div>
      </div>

      <div v-if="post.images.length > 0" class="post-media">
        <div class="media-scroll">
          <div
            v-for="(image, imgIndex) in post.images"
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
      </div>

      <footer class="post-actions">
        <button
          type="button"
          class="action-button"
          :class="{
            'action-button--active': isLiked,
            'is-animating': isAnimating
          }"
          :aria-pressed="isLiked"
          :aria-label="isLiked ? '좋아요 취소' : '좋아요'"
          @click="toggleLike"
        >
          <span class="action-icon">
            <span class="heart-icon-wrapper" v-html="heartIcon" />
          </span>
          <span class="action-count">{{ formatCount(likeCount) }}</span>
        </button>

        <button type="button" class="action-button">
          <span class="action-icon" v-html="commentIcon" />
          <span class="action-count">{{ formatCount(post.comments) }}</span>
        </button>

        <button type="button" class="action-button">
          <span class="action-icon" v-html="repostIcon" />
          <span class="action-count">{{ formatCount(post.reposts) }}</span>
        </button>

        <button
          type="button"
          class="action-button"
          :class="{ 'action-button--active': isBookmarked, 'is-bookmark-animating': isBookmarkAnimating }"
          :aria-pressed="isBookmarked"
          :aria-label="isBookmarked ? '저장 취소' : '저장'"
          @click="toggleBookmark"
        >
          <span class="action-icon">
            <span class="bookmark-icon-wrapper" v-html="bookmarkIcon" />
          </span>
        </button>
      </footer>
    </div>
  </article>
</template>

<style scoped>
.feed-post {
  display: flex;
  gap: 14px;
  padding: 20px;
  padding-right: 0;
  border-bottom: 1px solid var(--color-border);
}

.post-left {
  flex-shrink: 0;
}

.avatar-wrapper {
  position: relative;
  width: 47px;
  height: 47px;
}

.avatar {
  width: 47px;
  height: 47px;
  border-radius: 999px;
  border: 1px solid var(--color-chip-gray);
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.follow-button {
  position: absolute;
  bottom: 0;
  right: 0;
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
  color: white;
}

.post-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: var(--page-padding);
  box-sizing: border-box;
}

.header-left {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.post-time {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-muted);
  letter-spacing: -0.28px;
}

.more-button {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-icon :deep(svg) {
  width: 24px;
  height: 24px;
  color: var(--color-icon-muted);
}

.post-body {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.content-lines {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.content-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 3px;
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  line-height: 1.5;
  margin: 0;
}

.chip {
  padding: 2px 7px;
  border-radius: 7px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
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

.chip--gray {
  background: var(--color-chip-gray);
  color: var(--color-chip-gray-text);
}

.post-media {
  width: calc(100% + var(--page-padding));
  margin-left: 0;
  margin-right: calc(var(--page-padding) * -1);
}

.media-scroll {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  width: 100%;
  padding: 0;
  margin: 0;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.media-scroll::-webkit-scrollbar {
  display: none;
}

.media-scroll::after {
  content: '';
  flex: 0 0 var(--page-padding);
}

.media-item {
  flex: 0 0 180px;
  width: 180px;
  height: 240px;
  border-radius: var(--radius-md);
  overflow: hidden;
}

.media-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.post-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22.5px;
  height: 22.5px;
}

.action-icon :deep(svg) {
  width: 100%;
  height: 100%;
  color: var(--color-action-icon);
  fill: none;
}

.action-icon :deep(path) {
  stroke: currentColor;
  fill: inherit;
  transition: stroke 140ms ease, fill 140ms ease;
}

.action-button--active .action-icon :deep(svg) {
  color: var(--color-primary);
  fill: var(--color-primary);
}

.action-button--active .action-icon :deep(path) {
  stroke: var(--color-primary);
  fill: var(--color-primary);
}

.action-count {
  width: 24px;
  min-width: 24px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-action-text);
  text-align: left;
}

/* Heart Icon Animations */
.heart-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 140ms ease;
}

.action-button:active .heart-icon-wrapper {
  transform: scale(0.92);
}

@keyframes heart-pop {
  0% {
    transform: scale(1);
  }
  25% {
    transform: scale(0.88);
  }
  55% {
    transform: scale(1.18);
  }
  75% {
    transform: scale(0.96);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes heart-unlike {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.9);
  }
}

/* Like animation - pop effect */
.action-button.is-animating .heart-icon-wrapper {
  animation: heart-pop 360ms ease forwards;
}

/* Unlike animation - subtle shrink */
.action-button:not(.is-animating) .heart-icon-wrapper {
  transition: transform 180ms ease;
}

/* Bookmark Icon Animations */
.bookmark-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 140ms ease;
}

.action-button:active .bookmark-icon-wrapper {
  transform: scale(0.94);
}

@keyframes bookmark-pop {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(0.90);
  }
  60% {
    transform: scale(1.12);
  }
  80% {
    transform: scale(0.98);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes bookmark-unlike {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0.92);
  }
}

/* Save animation - pop effect */
.action-button.is-bookmark-animating .bookmark-icon-wrapper {
  animation: bookmark-pop 280ms ease forwards;
}

/* Unsave animation - subtle shrink */
.action-button:not(.is-bookmark-animating) .bookmark-icon-wrapper {
  transition: transform 160ms ease;
}

/* Bookmark saved state */
.action-button--active .action-icon :deep(svg) {
  color: var(--color-save-stroke);
  fill: var(--color-save-fill);
}

.action-button--active .action-icon :deep(path) {
  stroke: var(--color-save-stroke);
  fill: var(--color-save-fill);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .action-button.is-animating .heart-icon-wrapper {
    animation: none;
  }

  .action-button.is-bookmark-animating .bookmark-icon-wrapper {
    animation: none;
  }

  .heart-icon-wrapper {
    transition: none;
  }

  .bookmark-icon-wrapper {
    transition: none;
  }

  .action-icon :deep(path) {
    transition: none;
  }
}
</style>
