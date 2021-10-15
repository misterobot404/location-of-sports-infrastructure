<template>
    <v-app>
        <v-main>
            <!--
            <header>
                <Navbar/>
            </header>
            -->
            <!-- Page -->
            <keep-alive>
                <router-view/>
            </keep-alive>
        </v-main>
    </v-app>
</template>

<script>
export default {
    name: 'App'
}
</script>

<style>
.v-application {
    font-family: Nunito, sans-serif !important;
}
html {
    overflow-y: auto !important;
}
</style>
