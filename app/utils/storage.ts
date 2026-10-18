/**
 * Storage public URL helper.
 *
 *   DB / mock data 안의 image 는 "image_path" 만 보관한다 (예: "feed/post-001-1.webp").
 *   컴포넌트에서 실제 URL 이 필요할 때 이 helper 로 public URL 을 만든다.
 *
 *   → 같은 path 는 어디서 쓰이든 같은 URL → browser/CDN cache 가 한 번만 fetch.
 *   → query string 을 임의로 붙이지 않는다 (spec #19).
 *
 * 동작 (3 가지 모드):
 *   1) input 이 이미 http(s):// 로 시작하면 그대로 반환 (외부 CDN 호환).
 *   2) public supabaseUrl 이 설정돼 있고 path 가 "profiles/..." 같은 storage path 면
 *        `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
 *      형식의 public URL 을 반환.
 *   3) 위 조건이 안 맞으면 local public/ 폴더 URL 로 fallback
 *      (mock 단계에서 spec #26 안전 규칙을 지키면서 visual 을 유지하기 위함).
 *      → "/images/<rest>.webp" 가 없으면 마지막에 /images/chat/default-avatar.svg.
 *
 * 안전 (spec #5 / #26):
 *   - service_role key 는 절대 여기서 쓰지 않는다.
 *   - supabaseUrl 이 없으면 Storage URL 을 만들지 않고, local public URL 로 fallback.
 *   - 이 경우 supabase public bucket 에 올라간 이미지가 없어도
 *     mock data 의 절대 path("/images/...png")는 그대로 표시된다.
 *
 * STORAGE_FOLDERS 는 Storage bucket 안의 folder 이름과 1:1 매핑.
 *  - key == value (의미적 alias 제거 — folder 이름이 곧 key)
 *  - 한 file 이 정확히 한 folder 에 있을 때만 사용. (multi-folder 불가)
 *  - bucket root 의 flat file (e.g. my-repost-*) 은 `root` 사용.
 */
export const STORAGE_BUCKETS = {
  images: 'kkinit-images'
} as const

export const STORAGE_FOLDERS = {
  feed: 'feed',        // 게시물 image
  archive: 'archive',  // 식당 보관함 (place-uchon.png 등)
  explore: 'explore',  // 탐색 페이지 (r1.png, g1.png, g1a.png, ranking-1.png 등)
  chat: 'chat',        // chat profile (profile-kurumi.png, group-member-1.png 등)
  home: 'home',        // home header-avatar.png
  my: 'my',            // my 페이지 (avatar.png, post-author.png, post-img1.png)
  map: 'map',          // 지도 asset (map-bg.webp, avatar-1.webp 등)
  root: ''             // bucket root (flat file: my-repost-*, my-badges-*)
} as const

export type StorageFolder = (typeof STORAGE_FOLDERS)[keyof typeof STORAGE_FOLDERS]

/**
 * image_path (e.g. "feed/post-001-1.webp") → public URL string.
 *
 * 절대 path 가 들어와도 안전 ("/images/feed/x.png" → 그대로 반환).
 * 컴포넌트 마이그레이션 단계에서 옛 절대 path 가 섞여 들어와도
 * helper 는 절대 추측하지 않고 그대로 통과시킨다.
 *
 * 반환값은 항상 string (placeholder 포함). UI 가 깨지지 않도록 보장.
 */
export function getStorageImageUrl(
  imagePath: string | null | undefined,
  folderOrBucket: StorageFolder | string = STORAGE_FOLDERS.feed
): string {
  return resolveImageUrl(imagePath, folderOrBucket, '/images/chat/default-avatar.svg')
}

/**
 * Spec #22 — DB 에는 image_path 만 저장하는 패턴을 권장.
 * 컴포넌트에서 직접 URL 을 만들지 않고, 가능한 한 path 만 다루도록
 * helper 사용을 강제하는 facade.
 */
export const imagePathFacade = {
  feed: (file: string) => `${STORAGE_FOLDERS.feed}/${file}`,
  archive: (file: string) => `${STORAGE_FOLDERS.archive}/${file}`,
  explore: (file: string) => `${STORAGE_FOLDERS.explore}/${file}`,
  chat: (file: string) => `${STORAGE_FOLDERS.chat}/${file}`,
  home: (file: string) => `${STORAGE_FOLDERS.home}/${file}`,
  my: (file: string) => `${STORAGE_FOLDERS.my}/${file}`,
  map: (file: string) => `${STORAGE_FOLDERS.map}/${file}`,
  root: (file: string) => file  // flat file — no folder prefix
} as const

/**
 * Internal — main resolver.
 *
 * @param imagePath         - storage path, full URL, or legacy absolute path
 * @param folderOrBucket    - default Storage folder if `imagePath` has no prefix
 * @param fallback          - last-resort URL when nothing else resolves
 */
function resolveImageUrl(
  imagePath: string | null | undefined,
  folderOrBucket: string,
  fallback: string
): string {
  if (!imagePath) return fallback

  // 1) 이미 full URL
  if (/^https?:\/\//i.test(imagePath)) return imagePath

  // 2) 옛 절대 path ("/images/...") 는 그대로 반환 (mock 단계 호환).
  if (imagePath.startsWith('/')) return imagePath

  // 3) storage path → Supabase Storage public URL 시도
  const cfg = useRuntimeConfig()
  const base = cfg.public.supabaseUrl
  const bucket = STORAGE_BUCKETS.images

  const cleanPath = imagePath.replace(/^\/+/, '')
  // flat file (root folder) → no prefix; else → folder/file
  const finalPath = cleanPath.includes('/')
    ? cleanPath
    : folderOrBucket
      ? `${folderOrBucket}/${cleanPath}`
      : cleanPath

  if (base && bucket) {
    return `${base.replace(/\/+$/, '')}/storage/v1/object/public/${bucket}/${finalPath}`
  }

  // 4) supabaseUrl 미설정 → local public/ 폴더 URL 로 fallback
  //    storage path 의 folder prefix 를 떼고 /images/ 아래에 매핑.
  //    예: "feed/post-001-1.webp" → "/images/feed/post-001-1.webp"
  return `/images/${finalPath}`
}
