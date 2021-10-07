<template>
<div>
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
  name: 'App',
}
</script>
