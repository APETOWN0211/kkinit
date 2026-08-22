<script setup lang="ts">
import heartIcon from '~/assets/icons/feed/heart.svg?raw'
import commentIcon from '~/assets/icons/feed/comment.svg?raw'
import repostIcon from '~/assets/icons/feed/repost.svg?raw'
import repostIconAction from '~/assets/icons/feed/repost-action.svg?raw'
import bookmarkIcon from '~/assets/icons/feed/bookmark.svg?raw'
import moreIcon from '~/assets/icons/feed/more.svg?raw'
import followPlusIcon from '~/assets/icons/feed/follow-plus.svg?raw'
import followedIcon from '~/assets/icons/feed/followed.svg?raw'

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
  isReposted?: boolean
}

const props = defineProps<{
  post: FeedPost
  activeTab?: 'nearby' | 'following'
}>()

const isLiked = ref(props.post.isLiked ?? false)
const isBookmarked = ref(props.post.isBookmarked ?? false)
const isReposted = ref(props.post.isReposted ?? false)
const isFollowing = ref(props.post.author.isFollowing ?? false)
const isFollowAnimating = ref(false)

// Animation states
const isLikeAnimating = ref(false)
const isBookmarkAnimating = ref(false)

// Media scroll reset ref
const mediaScrollRef = ref<HTMLElement | null>(null)

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

const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
  if (isBookmarked.value) {
    isBookmarkAnimating.value = true
    setTimeout(() => {
      isBookmarkAnimating.value = false
    }, 280)
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
          v-if="!isFollowing && activeTab !== 'following'"
          type="button"
          class="follow-button"
          :class="{ 'follow-button--animating': isFollowAnimating }"
          aria-label="팔로우"
          @click="toggleFollow"
        >
          <span class="follow-icon" v-html="followPlusIcon" />
        </button>
        <button
          v-else-if="isFollowing && activeTab !== 'following'"
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
          <div class="media-leading-spacer" aria-hidden="true" />
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
          <div class="media-trailing-spacer" aria-hidden="true" />
        </div>
      </div>

      <footer class="post-actions">
        <button
          type="button"
          class="action-button like-button"
          :class="{ 'like-button--active': isLiked, 'is-like-animating': isLikeAnimating }"
          :aria-pressed="isLiked"
          :aria-label="isLiked ? '좋아요 취소' : '좋아요'"
          @click="toggleLike"
        >
          <span class="like-icon-wrapper">
            <span class="like-icon" v-html="heartIcon" />
          </span>
          <span class="action-count">{{ formatCount(post.likes + (isLiked ? 1 : 0)) }}</span>
        </button>

        <button type="button" class="action-button">
          <span class="action-icon" v-html="commentIcon" />
          <span class="action-count">{{ formatCount(post.comments) }}</span>
        </button>

        <button
          type="button"
          class="action-button repost-button"
          :class="{ 'repost-button--active': isReposted }"
          :aria-pressed="isReposted"
          :aria-label="isReposted ? '리포스트 취소' : '리포스트'"
          @click="toggleRepost"
        >
          <span
            class="repost-icon"
            :class="{ 'repost-icon--active': isReposted }"
            v-html="isReposted ? repostIconAction : repostIcon"
          />
          <span class="action-count">{{ formatCount(displayedReposts) }}</span>
        </button>

        <button
          type="button"
          class="action-button save-button"
          :class="{ 'save-button--active': isBookmarked, 'is-bookmark-animating': isBookmarkAnimating }"
          :aria-pressed="isBookmarked"
          :aria-label="isBookmarked ? '저장 취소' : '저장'"
          @click="toggleBookmark"
        >
          <span class="save-icon-wrapper">
            <span class="save-icon" v-html="bookmarkIcon" />
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

/* Follow animation */
@keyframes follow-pop {
  0% { transform: scale(1); }
  25% { transform: scale(0.88); }
  50% { transform: scale(1.08); }
  75% { transform: scale(0.97); }
  100% { transform: scale(1); }
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
  width: calc(100% + 61px);
  margin-left: -61px;
  margin-right: 0;
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
  scroll-behavior: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.media-scroll::-webkit-scrollbar {
  display: none;
}

.media-leading-spacer {
  flex: 0 0 51px;
}

.media-trailing-spacer {
  flex: 0 0 10px;
}

.media-item {
  flex: 0 0 180px;
  width: 180px;
  height: 240px;
  margin-left: 0;
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

/* Like Icon */
.like-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.like-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.like-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.like-icon :deep(path) {
  stroke: var(--color-action-icon);
  fill: none;
  transition: stroke 140ms ease, fill 140ms ease;
}

.like-button--active .like-icon :deep(path) {
  stroke: var(--color-primary) !important;
  fill: var(--color-primary) !important;
}

.like-button:active .like-icon-wrapper {
  transform: scale(0.92);
  transition: transform 120ms ease;
}

/* Like animation - pop effect */
@keyframes like-pop {
  0% { transform: scale(1); }
  25% { transform: scale(0.88); }
  55% { transform: scale(1.18); }
  75% { transform: scale(0.96); }
  100% { transform: scale(1); }
}

.like-button.is-like-animating .like-icon-wrapper {
  animation: like-pop 320ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

/* Unlike animation */
@keyframes like-unlike {
  0% { transform: scale(1); }
  100% { transform: scale(0.9); }
}

.like-button:not(.is-like-animating):active .like-icon-wrapper {
  animation: like-unlike 180ms ease forwards;
}

/* Save Icon */
.save-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.save-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.save-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.save-icon :deep(path) {
  stroke: var(--color-action-icon);
  fill: none;
  transition: stroke 140ms ease, fill 140ms ease;
}

.save-button--active .save-icon :deep(path) {
  stroke: var(--color-save-stroke) !important;
  fill: var(--color-save-fill) !important;
}

.save-button:active .save-icon-wrapper {
  transform: scale(0.92);
  transition: transform 120ms ease;
}

/* Bookmark animation - pop effect */
@keyframes bookmark-pop {
  0% { transform: scale(1); }
  30% { transform: scale(0.90); }
  60% { transform: scale(1.12); }
  80% { transform: scale(0.98); }
  100% { transform: scale(1); }
}

.save-button.is-bookmark-animating .save-icon-wrapper {
  animation: bookmark-pop 280ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

/* Unsave animation */
@keyframes bookmark-unlike {
  0% { transform: scale(1); }
  100% { transform: scale(0.92); }
}

.save-button:not(.is-bookmark-animating):active .save-icon-wrapper {
  animation: bookmark-unlike 180ms ease forwards;
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

/* ============================================
   Repost Button Styles
   ============================================ */
.repost-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.repost-icon :deep(svg) {
  width: 100%;
  height: 100%;
  stroke: var(--color-action-icon);
}

.repost-icon--active :deep(svg) {
  stroke: var(--color-text-primary);
}

.repost-button:active .repost-icon {
  transform: scale(0.92);
  transition: transform 120ms ease;
}
</style>
