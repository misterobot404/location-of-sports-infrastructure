export const routes = [
    //dont set <name> field to hide from header
    {
        path: '/',
        redirect: '/home'
    },
    {
        path: '/home',
        name: 'Home',
        component: () => import('../pages/Home'),
        meta: {
            title: 'Go to main page' //set if u want to set title on nav element
        }
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
