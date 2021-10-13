<template>
    <div class="navbar__container">
        <div class="navbar__items">
            <router-link class="navbar__item"
            v-for="item in filteredRouters"
            :key="item.name"
            :to="{name: item.name}"
            :title="item.meta && item.meta.title ? item.meta.title : ''"
            >{{item.name}}
            </router-link>
        </div>
    </div>
</template>

<script>
export default {
    name: 'my-navbar',
    data() {
      return {
          routes : this.$router.getRoutes()
      }
    },
    computed: {
        filteredRouters () {
            return this.routes.filter(i => i.name != '' && i.name != undefined)
        }
    }
}
</script>

<style scoped>
    .navbar__container {
        display: flex;
        align-items: center;
        height:50px;
    }

    .navbar__item {
        padding: 10px;
        margin-right: 10px;
        border: 1px solid #ccc;
    }

    .navbar__item.router-link-active {
        background:cyan;
    }
</style>
