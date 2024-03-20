import { createRouter, createWebHashHistory } from 'vue-router'

import NotFound from './layout/NotFound.vue'
import Home from './pages/Home.vue'

const routes = [
    { path: '/', component: Home },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
})
