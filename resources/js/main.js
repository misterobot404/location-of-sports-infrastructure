import Vue from 'vue'
import App from './App'
import router from './routes'
import store from './store'
import components from './components'

components.forEach(e => {
    Vue.component(e.name, e)
});

new Vue({
    store,
    router,
    render: h => h(App),
}).$mount('#app');
