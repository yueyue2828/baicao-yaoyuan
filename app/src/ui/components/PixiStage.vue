<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createGameStage, type GameStage } from '@/rendering/pixi/game-stage'

const host = ref<HTMLElement>()
let stage: GameStage | undefined
let observer: ResizeObserver | undefined
let unmounted = false

onMounted(async () => {
  if (!host.value) return

  const createdStage = await createGameStage(host.value)
  if (unmounted) {
    createdStage.destroy()
    return
  }

  stage = createdStage
  observer = new ResizeObserver(([entry]) => {
    if (entry) stage?.resize(entry.contentRect.width, entry.contentRect.height)
  })
  observer.observe(host.value)
})

onBeforeUnmount(() => {
  unmounted = true
  observer?.disconnect()
  observer = undefined
  stage?.destroy()
  stage = undefined
})
</script>

<template>
  <div ref="host" class="pixi-stage" role="img" aria-label="自动战斗场景" />
</template>

<style scoped>
.pixi-stage {
  width: 100%;
  min-height: 22rem;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  border: 1px solid var(--paper-line);
  background: linear-gradient(#dce5dc, #efe4ca);
}

.pixi-stage :deep(canvas) {
  display: block;
}
</style>
