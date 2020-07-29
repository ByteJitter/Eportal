<template>
  <v-flex class="table-title pt-3 pb-2 pl-3 grey lighten-2 button mb-5" md12>
    <p class="title">{{ title }}</p>
    <p class="subtitle-1">{{ subtitle }}</p>
  </v-flex>
</template>

<script>
export default {
  props: {
    title: String,
    subtitle: String
  }
};
</script>

<style>
</style>