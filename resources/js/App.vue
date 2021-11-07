<template>
    <v-app class="app">
        <v-main>
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

.v-btn {
    text-transform: none !important;
    font-weight: 600 !important;
}

.v-list {
    padding-top: 0 !important;
}

html {
    overflow-y: auto !important;
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
