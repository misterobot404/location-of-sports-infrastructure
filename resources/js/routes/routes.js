export const routes = [
    //dont set name field to hide from header
    {
        path: '/',
        name: 'Main',
        component: () => import('../pages/Home'),
        meta: {
            title: 'Go to main page' //set if u want to set title on header element
        }
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
