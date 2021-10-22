import axios from "axios"

export default {
    namespaced: true,
    state: {
        organisations: null
    },
    actions: {
        getOrganisations({commit}) {
            return axios.get('/api/organisations')
                .then(response => {
                    commit('SET_ORGANISATIONS', response.data.organisations);
                })
        },
    },
    mutations: {
        SET_ORGANISATIONS(state, relations) {
            state.organisations = relations;
        }
    }
}
