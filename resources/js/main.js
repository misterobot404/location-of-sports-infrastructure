import Vue from 'vue'
import App from './App'
import router from './routes'
import store from './store'

new Vue({
    store,
    router,
    render: h => h(App)
}).$mount('#app');
