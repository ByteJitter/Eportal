import Layout from '@/views/Layout/layout';
export default {
  path: '/prodMgt',
  component: Layout,
  redirect: '/prodMgt/machineList',
  meta: {
    title: '生产管理',
    ac: '/prodMgt'
  },
  children: [{
    path: 'machineList',
    component: () => import('@/views/prodMgt/productionManagement'),
    name: '打印机器列表',
    meta: {
      title: '机器管理',
      noCache: true,
      ac: '/prodMgt/machineList'
    }
  },
  {
    path: 'recordhistory',
    component: () => import('@/views/prodMgt/productionHistory'),
    name: '工作量历史记录',
    meta: {
      title: '工作量历史记录',
      noCache: true,
      ac: '/prodMgt/recordhistory'
    }
  },
  {
    path: 'situcationBoard',
    component: () => import('@/views/prodMgt/situcationBoard'),
    name: '战情看板',
    meta: {
      title: '战情看板',
      noCache: true,
      ac: '/prodMgt/situcationBoard'
    },
  }
  ]
}
