import axios from "axios"

export default {
    namespaced: true,
    state: {
        sport_objects: null,
    },
    getters: {
        getSportObjectById: state => id => {
            return state.sport_objects.find(el => el.id === id);
        },
    },
    actions: {
        getSportObjects({commit}) {
            // Send request
            return axios.get('/api/sport-objects')
                .then(response => {
                    commit('SET_SPORT_OBJECTS', response.data.sport_objects.map(sport_object => {
                        sport_object.params = JSON.parse(sport_object.params);
                        return sport_object;
                    }));
                })
        },
    },
    mutations: {
        SET_SPORT_OBJECTS(state, sport_objects) {
            state.sport_objects = sport_objects;
        }
    }
}
