import { useRouter } from 'vue-router'

/*
 * Safe navigation helper.
 *
 * 앱 내부 버튼/메뉴에서 아직 구현되지 않은 route 로의 이동을 막아
 * Nuxt 404 페이지 진입을 방지한다.
 *
 * 동작:
 *   - router.resolve(path).matched.length 가 0 이면 (현재 Nuxt router 에
 *     해당 route 가 매칭되지 않으면) 아무 동작도 하지 않고 현재 페이지를
 *     그대로 유지한다.
 *   - route 가 존재하면 router.push() 로 정상 이동한다.
 *
 * 사용:
 *   const { safeNavigate } = useSafeNavigation()
 *
 *   @click="safeNavigate('/archive')"
 *
 * 참고:
 *   - router.back() 은 이번 helper 대상이 아니다. 그대로 유지한다.
 *   - URL 을 하드코딩 배열로 관리하지 않으므로, 새 page 가 추가되면
 *     자동으로 인식된다.
 *   - dynamic route 도 router 가 처리하므로 정상 동작한다
 *     (예: /profile/123 — 해당 page 가 존재하면 이동).
 *
 * Chat detail 화이트리스트 (현재 단계):
 *   - /chat/[id] 는 mock detail 이 'tiranori' 만 채워져 있어,
 *     그 외 id 로의 이동은 빈 화면 / mock 누락 등의 문제를 일으킨다.
 *   - 따라서 /chat/[id] 로의 navigation 은 id 가 'tiranori' 일 때만 허용한다.
 *   - 그 외 (예: /chat/johnny, /chat/group-hapjeong-yasik) 는 무시한다.
 *   - 새로운 detail mock 이 추가되면 NAVIGABLE_CHAT_IDS 에 id 를 추가하면 된다.
 */
const NAVIGABLE_CHAT_IDS: ReadonlySet<string> = new Set(['tiranori'])

export const useSafeNavigation = () => {
  const router = useRouter()

  /**
   * target 이 /chat/[id] 형태일 때, 화이트리스트에 포함된 id 인지 검증한다.
   * 그 외 path 는 true 반환 (검사 통과).
   */
  const isChatDetailAllowed = (path: string): boolean => {
    const cleaned = path.split('?')[0].split('#')[0]
    const segments = cleaned.split('/').filter(Boolean)
    if (segments.length < 2) return true
    if (segments[0] !== 'chat') return true
    // segments.length === 2 === /chat/[id]
    return NAVIGABLE_CHAT_IDS.has(segments[1])
  }

  /**
   * target 으로 안전하게 이동한다.
   *
   * @param path 이동할 경로 (예: '/archive', '/groups/123')
   * @returns     true  = 이동 성공
   *              false = route 가 존재하지 않아 이동하지 않음
   */
  const safeNavigate = async (path: string): Promise<boolean> => {
    if (!path) return false

    /*
     * router 가 매칭하지 못한 path 는 matched 가 비어 있다.
     * 이 경우 push 자체를 호출하지 않는다 (404 / error 페이지로 가지 않게).
     */
    const resolved = router.resolve(path)
    if (!resolved.matched || resolved.matched.length === 0) {
      return false
    }

    /*
     * /chat/[id] 화이트리스트 적용.
     * mock detail 이 없는 id (예: johnny, group-hapjeong-yasik ...) 로의
     * 이동은 차단한다.
     */
    if (!isChatDetailAllowed(path)) {
      return false
    }

    /*
     * 현재 path 와 같으면 router 가 알아서 처리하지만,
     * 명시적으로 push 만 호출해 history 변경/page transition 이
     * 일어나지 않도록 한다.
     */
    if (resolved.path === router.currentRoute.value.path) {
      return true
    }

    await router.push(path)
    return true
  }

  return {
    safeNavigate
  }
}
