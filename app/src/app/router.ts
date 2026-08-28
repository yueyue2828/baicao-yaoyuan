import { createRouter, createWebHashHistory } from 'vue-router'
import AppShell from '@/ui/layout/AppShell.vue'

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: AppShell,
      children: [
        { path: '', name: 'farm', component: () => import('@/ui/screens/FarmScreen.vue') },
        {
          path: 'collection',
          name: 'collection',
          component: () => import('@/ui/screens/CollectionScreen.vue'),
        },
        { path: 'build', name: 'build', component: () => import('@/ui/screens/BuildScreen.vue') },
        {
          path: 'battle',
          name: 'battle',
          component: () => import('@/ui/screens/BattleScreen.vue'),
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/ui/screens/SettingsScreen.vue'),
        },
      ],
    },
  ],
})
