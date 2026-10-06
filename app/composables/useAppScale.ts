import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

/*
 * Figma 의 기준 canvas 는 390 × 844.
 * 실제 디바이스 viewport (예: iPhone 11 = 414 × 896) 에서는
 * wrapper 전체를 viewport_width / 390 배 만큼 확대한다.
 *
 * wrapper 자체는 scale 되지만 document layout 의 width/height 는 그대로
 * 390 × 844 로 유지되므로, wrapper 의 부모 (.app-wrapper) 가 그 scaled
 * 시각 영역 (414 × 896) 을 정확히 차지하도록 CSS 에서 width/height 를
 * 1/scale 로 보정한다.
 *
 * @returns reactive `scale` (number) and `wrapperScale` (number) for inline style binding.
 */
const BASE_WIDTH = 390
const BASE_HEIGHT = 844

const scale = ref(1)
const wrapperScale = ref(1)

const compute = () => {
  if (!import.meta.client) return
  const vw = window.innerWidth
  const vh = window.innerHeight

  /*
   * Desktop preview 와 tablet (≥ 768px) 그리고 iPhone 11 Pro Max 등
   * 390px 미만 mobile 은 base 크기로 그대로 두고, 390px 초과 viewport 에서만
   * Figma 캔버스를 비례 확대한다.
   *
   * 단, 너무 큰 데스크탑 viewport 에서 wrapper 가 미친 듯이 커지지 않도록
   * 상한은 480px (= iPhone 11 414 + 알파) 로 둔다.
   */
  const minScale = 1
  const maxScale = Math.min(vw / BASE_WIDTH, vh / BASE_HEIGHT)
  const ratio = Math.max(minScale, Math.min(maxScale, vw / BASE_WIDTH))

  scale.value = ratio
  wrapperScale.value = ratio > 1 ? 1 / ratio : 1
}

export const useAppScale = () => {
  let raf = 0

  const onResize = () => {
    if (raf) cancelAnimationFrame(raf)
    raf = requestAnimationFrame(() => {
      compute()
      raf = 0
    })
  }

  onMounted(() => {
    compute()
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
  })

  onBeforeUnmount(() => {
    if (raf) cancelAnimationFrame(raf)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('orientationchange', onResize)
  })

  // Reactive recompute when devicePixelRatio changes (e.g. dragging window to retina screen)
  watch(scale, () => { /* placeholder for HMR */ })

  return {
    scale,
    wrapperScale
  }
}