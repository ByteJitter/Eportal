import Layout from '@/views/Layout/layout'
export default {
  path: '/projects',
  component: Layout,
  meta: {
    title: '总项目管理',
    noCache: true,
    ac: '/projects'
  },
  redirect: '/projects/projectManagement/projectList',
  children: [{
    path: '/projects/pmo',
    meta: {
      title: 'PMO管理',
      noCache: true,
      ac: '/pmo'
    },
    component: () => import("@/views/projects/index/index"),
    redirect: '/projects/pmo/index',
    children: [{
      //  项目列表
      path: 'index',
      component: () => import('@/views/projects/pmo/index'),
      name: 'PMO项目列表',
      meta: {
        title: 'PMO项目列表',
        noCache: true,
        ac: '/pmo/index',
        keepAlive: true
      },
    },
    {
      //  项目查看编辑
      path: 'editcase',
      component: () => import('@/views/projects/pmo/editCase.vue'),
      name: 'PMO项目查看/编辑',
      hidden: true,
      meta: {
        title: 'PMO项目查看/编辑',
        noCache: true,
        ac: '/pmo/editcase',
        keepAlive: false
      },
    },
    {
      //  申请单
      path: 'applyform',
      component: () => import('@/views/projects/pmo/applyForm.vue'),
      name: 'PMO结案申请单',
      meta: {
        title: 'PMO结案申请单',
        noCache: true,
        ac: '/pmo/applyform',
        keepAlive: true
      },
    },
    {
      //  查看申请单
      path: 'applyformdetail',
      component: () => import('@/views/projects/pmo/applyFormDetail.vue'),
      name: 'PMO结案申请单详情',
      hidden: true,
      meta: {
        title: 'PMO结案申请单详情',
        noCache: true,
        ac: '/pmo/applyformdetail',
        keepAlive: false
      },
    },
    {
      //  点数发放申请单
      path: 'grantappform',
      component: () => import('@/views/projects/pmo/grantApplyForm.vue'),
      name: 'PMO发放点数申请单',
      meta: {
        title: 'PMO发放点数申请单',
        noCache: true,
        ac: '/pmo/grantappform',
        keepAlive: true
      },
    },
    {
      //  查看点数发放申请单
      path: 'grantappformdetail',
      component: () => import('@/views/projects/pmo/grantApplyFormDetail.vue'),
      name: 'PMO发放点数申请单详情',
      hidden: true,
      meta: {
        title: 'PMO发放点数申请单详情',
        noCache: true,
        ac: '/pmo/grantappformdetail',
        keepAlive: false
      },
    },
    {
      //  三年扣点，点数结算锁定界面 aaron add
      path: 'pointlockdelete',
      component: () => import('@/views/projects/pmo/lockDelete.vue'),
      name: 'PMO结算扣点',
      hidden: false,
      meta: {
        title: 'PMO结算扣点',
        noCache: true,
        ac: '/pmo/pointlockdelete'
      }
    },
    {
      // 点数导出统计
      path: 'exportCredits',
      component: () => import('@/views/projects/pmo/exportCredits.vue'),
      name: 'PMO导出点数统计',
      meta: {
        title: 'PMO导出点数统计',
        noCache: true,
        ac: '/pmo/exportCredits'
      }
    }
    ]
  },
  {
    path: '/projects/projectManagement',
    meta: {
      title: '项目管理',
      noCache: true,
      ac: '/projectManagement',
      keepAlive: false
    },
    component: () => import("@/views/projects/index/index"),
    redirect: '/projects/projectManagement/projectList',
    children: [{
      path: 'projectList',
      component: () => import('@/views/projects/projectManagement/projectList'),
      name: '项目列表',
      meta: {
        title: '项目列表',
        noCache: true,
        ac: '/projectManagement/projectList',
        keepAlive: false
      }
    },
    // {
    //   path: 'projectList/checkout',
    //   component: () => import('@/views/projects/projectManagement/checkout'),
    //   name: '项目查看',
    //   hidden: true,
    //   meta: {
    //     title: '项目查看',
    //     noCache: true,
    //     ac: '/projectManagement/projectList/checkout'
    //   },
    // },
    {
      path: 'myProject',
      component: () => import('@/views/projects/projectManagement/myProject'),
      name: '我的项目',
      meta: {
        title: '我的项目',
        noCache: true,
        ac: '/projectManagement/myProject',
        keepAlive: true
      },
    },
    {
      //  新增项目
      path: 'addproj',
      component: () => import('@/views/projects/projectManagement/addProj'),
      name: 'PM新增项目',
      hidden: true,
      meta: {
        title: 'PM新增项目',
        noCache: true,
        ac: '/projectManagement/addproj',
        keepAlive: false
      },
    },
    {
      path: 'myProject/manage',
      component: () => import('@/views/projects/projectManagement/manage'),
      name: '我的项目详情',
      hidden: true,
      meta: {
        title: '我的项目详情',
        noCache: true,
        ac: '/projectManagement/myProject/manage'
      },
    },
      // {
      //   path: 'myProject/checkout',
      //   component: () => import('@/views/projects/projectManagement/checkout'),
      //   name: '项目查看',
      //   hidden: true,
      //   meta: {
      //     title: '项目查看',
      //     noCache: true,
      //     ac: '/projectManagement/myProject/checkout'
      //   },
      // },
    ]
  },
  {
    path: '/projects/projectQueries',
    meta: {
      title: '项目查询',
      noCache: true,
      ac: '/projectQueries',
      keepAlive: false
    },
    component: () => import("@/views/projects/index/index"),
    redirect: '/projects/projectQueries/rankingList',
    children: [{
      path: 'rankingList',
      component: () => import('@/views/projects/projectQueries/rankingList'),
      name: '勋章排行榜',
      meta: {
        title: '勋章排行榜',
        noCache: true,
        ac: '/projectQueries/rankingList'
      },
    },
    {
      path: 'companyReward',
      component: () => import('@/views/projects/projectQueries/companyReward'),
      name: '公司奖金发放',
      meta: {
        title: '公司奖金发放',
        noCache: true,
        ac: '/projectQueries/companyReward'
      },
    },
    {
      path: 'companyRewardNoEdit',
      component: () => import('@/views/projects/projectQueries/companyRewardNoEdit'),
      name: '公司奖金发放_员工',
      meta: {
        title: '公司奖金发放_员工',
        noCache: true,
        ac: '/projectQueries/companyRewardNoEdit'
      },
    },
    {
      path: 'personalHomePage',
      component: () => import('@/views/projects/projectQueries/personalHomePage'),
      name: '个人主页',
      meta: {
        title: '个人主页',
        noCache: true,
        ac: '/projectQueries/personalHomePage'
      }
    },
    {
      path: 'companyRecord',
      component: () => import('@/views/projects/projectQueries/companyMedalRecord'),
      name: '公司勋章记录 ',
      meta: {
        title: '公司勋章记录',
        noCache: true,
        ac: '/projectQueries/companyMedalRecord'
      },
    },
    {
      path: 'levelTable',
      component: () => import('@/views/projects/projectQueries/levelTable'),
      name: '勋章等级对照表',
      meta: {
        title: '勋章等级对照表',
        noCache: true,
        ac: '/projectQueries/levelTable'
      },
    }
    ]
  }
  ]
}