import axios from "axios"

export default {
    namespaced: true,
    state: {
        sports: null,
    },
    getters: {
        getSportById: state => id => {
            return state.sports.find(el => el.id === id);
        },
    },
    actions: {
        getSports({commit}) {
            return axios.get('/api/sports')
                .then(response => {
                    commit('SET_SPORTS', response.data.sports);
                })
        },
    },
    mutations: {
        SET_SPORTS(state, sports) {
            state.sports = sports;
        }
    }
}
