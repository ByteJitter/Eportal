<!--
 * @Author: your name
 * @Date: 2019-11-28 11:30:15
 * @LastEditTime: 2019-11-28 13:16:45
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /eportal/src/App.vue
 -->
<template>
  <v-app id="app">
    
    <router-view :key="$route.fullpath">
    </router-view>
  </v-app>
</template>
<script>
import { MP } from "./map";
export default {
  name: 'app',
  data() {
    return {
      ak: "iybSMvqfTMHZlgVySASC6donCu3daCEF",   //物流中使用的密钥
    }
  },
  mounted(){
    this.$router.afterEach((to, from, next) => {
      window.scrollTo(0, 0)
    });
    MP(this.ak);
  }
};
</script>
<style scoped>
.transitionRouter-enter-active,
.transitionRouter-leave-active {
  transition: all 0.4s;
}

.transitionRouter-enter,
.transitionRouter-leave {
  transform: translate3d(100%, 0, 0);
}
</style>