export default {
    namespaced: true,
    state: {
        // Выбранные фильтры
        selected_organisations: [], // ведомства
        selected_types_of_sports: [], // виды спорта
        selected_types_of_sports_zones: [], // виды спорт. зон
        selected_accessibility: null, // доступность
        // Поиск по наименованию спорт зоны
        search_sportzone_name: "",
    },
    mutations: {
        set_selected_organisations(state, v) {
            state.selected_organisations = v;
        },
        set_selected_types_of_sports(state, v) {
            state.selected_types_of_sports = v;
        },
        set_selected_types_of_sports_zones(state, v) {
            state.selected_types_of_sports_zones = v;
        },
        set_selected_accessibility(state, v) {
            state.selected_accessibility = v;
        },
        set_search_sportzone_name(state, v) {
            state.search_sportzone_name = v;
        },
    }
}
