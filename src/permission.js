import router from './router';
import store from './store';
import {
  getAccessToken,
  removeAccessToken
} from '@/utils/auth' // getToken from cookie
import axios from 'axios'

const whiteList = ['/login', '/conctWchat','/dingtalk','/conctDingDing'];// no redirect whitelist

router.beforeEach((to, from, next) => {
  if (getAccessToken()) { // determine if there has token
    axios.defaults.headers.common['authorization'] = getAccessToken();
    /* has token*/
    if (to.path === '/login') {
      next({
        path: '/'
      })
    } else {
      if (store.getters.roles.length === 0) {
        // 判断当前用户是否已拉取完user_info信息
        axios.get('/api/userInfo').then(res => {
          // 拉取user_info
          if (res.data.status === 200) {
            // 临时存储一下用户名称，首页topbar展示用，如果后续用vuex 可更改删除
            localStorage.setItem('userName',res.data.result.name)
            const roles = res.data.result.roles_id; // note: roles must be a array! such as: ['editor','develop']
            if (roles && roles.length > 0) { // 验证返回的roles是否是一个非空数组
              store.commit('SET_ROLES', roles)
            } else {
              store.commit('SET_ROLES', ['noRole'])
            }
            let myrole = {
              "myrole": roles
            };

            axios.post('/api/role', myrole).then(res => {

              // 將回傳資料中的acl陣列存入myacl
              let myacl = res.data.result;
              let finall = [];
              myacl.forEach(item => {
                finall.push(item.path)
              });
              if (finall.length > 0) {
                store.dispatch('MyRoutes', finall).then(() => {
                  router.addRoutes(store.getters.addRouters);
                  next({
                    ...to,
                    replace: true
                  })
                })
              } else {
                store.dispatch('MyRoutes', ['norole']).then(() => {
                  router.addRoutes(store.getters.addRouters);
                  next({
                    ...to,
                    replace: true
                  })
                })
              }
            })
          } else if (res.data.status === 505) {
            removeAccessToken();
            next({
              path: '/login'
            })
          }
        }).catch((err) => {
          removeAccessToken();
          next({
            path: '/login'
          })
        })
      } else {
        // 没有分配路由时跳转到404页面
        if (to.matched.length !== 0) {
          next()
        } else {
          next({
            path: '/404'
          })
        }
      }
    }
  } else {
    /* has no token*/
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next()
    } else {
      next('/login') // 否则全部重定向到登录页
    }
  }
});