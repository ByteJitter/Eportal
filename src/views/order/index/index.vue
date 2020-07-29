<template>
  <div>
    <keep-alive>
      <router-view v-if="$route.meta.keepAlive"></router-view>
    </keep-alive>
    <router-view v-if="!$route.meta.keepAlive"></router-view>
  </div>
</template>

<script>
export default {
  computed: {
    key() {
      return new Date().getTime();
    }
  }
};
</script>

<style  scoped>
</style>