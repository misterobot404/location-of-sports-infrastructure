<template>
  <v-card class="pa-4 d-flex flex-column" style="border: 1px rgba(0,0,0, 0.25) solid">
    <h4 class="align-self-center mt-1">Фильтры</h4>
    <!--  Фильтр по ведомству -->
    <v-select
        v-model="m_selected_organisations"
        :items="organisations ? organisations.map(el => el.name).filter(el => organisations_filter ? (el.toLowerCase().indexOf(organisations_filter.toLowerCase())) !== -1 : true) : []"
        :menu-props="{ maxHeight: '400', maxWidth:'300' }"
        outlined
        dense
        multiple
        hide-details
        clearable
        placeholder="Ведомство"
        class="mt-2 pt-0__v-list"
    >
      <template v-slot:prepend-item>
        <div class="append">
          <v-list-item>
            <v-text-field v-model.lazy.trim="organisations_filter" prepend-icon="search" hide-details dense outlined placeholder="Поиск..."/>
          </v-list-item>
          <v-divider class="mt-2"/>
        </div>
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
            v-model="m_selected_types_of_sports"
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
            <div class="append">
              <v-list-item>
                <v-text-field v-model.lazy.trim="types_of_sports_filter" prepend-icon="search" hide-details dense outlined
                              placeholder="Поиск..."/>
              </v-list-item>
              <v-divider class="mt-2"/>
            </div>
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
            v-model="m_selected_types_of_sports_zones"
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
            <div class="append">
              <v-list-item>
                <v-text-field v-model.lazy.trim="types_of_sports_zones_filter" prepend-icon="search" hide-details dense outlined
                              placeholder="Поиск..."/>
              </v-list-item>
              <v-divider class="mt-2"/>
            </div>
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
        @change.native="set_search_sportzone_name($event.target.value)"
        class="mt-6"
        append-icon="search"
        hide-details
        dense
        outlined
        placeholder="Наименование спорт зоны"
    />
    <!--  Фильтр по доступности -->
    <label class="align-self-center mt-4">Доступность</label>
    <v-btn-toggle v-model="m_selected_accessibility" active-class="primary--text" class="d-flex flex-wrap">
      <v-col cols="6" v-for="(el) in accessibility" :key="el.name">
        <v-btn :value="el.name" v-text="el.name" outlined width="100%" style="white-space: normal !important;"/>
      </v-col>
    </v-btn-toggle>
    <!-- Actions -->
    <slot name="actions"/>
    <v-btn @click="dropFilters()" class="mt-2 align-self-center" text>
      <v-icon class="mr-1" small>close</v-icon>
      Сбросить всё
    </v-btn>
  </v-card>
</template>

<script>
import {mapMutations, mapState} from "vuex";

export default {
  name: "Filters",
  data() {
    return {
      // Поиск элементов внутри селекторов
      organisations_filter: null, // ведомства
      types_of_sports_filter: null, // виды спорта
      types_of_sports_zones_filter: null, // виды спорт. зон
    }
  },
  computed: {
    ...mapState({
      sports: state => state.sports.sports, // массив видов спорта
      organisations: state => state.organisations.organisations, // массив ведомств
      types_of_sports_zones: state => state.types_of_sports_zones.types_of_sports_zones, // массив типов спортзон
      accessibility: state => state.accessibility.accessibility // массив видов доступности
    }),
    // Выбранные фильтры
    ...mapState('filters', [
      'selected_organisations',
      'selected_types_of_sports_zones',
      'search_sportzone_name',
      'selected_accessibility',
      'selected_types_of_sports'
    ]),
    // Изменение глобального стейта
    m_selected_organisations: {
      get() {
        return this.selected_organisations;
      },
      set(v) {
        this.set_selected_organisations(v);
      }
    },
    m_selected_types_of_sports: {
      get() {
        return this.selected_types_of_sports;
      },
      set(v) {
        this.set_selected_types_of_sports(v);
      }
    },
    m_selected_accessibility: {
      get() {
        return this.selected_accessibility;
      },
      set(v) {
        this.set_selected_accessibility(v);
      }
    },
    m_selected_types_of_sports_zones: {
      get() {
        return this.selected_types_of_sports_zones;
      },
      set(v) {
        this.set_selected_types_of_sports_zones(v);
      }
    }
  },
  methods: {
    ...mapMutations('filters', [
      'set_selected_organisations',
      'set_selected_types_of_sports',
      'set_selected_accessibility',
      'set_search_sportzone_name',
      'set_selected_types_of_sports_zones',
    ]),
    // Сбросить все фильтры
    dropFilters() {
      this.set_selected_accessibility(null);
      this.set_selected_organisations([]);
      this.set_selected_types_of_sports_zones([]);
      this.set_selected_types_of_sports([]);
      this.set_search_sportzone_name("");
    },
  }
}
</script>

<style scoped>
.append {
  position: sticky;
  top: 0;
  z-index: 3;
  padding-top: 8px;
  background: white;
}
</style>
