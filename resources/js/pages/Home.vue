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
                        :value="search_sportzone_name"
                        v-on:change.native="search_sportzone_name = $event.target.value"
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
                                :label="'Пересечения (' + intersectionsPool.length + ')'"
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
                        suffix="?"
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
                    <h3 class="align-self-center mt-1">Варианты выгрузки:</h3>
                    <!--  Варианты выгрузки -->
                    <v-btn class="mt-4" @click="exportToPDF()">
                        <v-icon class="mr-1" color="primary">picture_as_pdf</v-icon>
                        PDF
                    </v-btn>
                    <v-btn class="mt-2" @click="exportToExcel()">
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
                    <v-col cols="4" class="pa-0 pr-2" style="overflow-y: scroll">
                        <v-text-field
                            v-model="search_region"
                            hide-details
                            placeholder="Поиск района..."
                            append-icon="search"
                            outlined
                            dense
                        />
                        <v-card
                            v-for="(el) in getRegions.filter(el => search_region ? el.name.toLowerCase().indexOf(search_region.toLowerCase()) !== -1 : true)"
                            @click="el.valid ? chooseRegionById(el.osm_id) : null"
                            @mouseenter="enlightRegionById(el.osm_id)"
                            @mouseleave="darkAllRegions()"
                            :key="el.osm_id"
                            min-height="100"
                            class="text-wrap my-3 pa-4"
                            :style="!el.valid ? 'opacity: 0.5' : null"
                            :class="[currentRegion === el.osm_id ? 'primary--text' : null]"
                        >
                            <h4>{{ el.name }}</h4>
                            <v-card-subtitle v-show="currentRegion === el.osm_id" v-html="currentRegionInfo" class="mt-2 pa-0"/>
                        </v-card>
                    </v-col>
                    <!-- Фильтры и спортивные события -->
                    <v-col cols="8" class="pa-0 px-2 d-flex flex-column" style="overflow-y: scroll">
                        <!-- Управление отображением блоков -->
                        <div class="d-flex">
                            <v-text-field
                                v-model="search_sport_object"
                                hide-details
                                placeholder="Поиск спортивного объекта..."
                                append-icon="search"
                                outlined
                                dense
                            />
                            <v-btn @click="reports_dialog = true" class="ml-2" icon large>
                                <v-icon>summarize</v-icon>
                            </v-btn>
                        </div>
                        <div class="d-flex my-2 flex-wrap">
                            <v-btn
                                @click="layers_block = !layers_block"
                                :class="[layers_block ? 'primary--text' : null, $vuetify.breakpoint.lgAndUp ? 'col' : 'col-12']"
                            >
                                Слои
                                <v-icon class="ml-2" :color="layers_block ? 'primary' : 'rgba(0, 0, 0, 0.54)'" v-text="layers_block ? 'layers' : 'layers_clear'"/>
                            </v-btn>
                            <v-btn
                                @click="filters_block = !filters_block"
                                :class="[filters_block ? 'primary--text' : null, $vuetify.breakpoint.lgAndUp ? 'col ml-4' : 'col-12 mt-2']"
                            >
                                Фильтры
                                <v-icon class="ml-2" :color="filters_block ? 'primary' : 'rgba(0, 0, 0, 0.54)'"
                                        v-text="filters_block ? 'filter_list' : 'filter_list_off'"/>
                            </v-btn>
                        </div>
                        <!-- Слои -->
                        <v-card v-if="layers_block" class="mt-2 pa-4 d-flex flex-column">
                            <!--  Слои -->
                            <h4 class="align-self-center mt-1">Слои карты</h4>
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
                                        :label="'Пересечения (' + intersectionsPool.length + ')'"
                                        hide-details
                                    />
                                </v-col>
                                <v-col cols="6" class="py-2">
                                    <v-checkbox
                                        v-model="doShowSavedIntersections"
                                        :label="'Сохраненные пересечения (' + savedIntersections.length + ')'"
                                        hide-details
                                    />
                                </v-col>
                                <v-col cols="12" class="py-2">
                                    <v-checkbox
                                        v-model="calculateOnHundred"
                                        :label="'Расчёт на 100.000 человек'"
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
                                suffix="?"
                            />
                        </v-card>
                        <!-- Фильтры -->
                        <v-card v-if="filters_block" class="mt-2 pa-4 d-flex flex-column">
                            <h4 class="align-self-center mt-1">Фильтры</h4>
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
                                        <v-text-field v-model.lazy.trim="organisations_filter" prepend-icon="search" hide-details dense outlined
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
                                :value="search_sportzone_name"
                                v-on:change.native="search_sportzone_name = $event.target.value"
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
                                <v-col cols="12" lg="6" v-for="(el) in accessibility" :key="el.name">
                                    <v-btn :value="el.name" v-text="el.name" outlined width="100%" style="white-space: normal !important;"/>
                                </v-col>
                            </v-btn-toggle>
                            <!--  Drop All  -->
                            <v-btn @click="dropFilters()" class="mt-2 align-self-center" text>
                                <v-icon class="mr-1" small>close</v-icon>
                                Сбросить всё
                            </v-btn>
                        </v-card>
                        <v-divider class="my-4"/>
                        <!-- Пересечения -->
                            <template v-if="doShowIntersections || doShowSavedIntersections">
                                <v-card class="mt-4 pa-4 d-flex flex-column">
                                    <h4 class="align-self-center mt-2">Пересечения</h4>
                                    <v-expansion-panels class="mt-2">
                                        <v-expansion-panel v-for="(intersect, i) in choosedIntersections" :key="i">
                                            <v-expansion-panel-header>
                                                Пересечение {{ i + 1 }}
                                            </v-expansion-panel-header>
                                            <v-expansion-panel-content>
                                                <button @click="deleteSavedIntersections(intersect)" style="float:right">Удалить</button>
                                                <div v-html="intersect.properties.get('customHTML')"></div>
                                            </v-expansion-panel-content>
                                        </v-expansion-panel>
                                    </v-expansion-panels>
                                    <div class="d-flex justify-space-between mt-4">
                                        <v-btn @click="clearChoosedIntersections">
                                            <v-icon class="mr-1" small>close</v-icon>
                                            Очистить
                                        </v-btn>
                                        <v-btn @click="saveIntersections">Сохранить</v-btn>
                                    </div>
                                </v-card>
                                <v-divider class="mt-4"/>
                            </template>
                        <!-- Cпортивные события -->
                        <template v-if="currentRegion">
                            <div class="flex d-flex flex-column">
                                <v-expansion-panels class="mt-2">
                                    <v-expansion-panel>
                                        <v-expansion-panel-header>
                                            Спортивные объекты
                                        </v-expansion-panel-header>
                                        <v-expansion-panel-content v-for="(sport_object) in filteredSportObjects.filter(el => search_sport_object ? el.object_name.toLowerCase().indexOf(search_sport_object.toLowerCase()) !== -1 : true)"
                                            :key="sport_object.object_id"
                                            >
                                            <v-card
                                                @click="chooseSportObjectById(sport_object.object_id)"
                                                class="overflow-hidden pa-3 my-1"
                                                :class="[selected_sport_object_id === sport_object.object_id ? 'primary--text' : null]"
                                                style="cursor: pointer"
                                            >
                                                <label style="cursor: pointer">{{ sport_object.object_name }}</label>
                                            </v-card>
                                        </v-expansion-panel-content>
                                    </v-expansion-panel>
                                </v-expansion-panels>
                            </div>
                        </template>
                        <template v-else>
                            <div class="flex d-flex justify-center align-center mt-1">
                                <v-icon class="mr-2">highlight_alt</v-icon>
                                <label>Выберите округ</label>
                            </div>
                        </template>
                    </v-col>
                </template>
                <!-- Mobile -->
                <template v-else>
                    <!-- Регионы -->
                    <v-row style="flex-wrap: nowrap; min-height: 100px" class="overflow-y-auto flex-grow-0">
                        <v-card
                            v-for="(el) in getRegions"
                            :key="el.osm_id"
                            class="text-wrap ma-2 pa-2"
                            @click="el.valid ? chooseRegionById(el.osm_id) : null"
                            :style="!el.valid ? 'opacity: 0.5' : null"
                            :class="[currentRegion === el.osm_id ? 'primary--text' : null]"
                        >
                            <h4 style="font-size: 14px">{{ el.name }}</h4>
                        </v-card>
                    </v-row>
                    <v-row>
                        <v-divider/>
                    </v-row>
                    <!-- TODO Поиск спортивного события -->
                    <!-- TODO Информация о текущих пересечениях и выбранном районе -->
                    <!-- Cпортивные события -->
                    <v-row class="overflow-y-auto" v-if="currentRegion">
                        <v-col cols="6" class="pa-2" v-for="(sport_object) in filteredSportObjects" :key="sport_object.object_id">
                            <v-card
                                height="100"
                                class="overflow-hidden pa-2"
                                @click="chooseSportObjectById(sport_object.object_id)"
                                :class="[selected_sport_object_id === sport_object.object_id ? 'primary--text' : null]"
                            >
                                <label class="text-wrap-ellips">{{ sport_object.object_name }}</label>
                            </v-card>
                        </v-col>
                    </v-row>
                </template>
            </v-col>
            <!-- Right/Top Col -->
            <v-col cols="7" class="pa-0" style="max-width: 100%;" id="map"/>
        </section>
    </v-container>
</template>

<script>
import {mapActions, mapState} from "vuex"
import regions_geo from '../regions_geo.json'
import population_heatmaps from '../population_heatmaps.json'

export default {
    name: "Home",
    data() {
        return {
            //ЦВЕТОВАЯ СХЕМА
            REGION_DEFAULT_STROKE_COLOR: '#038cfc',
            REGION_DEFAULT_STROKE_WIDTH: 2,
            REGION_HIGHLIGHTED_STROKE_WIDTH: 5,

            INTERSECTION_DEFAULT_COLOR: '#3ac255',
            INTERSECTION_CURRENT_COLOR: '#33BBFF',
            INTERSECTION_DEFAULT_STROKE_COLOR: '#000000',

            FILLED_REGION_COLOR: '#00000080',
            EMPTY_REGION_COLOR: '#ffffff00',

            selected_sport_object_id: null, //выбранный спорт объект

            // Mobile. Диалоговые окна
            filters_dialog: false,
            layers_dialog: false,
            reports_dialog: false,
            // Desktop. Отображение блоков
            filters_block: false,
            layers_block: false,

            // Фильтры
            search_region: "", //строки поиска
            search_sport_object: null,
            search_sportzone_name: "",
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

            myMap: null, // карта
            gridSize: 91, //степень кластеризации объектов
            loaded: 0, total: 0, //количество загружаемых объектов

            doPaintRegions: true, //выводить ли регионы
            regionsOverlay: null, //оверлей регионов

            doPaintSpHeatmap: false, //выводить ли хитмап по объектам
            spHeatmap: null, //объект хитмапа

            doPaintPopHeatmap: false, //выводить ли хитмап по населению
            popHeatmap: null, //хитмап населения

            doPaintCircles: false, //выводить ли круги доступности

            objectsOverlay: null, //оверлей объектов (и кругов)

            currentRegion: null, //выбранный регион
            currentRegionGeometry: null, //объект выбранного региона

            squareNormal: 1000, //нормаль площадей

            doShowEmptySpaces: false, //выводить ли области без доступностей
            emptySpacesOverlay: null, //оверлей "пустых" зон

            doShowIntersections: false, //выводить ли области с пересечениями
            intersectOverlay: null, //оверлей пересечений
            intersectionsPool: [], //общий пул пересечений

            choosedIntersections: [], //выбранные пользователем пересечения
            doShowSavedIntersections: false, //выводить ли сохраненные пересечения
            savedIntersOverlay: null, //оверлей сохраненных пересечений

            doPaintSportZones: false, //выводить ли спортзоны объектов
            sportZonesOverlay: null, //оверлей спортзон

            calculateOnHundred: true, //расчёт аналитики на 100.000 человек
        }
    },

    computed: {
        ...mapState({
            sport_objects: state => state.sport_objects.sport_objects, //массив спорт объектов
            sports: state => state.sports.sports, //массив видов спорта
            savedIntersections: state => state.intersections.intersections, //сохраненные пересечения
            organisations: state => state.organisations.organisations, //массив ведомств
            types_of_sports_zones: state => state.types_of_sports_zones.types_of_sports_zones, //массив типов спортзон
            accessibility: state => state.accessibility.accessibility //массив видов доступности
        }),

        filteredSportObjects() { //массив объектов с примененим фильтров
            let _pure = [...this.sport_objects || []];

            // Фильтры
            // По выбранному региону
            if (this.currentRegion) _pure = this.filterByRegion(_pure);

            // По ведомству
            if (this.selected_organisations.length) _pure = this.filterByOrganisations(_pure);

            // По виду спорта
            if (this.selected_types_of_sports.length) _pure = this.filterBySports(_pure);

            // По виду спорт зоны
            if (this.selected_types_of_sports_zones.length) _pure = this.filterByTypesOfSportsZones(_pure);

            // По доступности
            if (this.selected_accessibility) _pure = this.filterByAccessibility(_pure);

            return _pure;
        },

        currentRegionInfo() { //внутренняя html-разметка выбраного региона
            if (this.currentRegion)
                return `<label>Население: ${this.currentRegionGeometry.properties.get('population')}</label>` + `<br/>` +
                    `<label>Площадь: ${this.currentRegionGeometry.properties.get('square')}</label>` + `<br/>` +
                    `<label>Плотность населения: ${this.currentRegionGeometry.properties.get('population_density')}</label>` + `<br/>` +
                    `<label>Количество спорт объектов: ${this.currentRegionGeometry.properties.get('sport_objects_inside')}</label>`
                    ;
            return '';
        },

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
                // Сначала ставим районы с координатами
                .sort((x, y) => Number(y.valid) - Number(x.valid))
        },

        /*-----------------------------------------
            О В Е Р Л Е И (СЛОИ)   К А Р Т Ы
        ------------------------------------------*/
        regionsManager() { //слой регионов
            if (this.regionsOverlay == null) {
                this.regionsOverlay = new ymaps.GeoObjectCollection({}, {});
                this.myMap.geoObjects.add(this.regionsOverlay);
                this.regionsOverlay.events.add('click', e => {
                    let _me = e.get('target');
                    this.mapSetCurrentRegion(_me);
                }).add('mouseenter', e => {
                    let _me = e.get('target');
                    _me.options.set('strokeWidth', this.REGION_HIGHLIGHTED_STROKE_WIDTH);
                }).add('mouseleave', e => {
                    this.darkAllRegions();
                });
            }
            return this.regionsOverlay;
        },

        emptySpacesManager() { //слой для вывода не занятых областей
            if (this.emptySpacesOverlay == null) {
                this.emptySpacesOverlay = new ymaps.GeoObjectCollection({}, {});
                this.myMap.geoObjects.add(this.emptySpacesOverlay);
            }
            return this.emptySpacesOverlay;
        },

        intersectionsManager() { //слой пересечений
            if (this.intersectOverlay == null) {
                this.intersectOverlay = new ymaps.GeoObjectCollection({}, {});
                this.myMap.geoObjects.add(this.intersectOverlay);
            }
            return this.intersectOverlay;
        },

        objectsManager() { //слой спорт объектов
            if (this.objectsOverlay == null) {
                this.objectsOverlay = new ymaps.ObjectManager({
                    clusterize: !this.doPaintCircles,
                    gridSize: this.gridSize,
                    clusterIconLayout: "default#pieChart",
                    clusterDisableClickZoom: true
                });
                this.myMap.geoObjects.add(this.objectsOverlay);
                this.objectsOverlay.objects.events.add(['mouseenter', 'mouseleave'], this.mouseOverObject);
            }
            return this.objectsOverlay;
        },

        sportZonesManager() { //слой спорт зон
            if (this.sportZonesOverlay == null) {
                this.sportZonesOverlay = new ymaps.ObjectManager({
                    clusterize: false,
                    gridSize: this.gridSize,
                    clusterIconLayout: "default#pieChart",
                    clusterDisableClickZoom: true
                });
                this.myMap.geoObjects.add(this.sportZonesOverlay);
            }
            return this.sportZonesOverlay;
        },

        savedIntersManager() { //слой сохраненных пересечений
            if (this.savedIntersOverlay == null) {
                this.savedIntersOverlay = new ymaps.GeoObjectCollection({}, {});
                this.myMap.geoObjects.add(this.savedIntersOverlay);
            }
            return this.savedIntersOverlay;
        },
    },

    methods: {
        ...mapActions({
            storeIntersection: 'intersections/saveObject', //сохранение пересечения
            deleteIntersection: 'intersections/deleteObject', //удаление пересечения
        }),

        /*-----------------------------------------------
                        Ф И Л Ь Т Р Ы
        -----------------------------------------------*/
        filterBySports(objects) { // По виду спорта
            return objects.filter(sport_object => {
                let el_find = false;
                sport_object.params.forEach(param => {
                    if (param && this.selected_types_of_sports.includes(param.sport)) el_find = true;
                });
                return el_find;
            });
        },

        filterByRegion(objects) { // По региону
            return objects.filter(el => {
                let coordinates = el.object_coordinates.replace(/^\(|\)$/g, '').split(',');
                //фильтруем по тем, которые входят в выбранный регион
                return this.currentRegionGeometry.geometry.contains(coordinates);
            })
        },

        filterByOrganisations(objects) { // По ведомству
            return objects.filter(sport_object => {
                return this.selected_organisations.includes(sport_object.organisation_name)
            });
        },

        filterByTypesOfSportsZones(objects) { // По виду спорт. площадки
            return objects.filter(sport_object => {
                let el_find = false;
                sport_object.params.forEach(param => {
                    if (param && this.selected_types_of_sports_zones.includes(param.sportzone_type_name)) el_find = true;
                });
                return el_find;
            });
        },

        filterByAccessibility(objects)  {// По доступности
            return objects.filter(sport_object => {
                return this.selected_accessibility === sport_object.accessibility_name
            });
        },

        /*-----------------------------------------------
                        У Т И Л И Т Ы
        -----------------------------------------------*/
        chooseSportObjectById(id) { //открывает балун объекта по id
            this.selected_sport_object_id = id;
            let _obj = this.objectsManager.objects.getById(id);
            if (_obj) this.objectsManager.objects.balloon.open(id);
        },

        chooseRegionById(osm_id) { //выбирает район по osm_id
            this.regionsManager.each(rg => {
                if (rg.properties.get('osm_id') == osm_id)
                    rg.events.fire('click');
            });
        },

        enlightRegionById(osm_id) { //подсвечивает район по osm_id
            this.regionsManager.each(rg => {
                if (rg.properties.get('osm_id') == osm_id)
                    rg.options.set('strokeWidth', this.REGION_HIGHLIGHTED_STROKE_WIDTH);
            });
        },

        darkAllRegions() { //убирает подсветку со всех районов
            this.regionsManager.each(rg => {
                if (rg.properties.get('osm_id') != this.currentRegion)
                    rg.options.set('strokeWidth', this.REGION_DEFAULT_STROKE_WIDTH);
            });
        },

        createTurfMerkatorEllipsePolygon(geometry) { //преобразует ymaps circle в turf polygon через преобразование Меркатора
            let _merkator = turf.ellipse(geometry.coordinates,
                geometry.radius * Math.cos(geometry.coordinates[0] * Math.PI / 180) * 0.85 * 1.65, //верхний радиус
                geometry.radius * 1.77,
                {units: 'meters', steps: 72,}
            );
            //из-за того, что turf работает только с полигонами, преобразуем эллипс в полигон
            _merkator = turf.polygon(_merkator.geometry.coordinates);
            return _merkator;
        },

        removeIntersection(intersect) { //убираем пересечения из пула
            intersect.properties.set('is_choosed', false);
            intersect.options.set('fillColor', this.INTERSECTION_DEFAULT_COLOR);
            this.choosedIntersections = this.choosedIntersections.filter(inter => inter != intersect);
        },

        deleteSavedIntersections(intersect) { //удаление пересечения
            this.removeIntersection(intersect);
            let _id = intersect.properties.get('id');
            if (typeof (_id) == 'number') { //объект из базы
                this.deleteIntersection(_id);
                this.savedIntersManager.remove(intersect);
            }
        },

        clearChoosedIntersections() { //очистка пула выбранных пересечений
            this.choosedIntersections.forEach(intersect => {
                this.removeIntersection(intersect);
            });
        },

        saveIntersections() { //каскадно сохраняет выбранные пересечения
            this.choosedIntersections.forEach(intrsct => {
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
                this.storeIntersection(_params);
            });
        },

        countSportzonesInside(geoobject) { //ПОДСЧЕТ МЕТРИКИ ПЕРЕСЕЧЕНИЯ
            let _count = 0, _totalSquare = 0, _sports = [], _sztypes = [], _customHTML = '', _population = 0, _sportzones_by_types = {}, _sportzones_by_sports = {};
            //здесь рисуются объекты с базы и с карты, объекты в базе уже просчитаны
            if (geoobject.properties.get('source') != 'db') {
                //считаем, сколько объектов входит в пересечение
                this.filteredSportObjects.forEach(el => {
                    el.params.forEach(_sz => {
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
                        if (geoobject.geometry.contains(coord)) {
                            _population += Math.floor(pool[i].count_persons);
                        }
                    }
                }
                geoobject.properties.set('sportzones_inside', _count);
                geoobject.properties.set('total_square', _totalSquare);
                geoobject.properties.set('sportzones_by_types', _sportzones_by_types);
                geoobject.properties.set('sportzones_by_sports', _sportzones_by_sports);
                geoobject.properties.set('population', _population);
            } else { //Объекты из базы данных
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
                + `<p>Типы спортзон: ${[...new Set(_sztypes)].join('; ')}</p>`
                + `<p>Виды спорта: ${[...new Set(_sports)].join('; ')}</p>`
                + `<p>Суммарная площадь спортзон: ${Math.ceil(_totalSquare ?? 0)} кв.м.</p>`
                + `<p>Численность населения: ${Math.floor(_population)} чел.</p>`
            ;

            _customHTML += 'По типам спортзон:<br/><table><tr><th>Тип</th><th>Количество</th></tr>';
            for (var i in _sportzones_by_types) {
                _customHTML += `<tr><td>${i}</td><td>${_sportzones_by_types[i]}</td></tr>`
            }
            _customHTML += '</table>';

            _customHTML += '<br/>По видам спорта:<br/><table><tr><th>Вид спорта</th><th>Количество</th></tr>';
            for (var i in _sportzones_by_sports) {
                _customHTML += `<tr><td>${i}</td><td>${_sportzones_by_sports[i]}</td></tr>`
            }
            _customHTML += '</table>';

            _customHTML += `<h3>Расчёт (на ${this.calculateOnHundred ? 100000 : 1} чел.)</h3>`;
            _customHTML += `<p>Спортзон: ${((_count ?? 0) / _population * (this.calculateOnHundred ? 100000 : 1)).toFixed(4)} ед.</p>`;
            _customHTML += `<p>Площадь: ${((_totalSquare ?? 0) / _population * (this.calculateOnHundred ? 100000 : 1)).toFixed(4)} кв.м.</p>`;

            _customHTML += `По типам спортзон:<br/><table><tr><th>Тип</th><th>Количество</th></tr>`;
            for (var i in _sportzones_by_types) {
                _customHTML += `<tr><td>${i}</td><td>${((_sportzones_by_types[i] ?? 0) / _population * (this.calculateOnHundred ? 100000 : 1)).toFixed(4)}</td></tr>`
            }
            _customHTML += '</table>';

            _customHTML += `<br/>По видам спорта:<br/><table><tr><th>Вид спорта</th><th>Количество</th></tr>`;
            for (var i in _sportzones_by_sports) {
                _customHTML += `<tr><td>${i}</td><td>${((_sportzones_by_sports[i] ?? 0) / _population * (this.calculateOnHundred ? 100000 : 1)).toFixed(4)}</td></tr>`
            }
            _customHTML += '</table>';
            geoobject.properties.set('balloonContentBody', _customHTML);
            geoobject.properties.set('customHTML', _customHTML);
        },

        mouseOverObject(e) { // ховер по сорт объекту
            var objectId = e.get('objectId');
            if (e.get('type') === 'mouseenter') {
                this.objectsManager.objects.setObjectOptions(objectId, {
                    fillColor: this.FILLED_REGION_COLOR
                });
            } else {
                this.objectsManager.objects.setObjectOptions(objectId, {
                    fillColor: this.EMPTY_REGION_COLOR
                });
            }
        },

        mapSetCurrentRegion(region) { //устанавливает текущий район
            if (region.properties.get('osm_id') == this.currentRegion)
                return;
            this.darkAllRegions();
            this.currentRegion = region.properties.get('osm_id');
            this.currentRegionGeometry = region;
            region.options.set('strokeWidth', this.REGION_HIGHLIGHTED_STROKE_WIDTH);
            this.mapSetBounds(region);
            this.paintObjects();
            this.paintSportHeatmap();
            this.doShowEmptySpaces = false;
            this.paintEmptySpaces();
            this.doShowIntersections = false;
            this.paintIntersections();
            this.paintSportZones();
        },

        mapSetBounds(geoObject) { //центрирует карту на выбранном районе
            this.myMap.setBounds(geoObject.geometry.getBounds());
        },

        flushMainOverlay() { //пересоздаёт оверлеи объектов (используется при выоде объектов в иде кругов доступности)
            this.myMap.geoObjects.remove(this.objectsManager);
            this.objectsOverlay = null;
            this.paintObjects();
        },

        agregateExportHTML() { //формирует html для экспорта
            let _html = '';
            //выбранный регион
            _html += '<h2>Выбранный регион</h2>';
            _html += this.currentRegionInfo;
            //выбранные пересечения
            this.choosedIntersections.forEach(intersect => {
                _html += '<h2>Пересечение</h2>';
                _html += intersect.properties.get('customHTML');
            });
            return _html;
        },

        exportToExcel() {
            var uri = 'data:application/vnd.ms-excel;base64,'
                , template = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>'
                , base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))) }
                , format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }) }
            var ctx = {worksheet: name || 'Worksheet', table: this.agregateExportHTML()}
            window.location.href = uri + base64(format(template, ctx))
        },

        exportToPDF() {
            let _html = this.agregateExportHTML();
            html2pdf(_html);
        },

        // Сбросить все фильтры
        dropFilters() {
            this.selected_accessibility = null;
            this.selected_organisations = [];
            this.selected_types_of_sports_zones = [];
            this.selected_types_of_sports = [];
            this.search_sportzone_name = "";
        },

        //считаем информацию по пустой зоне
        countInfoForEmptySpace(space){
            let _customHTML = '', _population = 0;
            //считаем население, входящее в пересечение
            let pool = population_heatmaps['RECORDS'];
            for (var i = 0; i < pool.length; i++) {
                if (pool[i] && pool[i].coordinates && pool[i].count_persons) {
                    let coord = pool[i].coordinates.replace(/^\(|\)$/g, '').split(',');
                    if (space.geometry.contains(coord)) {
                        _population += Math.floor(pool[i].count_persons);
                    }
                }
            }
            _customHTML += `<p>Количество проживающих: ${_population} чел.</p>`;
            // анализируем площадь
            let _area = space.properties.get('_totalArea');
            _area = _area > 1000000 ? (_area / 1000000).toFixed(4) + ' кв.км.' : _area + ' кв.м.';
            _customHTML += `<p>Площадь зоны: ${_area}</p>`;
            space.properties.set('balloonContentBody', _customHTML);
        },

        /*-----------------------------------------------
                        Р И С О В А Н И Е
        -----------------------------------------------*/
        paintIntersectionsOnOverlay(intersectionsPool, manager) { //выводит пересечения на указанный оверлей
            intersectionsPool.forEach(inter => {
                //поскольку здесь могут быть объекты, созданные по-разному, необходимо использовать такое получение координат
                let _coords = inter.geometry ? inter.geometry.coordinates : JSON.parse(inter.polygon_json);
                let _tomap = new ymaps.Polygon(_coords,
                    {
                        hintContent: "Выбрать пересечение",
                        "balloonContent": "balloonContent",
                        "balloonContentHeader": 'Пересечение',
                        "balloonContentBody": `Body`,
                        "balloonContentFooter": ``,
                        source: inter.geometry ? 'map' : 'db',
                        population: inter.population,
                        sportzones_inside: inter.sportzones_count,
                        total_square: inter.area,
                        sportzones_by_sports: inter.type_sports,
                        sportzones_by_types: inter.type_sportzones,
                        sports: '',
                        sportzone_types: '',
                        id: inter.geometry ? 'intersection_' + Date.now() : inter.id,
                        is_choosed: false
                    },
                    {
                        zIndex: 9000,
                        opacity: 0.5,
                        fillColor: this.INTERSECTION_DEFAULT_COLOR,
                        strokeColor: this.INTERSECTION_DEFAULT_STROKE_COLOR,
                    });
                _tomap.events.add('click', e => {
                    let _me = e.get('target');
                    //если уже выбрано - убираем из пула
                    if (_me.properties.get('is_choosed')) {
                        this.choosedIntersections.splice(this.choosedIntersections.indexOf(_me), 1);
                        _me.properties.set('is_choosed', false);
                        _me.options.set('fillColor', this.INTERSECTION_DEFAULT_COLOR);
                    } else {
                        this.countSportzonesInside(_me);
                        this.choosedIntersections.push(_me);
                        _me.properties.set('is_choosed', true);
                        _me.options.set('fillColor', this.INTERSECTION_CURRENT_COLOR);
                    }
                });
                _tomap.events.add('mouseenter', e => {
                    let _me = e.get('target');
                    _me.options.set('strokeWidth', this.REGION_HIGHLIGHTED_STROKE_WIDTH);
                });
                _tomap.events.add('mouseleave', e => {
                    let _me = e.get('target');
                    _me.options.set('strokeWidth', this.REGION_DEFAULT_STROKE_WIDTH);
                });

                manager.add(_tomap);
            });
        },

        paintIntersections() { //вывод пересечений
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
                this.paintIntersectionsOnOverlay(this.intersectionsPool, this.intersectionsManager);
            } else {
                this.choosedIntersections = this.choosedIntersections.filter(inter => inter.properties.get('source') != 'map');
            }
        },

        paintSavedIntersections() { //вывод сохраненных пересечений
            this.savedIntersManager.removeAll();
            if (this.doShowSavedIntersections)
                this.paintIntersectionsOnOverlay(this.savedIntersections, this.savedIntersManager);
            else { //в случае убирания галочки "Сохраненные пересечения" убираем их из выбранных, если есть
                this.choosedIntersections = this.choosedIntersections.filter(inter => inter.properties.get('source') != 'db');
            }
        },

        paintEmptySpaces() { //вывод зон, не занятых объектами, на основе их доступности
            this.emptySpacesManager.removeAll();
            if (this.doShowEmptySpaces && this.currentRegion > 0) {
                //копируем текущий район
                let _emptyRegion = {...this.currentRegionGeometry};
                let _diff = turf.polygon(_emptyRegion.geometry.getCoordinates());
                //выбираем оттуда все объекты района
                this.objectsOverlay.objects.each(obj => {
                    let _secondPoly = this.createTurfMerkatorEllipsePolygon(obj.geometry);
                    let difference = turf.difference(_diff, _secondPoly);
                    _diff = difference;
                });
                //сразу считаем площадь области, чтоб потом не преобразовывать
                let _area = Math.floor(turf.area(_diff));
                let _options = {
                    "balloonContent": "balloonContent",
                    "balloonContentHeader": 'Пустая зона',
                    "balloonContentFooter": ``,
                    "hintContent": 'Выбрать область',
                    _totalArea: _area,
                };
                //если вдруг район разбился кругами на несколько, то обходим как мультиполигон
                if (_diff.geometry.type == "MultiPolygon") {
                    _diff.geometry.coordinates.forEach(coords => {
                        let _localpoly = new ymaps.Polygon(coords, _options, {
                            fillColor: this.FILLED_REGION_COLOR
                        });
                        _localpoly.events.add('click', e => {
                            let _me = e.get('target');
                            this.countInfoForEmptySpace(_me);
                            console.log(_me);
                        });
                        this.emptySpacesManager.add(_localpoly);
                    });
                } else {
                    _diff = new ymaps.Polygon(_diff.geometry.coordinates, _options, {
                        fillColor: this.FILLED_REGION_COLOR
                    });
                    _diff.events.add('click', e => {
                            let _me = e.get('target');
                            this.countInfoForEmptySpace(_me);
                            console.log(_me);
                        });
                    this.emptySpacesManager.add(_diff);
                }
            }
        },

        paintSportZones() { //вывод спортзон
            this.sportZonesManager.removeAll();
            if (this.doPaintSportZones && this.currentRegion > 0) {
                //спортзоны хранятся в объектах
                this.filteredSportObjects.forEach(el => {
                    el.params.forEach(_sz => {
                        if (_sz && _sz.sportzone_name.includes(this.search_sportzone_name)) {
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
                });
            }
        },

        paintObjects() { // Спортивные объекты (в виде точек или кругов доступности)
            if (!this.currentRegion > 0)
                return;
            this.objectsManager.removeAll();
            this.loaded = 0;
            // Порционная отрисовка объектов
            let _objectsinsideRegion = 0;
            for (var i = 0, count_per_step = this.doPaintCircles ? 100 : 1000, len = this.filteredSportObjects.length; i < len; i += count_per_step) {
                let data = [];
                let processed = 0;
                this.filteredSportObjects.slice(i, i + count_per_step).forEach(el => {
                    processed++;
                    let coordinates = el.object_coordinates.replace(/^\(|\)$/g, '').split(','),
                        _szones = [], _sports = [], _squares = [], _szonesHTML = '', _sportsHTML = '';
                    this.currentRegionGeometry.properties.set('sport_objects_inside', ++_objectsinsideRegion);
                    el.params.forEach(_sz => {
                        if (_sz) {
                            _szones.push(_sz.sportzone_type_name);
                            _squares.push(_sz.sportzone_square);
                            _sports.push(_sz.sport);
                        }
                    });

                    _szones = [...new Set(_szones)];
                    _sports = [...new Set(_sports)];
                    _squares = [...new Set(_squares)];

                    //суммарная площадь входящих спортплощадок и цвет окружности // object_total_square in [0; 5kk]
                    el.squareColor = `rgba(${255 * (this.squareNormal - el.object_total_square) / this.squareNormal}, ${el.object_total_square > this.squareNormal ? 255 : 255 * (0 + el.object_total_square) / this.squareNormal}, 0, 1)`;

                    if (_szones.length > 0) {
                        _szonesHTML += '<label>Состав:</label>';
                        _szonesHTML += '<ul>';
                        _szones.forEach((e, i) => {
                            _szonesHTML += `<li>${e} (${_squares[i] ?? 0} кв.м.)</li>`;
                        });
                        _szonesHTML += '</ul>'
                    }

                    if (_sports.length > 0) {
                        _sportsHTML += '<label>Виды спорта:</label>';
                        _sportsHTML += '<ul>';
                        _sports.forEach(e => {
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
                            id: el.object_id,
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
                            fillColor: this.EMPTY_REGION_COLOR,
                            opacity: 1,
                            strokeColor: el.squareColor,
                            strokeWidth: 5,
                            "zIndex": 5000 - el.accessibility_radius
                        }
                    };
                    data.push(_gobject);
                })
                setTimeout(() => {
                    this.loaded += processed;
                    this.objectsManager.add(data);
                });
            }
        },

        paintRegions() { // Вывод регионов
            if (this.regionsManager) this.regionsManager.removeAll();
            if (this.doPaintRegions) {
                regions_geo.features.forEach(feature => {
                    if (typeof (feature.geo_reverse.coordinates) == 'object') {
                        feature.geo_reverse.coordinates.forEach(coord => {
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
                                strokeColor: this.REGION_DEFAULT_STROKE_COLOR,
                                strokeWidth: feature.properties.OSM_ID == this.currentRegion ? this.REGION_HIGHLIGHTED_STROKE_WIDTH : this.REGION_DEFAULT_STROKE_WIDTH,
                            });
                            this.regionsManager.add(myGeoObject);
                        });
                    }
                });
            }
        },

        paintPopulationHeatmap() { // ВЫВОДИТ ХИТМАП НАСЕЛЕНИЯ
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
                        radius: 15,
                        dissipating: false,
                        opacity: 0.75,
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

        paintSportHeatmap() { // Хитмап спортивных объектов
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
                        radius: 10,
                        dissipating: false,
                        opacity: 0.75,
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
    },
    watch: {
        //события изменения "галочек"
        doPaintSportZones () {
            this.paintSportZones();
        },

        doShowEmptySpaces () {
            this.paintEmptySpaces();
        },

        doShowIntersections () {
            this.doPaintSportZones = true;
            this.paintIntersections();
        },

        doPaintCircles () {
            this.flushMainOverlay();
        },

        doPaintRegions () {
            this.paintRegions();
        },

        doPaintSpHeatmap () {
            this.paintSportHeatmap();
        },

        doPaintPopHeatmap () {
            this.paintPopulationHeatmap();
        },

        doShowSavedIntersections () {
            this.paintSavedIntersections();
        },

        filteredSportObjects(newValue) { // Перерисовка объектов на карте
            this.total = newValue.length ?? 0;
            if (this.currentRegion > 0) {
                this.paintObjects();
                this.paintSportHeatmap();
                this.paintSportZones();
            }
        },

        search_sportzone_name(){
            this.paintSportZones();
        },

        // Применение стартовых оверлеев и хитмапов к карте после загрузки данных
        sport_objects(v) {
            if (v) {
                if (this.doPaintRegions) this.paintRegions();
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
            this.myMap.controls.remove('geolocationControl');
            this.myMap.controls.remove('searchControl');
        });
    },
}
</script>

<style scoped>
#map {
    border: 1px solid black;
}

.text-wrap-ellips {
    display: -webkit-box;
    max-width: 200px;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
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
