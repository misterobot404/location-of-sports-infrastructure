<template>
  <v-app>
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

html {
  overflow-y: auto !important;
}
</style>
