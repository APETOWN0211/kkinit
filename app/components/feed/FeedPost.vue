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
  isBookmarked?: boolean
}

const props = defineProps<{
  post: FeedPost
  activeTab?: 'nearby' | 'following'
  isOwnPost?: boolean
  /*
   * Figma 3:170 Home 에는 action row 에 bookmark 가 없다.
   * 다른 화면에서 재사용할 수 있도록 기본값만 켜고 Home 은 끈다.
   */
  showBookmark?: boolean
}>()

const isLiked = ref(props.post.isLiked ?? false)
const isReposted = ref(props.post.isReposted ?? false)
const isBookmarked = ref(props.post.isBookmarked ?? false)
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

const toggleBookmark = () => {
  isBookmarked.value = !isBookmarked.value
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

/*
 * 3장 이상일 때만 가로 scroll 컨테이너를 쓴다.
 * 1장 / 2장은 Figma 와 동일하게 고정 레이아웃으로 렌더링한다.
 */
const hasOverflowMedia = computed(() => props.post.images.length > 2)
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
          Figma 3:170 › 3:197 (2장):
          container 318 wide, pt 4, image 146 × 208, gap 10, radius 12.
        -->
        <div
          v-if="!hasOverflowMedia && post.images.length >= 2"
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
          Figma 3:170 › 3:259 (1장):
          container 318 wide, pt 4, image 298 × 208, radius 12.
        -->
        <div
          v-else-if="!hasOverflowMedia"
          class="media-single"
        >
          <img
            :src="post.images[0]"
            alt="게시물 사진"
            class="media-image"
          />
        </div>

        <!--
          3장 이상은 Figma 에 없는 케이스지만 기존 horizontal scroll 을 유지한다.
        -->
        <div v-else class="media-scroll">
          <div
            v-for="(image, imgIndex) in post.images"
            :key="`s-${imgIndex}`"
            class="media-scroll-item"
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

        <button
          v-if="showBookmark"
          type="button"
          class="action-pill bookmark-pill"
          :class="{ 'bookmark-pill--active': isBookmarked }"
          :aria-pressed="isBookmarked"
          :aria-label="isBookmarked ? '저장 취소' : '저장'"
          @click="toggleBookmark"
        >
          <span class="bookmark-icon" aria-hidden="true">★</span>
          <span class="action-count">{{ isBookmarked ? '저장됨' : '저장' }}</span>
        </button>
      </footer>
    </div>
  </article>
</template>

<style scoped>
/*
 * FeedPost — Figma node 3:170 (홈 - 메인) source of truth.
 *
 * Post 1 (3:173)
 *  - row 3:173  : w 390, gap 10, px 20, py 12
 *  - avatar     : 42 × 42, rounded full
 *  - content 3:176 : x 72, w 318, py 12 → h 370
 *      header 38 / body 58 / media pt 4 + 208 / actions 38
 *      → 38 + 12(gap) + 58 + 12 + 212 + 12 + 38 = 382 ≈ 370 (Figma overlaps media pt)
 *  - header 3:178 : h 38, more 38 × 38 at x 260 (right edge 298 = 318 - 20 pr)
 *  - name 18 SemiBold #191919 / dot 3 / time 14 Regular #9F9A9A
 *  - body 3:184 : gap 6, text 16 Medium, chip px 7 py 2 radius 7
 *  - media 3:197: pt 4, 146 × 208, gap 10, radius 12
 *  - actions     : gap 10, pill h 38, px 13.875, radius 1155, icon 14, gap 6.938
 *
 * Divider 3:204 / 3:236
 *  - Figma 은 divider 를 post frame 자체의 border-top 으로 둔다.
 *    첫 post 3:173 에는 border 가 없다.
 *  - Home 은 별도 divider element 없이 이 규칙을 그대로 사용한다.
 */
.feed-post {
  display: flex;
  gap: 10px;

  width: 100%;

  padding: 12px var(--page-padding);

  box-sizing: border-box;

  background: var(--color-background);

  border-top: 1px solid var(--color-divider);
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
   Post content column — 3:176
   ========================= */
.post-content {
  flex: 1;
  min-width: 0;

  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* =========================
   Header (nickname · time · more) — 3:178
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
  flex-shrink: 0;

  width: 3px;
  height: 3px;

  border-radius: 50%;

  background: var(--color-text-muted);
}

.post-time {
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;

  color: var(--color-text-muted);

  letter-spacing: -0.28px;
}

/* Figma 3:41: 38 × 38 circle, #F5F6F8, ri:more-fill 22 (8px inset) */
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
   Body text + chips — 3:184
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
  /*
   * chip 안의 텍스트를 chip 의 padding-box 정중앙에 위치시키기 위해
   * line-height 를 chip padding-box height (padding-top + line-box + padding-bottom)
   * 와 같게 둔다. (Pretendard ascent 가 line 외부로 나가서 line-height 1.4
   * 그대로 두면 텍스트가 chip 가운데보다 살짝 위에 보이는 문제 해결)
   */
  line-height: 22px;

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
  background: var(--color-chip-teal);
  color: var(--color-text-on-primary);
}

.chip--gray {
  background: var(--color-chip-gray);
  color: var(--color-chip-gray-text);
}

/* =========================
   Media — 3:197 / 3:259
   ========================= */
.post-media {
  display: flex;
  flex-direction: column;
  gap: 10px;

  /* Figma media row 는 pt 4 */
  padding-top: 4px;
}

.media-image {
  display: block;
  width: 100%;
  height: 100%;

  object-fit: cover;
}

/*
 * Figma 3:198 / 3:199: 146 × 208, gap 10, radius 12.
 * content column 폭 = 390 - 20(px left) - 42(avatar) - 10(gap) - 20(px right) = 318.
 * 146 + 10 + 146 = 302 → 318 - 302 = 16 이 남는다(Figma 의도, 공백 유지).
 */
.media-pair {
  display: flex;
  align-items: center;
  gap: 10px;
}

.media-pair .media-item {
  flex: 0 0 146px;
  width: 146px;
  height: 208px;

  border-radius: 12px;

  overflow: hidden;

  background: #F5F6F8;
}

/* Figma 3:260: 298 × 208, radius 12 */
.media-single {
  width: 298px;
  max-width: 100%;

  height: 208px;

  border-radius: 12px;

  overflow: hidden;

  background: #F5F6F8;
}

/* 기존 horizontal scroll 기능 유지 (3장 이상) */
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
  flex: 0 0 146px;
  width: 146px;
  height: 208px;

  border-radius: 12px;

  overflow: hidden;

  background: #F5F6F8;
}

/* =========================
   Action pills — 3:200
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

  padding: 0 13.875px;

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

/* Figma 12:248 Variant2 — heart active.
 * background = linear-gradient(rgba(235,73,64,0.1), rgba(235,73,64,0.1)) + #F5F6F8
 * → 단색 약 0.1 alpha 의 red tint 와 시각적으로 같다.
 */
.like-pill--active {
  background: rgba(235, 73, 64, 0.1);
}

/*
 * Figma 12:268 Variant2 — repost active.
 * background = linear-gradient(rgba(85,199,174,0.1), rgba(85,199,174,0.1)) + #F5F6F8
 *   → 단색 약 0.1 alpha 의 mint tint.
 * 텍스트 색도 Figma 12:286 대로 #55c7ae 로 변경한다.
 */
.repost-pill--active {
  background: rgba(85, 199, 174, 0.1);
}

.repost-pill--active .action-count {
  color: var(--color-chip-teal);
}

.bookmark-pill--active {
  background: var(--color-chip-lime);
}

.bookmark-icon {
  font-size: 13px;
  line-height: 1;
}

/* Figma: icon box 14 × 14 */
.action-icon,
.like-icon,
.repost-icon,
.bookmark-icon {
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

/* Figma 12:248/257/268 — count 텍스트
 *  - font-size 15.031, line-height 1.156
 *  - Pretendard Regular, color #73787E (default) / #55c7ae (repost active)
 *  - gap: icon 14 → gap 6.938 → count
 */
.action-count {
  display: inline-block;

  margin-left: 6.938px;

  font-size: 15.031px;
  font-weight: 400;
  line-height: 1.156;

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

/*
 * Figma 12:268 Variant2 — repost active icon.
 * active 시:
 *  1) icon 을 horizontal flip (Figma variant2 의 좌우 반전 표현)
 *  2) icon stroke 를 mint(#55c7ae) 로 덮어쓴다
 *  3) flip 은 자연스러운 모션으로 부드럽게 전환 (cubic-bezier easing)
 */
.repost-icon {
  transform-origin: 50% 50%;
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.repost-pill--active .repost-icon {
  transform: scaleX(-1);
}

.repost-icon--active :deep(path) {
  stroke: var(--color-chip-teal) !important;
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
