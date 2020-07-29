<template>
  <v-snackbar :color="color" :top=true :right=true v-model="snackbar" :timeout="timeout">
    <v-icon color="white" class="mr-3" size="20">{{alertTip}}</v-icon>
    <div>{{titleTip}}</div>
    <v-icon color="white" size="16" @click="close">clear</v-icon>
  </v-snackbar>
</template>

<script>
export default {
  data() {
    return {
      snackbar: false,
      color:"info",
      titleTip:"",
      alertTip:"",
      timeout: 3000
    };
  },
  methods: {
    close() {
      this.snackbar = false;
    },
    show(titleTip, color = "info", alertTip = "info") {
      this.snackbar = true;
      this.color = color;
      this.titleTip = titleTip;
      this.alertTip = alertTip;
    },
  }
};
</script>

<style>
</style>