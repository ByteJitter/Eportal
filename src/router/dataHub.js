/*
 * @Author: your name
 * @Date: 2020-04-01 14:38:09
 * @LastEditTime: 2020-04-28 11:09:22
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /310的eportal2/eportal/src/router/dataHub.js
 */

import Layout from '@/views/Layout/layout';
export default {
  path: '/dataHub',
  component: Layout,
  redirect: '/dataHub',
  meta: {
    title: '财务分析',
    ac: '/dataHub'
  },
  children: [{
    path: 'dataHub',
    component: () => import('@/views/dataHub/dataHub'),
    name: 'dataHub',
    meta: {
      title: 'dataHub',
      noCache: true,
      ac: '/dataHub/dataHub'
    }
  },
  // {
  //   path: 'pivot',
  //   component: () => import('@/views/dataHub/pivot'),
  //   name: 'pivot',
  //   meta: {
  //     title: 'pivot js',
  //     noCache: true,
  //     ac: '/dataHub/pivot'
  //   }
  // }
  ]
}
