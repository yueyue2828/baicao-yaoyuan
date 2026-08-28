import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface DisplaySettings {
  uiScalePercent: number
  reduceEffects: boolean
  pixelSharpness: boolean
}

export const useDisplayStore = defineStore('display', () => {
  const uiScalePercent = ref(100)
  const reduceEffects = ref(false)
  const pixelSharpness = ref(true)
  const cssScale = computed(() => uiScalePercent.value / 100)

  function setUiScale(value: number): void {
    uiScalePercent.value = Math.min(200, Math.max(80, Math.round(value)))
  }

  return { uiScalePercent, reduceEffects, pixelSharpness, cssScale, setUiScale }
})
