<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAppStore } from '@/app/stores/app-store'
import { bootstrapApplication, type BootState } from '@/application/bootstrap'

const boot = ref<BootState>({ status: 'loading' })
const app = useAppStore()

onMounted(async () => {
  boot.value = await bootstrapApplication()
  if (boot.value.status === 'ready') await app.loadAppInfo()
})
</script>

<template>
  <div class="app-root">
    <h1 class="sr-only" data-testid="game-title">百草药园</h1>
    <main v-if="boot.status === 'error'" class="boot-error" role="alert">
      <h2>游戏资料加载失败</h2>
      <p>{{ boot.message }}</p>
      <p>存档尚未被修改。请重新安装或联系开发者。</p>
    </main>
    <RouterView v-else-if="boot.status === 'ready'" />
    <main v-else aria-busy="true">正在整理药园……</main>
  </div>
</template>
