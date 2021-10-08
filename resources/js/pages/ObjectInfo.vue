<template>
    <section>
        <h1> Здесь будет инфа об объекте id: {{object_id}}</h1>
        <div class="object__container container">
        </div>
        {{serverData}}
        <div v-if="error != ''" class="error" v-html="error"></div>
    </section>
</template>

<script>
import axios from 'axios';
export default {
    name: 'ObjectInfo',
    data () {
        return {
            object_id: null,
            serverData: '',
            error: ''
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
    }
}
</script>

<style>

</style>
