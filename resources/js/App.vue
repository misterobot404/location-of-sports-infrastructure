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
}

.v-list {
  padding-top: 0 !important;
}

html {
  overflow-y: auto !important;
}
</style>
