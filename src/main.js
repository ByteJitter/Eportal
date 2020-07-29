import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import router from './router'
import axios from 'axios'
import store from './store'
import './permission' // permission control

import Request from './utils/request';
import Validate from './utils/validate';

// 引入echarts
import echarts from 'echarts'
Vue.prototype.$echarts = echarts

Vue.prototype.$axios = axios // 不要使用

Vue.prototype.$request = Request;
Vue.prototype.$validate = Validate;


// 引入vuetify
import Vuetify from 'vuetify'
// 引入表单验证
import Vuelidate from 'vuelidate'
//使用vuetify
Vue.use(Vuetify)
Vue.use(Vuelidate)
Vue.use(VueRouter);
Vue.config.productionTip = false
//设置转场动画
// Vue.use(animated)
// vuetify样式
import 'vuetify/dist/vuetify.min.css'
//引入Font Awesome
// import '@fortawesome/fontawesome-free/css/all.css' // Ensure you are using css-loader
// Vue.use(Vuetify, {
//  iconfont: 'fa'
// })
//引入百度地图
// import BaiduMap from 'vue-baidu-map'
// Vue.use(BaiduMap, {
//   ak: 'iybSMvqfTMHZlgVySASC6donCu3daCEF'    //这个地方是官方提供的ak密钥
// })
// apollo安装
import {ApolloClient} from 'apollo-client'
import {HttpLink} from 'apollo-link-http'
import {InMemoryCache} from 'apollo-cache-inmemory'
import VueApollo from 'vue-apollo'
import {ApolloLink} from 'apollo-link'
// 引入WebDatarocks
// import WebDatarocks from "webdatarocks"
// import "webdatarocks/webdatarocks.min.css"
import Flexmonster from "vue-flexmonster";
import 'flexmonster/flexmonster.css';
Vue.use(VueApollo)
const httpLink = new HttpLink({
  uri: 'https://et.belstar.com.cn/graphql', //请求datahub的数据的地址
})

const middlewareLink = new ApolloLink((operation, forward) => {
  operation.setContext({
    // headers: {
    //   "Authorization":"Bearer c8543373d846600f152bc6369591f2d3448c7c22bee4285b80150f0e9cb1b6ef",
    //   "Content-Type":"application/json"
    // }
  })
  return forward(operation)
})

// Create the apollo client
const apolloClient = new ApolloClient({
  link: middlewareLink.concat(httpLink),
  cache: new InMemoryCache(),
  connectToDevTools: true,
})
const apolloProvider = new VueApollo({
  clients: {
    api:apolloClient,   //需要添加请求头
  },
  defaultClient: apolloClient,
})
Vue.config.productionTip = false

Vue.use(Vuetify, {
  iconfont: 'mdi' // 'md' || 'mdi' || 'fa' || 'fa4'
})
import SnackBar from '@/views/components/snackbarPlugin/index';
Vue.use(SnackBar, {router});

new Vue({
  router,
  store,
  provide: apolloProvider.provide(),  //需要添加这个
  render: h => h(App),
}).$mount('#app')
