export const routes = [
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        component: () => import('../pages/Home'),
    },
    {
        // Страница с аналитикой
        path: '/analytics/:id?',
        component: () => import('../pages/Analytics'),
    },
    {
        // Страница с информацией по объекту
        //name: 'Sport Objects',
        path: '/sport-objects/:id?',
        component: () => import('../pages/ObjectInfo'),
    },
    {
        path: '*',
        component: () => import('../pages/page404')
    }
];
