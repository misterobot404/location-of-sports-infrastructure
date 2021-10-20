import axios from "axios"

export default {
    namespaced: true,
    state: {
        intersections: [],
    },
    getters: {
        getById: state => id => {
            return state.intersections.find(el => el.id === id);
        },
    },
    actions: {
        getAll({commit}) {
            return axios.get('/api/intersections')
                .then(response => {
                    commit('SET_STATE', response.data.intersections);
                })
        },
        saveObject ({dispatch}, params){
            return axios
                .post('/api/intersections', params)
                .then(response => {
                    if (response.status == 204){
                        dispatch('getAll');
                    }
                    else alert(response.statusText);
                });
        },
        deleteObject ({dispatch}, id){
            return axios
                .delete('/api/intersections/' + id)
                .then(response => {
                    if (response.status == 204){
                        dispatch('getAll');
                    }
                    else alert(response.statusText);
                });
        },
    },
    mutations: {
        SET_STATE(state, intersections) {
            state.intersections = intersections;
        }
    }
}
