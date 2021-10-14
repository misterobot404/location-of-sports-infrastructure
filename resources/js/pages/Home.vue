<template>
    <section style="display: flex; justify-content: center;">
        <!-- Loader -->
        <div v-if="!dataReady" class="loader" style="text-align: center">
            <svg>
                <circle cx="50" cy="50" r="40" stroke="red" stroke-dasharray="78.5 235.5" stroke-width="3" fill="none"/>
                <circle cx="50" cy="50" r="30" stroke="blue" stroke-dasharray="62.8 188.8" stroke-width="3" fill="none"/>
                <circle cx="50" cy="50" r="20" stroke="green" stroke-dasharray="47.1 141.3" stroke-width="3" fill="none"/>
            </svg>
            <h2>Загрузка данных...</h2>
        </div>
        <!-- Map -->
        <div v-show="dataReady">
            <input v-model="sport_object_id" placeholder="id объекта">
            <router-link :to="{ name: 'Sport Objects', params: {id: sport_object_id}}" tag="button">Перейти</router-link>
            <br/>
            <label>Рисовать круги: <input type="checkbox" v-model="paintCircles"/></label>
            <div class="map__container container" id='map'/>
        </div>
    </section>
</template>

<script>
import {mapState, mapGetters} from "vuex"

export default {
    name: "Home",
    data() {
        return {
            sport_object_id: null,
            // map
            myMap: null,
            gridSize: 91,
            paintCircles: false,
            listBoxControl: null,
        }
    },
    computed: {
        ...mapState({
            sport_objects: state => state.sport_objects.sport_objects,
            sports: state => state.sports.sports,
            relations: state => state.relations.relations,
        }),
        ...mapGetters({
            getSportObjectById: "sport_objects/getSportObjectById",
            getSportIdBySportObjectId: "relations/getSportIdBySportObjectId",
            getSportById: "sports/getSportById",
            sports_of_object: "relations/getSportsBySportObjectId"
        }),
        dataReady() {
            return this.sport_objects && this.sports && this.relations;
        }
    },
    methods: {
        paintObjects() {
            // Создаём объект ObjectManager для отображения, кластеризации и управления видимостью объектов
            let objectManager = new ymaps.ObjectManager({
                // Чтобы метки начали кластеризоваться, выставляем опцию.
                clusterize: !this.paintCircles,
                // ObjectManager принимает те же опции, что и кластеризатор.
                gridSize: this.gridSize,
                // Макет метки кластера pieChart.
                clusterIconLayout: "default#pieChart",
                // Отображение списка объектов при клике на кластер
                clusterDisableClickZoom: true
            });
            this.myMap.geoObjects.removeAll();
            this.myMap.geoObjects.add(objectManager);

            // Применяем к ObjectManager фильтр
            let filterMonitor = new ymaps.Monitor(this.listBoxControl.state);
            filterMonitor.add('filters', function (filters) {
                objectManager.setFilter(getFilterFunction(filters));
            });
            function getFilterFunction(categories) {
                return function (obj) {
                    let content = obj.properties.balloonContentFooter;
                    return categories[content]
                }
            }

            // Порционная отрисовка объектов
            for (let i = 0, count_per_step = 200, pool = [...this.sport_objects]; i < 1000; i += count_per_step) {
                let data = [];
                pool.slice(i, i + count_per_step).map(el => {
                    let _sports = [];
                    this.sports_of_object(el.id).forEach(e => {
                        _sports.push(this.getSportById(e.id_sport)?.name);
                    });

                    data.push({
                        type: "Feature",
                        id: el.id,
                        geometry: {
                            coordinates: el.coordinates.replace(/^\(|\)$/g, '').split(','),
                            type: this.paintCircles ? "Circle" : "Point",
                            radius: 1000,
                        },
                        properties: {
                            "balloonContent": "balloonContent",
                            "balloonContentHeader": el.name,
                            "balloonContentBody": "<p>ЗДЕСЬ БУДУТ ПЕРЕЧИСЛЕНЫ СПОРТ ОБЪЕКТЫ, ВОЗМОЖНО, С ЧЕМТО ЕЩЁ</p>",
                            "balloonContentFooter": [...new Set(_sports)].join('; '),
                            "clusterCaption": el.name, //подпись и слева и справа
                            "hintContent": "<strong>Текст  <s>подсказки</s></strong>"
                        },
                        options: {
                            "preset": "islands#blueCircleDotIconWithCaption"
                        }
                    });
                });
                setTimeout(() => objectManager.add(data), this.paintCircles === "Circle" ? 300 : 100);
            }
        }
    },
    beforeMount() {
        // Создание карты
        ymaps.ready(['util.calculateArea']).then(() => {
            this.myMap = new ymaps.Map('map', {
                center: [55.76, 37.64],
                zoom: 10,
            });

            // Добавляем список для выбора видов спорта
            let listBoxItems = this.sports.map(sport => {
                    return new ymaps.control.ListBoxItem({
                        data: {content: sport.name},
                        state: {selected: false}
                    })
                }),
                reducer = function (filters, filter) {
                    filters[filter.data.get('content')] = filter.isSelected();
                    return filters;
                },
                listBoxControl = new ymaps.control.ListBox({
                    data: {
                        content: 'Фильтр по видам спорта',
                        title: 'Фильтр'
                    },
                    items: listBoxItems,
                    state: {
                        // Признак, развернут ли список.
                        expanded: false,
                        filters: listBoxItems.reduce(reducer, {})
                    }
                });
            this.listBoxControl = listBoxControl;
            this.myMap.controls.add(listBoxControl);
            listBoxControl.events.add(['select', 'deselect'], function (e) {
                let listBoxItem = e.get('target');
                let filters = ymaps.util.extend({}, listBoxControl.state.get('filters'));
                filters[listBoxItem.data.get('content')] = listBoxItem.isSelected();
                listBoxControl.state.set('filters', filters);
            });
        });

        // Следим за изменением данных для отрисовки объектов
        this.$watch(vm => [vm.sport_objects, vm.sports, vm.relations, vm.paintCircles], _ => {
            if (this.dataReady) this.paintObjects()
        });
    }
}
</script>

<style scoped>
.filter__container {
    display: flex;
}

.filter__container .filter {
    padding: 5px;
    width: 200px;
}

.map__container {
    align-content: center;
    height: 800px;
    width: 800px;
    border: 1px solid black;
}

/* Loader */
.loader {
    position: fixed;
    transform: translate(-50%, -50%);
    top: 50%;
    left: 50%;
}

.loader circle {
    transform-origin: center;
    transform-box: fill-box;
    transform-origin: center;
    animation: rotate linear infinite;
}

.loader circle:nth-child(1) {
    animation-duration: 1.6s;
}

.loader circle:nth-child(2) {
    animation-duration: 1.2s;
}

.loader circle:nth-child(3) {
    animation-duration: 0.8s;
}

@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}

.loader svg {
    width: 100px;
    height: 100px;
}

</style>
