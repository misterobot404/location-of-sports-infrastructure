import Vue from 'vue'
import App from './App'
import router from './routes'
import store from './store'
import components from './components'
import vuetify from "./plugins/vuetify"

components.forEach(e => {
    Vue.component(e.name, e)
});

new Vue({
    store,
    router,
    vuetify,
    render: h => h(App),
    beforeCreate() {
        store.dispatch('sports/getSports', null, {root: true}).then();
        store.dispatch('sport_objects/getSportObjects', null, {root: true}).then();
        store.dispatch('intersections/getAll', null, {root: true}).then();
    }
}).$mount('#app');


