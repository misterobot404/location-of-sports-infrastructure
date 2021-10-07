<template>
    <div>
        <!-- Nav -->
        <router-link v-for="route in $router.getRoutes()" :to="{name: route.name}" :key="route.path" v-text="route.name"/>
        <!-- Page -->
        <router-view/>
    </div>
</template>
<script>

export default {
    name: 'App'
}
</script>
