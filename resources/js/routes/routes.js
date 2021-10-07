export const routes = [
    {
        name: 'Home',
        path: '/',
        component: () => import('../pages/Home'),
    },
    {
        path: '*',
        redirect: '/'
    }
];
