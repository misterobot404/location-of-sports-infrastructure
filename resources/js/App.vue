<template>
    <div style="min-height: 100%">
        <!-- Header -->
        <section>
            <my-navbar></my-navbar>
        </section>
        <!-- Page -->
        <keep-alive>
            <router-view/>
        </keep-alive>
    </div>
</template>

<script>
export default {
    name: 'App'
}
</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}
</style>
