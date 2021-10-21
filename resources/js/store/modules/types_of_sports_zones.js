import axios from "axios"

export default {
    namespaced: true,
    state: {
        types_of_sports_zones: null
    },
    actions: {
        getTypesOfSportsZones({commit}) {
            return axios.get('/api/types-of-sports-zones')
                .then(response => {
                    commit('SET_TYPES_OF_SPORTS_ZONES', response.data.types_of_sports_zones);
                })
        },
    },
    mutations: {
        SET_TYPES_OF_SPORTS_ZONES(state, types_of_sports_zones) {
            state.types_of_sports_zones = types_of_sports_zones;
        }
    }
}
