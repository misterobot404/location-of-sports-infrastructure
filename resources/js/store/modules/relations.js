import axios from "axios"

export default {
    namespaced: true,
    state: {
        relations: null,
    },
    getters: {
        getSportIdBySportObjectId: state => id => {
            let rel = state.relations.find(el => el.id_object === id);
            return rel ? rel.id_sport : -1;
        },
        getSportsBySportObjectId: state => id => {
            return state.relations.filter(el => el.id_object === id);
        },
    },
    actions: {
        getRelations({commit}) {
            return axios.get('/api/relations')
                .then(response => {
                    commit('SET_RELATIONS', response.data.relations);
                })
        },
    },
    mutations: {
        SET_RELATIONS(state, relations) {
            state.relations = relations;
        }
    }
}
