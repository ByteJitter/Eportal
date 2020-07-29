import Layout from '@/views/Layout/layout';
export default {
  path: '/repairOrder',
  component: Layout,
  redirect: '/repairOrder/userList',
  meta: {
    title: '工单管理',
    ac: '/repairOrder'
  },
  children: [
    {
      path: 'userList',
      component: () => import('@/views/repairOrder/userList'),
      name: '提交工单',
      meta: { title: '提交工单', noCache: true, ac: '/repairOrder/userList',keepAlive: true }
    },
    {
      path: 'helpDeskIndex',
      component: () => import('@/views/repairOrder/helpDeskIndex'),
      name: 'HelpDesk',
      meta: { title: 'HelpDesk', noCache: true, ac: '/repairOrder/helpDeskIndex',keepAlive: true}
    },
    {
      path: 'addOrder',
      component: () => import('@/views/repairOrder/editOrder'),
      name: '新增工单',
      hidden: true,
      meta: { title: '新增工单', noCache: true, ac: '/repairOrder/addOrder',keepAlive: false}
    },
    {
      path: 'editOrder',
      component: () => import('@/views/repairOrder/editOrder'),
      name: '编辑工单',
      hidden: true,
      meta: { title: '编辑工单', noCache: true, ac: '/repairOrder/editOrder',keepAlive: false}
    },
    {
      path: 'detailOrder',
      component: () => import('@/views/repairOrder/detailOrder'),
      name: '查看工单',
      hidden: true,
      meta: { title: '查看工单', noCache: true, ac: '/repairOrder/detailOrder',keepAlive: false }
    },
    {
      path: 'helpDeskCheckout',
      component: () => import('@/views/repairOrder/helpDeskCheckout'),
      name: 'HelpDesk详情页',
      hidden: true,
      meta: { title: 'HelpDesk详情页', noCache: true, ac: '/repairOrder/helpDeskCheckout',keepAlive: false }
    }
  ]
}