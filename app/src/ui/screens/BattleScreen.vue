<script setup lang="ts">
import PixiStage from '@/ui/components/PixiStage.vue'
</script>

<template>
  <section aria-labelledby="battle-title">
    <h2 id="battle-title">战斗</h2>
    <p>全自动副本战斗、掉落结果与可读战报将在此呈现。</p>
    <PixiStage />
    <section class="battle-report" aria-labelledby="battle-report-title" aria-live="polite">
      <h3 id="battle-report-title">战报</h3>
      <p>尚未开始战斗。画面中的关键信息会同步显示为文字。</p>
    </section>
  </section>
</template>

<style scoped>
.battle-report {
  margin-top: 1rem;
  padding: 1rem 1.25rem;
  border-left: 0.3rem solid var(--jade);
  background: rgb(255 250 240 / 58%);
}

.battle-report h3 {
  margin-top: 0;
}
</style>
