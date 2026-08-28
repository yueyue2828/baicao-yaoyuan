<script setup lang="ts">
import { useDisplayStore } from '@/app/stores/display-store'
import { useAppStore } from '@/app/stores/app-store'

const display = useDisplayStore()
const app = useAppStore()

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

    <section class="version-information" aria-labelledby="version-title">
      <h3 id="version-title">版本信息</h3>
      <dl v-if="app.appInfo">
        <div>
          <dt>应用</dt>
          <dd>{{ app.appInfo.name }}</dd>
        </div>
        <div>
          <dt>版本</dt>
          <dd>{{ app.appInfo.version }}</dd>
        </div>
        <div>
          <dt>运行环境</dt>
          <dd>{{ app.appInfo.runtime === 'browser' ? '开发预览' : 'Windows 桌面版' }}</dd>
        </div>
      </dl>
      <p v-else>正在读取版本信息……</p>
      <p>本版本完全离线运行。</p>
    </section>
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

.version-information {
  width: min(34rem, 100%);
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--paper-line);
}

.version-information dl {
  display: grid;
  gap: 0.6rem;
}

.version-information dl div {
  display: grid;
  grid-template-columns: 6rem 1fr;
}

.version-information dt {
  color: var(--jade);
  font-weight: 700;
}

.version-information dd {
  margin: 0;
}
</style>
