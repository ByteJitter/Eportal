<!--  app的框架结构-->
<template>
  <v-layout>
    <v-flex>
      <side-bar></side-bar>
    </v-flex>
    <v-flex class="is_big_side">
      <v-layout>
        <v-flex md12>
          <top-bar ref="top"></top-bar>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex md12>
            <app-main></app-main>
        </v-flex>
        <v-flex>
          <snackbar ref="snackbar"></snackbar>
        </v-flex>
      </v-layout>
    </v-flex>
  </v-layout>
</template>

<script>
import appMain from './components/appMain.vue';
import sideBar from './components/sideBar.vue';
import topBar from './components/topBar.vue';
import snackbar from '@/views/components/snackbar.vue';
import { EventBus } from "@/utils/eventBus.js";

export default {
  components: {
    appMain,
    sideBar,
    topBar,
    snackbar
  },
  data () {
    return {
    };
  },
  mounted(){
    if(localStorage.getItem('headimgurl')){
      this.$refs.top.headimgurl = localStorage.getItem('headimgurl')
    }
    EventBus.$off("showSnackbar", {});
    EventBus.$on("showSnackbar", param => {
      this.$refs.snackbar.show(param.msg);
    })
  }
}

</script>
<style scoped>
.is_big_side {
  width:100% !important;
}
</style>