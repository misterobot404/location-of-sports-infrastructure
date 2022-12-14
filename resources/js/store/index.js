import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

import auth from './modules/auth'
import sports from "./modules/sports";
import relations from "./modules/relations";
import sport_objects from "./modules/sport_objects";
import accessibility from "./modules/accessibility";
import organisations from "./modules/organisations";
import types_of_sports_zones from "./modules/types_of_sports_zones";
import intersections from "./modules/intersections";
import layers from "./modules/local/layers";
import filters from "./modules/local/filters";

export default new Vuex.Store({
    strict: true,
    modules: {
        sports,
        relations,
        sport_objects,
        accessibility,
        organisations,
        types_of_sports_zones,
        auth,
        intersections,
        layers,
        filters
    }
})


