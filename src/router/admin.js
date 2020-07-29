import Layout from '@/views/Layout/layout';
export default {
  path: '/admin',
  component: Layout,
  name: 'Admin',
  redirect: '/admin/user',
  meta: {
    title: '系统管理',
    icon: 'admin',
    ac: '/admin'
  },
  children: [{
    path: 'companyMg',
    component: () => import('@/views/admin/companyMg'),
    name: '公司管理',
    meta: {
      title: '公司管理',
      noCache: true,
      ac: '/admin/companyMg'
    }
  },
  {
    path: 'branches',
    component: () => import('@/views/admin/branches'),
    name: '分支机构管理',
    meta: {
      title: '分支机构管理',
      noCache: true,
      ac: '/admin/branches'
    }
  },
  {
    path: 'user',
    component: () => import('@/views/admin/userMgmt'),
    name: '用户列表',
    meta: {
      title: '用户管理',
      noCache: true,
      ac: '/admin/user'
    }
  },
  {
    path: 'userrole',
    component: () => import('@/views/admin/roleMgmt'),
    name: '角色权限',
    meta: {
      title: '角色权限管理',
      noCache: true,
      ac: '/admin/role'
    }
  },
  {
    path: 'acl',
    component: () => import('@/views/admin/aclMgmt'),
    name: '路由列表',
    meta: {
      title: '路由列表管理',
      noCache: true,
      ac: '/admin/acl'
    }
  },
  {
    path: 'workCenters',
    component: () => import('@/views/admin/workCenter'),
    name: '打印中心',
    meta: {
      title: '打印中心管理',
      noCache: true,
      ac: '/admin/workCenter'
    }
  },
  {
    path: 'customerMg',
    component: () => import('@/views/admin/customerMg'),
    name: '看板客户管理',
    meta: {
      title: '看板客户管理',
      noCache: true,
      ac: '/admin/customerMg'
    }
  },
  ]
}