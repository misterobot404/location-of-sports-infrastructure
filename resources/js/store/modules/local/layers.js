export default {
    namespaced: true,
    state: {
        doPaintRegions: true, //выводить ли регионы
        doPaintSportZones: false, //выводить спорт зоны
        doPaintSpHeatmap: false, //выводить ли хитмап по объектам
        doPaintPopHeatmap: false, //выводить ли хитмап по населению
        doPaintCircles: false, //выводить ли круги доступности
        doShowEmptySpaces: false, //выводить ли области без доступностей
        doShowIntersections: false, //выводить ли области с пересечениями
        squareNormal: 1000, //нормаль площадей
        calculateOnHundred: true, // расчёт аналитики на 100.000 человек
        doShowSavedIntersections: false, // выводить ли сохраненные пересечения
    },
    mutations: {
        set_doPaintRegions(state, v) {
            state.doPaintRegions = v;
        },
        set_doPaintSportZones(state, v) {
            state.doPaintSportZones = v;
        },
        set_doPaintSpHeatmap(state, v) {
            state.doPaintSpHeatmap = v;
        },
        set_doPaintPopHeatmap(state, v) {
            state.doPaintPopHeatmap = v;
        },
        set_doPaintCircles(state, v) {
            state.doPaintCircles = v;
        },
        set_doShowEmptySpaces(state, v) {
            state.doShowEmptySpaces = v;
        },
        set_doShowIntersections(state, v) {
            state.doShowIntersections = v;
        },
        set_squareNormal(state, v) {
            state.squareNormal = v;
        },
        set_calculateOnHundred(state, v) {
            state.calculateOnHundred = v;
        },
        set_doShowSavedIntersections(state, v) {
            state.doShowSavedIntersections = v;
        },
    }
}
