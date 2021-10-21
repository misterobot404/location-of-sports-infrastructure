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
        // Виды спорт.зон
        store.dispatch('types_of_sports_zones/getTypesOfSportsZones', null, {root: true}).then();
        // Доступность
        store.dispatch('accessibility/getAccessibility', null, {root: true}).then();
        // Виды спорта
        store.dispatch('sports/getSports', null, {root: true}).then();
        // Ведомства
        store.dispatch('organisations/getOrganisations', null, {root: true}).then();
        // Спортивные объекты
        store.dispatch('sport_objects/getSportObjects', null, {root: true}).then();
    }
}).$mount('#app');


