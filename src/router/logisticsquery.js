import Layout from '@/views/Layout/layout';
export default {
  path: '/logisticsQuery',
  component: Layout,
  meta: {
    title: '物流管理',
    noCache: true,
    ac: '/logisticsQuery'
  },
  redirect: '/logisticsQuery/enter',
  children: [
    {
      path: 'enter',
      component: () => import('@/views/logisticsQuery/index'),
      name: '快递查询',
      meta: {
        title: '快递查询',
        noCache: true,
        ac: '/logisticsQuery/enter'
      },
    },
    {
      path: 'express',
      component: () => import('@/views/logisticsQuery/express'),
      name: '快递',
      hidden: true,
      meta: {
        title: '快递',
        noCache: true,
        ac: '/logisticsQuery/express'
      },
    },
    {
      path: 'expressInfo',
      component: () => import('@/views/logisticsQuery/expressInfo'),
      name: '快递详情',
      hidden: true,
      meta: {
        title: '快递详情',
        noCache: true,
        ac: '/logisticsQuery/expressInfo'
      },
    }
  ]
}