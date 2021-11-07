<template>
    <v-container class="fill-height align-baseline" v-if="getRegions">
        <!-- Loading process  -->
        <v-overlay v-if="!is_ready" class="overlay" opacity="0">
            <svg>
                <circle cx="50" cy="50" r="40" stroke="red" stroke-dasharray="78.5 235.5" stroke-width="3" fill="none"/>
                <circle cx="50" cy="50" r="30" stroke="blue" stroke-dasharray="62.8 188.8" stroke-width="3" fill="none"/>
                <circle cx="50" cy="50" r="20" stroke="green" stroke-dasharray="47.1 141.3" stroke-width="3" fill="none"/>
            </svg>
            <h2>Загрузка данных...</h2>
        </v-overlay>
        <!-- Navigation  -->
        <v-row class="mt-10 align-center">
            <v-btn to="/home" icon>
                <v-icon>arrow_back_ios_new</v-icon>
            </v-btn>
            <h1 class="ml-2" v-text="!$route.params.id ? 'Город' : getRegions.find(el => el.osm_id === Number($route.params.id)).name"/>
        </v-row>
        <!-- Diagram  -->
        <v-row class="mb-16 mt-0">
            <v-col>
                <div style="height: 500px" ref="chart"/>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from "axios"
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import regions_geo from "../regions_geo.json";

am4core.useTheme(am4themes_animated);

export default {
    name: "Analytics",
    data() {
        return {
            is_ready: false,
            data: null,
        }
    },
    computed: {
        getRegions() { //массив для вывода фильров на панели слева
            return regions_geo.features
                .map(feature => {
                    return {
                        name: feature.properties.NAME,
                        osm_id: feature.properties.OSM_ID,
                        valid: feature.properties.OSM_ID === 2263059
                            || feature.properties.OSM_ID === 162903
                            || feature.properties.OSM_ID === 1320234
                            || feature.properties.OSM_ID === 1278703
                            || feature.properties.OSM_ID === 226149
                    }
                })
        },
    },
    async mounted() {
        await axios.get('/api/analytics')
            .then(response => this.data = response.data.sports)

        let chart = am4core.create(this.$refs.chart, am4charts.PieChart);
        chart.data = this.data;
        let pieSeries = chart.series.push(new am4charts.PieSeries());
        pieSeries.dataFields.value = "litres";
        pieSeries.dataFields.category = "country";

        this.chart = chart;
        this.is_ready = true;
    },
    beforeDestroy() {
        if (this.chart) {
            this.chart.dispose();
        }
    }
}
</script>

