<template>
    <section>
        <h1>Здесь будет страница с картой и фильтрами</h1>
        <div class="filter__container container">
            <input placeholder="Поиск" class="filter"/><br/>
            <select class="filter"></select>
            <select class="filter"></select>
            <select class="filter"></select>
        </div>
        <div class="map__container container">
            Я карта!
            <br/>
            <input v-model="sport_object" placeholder="id объекта">
            <router-link :to="'/info/' + sport_object" tag="button">Перейти</router-link>
        </div>
    </section>
</template>

<script>
export default {
    name: "Home",
    data() {
        return {
            sport_object: null
        }
    }
}
</script>

<style scoped>
.filter__container {
    display: flex;
}
.filter__container .filter {
    padding: 5px;
    width: 200px;
}
.map__container {
    align-content: center;
    height: 800px;
    width: 800px;
    border: 1px solid black;
}
</style>
