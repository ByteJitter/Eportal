import Layout from '@/views/Layout/layout'
export default {
  path: '/orderSystem',
  name: "接单管理",
  component: Layout,
  meta: {
    title: '接单管理',
    noCache: true,
    ac: '/orderStystem'
  },
  redirect: "/orderStystem/Order",
  children: [{
    path: '/orderStystem/Order',
    name: '订单管理',
    meta: {
      title: '订单管理',
      noCache: true,
      ac: '/orderStystem/Order'
    },
    component: () => import("@/views/order/index/index"),
    redirect: '/orderStystem/Order/allorders',
    children: [{
      path: '/orderStystem/Order/allorders',
      name: '所有订单',
      component: () => import("@/views/order/allOrder"),
      meta: {
        title: '所有订单',
        noCache: true,
        ac: '/orderStystem/Order/allorders',
        keepAlive: true
      },
    },
    {
      path: '/orderStystem/Order/orderDetail',
      name: '订单详情',
      component: () => import("@/views/order/orderDetail"),
      meta: {
        title: '订单详情',
        noCache: true,
        ac: '/orderStystem/Order/orderDetail',
        keepAlive: false
      },
      hidden: true
    },
    {
      path: '/orderStystem/Order/logisticsMange',
      name: '订单物流管理',
      component: () => import("@/views/order/logisticsMange"),
      meta: {
        title: '订单物流管理',
        noCache: true,
        ac: '/orderStystem/Order/logisticsMange',
        keepAlive: true
      },
    },
    ]
  },
  {
    path: '/orderStystem/product',
    name: "产品管理",
    meta: {
      title: '产品管理',
      noCache: true,
      ac: '/orderStystem/product'
    },
    component: () => import("@/views/order/index/index"),
    redirect: "/orderStystem/product/subproduct",
    children: [{
      path: '/orderStystem/product/addProduct',
      component: () => import('@/views/order/addProduct'),
      name: '产品详情',
      hidden: true,
      meta: {
        title: '产品详情',
        noCache: true,
        ac: '/orderStystem/product/addProduct',
        keepAlive: false
      },
    },
    {
      path: '/orderStystem/product/subproduct',
      component: () => import('@/views/order/product'),
      name: '产品列表',
      meta: {
        title: '产品列表',
        noCache: true,
        ac: '/orderStystem/product/subproduct',
        keepAlive: true
      },
    }
    ]
  },
  {
    path: '/orderStystem/customerManage',
    name: "客户管理",
    component: Layout,
    component: () => import('@/views/order/customerManage'),
    meta: {
      title: '客户管理',
      noCache: true,
      ac: '/orderStystem/customerManage'
    }
  },
  {
    path: '/orderStystem/invoice',
    name: "发票管理",
    component: Layout,
    component: () => import('@/views/order/invoice'),
    meta: {
      title: '发票管理',
      noCache: true,
      ac: '/orderStystem/invoice'
    },
  },
  {
    path: '/orderStystem/feedback',
    name: "意见反馈",
    component: Layout,
    component: () => import('@/views/order/feedback'),
    meta: {
      title: '意见反馈',
      noCache: true,
      ac: '/orderStystem/feedback'
    },
  }
  ]
}