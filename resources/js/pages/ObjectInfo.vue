<template>
    <section>
        <h1> Здесь будет инфа об объекте id: {{object_id}}</h1>
        <div class="object__container container">
        </div>
    </section>
</template>

<script>
export default {
    name: 'ObjectInfo',
    data () {
        return {
            object_id: null
        }
    },
    mounted () {
        this.object_id = this.$route.params.id;
    }
}
</script>

<style>

</style>
