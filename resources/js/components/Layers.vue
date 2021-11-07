<template>
  <v-card class="d-flex flex-column pa-4" style="border: 1px rgba(0,0,0, 0.25) solid">
    <!--  Слои -->
    <h4 class="align-self-center mt-1">Слои карты</h4>
    <v-row class="overflow-x-auto">
      <v-col cols="6" class="py-2">
        <v-checkbox
            v-model="m_doPaintRegions"
            label="Регионы"
            hide-details
        />
      </v-col>
      <v-col cols="6" class="py-2">
        <v-checkbox
            v-model="m_doPaintSportZones"
            label="Спортплощадки"
            hide-details
        />
      </v-col>
      <v-col cols="6" class="py-2">
        <v-checkbox
            v-model="m_doPaintSpHeatmap"
            label="Хитмап объектов"
            hide-details
        />
      </v-col>
      <v-col cols="6" class="py-2">
        <v-checkbox
            v-model="m_doPaintPopHeatmap"
            label="Хитмап населения"
            hide-details
        />
      </v-col>
      <v-col cols="6" class="py-2">
        <v-checkbox
            v-model="m_doPaintCircles"
            label="Доступность"
            hide-details
        />
      </v-col>
      <v-col cols="6" class="py-2">
        <v-checkbox
            v-model="m_doShowEmptySpaces"
            label="Пустоты"
            hide-details
        />
      </v-col>
      <v-col cols="6" class="py-2">
        <v-checkbox
            v-model="m_doShowIntersections"
            label="Пересечения"
            hide-details
        />
      </v-col>
      <v-col cols="6" class="py-2">
        <v-checkbox
            v-model="m_doShowSavedIntersections"
            :label="'Сохраненные пересечения (' + savedIntersections.length + ')'"
            hide-details
        />
      </v-col>
      <v-col cols="12" class="py-2">
        <v-checkbox
            v-model="m_calculateOnHundred"
            :label="'Расчёт на 100.000 человек'"
            hide-details
        />
      </v-col>
    </v-row>
    <v-divider class="mt-6"/>
    <!--  Нормаль площади -->
    <label class="mt-4 align-self-center">Нормаль площади</label>
    <v-text-field
        v-model.lazy.number="m_squareNormal"
        class="mt-2"
        hide-details
        type="number"
        dense
        outlined
        suffix="㎡"
    />
    <!-- Actions -->
    <slot name="actions"/>
  </v-card>
</template>

<script>
import {mapState, mapMutations} from "vuex";

export default {
  name: "Layers",
  computed: {
    ...mapState('layers', [
      'doPaintSportZones',
      'doPaintRegions',
      'doPaintCircles',
      'doShowEmptySpaces',
      'squareNormal',
      'doPaintPopHeatmap',
      'doPaintSpHeatmap',
      'doShowIntersections',
      'calculateOnHundred',
      'doShowSavedIntersections'
    ]),
    ...mapState({savedIntersections: state => state.intersections.intersections}),
    // Изменение глобального стейта
    m_doPaintSportZones: {
      get() {
        return this.doPaintSportZones;
      },
      set(v) {
        this.set_doPaintSportZones(v);
      }
    },
    m_doPaintCircles: {
      get() {
        return this.doPaintCircles;
      },
      set(v) {
        this.set_doPaintCircles(v);
      }
    },
    m_calculateOnHundred: {
      get() {
        return this.calculateOnHundred;
      },
      set(v) {
        this.set_calculateOnHundred(v);
      }
    },
    m_doShowSavedIntersections: {
      get() {
        return this.doShowSavedIntersections;
      },
      set(v) {
        this.set_doShowSavedIntersections(v);
      }
    },
    m_doPaintRegions: {
      get() {
        return this.doPaintRegions;
      },
      set(v) {
        this.set_doPaintRegions(v);
      }
    },
    m_doPaintSpHeatmap: {
      get() {
        return this.doPaintSpHeatmap;
      },
      set(v) {
        this.set_doPaintSpHeatmap(v);
      }
    },
    m_doPaintPopHeatmap: {
      get() {
        return this.doPaintPopHeatmap;
      },
      set(v) {
        this.set_doPaintPopHeatmap(v);
      }
    },
    m_doShowEmptySpaces: {
      get() {
        return this.doShowEmptySpaces;
      },
      set(v) {
        this.set_doShowEmptySpaces(v);
      }
    },
    m_doShowIntersections: {
      get() {
        return this.doShowIntersections;
      },
      set(v) {
        this.set_doShowIntersections(v);
      }
    },
    m_squareNormal: {
      get() {
        return this.squareNormal;
      },
      set(v) {
        this.set_squareNormal(v);
      }
    },
  },
  methods: {
    ...mapMutations('layers', [
      'set_doPaintSportZones',
      'set_doPaintRegions',
      'set_doPaintCircles',
      'set_doShowEmptySpaces',
      'set_squareNormal',
      'set_doPaintPopHeatmap',
      'set_doPaintSpHeatmap',
      'set_doShowIntersections',
      'set_calculateOnHundred',
      'set_doShowSavedIntersections',
    ])
  }
}
</script>

<style scoped>

</style>
