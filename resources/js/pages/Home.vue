<template>
    <v-container fluid pa-0>
        <!-- Loading process  -->
        <v-overlay v-if="!sport_objects" class="overlay" opacity="0">
            <svg>
                <circle cx="50" cy="50" r="40" stroke="red" stroke-dasharray="78.5 235.5" stroke-width="3" fill="none"/>
                <circle cx="50" cy="50" r="30" stroke="blue" stroke-dasharray="62.8 188.8" stroke-width="3" fill="none"/>
                <circle cx="50" cy="50" r="20" stroke="green" stroke-dasharray="47.1 141.3" stroke-width="3" fill="none"/>
            </svg>
            <h2>Загрузка данных...</h2>
        </v-overlay>
        <!-- Page -->
        <section style="height: 100vh; overflow: hidden;" class="d-flex flex-column-reverse flex-md-row">
            <!-- Left/Bot Col -->
            <v-col cols="6" md="5" class="d-flex" style="overflow: auto; max-width: 100%">
                <!-- Регионы -->
                <!--<v-col cols="4" class="pa-0">
                    <v-text-field
                        v-model="search_region"
                        hide-details
                        placeholder="Поиск района..."
                        append-icon="search"
                        outlined
                        dense
                    />
                </v-col>
                <v-col class="text-center pa-0">
                    <v-divider vertical/>
                </v-col>-->
                <!-- Фильтры и спортивные события -->
                <v-col cols="7" class="pa-0">
                    <!--<v-text-field
                        v-model="search_region"
                        hide-details
                        placeholder="Поиск спортивного объекта..."
                        append-icon="search"
                        outlined
                        dense
                    />-->
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
                        <label>Спортплощадки: <input type="checkbox" v-model="doPaintSportZones" @change="paintSportZones"/></label><br/>
                        <label>Хитмап объектов: <input type="checkbox" v-model="doPaintSpHeatmap"/></label><br/>
                        <label>Хитмап населения: <input type="checkbox" v-model="doPaintPopHeatmap"/></label><br/>
                        <label>Доступность: <input type="checkbox" v-model="doPaintCircles"/></label><br/>
                        <label>Пустоты: <input type="checkbox" v-model="doShowEmptySpaces" @change="paintEmptySpaces"/></label><br/>
                        <label>Пересечения: <input type="checkbox" v-model="doShowIntersections" @change="paintIntersections"/></label> {{intersectionsPool.length}}<br/>
                        <label v-show="savedIntersections.length">Сохраненные пересечения: <input type="checkbox" v-model="doShowSavedIntersections" @change="paintSavedIntersections"/></label><br/>
                        <label>Нормаль площади: <input type="number" v-model="squareNormal" @change="flushMainOverlay"/></label><br/>
                    </section>
                    <div v-show="currentRegion" v-html="currentRegionInfo" class="mt-4">
                    </div>
                    <div v-show="choosedIntersections.length > 0" class="mt-4">
                        <h2>Выбранные пересечения</h2>
                        <div v-for="intersect in choosedIntersections" v-bind:key="intersect.properties.get('id')">
                            <hr/>
                            <div v-html="intersect.properties.get('customHTML')"></div>
                            <button @click="removeIntersection(intersect)">Удалить</button>
                        </div>
                        <hr/>
                        <button @click="clearChoosedIntersections">Очистить</button><button @click="saveIntersections">Сохранить</button>
                    </div>
                </v-col>
            </v-col>
            <!-- Right/Top Col -->
            <v-col cols="6" md="7" class="pa-0" style="max-width: 100%;">
                <div id='map'/>
<!--                &lt;!&ndash; Rendering process  &ndash;&gt;
                <progress v-if="loaded > 0 && loaded < total" :value="loaded" :max="total" style="width: 108px; position: relative; top: 38px; left: 10px; z-index: 400;"/>-->
            </v-col>
        </section>
    </v-container>
</template>

<script>
import axios from "axios"
import {mapActions, mapState} from "vuex"
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

            doPaintRegions: true, //выводить ли регионы
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

            doShowIntersections: false, //выводить ли области с пересечениями
            intersectOverlay: null,
            intersectionsPool: [], //общий пул пересечений

            choosedIntersections: [], //выбранные пользователем пересечения
            doShowSavedIntersections: false, //выводить ли сохраненные пересечения
            savedIntersOverlay: null, //оверлей сохраненных пересечений

            doPaintSportZones: false, //выводить ли спортплощадки объектов
            sportZonesOverlay: null,
        }
    },
    computed: {
        ...mapState({
            sport_objects: state => state.sport_objects.sport_objects,
            sports: state => state.sports.sports,
            savedIntersections: state => state.intersections.intersections //сохраненные пересечения
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

        intersectionsManager() {
            if (this.intersectOverlay == null) {
                this.intersectOverlay = new ymaps.GeoObjectCollection({}, {});
                this.myMap.geoObjects.add(this.intersectOverlay);
            }
            return this.intersectOverlay;
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
                this.objectsOverlay.objects.events.add(['mouseenter', 'mouseleave'], this.mouseOverObject);
            }
            return this.objectsOverlay;
        },

        sportZonesManager() {
            if (this.sportZonesOverlay == null) {
                this.sportZonesOverlay = new ymaps.ObjectManager({
                    // Чтобы метки начали кластеризоваться, выставляем опцию.
                    clusterize: false,
                    // ObjectManager принимает те же опции, что и кластеризатор.
                    gridSize: this.gridSize,
                    // Макет метки кластера pieChart.
                    clusterIconLayout: "default#pieChart",
                    // Отображение списка объектов при клике на кластер
                    clusterDisableClickZoom: true
                });
                this.myMap.geoObjects.add(this.sportZonesOverlay);
            }
            return this.sportZonesOverlay;
        },

        currentRegionInfo() {
            if (this.currentRegion)
                return `<h2>${this.currentRegionGeometry.properties.get('name')}</h2>` +
                    `<p>Население: ${this.currentRegionGeometry.properties.get('population')}</p>` +
                    `<p>Площадь: ${this.currentRegionGeometry.properties.get('square')}</p>` +
                    `<p>Плотность населения: ${this.currentRegionGeometry.properties.get('population_density')}</p>` +
                    `<p>Количество спорт объектов: ${this.currentRegionGeometry.properties.get('sport_objects_inside')}</p>`
                ;
            return '';
        },

        savedIntersManager() {
            if (this.savedIntersOverlay == null) {
                this.savedIntersOverlay = new ymaps.GeoObjectCollection({}, {});
                this.myMap.geoObjects.add(this.savedIntersOverlay);
            }
            return this.savedIntersOverlay;
        },
    },
    methods: {
        ...mapActions({
            storeInteraction: 'intersections/saveObject',
            deleteInteraction: 'intersections/deleteObject',
        }),
        paintSavedIntersections () {
            this.savedIntersManager.removeAll();
            if (this.doShowSavedIntersections)
                this.paintIntersectionsOnOverlay(this.savedIntersections, this.savedIntersManager);
        },
        removeIntersection(intersect) {
            let _id = intersect.properties.get('id');
            this.choosedIntersections.splice(this.choosedIntersections.indexOf(intersect), 1);
            intersect.properties.set('is_choosed', false);
            intersect.options.set('fillColor', '#3ac255');
            if (typeof(_id) == 'number'){ //объект из базы
                this.deleteInteraction(_id);
                this.savedIntersManager.remove(intersect);
            }
        },
        clearChoosedIntersections (){
            this.choosedIntersections.map(intersect => {
                this.removeIntersection(intersect);
            })
            this.choosedIntersections = [];
        },
        saveIntersections (){
            this.choosedIntersections.map(intrsct => {
                //собираемая информация: типы спортзон, суммарная площадь, количество зон внутри, виды спорта
                let _sz_count = 0, _sz_types = '', _sz_square = 0, _sz_sports = '', _sz_by_sport = {}, _sz_by_type = {}, _population = 0, _coords = null;
                _sz_count = intrsct.properties.get('sportzones_inside');
                _sz_types = intrsct.properties.get('sportzone_types');
                _sz_square = intrsct.properties.get('total_square');
                _sz_sports = intrsct.properties.get('sports');
                _sz_by_sport = intrsct.properties.get('sportzones_by_sports');
                _sz_by_type = intrsct.properties.get('sportzones_by_types');
                _population = intrsct.properties.get('population');
                _coords = intrsct.geometry.getCoordinates();
                let _params = {
                    polygon_json: JSON.stringify(_coords),
                    polygon: _coords,
                    area: _sz_square,
                    type_sportzones: JSON.stringify(_sz_by_type),
                    type_sports: JSON.stringify(_sz_by_sport),
                    sportzones_count: _sz_count,
                    population: _population
                };
                //запрос на сохранение пересечения
                this.storeInteraction(_params);
            });
        },
        paintSportZones(){
            this.sportZonesManager.removeAll();
            if (this.doPaintSportZones && this.currentRegion > 0){
                this.filteredSportObjects.map(el => {
                    let coordinates = el.object_coordinates.replace(/^\(|\)$/g, '').split(','), _szones = [], _sports = [], _squares = [], _szonesHTML = '', _sportsHTML = '';
                    //фильтруем по тем, которые входят в выбранный регион
                    if (this.currentRegionGeometry.geometry.contains(coordinates))
                    {
                        el.params.map(_sz => {
                            if (_sz){
                                let _szcoordinates = _sz.sportzone_coordinates.replace(/^\(|\)$/g, '').split(',');
                                let _szo = {
                                    type: "Feature",
                                    id: _sz.sportzone_id,
                                    geometry: {
                                        coordinates: [parseFloat(_szcoordinates[0]), parseFloat(_szcoordinates[1])],
                                        type: "Point",
                                    },
                                    properties: {
                                        "balloonContent": "balloonContent",
                                        "balloonContentHeader": _sz.sportzone_name,
                                        "balloonContentBody":
                                            'Площадь: ' + _sz.sportzone_square + 'кв.м.'
                                            + '<br/>Тип: ' + _sz.sportzone_type_name
                                            ,
                                        "balloonContentFooter": 'FOOTER',
                                        "clusterCaption": _sz.sportzone_name, //подпись и слева и справа
                                        "hintContent": _sz.sportzone_name
                                    },
                                    options: {
                                        "preset": "twirl#violetIcon",
                                    }
                                }
                                this.sportZonesManager.add(_szo);
                            }
                        });
                    }
                })
            }
        },
        //преобразует ymaps circle в turf polygon через преобразование Меркатора
        createTurfMerkatorEllipsePolygon(geometry){
            //из-за того, что turf не учитывает преобразование Меркатора, рисуем эллипс с этим учетом
            let _merkator = turf.ellipse(geometry.coordinates,
                geometry.radius*Math.cos(geometry.coordinates[0]*Math.PI/180)*0.85*1.65, //верхний радиус
                geometry.radius*1.77,
                {units: 'meters', steps: 72,}
            );
            //из-за того, что turf работает только с полигонами, преобразуем эллипс в полигон
            _merkator = turf.polygon(_merkator.geometry.coordinates);
            return _merkator;
        },

        paintIntersectionsOnOverlay (intersectionsPool, manager){
            intersectionsPool.map(inter => {
                //поскольку здесь могут быть объекты, созданные по-разному, необходимо использовать такое получение координат
                let _coords = inter.geometry ? inter.geometry.coordinates : JSON.parse(inter.polygon_json);
                let _tomap = new ymaps.Polygon(_coords,
                {
                    hintContent: "Выбрать пересечение",
                    balloonContent: "Пересечение",
                    source: inter.geometry ? 'map' : 'db',
                    population: inter.population,
                    sportzones_inside: inter.sportzones_count,
                    total_square: inter.area,
                    sportzones_by_sports: inter.type_sports,
                    sportzones_by_types: inter.type_sportzones,
                    sports: '',
                    sportzone_types: '',
                    id: inter.geometry ? 'intersection_' + Date.now() : inter.id,
                },
                {
                    zIndex: 9000,
                    opacity: 0.5,
                    fillColor: '#3ac255',
                    strokeColor: '#000000',
                });
                _tomap.events.add('click', e => {
                    e.preventDefault();
                    let _me = e.get('target');
                    //если уже выбрано - убираем из пула
                    if(_me.properties.get('is_choosed')){
                        this.choosedIntersections.splice(this.choosedIntersections.indexOf(_me), 1);
                        _me.properties.set('is_choosed', false);
                        _me.options.set('fillColor', '#3ac255');
                    }
                    else{
                        this.countSportzonesInside(_me);
                        this.choosedIntersections.push(_me);
                        _me.properties.set('is_choosed', true);
                        _me.options.set('fillColor', '#33BBFF');
                    }
                });
                _tomap.events.add('mouseenter', e => {
                    let _me = e.get('target');
                    _me.options.set('strokeWidth', '8');
                });
                _tomap.events.add('mouseleave', e => {
                    let _me = e.get('target');
                    _me.options.set('strokeWidth', '2');
                });

                manager.add(_tomap);
            });
        },

        //ВЫВОД ПЕРЕСЕЧЕНИЙ
        paintIntersections(){
            this.intersectionsPool = [];
            this.intersectionsManager.removeAll();
            if (this.doShowIntersections && this.currentRegion > 0){
                //выбираем оттуда все объекты района
                for (var i = 0, len = this.objectsOverlay.objects.getAll().length; i < len-1; i++){
                    for (var j = i+1; j < len; j++){
                        let first_obj = this.objectsOverlay.objects.getAll()[i];
                        let second_obj = this.objectsOverlay.objects.getAll()[j];
                        let _firstPoly = this.createTurfMerkatorEllipsePolygon(first_obj.geometry);
                        let _secondPoly = this.createTurfMerkatorEllipsePolygon(second_obj.geometry);
                        let _intersection = turf.intersect(_firstPoly, _secondPoly);
                        if (_intersection)
                            this.intersectionsPool.push(_intersection);
                    }
                }
                this.paintIntersectionsOnOverlay(this.intersectionsPool, this.intersectionsManager);
            }
        },

        //ПОДСЧЕТ МЕТРИКИ ПЕРЕСЕЧЕНИЯ
        countSportzonesInside (geoobject){
            let _count = 0, _totalSquare = 0, _sports = [], _sztypes = [], _customHTML = '', _population = 0, _sportzones_by_types = {}, _sportzones_by_sports = {};
            //здесь рисуются объекты с базы и с карты, объекты в базе уже просчитаны
            if (geoobject.properties.get('source') != 'db'){
                console.log('its geom');
                //считаем, сколько объектов входит в пересечение
                this.filteredSportObjects.map(el => {
                    let coordinates = el.object_coordinates.replace(/^\(|\)$/g, '').split(',');
                    //фильтруем по тем, которые входят в выбранный регион
                    if (geoobject.geometry.contains(coordinates))
                        el.params.map(_sz => {
                            if (_sz){
                                let _szcoordinates = _sz.sportzone_coordinates.replace(/^\(|\)$/g, '').split(',');
                                if (geoobject.geometry.contains(_szcoordinates)){
                                    _count ++;
                                    _totalSquare += _sz.sportzone_square;
                                    _sports.push(_sz.sport);
                                    _sztypes.push(_sz.sportzone_type_name);
                                }
                            }
                        });
                });

                _sportzones_by_types = _sztypes.reduce((obj, item) => {
                    obj[item] = (obj[item] || 0) + 1;
                    return obj;
                }, {});
                _sportzones_by_sports = _sports.reduce((obj, item) => {
                    obj[item] = (obj[item] || 0) + 1;
                    return obj;
                }, {});
                //считаем население, входящее в пересечение
                let pool = population_heatmaps['RECORDS'];
                for (var i = 0; i < pool.length; i++) {
                    if (pool[i] && pool[i].coordinates && pool[i].count_persons) {
                        let coord = pool[i].coordinates.replace(/^\(|\)$/g, '').split(',');
                        if (geoobject.geometry.contains(coord)){
                            _population += Math.floor(pool[i].count_persons);
                        }
                    }
                }
            }
            else{ //Объекты из базы данных
                _count = geoobject.properties.get('sportzones_inside');
                _totalSquare = geoobject.properties.get('total_square');
                _sportzones_by_types = JSON.parse(geoobject.properties.get('sportzones_by_types'));
                _sportzones_by_sports = JSON.parse(geoobject.properties.get('sportzones_by_sports'));
                _population = geoobject.properties.get('population');
                _sztypes = Object.keys(_sportzones_by_types);
                _sports = Object.keys(_sportzones_by_sports);

                geoobject.properties.set('sports', [...new Set(_sports)].join('; '));
                geoobject.properties.set('sportzone_types', [...new Set(_sztypes)].join('; '));
            }
            _customHTML = `<p>Количество спортзон: ${_count}</p>`
                + `<p>Суммарная площадь спортзон: ${Math.ceil(_totalSquare??0)}</p>`
                + `<p>Типы спортзон: ${[...new Set(_sztypes)].join('; ')}</p>`
                + `<p>Виды спорта: ${[...new Set(_sports)].join('; ')}</p>`
                + `<p>По типам: ${JSON.stringify(_sportzones_by_types)}</p>`
                + `<p>По спорту: ${JSON.stringify(_sportzones_by_sports)}</p>`
                + `<p>Численность населения: ${Math.floor(_population)} чел.</p>`
            ;
            geoobject.properties.set('customHTML', _customHTML);
        },

        paintEmptySpaces(){
            this.emptySpacesManager.removeAll();
            this.emptyRegion = null;
            if (this.doShowEmptySpaces && this.currentRegion > 0){
                //копируем текущий район
                this.emptyRegion = {...this.currentRegionGeometry};
                let _diff = turf.polygon(this.emptyRegion.geometry.getCoordinates());
                //выбираем оттуда все объекты района
                this.objectsOverlay.objects.each(obj => {
                    let _secondPoly = this.createTurfMerkatorEllipsePolygon(obj.geometry);
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
            //todo hover только для кругов?
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
            if (region.properties.get('osm_id') == this.currentRegion)
                return;
            this.currentRegion = region.properties.get('osm_id');
            this.currentRegionGeometry = region;
            region.options.set('strokeWidth', '5');
            this.mapSetBounds(region);
            this.paintObjects();
            this.paintSportHeatmap();
            this.doShowEmptySpaces = false;
            this.paintEmptySpaces();
            this.doShowIntersections = false;
            this.paintIntersections();
            this.paintSportZones();
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
            let _objectsinsideRegion = 0;
            for (var i = 0, count_per_step = this.doPaintCircles? 100 : 1000, len = this.filteredSportObjects.length; i < len; i += count_per_step) {
                let data = []; let processed = 0;
                this.filteredSportObjects.slice(i, i + count_per_step).map(el => {
                    processed ++;
                    let coordinates = el.object_coordinates.replace(/^\(|\)$/g, '').split(','), _szones = [], _sports = [], _squares = [], _szonesHTML = '', _sportsHTML = '';
                    //фильтруем по тем, которые входят в выбранный регион
                    if (this.currentRegionGeometry.geometry.contains(coordinates))
                    {
                        this.currentRegionGeometry.properties.set('sport_objects_inside', ++_objectsinsideRegion);
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
                                _szonesHTML += `<li>${e} (${_squares[i]??0} кв.м.)</li>`;
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
                                "zIndex": 5000 - el.accessibility_radius
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
                                    coordinates: [coord[0]]
                                },
                                properties: {
                                    "name": feature.properties.NAME,
                                    "hintContent": "Выбрать: " + feature.properties.NAME,
                                    "osm_id": feature.properties.OSM_ID,
                                    "sport_objects_inside" : 0,
                                    "population": feature.properties.count_persons,
                                    "square": feature.properties.area + ' кв.км',
                                    "population_density": Math.floor(feature.properties.count_persons / feature.properties.area) + ' на кв.км.',
                                }
                            }, {
                                fillColor: 'rgba(0, 0, 255, 0)',
                                strokeColor: '#3390FF',
                                strokeWidth: 2,
                            });
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
        // ВЫВОДИТ ХИТМАП НАСЕЛЕНИЯ
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
        // Применение стартовых оверлеев и хитмапов к карте после загрузки данных
        sport_objects(v) {
            if (v) {
                if (this.doPaintRegions) this.paintRegions();
                if (this.doPaintSpHeatmap) this.paintSportHeatmap();
                if (this.doPaintPopHeatmap) this.paintPopulationHeatmap();
            }
        }
    },
    beforeMount() {
        // Создание карты
        ymaps.ready(['util.calculateArea']).then(() => {
            this.myMap = new ymaps.Map('map', {
                center: [55.76, 37.64],
                zoom: 10,
            }, {
                // Автоматически растягивать карту по размерам контейнера
                autoFitToViewport: 'always'
            });
        });
    },
}
</script>

<style scoped>
#map {
    border: 1px solid black;
    height: 100%;
}

/* Loader */
.overlay {
    text-align: center;
    background-color: #ffffff !important;
    color: #05051f !important;
}

.overlay circle {
    transform-origin: center;
    transform-box: fill-box;
    transform-origin: center;
    animation: rotate linear infinite;
}

.overlay circle:nth-child(1) {
    animation-duration: 1.6s;
}

.overlay circle:nth-child(2) {
    animation-duration: 1.2s;
}

.overlay circle:nth-child(3) {
    animation-duration: 0.8s;
}

@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}

.overlay svg {
    width: 100px;
    height: 100px;
}
</style>
