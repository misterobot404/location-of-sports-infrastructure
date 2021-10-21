<template>
    <v-container fluid pa-0>
        <!-- Loading process  -->
        <!--        <v-overlay v-if="!sport_objects" class="overlay" opacity="0">
                    <svg>
                        <circle cx="50" cy="50" r="40" stroke="red" stroke-dasharray="78.5 235.5" stroke-width="3" fill="none"/>
                        <circle cx="50" cy="50" r="30" stroke="blue" stroke-dasharray="62.8 188.8" stroke-width="3" fill="none"/>
                        <circle cx="50" cy="50" r="20" stroke="green" stroke-dasharray="47.1 141.3" stroke-width="3" fill="none"/>
                    </svg>
                    <h2>Загрузка данных...</h2>
                </v-overlay>-->
        <!-- Rendering circles process  -->
        <progress v-if="doPaintCircles && loaded > 0 && loaded < total" :value="loaded" :max="total"
                  style="width: 30%; min-width: 300px; position: absolute; bottom: 8%; left: 50%; z-index: 400; transform: translate(-50%,-50%)"/>
        <!-- Mobile navigation  -->
        <v-bottom-navigation :input-value="!$vuetify.breakpoint.mdAndUp" fixed background-color="#f5f5f5" grow height="44">
            <!-- Filters -->
            <v-dialog v-model="filters_dialog" width="400px">
                <template v-slot:activator="{ on }">
                    <v-btn large v-on="on">
                        <span>Фильтры</span>
                        <v-icon>filter_alt</v-icon>
                    </v-btn>
                </template>
                <v-card class="pa-4 pb-3 d-flex flex-column">
                    <!--  Фильтр по ведомству -->
                    <v-select
                        v-model="selected_organisations"
                        :items="organisations ? organisations.map(el => el.name).filter(el => organisations_filter ? (el.toLowerCase().indexOf(organisations_filter.toLowerCase())) !== -1 : true) : []"
                        :menu-props="{ maxHeight: '400', maxWidth:'300' }"
                        outlined
                        dense
                        multiple
                        hide-details
                        clearable
                        placeholder="Ведомство"
                        class="mt-2"
                    >
                        <template v-slot:prepend-item>
                            <v-list-item>
                                <v-text-field v-model.lazy.trim="organisations_filter" prepend-icon="search" hide-details dense outlined placeholder="Поиск..."/>
                            </v-list-item>
                            <v-divider class="mt-2"/>
                        </template>
                        <template v-slot:selection="{ item, index }">
                            <v-chip v-if="index < 2" class="my-1" style="white-space: normal; word-break: break-word">
                                <span>{{ item }}</span>
                            </v-chip>
                            <span
                                v-if="index === 2"
                                class="grey--text text-caption"
                            >
                          (+{{ selected_organisations.length - 1 }} others)
                        </span>
                        </template>
                    </v-select>
                    <!--  Фильтр по видам спорта и спорт зон -->
                    <v-row class="mt-3">
                        <v-col cols="6">
                            <!-- Виды спорта -->
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
                                placeholder="Вид спорта"
                            >
                                <template v-slot:prepend-item>
                                    <v-list-item>
                                        <v-text-field v-model.lazy.trim="types_of_sports_filter" prepend-icon="search" hide-details dense outlined
                                                      placeholder="Поиск..."/>
                                    </v-list-item>
                                    <v-divider class="mt-2"/>
                                </template>
                                <template v-slot:selection="{ item, index }">
                                    <v-chip v-if="index < 2" class="my-1" style="white-space: normal; word-break: break-word">
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
                        </v-col>
                        <v-col cols="6">
                            <!--  Спорт зоны -->
                            <v-select
                                v-model="selected_types_of_sports_zones"
                                :items="types_of_sports_zones ?
                    types_of_sports_zones.map(el => el.name)
                    .filter(el => types_of_sports_zones_filter ? (el.toLowerCase().indexOf(types_of_sports_zones_filter.toLowerCase())) !== -1 : true)
                    : []"
                                :menu-props="{ maxHeight: '400', maxWidth:'300' }"
                                outlined
                                dense
                                multiple
                                hide-details
                                placeholder="Тип спорт.зоны"
                            >
                                <template v-slot:prepend-item>
                                    <v-list-item>
                                        <v-text-field v-model.lazy.trim="types_of_sports_zones_filter" prepend-icon="search" hide-details dense outlined
                                                      placeholder="Поиск..."/>
                                    </v-list-item>
                                    <v-divider class="mt-2"/>
                                </template>
                                <template v-slot:selection="{ item, index }" style="white-space: normal;">
                                    <v-chip v-if="index < 2" class="my-1" style="white-space: normal; word-break: break-word">
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
                        </v-col>
                    </v-row>
                    <!--  Поиск по наименованию спорт зоны -->
                    <v-text-field
                        v-model.lazy.trim="search_sportzone_name"
                        class="mt-6"
                        append-icon="search"
                        hide-details
                        dense
                        outlined
                        placeholder="Наименование спорт зоны"
                    />
                    <!--  Фильтр по доступности -->
                    <label class="align-self-center mt-4">Доступность</label>
                    <v-btn-toggle v-model="selected_accessibility" active-class="primary--text" class="d-flex flex-wrap">
                        <v-col cols="6" v-for="(el) in accessibility" :key="el.name">
                            <v-btn :value="el.name" v-text="el.name" outlined width="100%" style="white-space: normal !important;"/>
                        </v-col>
                    </v-btn-toggle>

                    <!--  Actions  -->
                    <v-btn @click="filters_dialog = false" color="primary" width="50%" class="mt-4 align-self-center">Закрыть</v-btn>
                    <v-btn @click="dropFilters()" class="mt-2 align-self-center" text>
                        <v-icon class="mr-1" small>close</v-icon>
                        Сбросить всё
                    </v-btn>
                </v-card>
            </v-dialog>
            <!-- Layers -->
            <v-dialog v-model="layers_dialog" width="400px">
                <template v-slot:activator="{ on }">
                    <v-btn large v-on="on">
                        <span>Слои</span>
                        <v-icon>layers</v-icon>
                    </v-btn>
                </template>
                <v-card class="pa-4 d-flex flex-column">
                    <!--  Слои -->
                    <label class="align-self-center mt-1">Слои карты</label>
                    <v-row class="px-5">
                        <v-col cols="6" class="py-2">
                            <v-checkbox
                                v-model="doPaintRegions"
                                label="Регионы"
                                hide-details
                            />
                        </v-col>
                        <v-col cols="6" class="py-2">
                            <v-checkbox
                                v-model="doPaintSportZones"
                                label="Спортплощадки"
                                hide-details
                            />
                        </v-col>
                        <v-col cols="6" class="py-2">
                            <v-checkbox
                                v-model="doPaintSpHeatmap"
                                label="Хитмап объектов"
                                hide-details
                            />
                        </v-col>
                        <v-col cols="6" class="py-2">
                            <v-checkbox
                                v-model="doPaintPopHeatmap"
                                label="Хитмап населения"
                                hide-details
                            />
                        </v-col>
                        <v-col cols="6" class="py-2">
                            <v-checkbox
                                v-model="doPaintCircles"
                                label="Доступность"
                                hide-details
                            />
                        </v-col>
                        <v-col cols="6" class="py-2">
                            <v-checkbox
                                v-model="doShowEmptySpaces"
                                label="Пустоты"
                                hide-details
                            />
                        </v-col>
                        <v-col cols="6" class="py-2">
                            <v-checkbox
                                v-model="doShowIntersections"
                                label="Пересечения"
                                hide-details
                            />
                        </v-col>
                    </v-row>
                    <v-divider class="mt-6"/>
                    <!--  Нормаль площади -->
                    <label class="mt-4 align-self-center">Нормаль площади</label>
                    <v-text-field
                        v-model.lazy.number="squareNormal"
                        class="mt-2"
                        hide-details
                        type="number"
                        dense
                        outlined
                        suffix="㎡"
                    />
                    <!--  Actions  -->
                    <v-btn @click="layers_dialog = false" color="primary" class="mt-4 align-self-center">Закрыть</v-btn>
                </v-card>
            </v-dialog>
            <!-- Reports -->
            <v-dialog v-model="reports_dialog" width="400px">
                <template v-slot:activator="{ on }">
                    <v-btn large v-on="on">
                        <span>Отчёты</span>
                        <v-icon>summarize</v-icon>
                    </v-btn>
                </template>
                <v-card class="pa-4 d-flex flex-column">
                    <label class="align-self-center mt-1">Варианты выгрузки:</label>
                    <!--  Варианты выгрузки -->
                    <v-btn class="mt-4" @click="unloadingPdf()">
                        <v-icon class="mr-1" color="primary">picture_as_pdf</v-icon>
                        PDF
                    </v-btn>
                    <v-btn class="mt-2" @click="unloadingExcel()">
                        <v-icon class="mr-1" color="primary">grid_on</v-icon>
                        Excel
                    </v-btn>
                    <!--  Actions  -->
                    <v-btn @click="reports_dialog = false" color="primary" class="mt-4 align-self-center">Закрыть</v-btn>
                </v-card>
            </v-dialog>
        </v-bottom-navigation>

        <!-- Page -->
        <section style="height: 100vh;" class="d-flex flex-column-reverse flex-md-row overflow-hidden">
            <!-- Left/Bot Col -->
            <v-col cols="5" class="d-flex flex-column flex-md-row overflow-hidden" style="max-width: 100%">
                <!-- Desktop -->
                <template v-if="$vuetify.breakpoint.mdAndUp">
                    <!-- Регионы -->
                    <v-col cols="4" class="pa-0">
                        <v-text-field
                            v-model="search_region"
                            hide-details
                            placeholder="Поиск района..."
                            append-icon="search"
                            outlined
                            dense
                        />
                    </v-col>
                    <v-col cols="1" class="text-center pa-0">
                        <v-divider vertical/>
                    </v-col>
                    <!-- Фильтры и спортивные события -->
                    <v-col cols="7" class="pa-0">
                        <v-text-field
                            v-model="search_region"
                            hide-details
                            placeholder="Поиск спортивного объекта..."
                            append-icon="search"
                            outlined
                            dense
                        />
                        <div v-show="currentRegion" v-html="currentRegionInfo" class="mt-4"/>
                    </v-col>
                </template>
                <!-- Mobile -->
                <template v-else>
                    <!-- Регионы -->
                    <v-row style="flex-wrap: nowrap; min-height: 100px" class="overflow-y-auto flex-grow-0">
                        <v-card v-for="(el) in getRegions" :key="el.osm_id" class="text-wrap ma-2 pa-2">
                            <label style="font-size: 14px">{{ el.name }}</label>
                        </v-card>
                    </v-row>
                    <v-row>
                        <v-divider/>
                    </v-row>
                    <!-- Фильтры и спортивные события -->
                    <v-row class="overflow-y-auto">
                        <v-col cols="6" class="pa-2" v-for="(el) in getRegions" :key="el.osm_id">
                            <v-card  height="100" class="text-wrap pa-2">
                                <label>{{ el.name }}</label>
                            </v-card>
                        </v-col>
                        <!-- TODO Куда деть информацию о выбранной области -->
                        <!--                            <div v-show="currentRegion" v-html="currentRegionInfo" class="mt-4"/>-->
                    </v-row>
                </template>
            </v-col>
            <!-- Right/Top Col -->
            <v-col cols="7" class="pa-0" style="max-width: 100%;" id="map"/>
        </section>
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
            selected_sport_object_id: null,
            search_region: null,
            search_sport_object: null,
            search_sportzone_name: null,

            // Диалоговые окна
            filters_dialog: false,
            layers_dialog: false,
            reports_dialog: false,

            // Фильтры
            // Ведомства
            selected_organisations: [],
            organisations_filter: null,
            // Виды спорта
            selected_types_of_sports: [],
            types_of_sports_filter: null,
            // Виды спорт. зон
            selected_types_of_sports_zones: [],
            types_of_sports_zones_filter: null,
            // Доступность
            selected_accessibility: null,

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
            intersectionsPool: [],

            doPaintSportZones: false, //выводить ли спортплощадки объектов
            sportZonesOverlay: null,
        }
    },
    computed: {
        ...mapState({
            sport_objects: state => state.sport_objects.sport_objects,
            sports: state => state.sports.sports,
            organisations: state => state.organisations.organisations,
            types_of_sports_zones: state => state.types_of_sports_zones.types_of_sports_zones,
            accessibility: state => state.accessibility.accessibility
        }),

        filteredSportObjects() {
            let _pure = [...this.sport_objects || []];

            // TODO
            // Поиск
            // По региону
            // if (this.search_region) _pure = this.filterBySports(_pure);
            // По спорт зоне
            // if (this.search_sport_object) _pure = this.filterBySports(_pure);
            // По названию спорт зоны
            // if (this.search_sport_object) _pure = this.filterBySports(_pure);

            // TODO
            // Фильтры
            // По ведомству
            // if (this.selected_organisations.length) _pure = this.filterByOrganisations(_pure);
            // По виду спорта
            if (this.selected_types_of_sports.length) _pure = this.filterBySports(_pure);
            // По виду спорт зоны
            // if (this.selected_types_of_sports_zones.length) _pure = this.filterByTypesOfSportsZones(_pure);

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
                this.objectsOverlay.objects.events.add(['click'], this.clickOnObject);
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

        getRegions() {
            return regions_geo.features.map(feature => {
                return {
                    name: feature.properties.NAME,
                    osm_id: feature.properties.OSM_ID
                }
            });
        }
    },
    methods: {
        saveIntersection(intrsct) {
            console.log(intrsct, 'saved');
            //собираемая информация: типы спортзон, суммарная площадь, количество зон внутри, виды спорта
            let _sz_count = 0, _sz_types = '', _sz_square = 0, _sz_sports = '';
            _sz_count = intrsct.properties.get('sportzones_inside');
            _sz_types = intrsct.properties.get('sportzone_types');
            _sz_square = intrsct.properties.get('total_square');
            _sz_sports = intrsct.properties.get('sports');
            //TODO axios на сохранение пересечения и запоминание зон в data (или state)
        },
        paintSportZones() {
            this.sportZonesManager.removeAll();
            if (this.doPaintSportZones && this.currentRegion > 0) {
                this.filteredSportObjects.map(el => {
                    let coordinates = el.object_coordinates.replace(/^\(|\)$/g, '').split(','), _szones = [], _sports = [], _squares = [], _szonesHTML = '',
                        _sportsHTML = '';
                    //фильтруем по тем, которые входят в выбранный регион
                    if (this.currentRegionGeometry.geometry.contains(coordinates)) {
                        el.params.map(_sz => {
                            if (_sz) {
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
        createTurfMerkatorEllipsePolygon(geometry) {
            //из-за того, что turf не учитывает преобразование Меркатора, рисуем эллипс с этим учетом
            let _merkator = turf.ellipse(geometry.coordinates,
                geometry.radius * Math.cos(geometry.coordinates[0] * Math.PI / 180) * 0.85 * 1.65, //верхний радиус
                geometry.radius * 1.77,
                {units: 'meters', steps: 72,}
            );
            //из-за того, что turf работает только с полигонами, преобразуем эллипс в полигон
            _merkator = turf.polygon(_merkator.geometry.coordinates);
            return _merkator;
        },

        paintIntersections() {
            this.intersectionsPool = [];
            this.intersectionsManager.removeAll();
            if (this.doShowIntersections && this.currentRegion > 0) {
                //выбираем оттуда все объекты района
                for (var i = 0, len = this.objectsOverlay.objects.getAll().length; i < len - 1; i++) {
                    for (var j = i + 1; j < len; j++) {
                        let first_obj = this.objectsOverlay.objects.getAll()[i];
                        let second_obj = this.objectsOverlay.objects.getAll()[j];
                        let _firstPoly = this.createTurfMerkatorEllipsePolygon(first_obj.geometry);
                        let _secondPoly = this.createTurfMerkatorEllipsePolygon(second_obj.geometry);
                        let _intersection = turf.intersect(_firstPoly, _secondPoly);
                        if (_intersection)
                            this.intersectionsPool.push(_intersection);
                    }
                }
                this.intersectionsPool.map(inter => {
                    let _tomap = new ymaps.Polygon(inter.geometry.coordinates,
                        {
                            "hintContent": "Выбрать пересечение",
                            balloonContent: "Пересечение"
                        },
                        {
                            "zIndex": 9000,
                            opacity: 0.5,
                            fillColor: '#3ac255',
                            "strokeColor": '#000000'
                        });
                    _tomap.events.add('click', e => {
                        let _me = e.get('target');
                        this.countSportzonesInside(_me);
                        _me.properties.set('balloonContent', _me.properties);
                    });
                    _tomap.events.add('mouseenter', e => {
                        let _me = e.get('target');
                        _me.options.set('strokeWidth', '8');
                    });
                    _tomap.events.add('mouseleave', e => {
                        let _me = e.get('target');
                        _me.options.set('strokeWidth', '2');
                    });

                    this.intersectionsManager.add(_tomap);
                });
            }
        },

        countSportzonesInside(geoobject) {
            let _count = 0, _totalSquare = 0, _sports = [], _sztypes = [], _customHTML = '', _customFooter = '';
            this.filteredSportObjects.map(el => {
                let coordinates = el.object_coordinates.replace(/^\(|\)$/g, '').split(',');
                //фильтруем по тем, которые входят в выбранный регион
                if (geoobject.geometry.contains(coordinates)) {
                    el.params.map(_sz => {
                        if (_sz) {
                            let _szcoordinates = _sz.sportzone_coordinates.replace(/^\(|\)$/g, '').split(',');
                            if (geoobject.geometry.contains(_szcoordinates)) {
                                _count++;
                                _totalSquare += _sz.sportzone_square;
                                _sports.push(_sz.sport);
                                _sztypes.push(_sz.sportzone_type_name);
                            }
                        }
                    });
                }
            });
            geoobject.properties.set('sportzones_inside', _count);
            geoobject.properties.set('total_square', _totalSquare);
            geoobject.properties.set('sports', [...new Set(_sports)].join('; '));
            geoobject.properties.set('sportzone_types', [...new Set(_sztypes)].join('; '));
            _customHTML = `<p>Количество спортзон: ${_count}</p>`
                + `<p>Суммарная площадь спортзон: ${_totalSquare}</p>`
                + `<p>Типы спортзон: ${[...new Set(_sztypes)].join('; ')}</p>`
                + `<p>Виды спорта: ${[...new Set(_sports)].join('; ')}</p>`
            ;
            //TODO Сверстать красиво
            _customFooter = `<div><label>Название <br/><input type="text" class="input intersection_name" placeholder="Введите название области" /></label>`
                + `<br/><button class="btn save_itersection" onclick="">Сохранить</button></div>`;
            geoobject.properties.set('balloonContentBody', _customHTML);
            geoobject.properties.set('balloonContentFooter', _customFooter);
        },

        paintEmptySpaces() {
            this.emptySpacesManager.removeAll();
            this.emptyRegion = null;
            if (this.doShowEmptySpaces && this.currentRegion > 0) {
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
                if (_diff.geometry.type == "MultiPolygon") {
                    _diff.geometry.coordinates.map(coords => {
                        let _localpoly = new ymaps.Polygon(coords, null, {
                            fillColor: '#00000080'
                        });
                        this.emptySpacesManager.add(_localpoly);
                    });
                } else {
                    _diff = new ymaps.Polygon(_diff.geometry.coordinates, null, {
                        fillColor: '#00000080'
                    });
                    this.emptySpacesManager.add(_diff);
                }
            }
        },
        // ховер по объекту
        mouseOverObject(e) {
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
        //клик на объекте
        clickOnObject(e) {
            var objectId = e.get('objectId'),
                objectGeometry = this.objectsManager.objects.getById(objectId).geometry.type;
            /* это пример изменения по id объекта
            this.objectManager.objects.setObjectOptions(objectId, {
                preset: 'islands#yellowIcon'
            });
            */
        },
        filterBySports(objects) {
            return objects.filter(sport_object => {
                let el_find = false;
                sport_object.params.forEach(param => {
                    if (param && this.selected_types_of_sports.includes(param.sport)) el_find = true;
                });
                return el_find;
            });
        },
        mapSetCurrentRegion(region) {
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
        mapSetBounds(geoObject) {
            this.mapScopeObject = new ymaps.GeoObjectCollection({}, {});
            this.myMap.geoObjects.add(this.mapScopeObject);
            this.mapScopeObject.add(geoObject);
            this.myMap.setBounds(this.mapScopeObject.getBounds());
        },
        //пересоздаёт OM объектов
        flushMainOverlay() {
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
            for (var i = 0, count_per_step = this.doPaintCircles ? 100 : 1000, len = this.filteredSportObjects.length; i < len; i += count_per_step) {
                let data = [];
                let processed = 0;
                this.filteredSportObjects.slice(i, i + count_per_step).map(el => {
                    processed++;
                    let coordinates = el.object_coordinates.replace(/^\(|\)$/g, '').split(','), _szones = [], _sports = [], _squares = [], _szonesHTML = '',
                        _sportsHTML = '';
                    //фильтруем по тем, которые входят в выбранный регион
                    if (this.currentRegionGeometry.geometry.contains(coordinates)) {
                        this.currentRegionGeometry.properties.set('sport_objects_inside', ++_objectsinsideRegion);
                        el.params.map(_sz => {
                            if (_sz) {
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
                        el.squareColor = `rgba(${255 * (this.squareNormal - el.object_total_square) / this.squareNormal}, ${el.object_total_square > this.squareNormal ? 255 : 255 * (0 + el.object_total_square) / this.squareNormal}, 0, 1)`;

                        if (_szones.length > 0) {
                            _szonesHTML += '<label>Состав:</label>';
                            _szonesHTML += '<ul>';
                            _szones.map((e, i) => {
                                _szonesHTML += `<li>${e} (${_squares[i]}кв.м.)</li>`;
                            });
                            _szonesHTML += '</ul>'
                        }

                        if (_sports.length > 0) {
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
                                    "sport_objects_inside": 0,
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
        },

        // TODO
        // Выгрузка в pdf
        unloadingPdf() {

        },
        // TODO
        // Выгрузка в excel
        unloadingExcel() {

        },
        // Сбросить все фильтры
        dropFilters() {
            this.selected_accessibility = null;
            this.selected_organisations = [];
            this.selected_types_of_sports_zones = [];
            this.selected_types_of_sports = [];
            this.search_sportzone_name = null;
        },
    },
    watch: {
        // Перерисовка объектов на карте
        filteredSportObjects(v) {
            this.total = v.length ?? 0;
            this.objectsManager.removeAll();
            if (this.currentRegion > 0) {
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
            // Удаляем нерабочие кнопки-функции с карты
            // Определения геолокации
            this.myMap.controls.remove('geolocationControl');
            // Поиск
            this.myMap.controls.remove('searchControl');

            this.myMap.events.add('balloonopen', e => {
                let _me = e.get('target');
                //обработчик кнопки "сохранить"
                let _btnsave = document.getElementsByClassName('save_itersection')[0];
                if (_btnsave) _btnsave.addEventListener('click', event => {
                    this.saveIntersection(_me);
                });
            });
        });
    },
}
</script>

<style scoped>
#map {
    border: 1px solid black;
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
