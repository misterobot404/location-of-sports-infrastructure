<template>
    <section style="display: flex; justify-content: center">
        <div>
            <div class="filter__container container">
                <input placeholder="Поиск" class="filter"/>
                <br/>
                <select class="filter"/>
                <select class="filter"/>
                <select class="filter"/>
            </div>
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
            paintCircles: false
        }
    },
    computed: {
        ...mapState('sport_objects', ["sport_objects"]),
        ...mapState('sports', ["sports"]),
        ...mapState('relations', ["relations"]),
        ...mapGetters('sport_objects', ["getSportObjectById"]),
        ...mapGetters('relations', ["getSportIdBySportObjectId"]),
        ...mapGetters('sports', ["getSportById"]),
        ready() {
            return this.sport_objects && this.sports && this.relations;
        }
    },
    methods: {
        paintMap() {
            if (this.ready) {
                let objectManager = new ymaps.ObjectManager({
                    // Чтобы метки начали кластеризоваться, выставляем опцию.
                    clusterize: !this.paintCircles,
                    // ObjectManager принимает те же опции, что и кластеризатор.
                    gridSize: this.gridSize,
                    // Макет метки кластера pieChart.
                    clusterIconLayout: "default#pieChart"
                });
                this.myMap.geoObjects.removeAll();
                this.myMap.geoObjects.add(objectManager);

                let listBoxItems = this.sports.map(sport => {
                        return new ymaps.control.ListBoxItem({
                            data: {content: sport.name},
                            state: {selected: true}
                        })
                    }),
                    reducer = function (filters, filter) {
                        filters[filter.data.get('content')] = filter.isSelected();
                        return filters;
                    },
                    // Теперь создадим список, содержащий 5 пунктов.
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

                this.myMap.controls.add(listBoxControl);

                // Добавим отслеживание изменения признака, выбран ли пункт списка.
                listBoxControl.events.add(['select', 'deselect'], function (e) {
                    let listBoxItem = e.get('target');
                    let filters = ymaps.util.extend({}, listBoxControl.state.get('filters'));
                    filters[listBoxItem.data.get('content')] = listBoxItem.isSelected();
                    listBoxControl.state.set('filters', filters);
                });

                let filterMonitor = new ymaps.Monitor(listBoxControl.state);
                filterMonitor.add('filters', function (filters) {
                    // Применим фильтр.
                    objectManager.setFilter(getFilterFunction(filters));
                });

                function getFilterFunction(categories) {
                    return function (obj) {
                        var content = obj.properties.balloonContent;
                        return categories[content]
                    }
                }

                for (let i = 0, count_per_step = 1000, pool = [...this.sport_objects]; i < 5000; i += count_per_step) {
                    let data = [];
                    pool.slice(i, i + count_per_step).map(el => {
                        data.push({
                            type: "Feature",
                            id: el.id,
                            geometry: {
                                coordinates: el.coordinates.replace(/^\(|\)$/g, '').split(','),
                                type: this.paintCircles ? "Circle" : "Point",
                                radius: 1000,
                            },
                            properties: {
                                "balloonContent": this.getSportById(this.getSportIdBySportObjectId(el.id)).name,
                                "balloonContentHeader": el.name,
                                "balloonContentBody": "<p>ЗДЕСЬ НУЖНО ОПИСАНИЕ ОБЪЕКТА КАКОЕ_ТО</p>",
                                "balloonContentFooter": "<font size=1>Информация предоставлена: </font> <strong>этим балуном</strong>",
                                "clusterCaption": el.name, //подпись и слева и справа
                                "hintContent": "<strong>Текст  <s>подсказки</s></strong>"
                            },
                            options: {
                                "preset": "islands#blueCircleDotIconWithCaption"
                            }
                        });
                    });
                    setTimeout(() => {
                        objectManager.add(data);
                    }, this.paintCircles === "Circle" ? 200 : 100);
                }
            }
        }
    },
    watch: {
        paintCircles() {
            this.paintMap();
        },
        sport_objects() {
            this.paintMap();
        },
        sports() {
            this.paintMap();
        },
        relations() {
            this.paintMap();
        }
    },
    beforeMount() {
        //ИНИЦИИРУЕМ КАРТУ
        ymaps.ready(['util.calculateArea']).then(() => {
            this.myMap = new ymaps.Map('map', {
                // используется перевернутый порядок координат (longlat)
                center: [55.76, 37.64],
                zoom: 10,
            });
        })
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
</style>
