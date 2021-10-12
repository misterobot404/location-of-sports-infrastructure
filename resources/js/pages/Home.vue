<template>
    <section>
        <h1>Здесь будет страница с картой и фильтрами</h1>
        <div class="filter__container container">
            <input placeholder="Поиск" class="filter"/><br/>
            <select class="filter"></select>
            <select class="filter"></select>
            <select class="filter"></select>
        </div>
        <input v-model="sport_object" placeholder="id объекта">
        <router-link :to="'/info/' + sport_object" tag="button">Перейти</router-link>
        <br/><label for="">Рисовать круги: <input type="checkbox" v-model="paintCircles"/></label>
        <div class="map__container container" id='map'>
        </div>
    </section>
</template>

<script>
import {mapState, mapGetters} from "vuex"
export default {
    name: "Home",
    data() {
        return {
            sport_object: null,
            myMap: null,
            objectManager: null,
            gridSize: 91,
            paintCircles: false,
            _sport_objects: []
        }
    },
    computed: {
        ...mapState('sport_objects', ["sport_objects"]),
        ...mapGetters('sport_objects', ["getSportObjectById"])
    },
    methods: {
        paintMap () {
            let pool = this._sport_objects;
            this.objectManager = new ymaps.ObjectManager({
                // Чтобы метки начали кластеризоваться, выставляем опцию.
                clusterize: !this.paintCircles,
                // ObjectManager принимает те же опции, что и кластеризатор.
                gridSize: this.gridSize,
                clusterDisableClickZoom: true
            });
            // Чтобы задать опции одиночным объектам и кластерам,
            // обратимся к дочерним коллекциям ObjectManager.
            this.objectManager.objects.options.set('preset', 'islands#greenDotIcon');
            this.objectManager.clusters.options.set('preset', 'islands#greenClusterIcons');
            this.myMap.geoObjects.removeAll();
            this.myMap.geoObjects.add(this.objectManager);
            if (pool.length > 0){
                let data = [];

                pool.slice(0, 100).map(el => {
                    let coords = el.coordinates.replace(/^\(|\)$/g,'').split(',');
                    data.push({
                        type: "Feature",
                        id: el.id,
                        geometry: {
                            coordinates: coords,
                            type: this.paintCircles ? "Circle" : "Point",
                            radius: 1000,
                        },
                        properties: {
                            "balloonContentHeader": el.name,
                            "balloonContentBody": "<p>ЗДЕСЬ НУЖНО ОПИСАНИЕ ОБЪЕКТА КАКОЕ_ТО</p>",
                            "balloonContentFooter": "<font size=1>Информация предоставлена: </font> <strong>этим балуном</strong>",
                            "clusterCaption": el.name, //подпись и слева и справа
                            "hintContent": "<strong>Текст  <s>подсказки</s></strong>"
                        }
                    });
                });
                this.objectManager.add(data);
            }
        }
    },
    watch: {
        paintCircles: function(checked) {
            this.paintMap();
        },
        sport_objects: function (pool) {
            this._sport_objects = [...pool];
            this.paintMap();
        },
    },
    mounted () {
        //ИНИЦИИРУЕМ КАРТУ
        ymaps.ready(['util.calculateArea']).then(() => {

        this.myMap = new ymaps.Map('map', {
            // используется перевернутый порядок координат (longlat)
            center: [55.76, 37.64],
            zoom: 10
        }, {
            searchControlProvider: 'yandex#search'
        });
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
</style>
