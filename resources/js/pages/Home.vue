<template>
    <v-container fluid>
        <!-- Loader -->
        <div v-if="!sport_objects" class="loader" style="text-align: center">
            <svg>
                <circle cx="50" cy="50" r="40" stroke="red" stroke-dasharray="78.5 235.5" stroke-width="3" fill="none"/>
                <circle cx="50" cy="50" r="30" stroke="blue" stroke-dasharray="62.8 188.8" stroke-width="3" fill="none"/>
                <circle cx="50" cy="50" r="20" stroke="green" stroke-dasharray="47.1 141.3" stroke-width="3" fill="none"/>
            </svg>
            <h2 v-text="'Загрузка данных...'"/>
        </div>
        <!-- Page -->
        <v-row v-show="sport_objects">
            <!-- Left -->
            <v-col cols="4" class="pl-5">
                <progress :value="loaded" max="10000" style="width: 100%"/>
                <v-select
                    v-model="selected_types_of_sports"
                    :items="sports ?
                    sports.map(el => el.name)
                    .filter(el => types_of_sports_filter ? (el.toLowerCase().indexOf(types_of_sports_filter.toLowerCase())) !== -1 : true)
                    : []"
                    :menu-props="{ maxHeight: '400', maxWidth:'300' }"
                    outlined
                    dense
                    multiple
                    hide-details
                    clearable
                    placeholder="Выберите вид спорта"
                    class="mt-4"
                >
                    <template v-slot:prepend-item>
                        <v-list-item>
                            <v-text-field v-model.lazy.trim="types_of_sports_filter" prepend-icon="search" hide-details dense outlined placeholder="Поиск..."/>
                        </v-list-item>
                        <v-divider class="mt-2"></v-divider>
                    </template>
                    <template v-slot:selection="{ item, index }">
                        <v-chip v-if="index < 2">
                            <span>{{ item }}</span>
                        </v-chip>
                        <span
                            v-if="index === 2"
                            class="grey--text text-caption"
                        >
                          (+{{ selected_types_of_sports.length - 1 }} others)
                        </span>
                    </template>
                </v-select>
                <div class="d-flex mt-4">
                    <v-text-field
                        v-model="selected_sport_object_id"
                        placeholder="id объекта"
                        hide-details
                        filled
                        dense
                    />
                    <v-btn
                        :to="{ name: 'Sport Objects', params: {id: selected_sport_object_id}}"
                        color="primary"
                        class="ml-2"
                        style="text-transform: none">
                        Перейти
                    </v-btn>
                </div>
                <section class="mt-4">
                    <label>Регионы: <input type="checkbox" v-model="doPaintRegions"/></label><br/>
                    <label>Хитмап объектов: <input type="checkbox" v-model="doPaintSpHeatmap"/></label><br/>
                    <label>Хитмап населения: <input type="checkbox" v-model="doPaintPopHeatmap"/></label><br/>
                    <label>Доступность: <input type="checkbox" v-model="doPaintCircles"/></label><br/>
                </section>
                <div ref='region_info' class="mt-4"/>
            </v-col>
            <!-- Right -->
            <v-col cols="8" class="pa-0">
                <div id='map'/>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import {mapState} from "vuex"
import regions_geo from '../regions_geo.json'
import population_heatmaps from '../population_heatmaps.json'

export default {
    name: "Home",
    data() {
        return {
            // filters
            selected_sport_object_id: null,
            selected_types_of_sports: [],
            types_of_sports_filter: null,
            // map
            myMap: null,
            gridSize: 91,
            sport_object_id: null,
            loaded: 0,

            doPaintRegions: false, //выводить ли регионы
            regionsOverlay: null, //оверлей регионов

            doPaintSpHeatmap: false, //выводить ли хитмап по объектам
            spHeatmap: null, //объект хитмапа

            doPaintPopHeatmap: false, //выводить ли хитмап по населению
            popHeatmap: null, //хитмап населения
        }
    },
    computed: {
        ...mapState({
            sport_objects: state => state.sport_objects.sport_objects,
            sports: state => state.sports.sports
        }),
        filteredSportObjects() {
            if (this.sport_objects) {
                // Фильтр по видам спорта
                if (this.selected_types_of_sports.length)
                    return this.sport_objects.filter(sport_object => {
                        let el_find = false;
                        sport_object.params.forEach(param => {
                            if (param && this.selected_types_of_sports.includes(param.sport)) el_find = true;
                        });
                        return el_find;
                    })
                else return this.sport_objects;
            } else return false;
        },

        regionsManager() {
            if (this.regionsOverlay == null) {
                this.regionsOverlay = new ymaps.GeoObjectCollection({}, {});
                this.myMap.geoObjects.add(this.regionsOverlay);
            }
            return this.regionsOverlay;
        }
    },
    methods: {
        // Рисование объектов
        // Спортивные объекты (в виде точек или кругов доступности)
        paintObjects() {
            // Создаём объект ObjectManager для отображения, кластеризации и управления видимостью объектов
            let objectManager = new ymaps.ObjectManager({
                // Чтобы метки начали кластеризоваться, выставляем опцию.
                clusterize: !this.doPaintCircles,
                // ObjectManager принимает те же опции, что и кластеризатор.
                gridSize: this.gridSize,
                // Макет метки кластера pieChart.
                clusterIconLayout: "default#pieChart",
                // Отображение списка объектов при клике на кластер
                clusterDisableClickZoom: true
            });
            this.myMap.geoObjects.removeAll();
            this.myMap.geoObjects.add(objectManager);

            // Порционная отрисовка объектов
            for (let i = 0, count_per_step = 1000; i < this.filteredSportObjects.length; i += count_per_step) {
                let data = [];
                this.filteredSportObjects.slice(i, i + count_per_step).map(el => {
                    data.push({
                        type: "Feature",
                        id: el.object_id,
                        geometry: {
                            coordinates: el.object_coordinates.replace(/^\(|\)$/g, '').split(','),
                            type: this.paintCircles ? "Circle" : "Point",
                            radius: 1000,
                        },
                        properties: {
                            "balloonContent": "balloonContent",
                            "balloonContentHeader": el.object_name,
                            "balloonContentBody": "<p>ЗДЕСЬ БУДУТ ПЕРЕЧИСЛЕНЫ СПОРТ ОБЪЕКТЫ, ВОЗМОЖНО, С ЧЕМТО ЕЩЁ</p>",
                            "balloonContentFooter": "",
                            "clusterCaption": el.object_name, //подпись и слева и справа
                            "hintContent": "<strong>Текст  <s>подсказки</s></strong>"
                        },
                        options: {
                            "preset": "islands#blueCircleDotIconWithCaption"
                        }
                    });
                });
                setTimeout(() => {
                    this.loaded = i + count_per_step;
                    objectManager.add(data);
                }, this.paintCircles === "Circle" ? 300 : 100)
            }
        },
        // Регионы москвы
        paintRegions() {
            if (this.doPaintRegions) {
                //добавить регионы
                regions_geo.features.map(feature => {
                    if (typeof (feature.geo_reverse.coordinates) == 'object') {
                        feature.geo_reverse.coordinates.map(coord => {
                            var myGeoObject = new ymaps.GeoObject({
                                geometry: {
                                    type: "Polygon",
                                    coordinates: [
                                        // The coordinates of the vertices of the external contour.
                                        coord[0]
                                    ]
                                },
                                // Описываем свойства геообъекта.
                                properties: {
                                    // Содержимое балуна.
                                    /*
                                    balloonContent: feature.properties.NAME,
                                    "balloonContentHeader": feature.properties.NAME,
                                    "balloonContentBody": "<p>ЗДЕСЬ БУДЕТ ИНФА О РАЙОНЕ/p>",
                                    "balloonContentFooter": "123123123",
                                    */
                                    "hintContent": "Выбрать: " + feature.properties.NAME,
                                    infoHTML: '<h2>' + feature.properties.NAME + '</h2>'
                                        + '<p>Население:</p>'
                                        + '<p>Площадь:</p>'
                                        + '<p>Плотность населения:</p>'
                                        + '<p>Количество спорт объектов:</p>',
                                }
                            }, {
                                fillColor: 'rgba(0, 0, 255, 0)',
                                strokeColor: '#000000',//`rgb(${[1,2,3].map(x=>Math.random()*256|0)})`,
                                opacity: 0.5,
                                strokeWidth: 2,
                            });
                            myGeoObject.events.add('click', e => {
                                e.preventDefault();
                                let _me = e.get('target');
                                this.$refs.region_info.innerHTML = _me.properties.get('infoHTML');
                            });
                            this.regionsManager.add(myGeoObject);
                        });
                    }
                });
            }
            else this.regionsManager.removeAll();
        },
        // Хитмап населения
        paintPopulationHeatmap() {
            if (this.doPaintPopHeatmap) {
                let pool = population_heatmaps['RECORDS'];
                ymaps.modules.require(['Heatmap'], Heatmap => {
                    let heatmapdata = [];
                    for (var i = 0; i < pool.length; i++) {
                        if (pool[i] && pool[i].coordinates && pool[i].count_persons) {
                            let coord = pool[i].coordinates.replace(/^\(|\)$/g, '').split(',');
                            //for (var j = 1; j < pool[i].count_persons; j++)
                            heatmapdata.push([parseFloat(coord[0]), parseFloat(coord[1])]);
                        }
                    }
                    this.popHeatmap = new Heatmap(heatmapdata, {
                        // Радиус влияния.
                        radius: 15,
                        // Нужно ли уменьшать пиксельный размер точек при уменьшении зума. False - не нужно.
                        dissipating: false,
                        // Прозрачность тепловой карты.
                        opacity: 0.75,
                        // JSON описание градиента.
                        gradient: {
                            0.1: 'rgba(50, 0, 0, 0.25)', //внешняя область
                            0.2: 'rgba(254, 220, 62, 1)',
                            0.7: 'rgba(255, 172, 0, 1)',
                            1.0: 'rgba(255, 0, 0, 1)'
                        }
                    });
                    this.popHeatmap.setMap(this.myMap);
                });
            }
            else this.popHeatmap.destroy();
        },
        // Хитмап спортивных объектов
        paintSportHeatmap() {
            if (this.doPaintSpHeatmap) {
                let pool = [...this.filteredSportObjects];
                ymaps.modules.require(['Heatmap'], Heatmap => {
                    let heatmapdata = [];
                    for (var i = 0; i < pool.length; i++) {
                        if (pool[i] && pool[i].object_coordinates) {
                            let coord = pool[i].object_coordinates.replace(/^\(|\)$/g, '').split(',');
                            heatmapdata.push([parseFloat(coord[0]), parseFloat(coord[1])]);
                        }
                    }
                    this.spHeatmap = new Heatmap(heatmapdata, {
                        // Радиус влияния.
                        radius: 10,
                        // Нужно ли уменьшать пиксельный размер точек при уменьшении зума. False - не нужно.
                        dissipating: false,
                        // Прозрачность тепловой карты.
                        opacity: 0.75,
                        // JSON описание градиента.
                        gradient: {
                            0.1: 'rgba(50, 0, 0, 0.25)', //внешняя область
                            0.2: 'rgba(254, 220, 62, 1)',
                            0.7: 'rgba(255, 172, 0, 1)',
                            1.0: 'rgba(255, 0, 0, 1)'
                        }
                    });
                    this.spHeatmap.setMap(this.myMap);
                });
            }
            else this.spHeatmap.destroy();
        }
    },
    watch: {
        // Перерисовка объектов на карте
        // TODO При изменении данных из фильтра перерисовывать хитмап спортивных объектов
        filteredSportObjects(v) {
            if (v) this.paintObjects();
        },
        doPaintCircles() {
            this.paintObjects();
        },
        // Перерисовка оверлея и хитмапов
        doPaintRegions() {
            this.paintRegions();
        },
        doPaintSpHeatmap() {
            this.paintSportHeatmap();
        },
        doPaintPopHeatmap() {
            this.paintPopulationHeatmap();
        },
    },
    beforeMount() {
        // Создание карты
        // TODO Сломался вывод регионов при старте
        ymaps.ready(['util.calculateArea']).then(() => {
            this.myMap = new ymaps.Map('map', {
                center: [55.76, 37.64],
                zoom: 10,
            });
        });
    }
}
</script>

<style scoped>
#map {
    height: 100vh;
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
