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
            <router-link to="/info/123" tag="button">Предположим, что я объект</router-link>
        </div>
    </section>
</template>

<script>
export default {
    name: "Home"
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
