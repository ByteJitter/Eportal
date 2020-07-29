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
    show(titleTip, color = "info", alertTip = "add_alert") {
      this.snackbar = true;
      this.color = color;
      this.titleTip = titleTip;
      this.alertTip = alertTip;
    },
    showOk(titleTip = '搜索成功'){
      this.show(titleTip, "info");
    },
    showError(titleTip = '获取数据失败，请刷新重试'){
      this.show(titleTip, "error");
    },
    showStatus(operate, status = true){
      switch (operate) {
      case 'search':
        status ? this.show('搜索成功') : this.showError('搜索失败，请刷新重试');
        break;
      case 'delete':
        status ? this.show('删除成功') : this.showError('删除失败，请刷新重试');
        break;
      case 'edit':
        status ? this.show('编辑成功') : this.showError('编辑失败，请刷新重试');
        break;
      case 'add':
        status ? this.show('新增成功') : this.showError('新增失败，请刷新重试');
        break;
      default:
        break;
      }
    }
  }
};
</script>

<style>
</style>