export const routes = [
    //dont set <name> field to hide from header
    {
        path: '/',
        name: 'Main',
        component: () => import('../pages/Home'),
        meta: {
            title: 'Go to main page' //set if u want to set title on nav element
        }
    },
    {
        // Страница с информацией по объекту
        path: '/info/:id',
        component: () => import('../pages/ObjectInfo'),
    },
    {
        path: '*',
        component: () => import('../pages/page404')
    }
];
