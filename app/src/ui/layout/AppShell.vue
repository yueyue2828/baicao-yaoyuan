<script setup lang="ts">
const destinations = [
  { name: 'farm', label: '药田' },
  { name: 'collection', label: '本草' },
  { name: 'build', label: '队伍' },
  { name: 'battle', label: '战斗' },
  { name: 'settings', label: '设置' },
] as const
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <strong>百草药园</strong>
    </header>
    <div class="app-body">
      <nav class="primary-nav" aria-label="主要功能">
        <RouterLink v-for="item in destinations" :key="item.name" :to="{ name: item.name }">
          {{ item.label }}
        </RouterLink>
      </nav>
      <main class="screen-content"><RouterView /></main>
    </div>
  </div>
</template>

<style scoped>
.app-shell {
  display: grid;
  min-height: 100dvh;
  grid-template-rows: auto minmax(0, 1fr);
  color: #263d36;
  background: #f6f0df;
}

.app-header {
  padding: 0.8rem 1.5rem;
  border-bottom: 1px solid #cbbd9f;
  background: #e8dcc0;
  color: #263d36;
  font-size: 1.25rem;
  letter-spacing: 0.12em;
}

.app-body {
  display: grid;
  min-height: 0;
  grid-template-rows: minmax(0, 1fr) auto;
}

.primary-nav {
  z-index: 1;
  display: grid;
  grid-row: 2;
  grid-template-columns: repeat(5, minmax(7rem, 1fr));
  gap: 0.75rem;
  padding: 0.75rem clamp(1rem, 4vw, 4rem);
  border-top: 1px solid #cbbd9f;
  background: rgb(246 240 223 / 96%);
}

.primary-nav a {
  padding: 0.7rem 1rem;
  border: 1px solid #b8aa8e;
  border-radius: 0.35rem;
  color: #263d36;
  background: #efe4ca;
  font-size: 1rem;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
}

.primary-nav a:hover,
.primary-nav a.router-link-active {
  border-color: #55766b;
  color: #fffaf0;
  background: #55766b;
}

.screen-content {
  grid-row: 1;
  min-height: 0;
  padding: clamp(1.25rem, 3vw, 2.5rem);
  overflow: auto;
}
</style>
