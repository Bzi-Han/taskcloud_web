import { createRouter, createWebHistory } from 'vue-router'
import network from './network'
import store from './store'

const routes = [
    {
        path: '/',
        component: () => import('../views/common/Login.vue'),
        meta: {
            annonymous: true
        }
    },
    {
        path: '/home-status',
        component: () => import('../layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('../views/common/TaskStatus.vue') }
        ]
    },
    {
        path: '/task-detail',
        component: () => import('../layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('../views/common/TaskDetail.vue') }
        ]
    },
    {
        path: '/task-log',
        component: () => import('../layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('../views/common/TaskLog.vue') }
        ]
    },
    {
        path: '/task',
        component: () => import('../layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('../views/common/Task.vue') }
        ]
    },
    {
        path: '/package',
        component: () => import('../layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('../views/common/Package.vue') }
        ]
    },
    {
        path: '/config',
        component: () => import('../layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('../views/common/Config.vue') }
        ]
    },
    {
        path: '/help/:id?',
        component: () => import('../layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('../views/common/Help.vue') }
        ]
    },
    {
        path: '/user-info/:id?',
        component: () => import('../layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('../views/common/UserInfo.vue') }
        ]
    },
    {
        path: '/developer-task',
        component: () => import('../layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('../views/developer/DeveloperTask.vue') }
        ],
        meta: {
            requiresPermission: 1
        }
    },
    {
        path: '/developer-help',
        component: () => import('../layouts/MainLayout.vue'),
        children: [
            { path: '', component: () => import('../views/developer/DeveloperHelp.vue') }
        ],
        meta: {
            requiresPermission: 1
        }
    },
    {
        path: '/review-task',
        component: () => import('../layouts/AdminLayout.vue'),
        children: [
            { path: '', component: () => import('../views/admin/ReviewTask.vue') }
        ],
        meta: {
            requiresPermission: 2
        }
    },
    {
        path: '/review-help',
        component: () => import('../layouts/AdminLayout.vue'),
        children: [
            { path: '', component: () => import('../views/admin/ReviewHelp.vue') }
        ],
        meta: {
            requiresPermission: 2
        }
    },
];

const router = new createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
    if ('/' === to.path && network.authorized)
        next('/home-status');

    const adminFilterResult = store.useUserInfo(userInfo => {
        if (2 == userInfo.type && '/review-task' !== to.path && '/review-help' !== to.path) {
            next('/review-task');

            return true;
        }

        return false;
    });
    if (adminFilterResult)
        return;

    if (undefined !== to.meta.requiresPermission) {
        if (store.useUserInfo(userInfo => to.meta.requiresPermission <= userInfo.type))
            next();
        else
            next('/home-status');

        return;
    }

    if (!to.meta.annonymous) {
        if (network.authorized)
            next();
        else
            next({path: '/'});
    } else
        next();
});

export default router