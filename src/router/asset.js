
import Layout from '@/views/Layout/layout'
export default {
  path: '/assetManege',
  component: Layout,
  meta: {
    title: '资产管理',
    noCache: true,
    ac: '/assetManege'
  },
  redirect: '/assetManege/assetBusiness',
  children: [{
    path: 'assetBusiness',
    component: () => import('@/views/asset/assetBusiness'),
    name: '资产类型',
    meta: {
      title: '资产类型',
      noCache: true,
      ac: '/assetManege/assetBusiness'
    },
  },
  {
    path: 'assetAttr',
    component: () => import('@/views/asset/assetAttr'),
    name: '资产属性',
    meta: {
      title: '资产属性',
      noCache: true,
      ac: '/assetManege/assetAttr'
    },
  },
  {
    path: 'assetSubset',
    component: () => import('@/views/asset/assetSubset'),
    name: '资产子集',
    meta: {
      title: '资产子集',
      noCache: true,
      ac: '/assetManege/assetSubset'
    },
  },
  {
    path: 'assetUse',
    component: () => import('@/views/asset/assetUse'),
    name: '资产使用情况',
    meta: {
      title: '资产使用情况',
      noCache: true,
      ac: '/assetManege/assetUse'
    },
  },
  {
    path: 'addAssetUse',
    component: () => import('@/views/asset/addAssetUse'),
    name: '增加资产使用配置',
    hidden: true,
    meta: {
      title: '增加资产使用配置',
      noCache: true,
      ac: '/assetManege/addAssetUse'
    },
  }
  ]
}
