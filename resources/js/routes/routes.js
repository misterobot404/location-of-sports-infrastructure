export const routes = [
    //dont set name field to hide from header
    {
        path: '/',
        component: () => import('../pages/Home'),
    },
    {
        path: '//',
        name: 'Main',
        alias: ['/'],
    },
    {
        path: '/404',
        name: '404',
        component: () => import('../pages/page404'),
    },
    {
        path: '*',
        component: () => import('../pages/page404')
    }
];
