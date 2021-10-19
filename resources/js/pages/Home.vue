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
        <v-row v-show="sport_objects" >
            <!-- Left -->
            <v-col cols="4" class="pl-5">
                <progress :value="loaded" :max="total" style="width: 100%"/>
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
                <section class="mt-4">
                    <label>Регионы: <input type="checkbox" v-model="doPaintRegions"/></label><br/>
                    <label>Хитмап объектов: <input type="checkbox" v-model="doPaintSpHeatmap"/></label><br/>
                    <label>Хитмап населения: <input type="checkbox" v-model="doPaintPopHeatmap"/></label><br/>
                    <label>Доступность: <input type="checkbox" v-model="doPaintCircles"/></label><br/>
                    <label>Пустоты: <input type="checkbox" v-model="doShowEmptySpaces" @change="paintEmptySpaces"/></label><br/>
                    <label>Нормаль площади: <input type="number" v-model="squareNormal" @change="flushMainOverlay"/></label><br/>
                    <label>Текущий район: {{currentRegion}}</label><br/>
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
            loaded: 0, total: 0,

            doPaintRegions: false, //выводить ли регионы
            regionsOverlay: null, //оверлей регионов

            doPaintSpHeatmap: false, //выводить ли хитмап по объектам
            spHeatmap: null, //объект хитмапа

            doPaintPopHeatmap: false, //выводить ли хитмап по населению
            popHeatmap: null, //хитмап населения

            doPaintCircles: false, //выводить ли круги доступности

            objectsOverlay: null, //оверлей объектов (и кругов)

            currentRegion: null, //выбранный регион
            currentRegionGeometry: null,
            mapScopeObject: null, //центрирование карты на объекте

            squareNormal: 1000, //нормаль площадей

            doShowEmptySpaces: false, //выводить ли области без доступностей
            emptyRegion: null,
            emptySpacesOverlay: null,
        }
    },
    computed: {
        ...mapState({
            sport_objects: state => state.sport_objects.sport_objects,
            sports: state => state.sports.sports
        }),

        filteredSportObjects() {
            let _pure = [...this.sport_objects || []];
            //фильтруем
            if (this.selected_types_of_sports.length) _pure = this.filterBySports(_pure);
            return _pure;
        },

        regionsManager() {
            if (this.regionsOverlay == null) {
                this.regionsOverlay = new ymaps.GeoObjectCollection({}, {});
                this.myMap.geoObjects.add(this.regionsOverlay);
            }
            return this.regionsOverlay;
        },

        emptySpacesManager() {
            if (this.emptySpacesOverlay == null) {
                this.emptySpacesOverlay = new ymaps.GeoObjectCollection({}, {});
                this.myMap.geoObjects.add(this.emptySpacesOverlay);
            }
            return this.emptySpacesOverlay;
        },

        objectsManager() {
            if (this.objectsOverlay == null) {
                this.objectsOverlay = new ymaps.ObjectManager({
                    // Чтобы метки начали кластеризоваться, выставляем опцию.
                    clusterize: !this.doPaintCircles,
                    // ObjectManager принимает те же опции, что и кластеризатор.
                    gridSize: this.gridSize,
                    // Макет метки кластера pieChart.
                    clusterIconLayout: "default#pieChart",
                    // Отображение списка объектов при клике на кластер
                    clusterDisableClickZoom: true
                });
                this.myMap.geoObjects.add(this.objectsOverlay);
                this.objectsOverlay.objects.events.add(['click'], this.clickOnObject);
                this.objectsOverlay.objects.events.add(['mouseenter', 'mouseleave'], this.mouseOverObject);
            }
            return this.objectsOverlay;
        },
    },
    methods: {
        paintEmptySpaces(){
            //TODO очистка
            this.emptySpacesManager.removeAll();
            this.emptyRegion = null;
            if (this.doShowEmptySpaces && this.currentRegion > 0){
                //копируем текущий район
                this.emptyRegion = {...this.currentRegionGeometry};
                //убираем оттуда все объекты района
                let _diff = turf.polygon(this.emptyRegion.geometry.getCoordinates());
                this.objectsOverlay.objects.each(obj => {
                    //из-за того, что turf не учитывает преобразование Меркатора, рисуем эллипс с этим учетом
                    let _secondPoly = turf.ellipse(obj.geometry.coordinates,
                        obj.geometry.radius*Math.cos(obj.geometry.coordinates[0]*Math.PI/180)*0.85*1.65, //верхний
                        obj.geometry.radius*1.77,
                        {units: 'meters', steps: 72,}
                    );
                    //из-за того, что turf.dufference работает только с полигонами, преобразуем эллипс в полигон
                    _secondPoly = turf.polygon(_secondPoly.geometry.coordinates);
                    let difference = turf.difference(_diff, _secondPoly);
                    _diff = difference;
                });
                //если вдруг район разбился кругами на несколько, то обходим как мультиполигон
                if (_diff.geometry.type == "MultiPolygon"){
                    _diff.geometry.coordinates.map(coords => {
                        let _localpoly = new ymaps.Polygon(coords, null, {
                            fillColor: '#00000080'
                        });
                        this.emptySpacesManager.add(_localpoly);
                    });
                }
                else{
                    _diff = new ymaps.Polygon(_diff.geometry.coordinates, null, {
                        fillColor: '#00000080'
                    });
                    this.emptySpacesManager.add(_diff);
                }
            }
        },
        // ховер по объекту
        mouseOverObject(e){
            var objectId = e.get('objectId'),
                objectGeometry = this.objectsManager.objects.getById(objectId).geometry.type;
                if (e.get('type') === 'mouseenter') {
                    this.objectsManager.objects.setObjectOptions(objectId, {
                        fillColor: '#00000080'
                    });
                } else {
                    this.objectsManager.objects.setObjectOptions(objectId, {
                        fillColor: '#ffffff00'
                    });
                }

        },
        //клик на объекте
        clickOnObject(e){
            var objectId = e.get('objectId'),
                objectGeometry = this.objectsManager.objects.getById(objectId).geometry.type;
            /* это пример изменения по id объекта
            this.objectManager.objects.setObjectOptions(objectId, {
                preset: 'islands#yellowIcon'
            });
            */
        },
        filterBySports(objects){
            return objects.filter(sport_object => {
                let el_find = false;
                sport_object.params.forEach(param => {
                    if (param && this.selected_types_of_sports.includes(param.sport)) el_find = true;
                });
                return el_find;
            });
        },
        mapSetCurrentRegion(region){
            this.$refs.region_info.innerHTML = region.properties.get('infoHTML');
            this.currentRegionGeometry = region;
            this.currentRegion = region.properties.get('osm_id');
            region.options.set('strokeWidth', '5');
            this.mapSetBounds(region);
            this.paintObjects();
            this.paintSportHeatmap();
            this.doShowEmptySpaces = false;
            this.paintEmptySpaces();
        },
        mapSetBounds(geoObject){
            this.mapScopeObject = new ymaps.GeoObjectCollection({}, {});
            this.myMap.geoObjects.add(this.mapScopeObject);
            this.mapScopeObject.add(geoObject);
            this.myMap.setBounds(this.mapScopeObject.getBounds());
        },
        //пересоздаёт OM объектов
        flushMainOverlay(){
            this.myMap.geoObjects.remove(this.objectsManager);
            this.objectsOverlay = null;
            this.paintObjects();
        },
        // Спортивные объекты (в виде точек или кругов доступности)
        paintObjects() {
            if (!this.currentRegion > 0)
                return;
            this.objectsManager.removeAll();
            this.loaded = 0;
            // Порционная отрисовка объектов
            for (var i = 0, count_per_step = this.doPaintCircles? 100 : 1000, len = this.filteredSportObjects.length; i < len; i += count_per_step) {
                let data = []; let processed = 0;
                this.filteredSportObjects.slice(i, i + count_per_step).map(el => {
                    processed ++;
                    let coordinates = el.object_coordinates.replace(/^\(|\)$/g, '').split(','), _szones = [], _sports = [], _squares = [], _szonesHTML = '', _sportsHTML = '';
                    //фильтруем по тем, которые входят в выбранный регион
                    if (this.currentRegionGeometry.geometry.contains(coordinates))
                    {
                        el.params.map(_sz => {
                            if (_sz){
                                _szones.push(_sz.sportzone_type_name);
                                _squares.push(_sz.sportzone_square);
                                _sports.push(_sz.sport);
                            }
                        });

                        _szones = [...new Set(_szones)];
                        _sports = [...new Set(_sports)];
                        _squares = [...new Set(_squares)];

                        //суммарная площадь входящих спортплощадок и цвет окружности
                        // object_total_square in [0; 5kk]
                        el.squareColor =  `rgba(${255*(this.squareNormal - el.object_total_square)/this.squareNormal}, ${el.object_total_square > this.squareNormal ? 255 : 255*(0 + el.object_total_square) / this.squareNormal}, 0, 1)`;

                        if (_szones.length > 0){
                            _szonesHTML += '<label>Состав:</label>';
                            _szonesHTML += '<ul>';
                            _szones.map((e, i) => {
                                _szonesHTML += `<li>${e} (${_squares[i]}кв.м.)</li>`;
                            });
                            _szonesHTML += '</ul>'
                        }

                        if (_sports.length > 0){
                            _sportsHTML += '<label>Виды спорта:</label>';
                            _sportsHTML += '<ul>';
                            _sports.map(e => {
                                _sportsHTML += `<li>${e}</li>`;
                            });
                            _sportsHTML += '</ul>'
                        }
                        let _gobject = {
                            type: "Feature",
                            id: el.object_id,
                            geometry: {
                                coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])],
                                type: this.doPaintCircles ? "Circle" : "Point",
                                radius: el.accessibility_radius,
                            },
                            properties: {
                                "balloonContent": "balloonContent",
                                "balloonContentHeader": el.object_name,
                                "balloonContentBody":
                                    '<p>Доступность: ' + el.accessibility_name + '</p>'
                                    + _szonesHTML
                                    + _sportsHTML
                                    + 'Общая площадь: ' + el.object_total_square + 'кв.м.'
                                    ,
                                "balloonContentFooter": 'Ведомство: ' + el.organisation_name,
                                "clusterCaption": el.object_name, //подпись и слева и справа
                                "hintContent": el.object_name
                            },
                            options: {
                                "preset": "islands#blueCircleDotIconWithCaption",
                                fillColor: '#ffffff00', //el.squareColor,
                                opacity: 1,
                                strokeColor: el.squareColor,//['#000000', '#ffffff']
                                strokeWidth: 5,
                                'zindex': 5000 - el.accessibility_radius
                            }
                        };
                        data.push(_gobject);
                    }
                });
                setTimeout(() => {
                    this.loaded += processed;
                    this.objectsManager.add(data);
                });
            }
        },
        // Регионы москвы
        paintRegions() {
            if (this.regionsManager) this.regionsManager.removeAll();
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
                                    "osm_id": feature.properties.OSM_ID,
                                }
                            }, {
                                fillColor: 'rgba(0, 0, 255, 0)',
                                strokeColor: '#3390FF',
                                strokeWidth: 2,
                            });
                            /* TODO пока работает криво
                            myGeoObject.events.add('mouseenter', e => {
                                e.preventDefault();
                                let _me = e.get('target');
                                _me.options.set('strokeWidth', '5');
                            }).add('mouseleave', e => {
                                e.preventDefault();
                                let _me = e.get('target');
                                _me.options.set('strokeWidth', '2');
                            });
                            */
                            myGeoObject.events.add('click', e => {
                                e.preventDefault();
                                let _me = e.get('target');
                                this.mapSetCurrentRegion(_me);
                            });
                            this.regionsManager.add(myGeoObject);
                        });
                    }
                });
            }
        },
        // Хитмап населения
        paintPopulationHeatmap() {
            if (this.popHeatmap) this.popHeatmap.destroy();
            if (this.doPaintPopHeatmap) {
                let pool = population_heatmaps['RECORDS'];
                ymaps.modules.require(['Heatmap'], Heatmap => {
                    let heatmapdata = {
                        type: 'FeatureCollection',
                        features: []
                    };
                    for (var i = 0; i < pool.length; i++) {
                        if (pool[i] && pool[i].coordinates && pool[i].count_persons) {
                            let coord = pool[i].coordinates.replace(/^\(|\)$/g, '').split(',');
                            heatmapdata.features.push({
                                id: pool[i].id,
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [parseFloat(coord[0]), parseFloat(coord[1])]
                                },
                                properties: {
                                    weight: pool[i].count_persons
                                }
                            });
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
        },
        // Хитмап спортивных объектов
        paintSportHeatmap() {
            if (this.spHeatmap) this.spHeatmap.destroy();
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
        }
    },
    watch: {
        // Перерисовка объектов на карте
        filteredSportObjects(v) {
            this.total = v.length ?? 0;
            this.objectsManager.removeAll();
            if (this.currentRegion > 0){
                this.paintObjects();
                this.paintSportHeatmap(); //перерисовка хитмапа объектов
            }
        },
        doPaintCircles() {
            this.flushMainOverlay();
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
    },
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
