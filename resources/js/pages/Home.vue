<template>
    <section>
        <div ref='region_info' style="width:25%; float:left;">
        </div>
        <div style="margin-left:25%;">
            <progress :value="loaded" :max="total"></progress>
            <br/>
            <label>Регионы: <input type="checkbox" v-model="doPaintRegions"/></label>
            <label>Хитмап объектов: <input type="checkbox" v-model="doPaintSpHeatmap"/></label>
            <label>Хитмап населения: <input type="checkbox" v-model="doPaintPopHeatmap"/></label>
            <label>Доступность: <input type="checkbox" v-model="doPaintCircles"/></label>
            <div class="map__container container" id='map'/>
        </div>
    </section>
</template>

<script>
import {mapState, mapGetters} from "vuex"
import regions_geo from '../regions_geo.json'
import population_heatmaps from '../population_heatmaps.json'
export default {
    name: "Home",
    data() {
        return {
            sport_object_id: null,
            myMap: null, //карта

            mainLayer: null, //главный слой (кластер)
            gridSize: 91, //сила кластеризации

            doPaintRegions: true, //выводить ли регионы
            regionsOverlay: null, //оверлей регионов

            doPaintSpHeatmap: false, //выводить ли хитмап по объектам
            spHeatmap: null, //объект хитмапа

            doPaintPopHeatmap: false, //выводить ли хитмап по населению
            popHeatmap: null, //хитмап населения,

            doPaintCircles: false, //выводить ли зоны доступности вместо объектов
            circlesOverlay: null, //оверлей для зон доступности

            loaded: 0, total: 0, //для прогрессбара
        }
    },
    computed: {
        mainObjectManager: {
            get () {
                if (this.mainLayer == null){
                    this.mainLayer = new ymaps.ObjectManager({
                        clusterize: true, //кластеризация меток
                        gridSize: this.gridSize,
                        clusterIconLayout: "default#pieChart"
                    });
                    this.myMap.geoObjects.add(this.mainLayer);
                }
                return this.mainLayer;
            }
        },
        circlesObjectManager: {
            get () {
                if (this.circlesOverlay == null){
                    this.circlesOverlay = new ymaps.ObjectManager({
                        clusterize: false, //кластеризация меток
                        gridSize: this.gridSize,
                        clusterIconLayout: "default#pieChart"
                    });
                    this.myMap.geoObjects.add(this.circlesOverlay);
                }
                return this.circlesOverlay;
            }
        },
        regionsManager: {
            get () {
                if (this.regionsOverlay == null){
                    this.regionsOverlay = new ymaps.GeoObjectCollection({}, {});
                    this.myMap.geoObjects.add(this.regionsOverlay);
                }
                return this.regionsOverlay;
            }
        },
        ...mapState('sport_objects', ["sport_objects"]),
        ...mapState('sports', ["sports"]),
        ...mapState('relations', ["relations"]),
        ...mapGetters('sport_objects', ["getSportObjectById"]),
        ...mapGetters('relations', ["getSportIdBySportObjectId"]),
        ...mapGetters('sports', ["getSportById"]),
        ...mapGetters({sports_of_object: 'relations/getSportsBySportObjectId'}),
        ready() {
            return this.sport_objects && this.sports && this.relations;
        }
    },
    methods: {
        //РЕГИОНЫ МОСКВЫ
        paintRegions() {
            if (this.doPaintRegions){
                //добавить регионы
                regions_geo.features.map(feature => {
                    if (typeof (feature.geo_reverse.coordinates) == 'object'){
                        feature.geo_reverse.coordinates.map(coord => {
                            var myGeoObject = new ymaps.GeoObject({
                                geometry: {
                                    type: "Polygon",
                                    coordinates: [
                                        coord[0]
                                    ]
                                },
                                // Описываем свойства геообъекта.
                                properties: {
                                    // Содержимое балуна.
                                    "hintContent": "Выбрать: " + feature.properties.NAME,
                                    infoHTML: '<h2>' + feature.properties.NAME +'</h2>'
                                        + '<p>Население:</p>'
                                        + '<p>Площадь:</p>'
                                        + '<p>Плотность населения:</p>'
                                        + '<p>Количество спорт объектов:</p>'
                                        ,
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
            else{
                //удалить слой регионов
                this.regionsManager.removeAll();
            }
        },
        //ХИТМАП СПОРТ ОБЪЕКТОВ
        paintSportHeatmap() {
            if (this.doPaintSpHeatmap){
                let pool = [...this.sport_objects];
                ymaps.modules.require(['Heatmap'], Heatmap => {
                    let heatmapdata = [];
                    for (var i = 0; i < pool.length; i++) {
                        if (pool[i] && pool[i].coordinates){
                            let coord = pool[i].coordinates.replace(/^\(|\)$/g, '').split(',');
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
            else{
                this.spHeatmap.destroy();
            }
        },
        //ХИТМАП НАСЕЛЕНИЯ
        paintPopulationHeatmap() {
            if (this.doPaintPopHeatmap){
                let pool = population_heatmaps['RECORDS'];
                ymaps.modules.require(['Heatmap'], Heatmap => {
                    let heatmapdata = [];
                    for (var i = 0; i < pool.length; i++) {
                        if (pool[i] && pool[i].coordinates && pool[i].count_persons){
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
            else{
                this.popHeatmap.destroy();
            }
        },
        paintPoints(ind = 0){
            let el = [...this.sport_objects][ind];
            let _sports = [];
            this.sports_of_object(el.id).map(e => {
                _sports.push(this.getSportById(e.id_sport)?.name);
            });

            let data = {
                type: "Feature",
                id: el.id,
                geometry: {
                    coordinates: el.coordinates.replace(/^\(|\)$/g, '').split(','),
                    type: this.doPaintCircles ? "Circle" : "Point",
                    radius: 1000,
                },
                properties: {
                    "balloonContent": 'balloonContent',
                    "balloonContentHeader": el.name,
                    "balloonContentBody": "<p>ЗДЕСЬ БУДУТ ПЕРЕЧИСЛЕНЫ СПОРТ ОБЪЕКТЫ, ВОЗМОЖНО, С ЧЕМТО ЕЩЁ</p>",
                    "balloonContentFooter": [...new Set(_sports)].join('; '),
                    "clusterCaption": el.name, //подпись и слева и справа
                    "hintContent": "<strong>Текст  <s>подсказки</s></strong>"
                },
                options: {
                    "preset": "islands#blueCircleDotIconWithCaption"
                }
            };

            this.progress = Math.floor(ind / this.sport_objects.length * 100);
            this.loaded = ++ind;

            setTimeout(() => {
                if (!this.doPaintCircles)
                    this.mainObjectManager.add(data);
                else
                    this.circlesObjectManager.add(data);
            });
            if(ind < 20)
                setTimeout(() => {
                    this.paintPoints(this.loaded);
                });
        },
        paintMap() {
            if (this.ready) {
                this.mainObjectManager.removeAll();
                this.circlesObjectManager.removeAll();

                setTimeout(() => {
                    this.paintPoints();
                });
            }
        }
    },
    watch: {
        doPaintRegions() {
            this.paintRegions();
        },
        doPaintSpHeatmap() {
            this.paintSportHeatmap();
        },
        doPaintPopHeatmap() {
            this.paintPopulationHeatmap();
        },
        doPaintCircles() {
            this.paintMap();
        },
        sport_objects() {
            this.total = this.sport_objects.length;
            this.paintMap();
        },
        sports() {
            this.paintMap();
        },
        relations() {
            this.paintMap();
        },
    },
    beforeMount() {
        //ИНИЦИИРУЕМ КАРТУ
        ymaps.ready(['util.calculateArea']).then(() => {
            this.myMap = new ymaps.Map('map', {
                // используется перевернутый порядок координат (longlat)
                center: [55.76, 37.64],
                zoom: 10,
            });
            setTimeout(() => {
                if (this.doPaintRegions)
                    this.paintRegions();
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
