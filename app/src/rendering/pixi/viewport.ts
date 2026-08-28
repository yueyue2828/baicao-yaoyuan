export interface SafeViewport {
  scale: number
  offsetX: number
  offsetY: number
  visibleWidth: number
  visibleHeight: number
}

export function computeSafeViewport(width: number, height: number): SafeViewport {
  const scale = Math.min(width / 1280, height / 720)
  const visibleWidth = width / scale
  const visibleHeight = height / scale

  return {
    scale,
    offsetX: (width - 1280 * scale) / 2,
    offsetY: (height - 720 * scale) / 2,
    visibleWidth,
    visibleHeight,
  }
}
