import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

import auth from './modules/auth'
import sports from "./modules/sports";
import relations from "./modules/relations";
import sport_objects from "./modules/sport_objects";
import accessibility from "./modules/accessibility";
import organisations from "./modules/organisations";

export default new Vuex.Store({
    strict: true,
    modules: {
        sports,
        relations,
        sport_objects,
        accessibility,
        organisations,
        auth,
    }
})


