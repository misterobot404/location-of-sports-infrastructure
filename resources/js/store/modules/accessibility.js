import axios from "axios"

export default {
    namespaced: true,
    state: {
        accessibility: null
    },
    actions: {
        getAccessibility({commit}) {
            return axios.get('/api/accessibility')
                .then(response => {
                    commit('SET_ACCESSIBILITY', response.data.accessibility);
                })
        },
    },
    mutations: {
        SET_ACCESSIBILITY(state, accessibility) {
            state.accessibility = accessibility;
        }
    }
}
