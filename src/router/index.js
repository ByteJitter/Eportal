
import Router from 'vue-router'
import Vue from 'vue'
import Layout from '@/views/Layout/layout'
import Login from '@/views/login/index'
import ConctWchat from '@/views/login/conctWchat'
import Authredirect from '@/views/login/authredirect'
import ConctDingDing from '@/views/login/conctDingDing'
// 引入路由文件
import Admin from '@/router/admin';
import Prodmgt from '@/router/prodmgt';
import Salaries from '@/router/salaries';
import Projects from '@/router/projects';
import Logisticsquery from '@/router/logisticsquery';
import Ordersystem from '@/router/ordersystem';
import Repairorder from '@/router/repairorder';
import Asset from '@/router/asset';
import DataHub from '@/router/dataHub';

Vue.use(Router)
export const constantRouterMap = [{
  path: '/login',
  component: Login,
},
{
  path: '/conctWchat',
  name: 'ConctWchat',
  component: ConctWchat
},
{
  path: '/authredirect',
  name: 'Authredirect',
  component: Authredirect
},
{
  path: '/conctDingDing',
  name: 'ConctDingDing',
  component: ConctDingDing
},
{
  path: '/',
  component: Layout,
  redirect: '/home',
  meta: {
    title: '首页'
  },
  children: [{
    path: '/home',
    component: () => import('@/views/home/index'),
    name: '首页',
    meta: {
      title: '首页'
    }
  }]
},
{
  path: "/404",
  name: "404",
  component: () => import('@/views/errorPage/404.vue'),
  meta: {
    title: '404',
    noCache: true,
    ac: '/404'
  },
},

]

export default new Router({
  scrollBehavior: () => ({
    y: 0
  }),
  routes: constantRouterMap
})

export const asyncRouterMap = [
  Prodmgt,          // 生产管理
  Salaries,         // 薪资管理
  Projects,         // 总项目管理
  Logisticsquery,   // 物流查询模块 11.4 by aaron
  Ordersystem,      //接单小程序后台路由 11.4 by aaron
  Repairorder,      // 工单系统 
  Asset,            //资产模块
  DataHub,
  Admin,            // 系统管理
  {
    path: "*",      // 此处需特别注意置于最底部
    redirect: "/404"
  }
]
