import { createRouter, createWebHashHistory } from 'vue-router'

import NotFound from './layout/NotFound.vue'
import Home from './pages/Home.vue'
import Editor from './pages/Editor.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/editor/:sceneUUID', component: Editor, name: 'Editor' },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
})
