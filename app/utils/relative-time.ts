/**
 * app/utils/relative-time.ts
 *
 * spec #43 / #44 — relative time formatter (Korean).
 *
 *   "방금"        (< 1 minute)
 *   "1분 전"      (< 1 hour)
 *   "1시간 전"    (< 1 day)
 *   "1일 전"      (< 7 days)
 *   "1주 전"      (< 30 days)
 *   "MM/DD"       (otherwise)
 */

export function formatRelativeTime(input: string | Date): string {
  const date = input instanceof Date ? input : new Date(input)
  if (Number.isNaN(date.getTime())) return ''

  const now = Date.now()
  const diffMs = now - date.getTime()
  if (diffMs < 0) return '방금'

  const min = Math.floor(diffMs / 60_000)
  if (min < 1) return '방금'
  if (min < 60) return `${min}분 전`

  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}시간 전`

  const day = Math.floor(hr / 24)
  if (day < 7) return `${day}일 전`

  const week = Math.floor(day / 7)
  if (week < 5) return `${week}주 전`

  const m = date.getMonth() + 1
  const d = date.getDate()
  return `${m}/${d}`
}
