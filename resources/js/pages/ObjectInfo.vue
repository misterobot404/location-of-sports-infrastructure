<template>
    <section>
        <template v-if="Number($route.params.id) && sport_objects">
            <h1> Здесь будет информация об объекте id: {{ Number($route.params.id) }}</h1>
            <div class="object__container container" v-text="getSportObjectById(Number($route.params.id))"/>
        </template>
        <template v-else-if="sport_objects">
            <h1> Здесь будет информация о 1000 спортивных объектах:</h1>
            <div class="object__container container" v-text="sport_objects.slice(0, 1000)"/>
        </template>
<!--        <div v-if="error != ''" class="error" v-html="error"></div>-->
    </section>
</template>

<script>
import {mapState, mapGetters} from "vuex"
export default {
    name: 'ObjectInfo',
    computed: {
        ...mapState('sport_objects',["sport_objects"]),
        ...mapGetters('sport_objects',["getSportObjectById"])
    }
}
</script>

<style>

</style>
