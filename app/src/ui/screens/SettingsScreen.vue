<script setup lang="ts">
import { useDisplayStore } from '@/app/stores/display-store'

const display = useDisplayStore()

function updateUiScale(event: Event): void {
  display.setUiScale(Number((event.target as HTMLInputElement).value))
}
</script>

<template>
  <section aria-labelledby="settings-title">
    <h2 id="settings-title">设置</h2>
    <p>调整界面比例与画面表现。窗口尺寸仍可独立缩放。</p>

    <fieldset class="display-settings">
      <legend>显示</legend>

      <label for="ui-scale">界面缩放：{{ display.uiScalePercent }}%</label>
      <input
        id="ui-scale"
        type="range"
        min="80"
        max="200"
        step="5"
        :value="display.uiScalePercent"
        @input="updateUiScale"
      />

      <label class="check-row">
        <input v-model="display.reduceEffects" type="checkbox" />
        减少特效
      </label>

      <label class="check-row">
        <input v-model="display.pixelSharpness" type="checkbox" />
        保持像素锐利
      </label>
    </fieldset>
  </section>
</template>

<style scoped>
.display-settings {
  display: grid;
  width: min(34rem, 100%);
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1.25rem;
  border: 1px solid var(--paper-line);
  background: rgb(255 250 240 / 58%);
}

.display-settings legend {
  padding-inline: 0.5rem;
  color: var(--jade);
  font-weight: 700;
}

.display-settings input[type='range'] {
  width: 100%;
  accent-color: var(--cinnabar);
}

.check-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.check-row input {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--jade);
}
</style>
