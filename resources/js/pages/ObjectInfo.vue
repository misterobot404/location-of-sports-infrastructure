<template>
    <section>
        <template v-if="$route.params.id">
            <h1> Здесь будет инфа об объекте id: {{object_id}}</h1>
            <div class="object__container container" v-text="getSportObjectById(Number($route.params.id))"/>
        </template>
        <template v-else>
            <h1> Здесь будет инфа о всех (не всех, только 5000) спортивных объектах:</h1>
            <div class="object__container container" v-text="sport_objects.slice(0, 5000)"/>
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
    /*data () {
        return {
            // object_id: null,
            // serverData: '',
            // error: ''
        }
    },
    methods: {
        get_hello () {
            axios.get('/api/say_hello', {params: {
                    id: this.object_id
                }})
                .then(response => {
                    this.serverData = response.data.message;
                    this.error = '';
                })
                .catch(e => {
                    this.error = e;
                })
                .finally(() => {
                });
        }
    },
    mounted () {
        this.object_id = this.$route.params.id;
        this.get_hello();
    }*/
}
</script>

<style>

</style>
