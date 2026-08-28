import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './app/App.vue'
import { router } from './app/router'
import './ui/styles/tokens.css'

createApp(App).use(createPinia()).use(router).mount('#app')
