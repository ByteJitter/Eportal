import Layout from '@/views/Layout/layout'
export default {
  path: '/salaries',
  component: Layout,
  redirect: '/salaries/ClassifyManagement',
  meta: {
    title: '总薪资管理',
    noCache: true,
    ac: '/salaries'
  },
  children: [
    {
      path: '/salaries/ClassifyManagement',
      meta: {
        title: '类别管理',
        noCache: true,
        ac: '/ClassifyManagement'
      },
      component: () => import("@/views/salaries/index/index"),
      redirect: '/salaries/ClassifyManagement/ClassifyManagement',
      children: [{
        path: 'ClassifyManagement',
        component: () => import('@/views/salaries/classify/ClassifyManagement'),
        name: '分类管理',
        meta: {
          title: '分类管理',
          noCache: true,
          ac: '/ClassifyManagement/ClassifyManagement'
        }
      },
      {
        path: 'rankManagement',
        component: () => import('@/views/salaries/classify/rankManagement'),
        name: '等级管理',
        meta: {
          title: '等级管理',
          noCache: true,
          ac: '/ClassifyManagement/rankManagement'
        }
      },
      {
        path: 'gradeManagement',
        component: () => import('@/views/salaries/classify/gradeManagement'),
        name: '级别管理',
        meta: {
          title: '级别管理',
          noCache: true,
          ac: '/ClassifyManagement/gradeManagement'
        }
      },
      {
        path: 'adjustTypeManagement',
        component: () => import('@/views/salaries/classify/adjustTypeManagement'),
        name: '特殊调整类型管理',
        meta: {
          title: '特殊调整类型管理',
          noCache: true,
          ac: '/ClassifyManagement/adjustTypeManagement'
        }
      },
      ]
    },
    {
      path: '/salaries/salaryManagement',
      meta: {
        title: '薪资管理',
        noCache: true,
        ac: '/salaryManagement'
      },
      component: () => import("@/views/salaries/index/index"),
      redirect: "/salaries/salaryManagement/baseSalary",
      children: [{
        path: 'baseSalary',
        component: () => import('@/views/salaries/salaryManagement/baseSalary'),
        name: '基本薪资',
        meta: {
          title: '基本薪资',
          noCache: true,
          ac: '/salaryManagement/baseSalary'
        }
      },
      {
        path: 'supply',
        component: () => import('@/views/salaries/salaryManagement/supply'),
        name: '每月加给',
        meta: {
          title: '每月加给',
          noCache: true,
          ac: '/salaryManagement/supply'
        }
      }
      ]
    },
    {
      path: '/salaries/department',
      meta: {
        title: '部门管理',
        noCache: true,
        ac: '/department'
      },
      component: () => import("@/views/salaries/index/index"),
      redirect: "/salaries/department/department",
      children: [{
        path: 'department',
        component: () => import('@/views/salaries/department/department'),
        name: '部门信息',
        meta: {
          title: '部门信息',
          noCache: true,
          ac: '/department/department'
        }
      }]
    },
    {
      path: '/salaries/EmployeeManagement',
      meta: {
        title: '员工管理',
        noCache: true,
        ac: '/EmployeeManagement'
      },
      component: () => import("@/views/salaries/index/index"),
      redirect: '/salaries/EmployeeManagement/Employee',
      children: [{
        path: 'Employee',
        component: () => import('@/views/salaries/EmployeeManagement/Employee'),
        name: '员工信息',
        meta: {
          title: '员工信息',
          noCache: true,
          ac: '/EmployeeManagement/Employee'
        },
      },
      {
        path: 'valueIndex',
        component: () => import('@/views/salaries/EmployeeManagement/valueIndex'),
        name: 'valueIndex计算',
        meta: {
          title: 'valueIndex计算',
          noCache: true,
          ac: '/EmployeeManagement/valueIndex'
        },
      },
      {
        path: 'detailEmployee',
        component: () => import('@/views/salaries/EmployeeManagement/detailEmployee'),
        name: 'detailEmployee',
        hidden: true,
        meta: {
          title: '员工信息详情',
          noCache: true,
          ac: '/EmployeeManagement/detailEmployee'
        },
      },
      {
        path: 'addEmployee',
        component: () => import('@/views/salaries/EmployeeManagement/addEmployee'),
        name: 'addEmployee',
        hidden: true,
        meta: {
          title: '添加员工信息',
          noCache: true,
          ac: '/EmployeeManagement/addEmployee'
        }
      }
      ]
    },
    {
      path: '/salaries/Salary_structure',
      meta: {
        title: '奖金管理',
        noCache: true,
        ac: '/Salary_structure'
      },
      component: () => import("@/views/salaries/index/index"),
      redirect: "/salaries/Salary_structure/performance_employee",
      children: [{
        path: 'performance_employee',
        component: () => import('@/views/salaries/Salary_structure/performance_employee'),
        name: '绩效管理_员工',
        meta: {
          title: '绩效管理_员工',
          noCache: true,
          ac: '/Salary_structure/performance_employee'
        },
      },
      {
        path: 'shareBonus_employee',
        component: () => import('@/views/salaries/Salary_structure/shareBonus_employee'),
        name: '分红管理_员工',
        meta: {
          title: '分红管理_员工',
          noCache: true,
          ac: '/Salary_structure/shareBonus_employee'
        },
      },
      {
        path: 'stockManagement_employee',
        component: () => import('@/views/salaries/Salary_structure/stockManagement_employee'),
        name: '股票管理_员工',
        meta: {
          title: '股票管理_员工',
          noCache: true,
          ac: '/Salary_structure/stockManagement_employee'
        },
      },
      {
        path: 'bonusPool',
        component: () => import('@/views/salaries/Salary_structure/bonusPool'),
        name: '奖金池管理',
        meta: {
          title: '奖金池管理',
          noCache: true,
          ac: '/Salary_structure/bonusPool'
        }
      },
      {
        path: 'bonusCalculation',
        component: () => import('@/views/salaries/Salary_structure/bonusCalculation'),
        name: '奖金计算',
        meta: {
          title: '奖金计算',
          noCache: true,
          ac: '/Salary_structure/bonusCalculation'
        },
      },
      {
        path: 'departmentMoment',
        component: () => import('@/views/salaries/Salary_structure/departmentMoment'),
        name: '部门员工待发奖金档',
        meta: {
          title: '部门员工待发奖金档',
          noCache: true,
          ac: '/Salary_structure/departmentMoment'
        },
      },
      {
        path: 'deMoment',
        component: () => import('@/views/salaries/Salary_structure/deMoment'),
        name: '员工待发奖金档',
        meta: {
          title: '员工待发奖金档',
          noCache: true,
          ac: '/Salary_structure/deMoment'
        },
      },
      {
        path: 'hrDepartMoment',
        component: () => import('@/views/salaries/Salary_structure/hrDepartMoment'),
        name: '员工待发奖金档(HR)',
        meta: {
          title: '员工待发奖金档（HR）',
          noCache: true,
          ac: '/Salary_structure/hrDepartMoment'
        },
      },
      {
        path: 'stockManagement',
        component: () => import('@/views/salaries/Salary_structure/stockManagement'),
        name: '股票管理',
        meta: {
          title: '股票管理',
          noCache: true,
          ac: '/Salary_structure/stockManagement'
        },
      },
      {
        path: 'perforMance',
        component: () => import('@/views/salaries/Salary_structure/perforMance'),
        name: '绩效管理',
        meta: {
          title: '绩效管理',
          noCache: true,
          ac: '/Salary_structure/perforMance'
        },
      },
      {
        path: 'shareBonus',
        component: () => import('@/views/salaries/Salary_structure/shareBonus'),
        name: '分红管理',
        meta: {
          title: '分红管理',
          noCache: true,
          ac: '/Salary_structure/shareBonus'
        },
      },
      {
        path: 'bonusTotal',
        component: () => import('@/views/salaries/payslipManagement/bonusTotal'),
        name: '奖金合计',
        meta: {
          title: '奖金合计',
          noCache: true,
          ac: '/payslipManagement/bonusTotal'
        },
      },
      // {
      //   path: 'departmentDetail',
      //   component: () => import('@/views/salaries/Salary_structure/departmentDetail'),
      //   name: '双薪待发奖金档详细内容',
      //   hidden: true,
      //   meta: {
      //     title: '双薪待发奖金档详细内容',
      //     noCache: true,
      //     ac: '/Salary_structure/departmentDetail'
      //   },
      // },
      // {
      //   path: 'departmentShare',
      //   component: () => import('@/views/salaries/Salary_structure/departmentShare'),
      //   name: '分红待发奖金档详细内容',
      //   hidden: true,
      //   meta: {
      //     title: '分红待发奖金档详细内容',
      //     noCache: true,
      //     ac: '/Salary_structure/departmentShare'
      //   },
      // },
      {
        path: 'departmentPerfor',
        component: () => import('@/views/salaries/Salary_structure/departmentPerfor'),
        name: '绩效待发奖金档详细内容',
        hidden: true,
        meta: {
          title: '绩效待发奖金档详细内容',
          noCache: true,
          ac: '/Salary_structure/departmentPerfor'
        },
      },
      {
        path: 'checkStock',
        component: () => import('@/views/salaries/Salary_structure/checkStock'),
        name: '查看股票管理的详细内容',
        hidden: true,
        meta: {
          title: '查看股票管理的详细内容',
          noCache: true,
          ac: '/Salary_structure/checkStock'
        },
      },
      {
        path: 'checkPerfor',
        component: () => import('@/views/salaries/Salary_structure/checkPerfor'),
        name: '查看绩效管理的详细内容',
        hidden: true,
        meta: {
          title: '查看绩效管理的详细内容',
          noCache: true,
          ac: '/Salary_structure/checkPerfor'
        },
      },
      // {
      //   path: 'shareRecord',
      //   component: () => import('@/views/salaries/Salary_structure/shareRecord'),
      //   name: '查看分红管理的详细内容',
      //   hidden: true,
      //   meta: {
      //     title: '查看分红管理的详细内容',
      //     noCache: true,
      //     ac: '/Salary_structure/shareRecord'
      //   },
      // }
      ]
    },
    {
      path: '/salaries/payslipManagement',
      meta: {
        title: '薪资单管理',
        noCache: true,
        ac: '/payslipManagement'
      },
      component: () => import("@/views/salaries/index/index"),
      redirect: "/salaries/payslipManagement/salaryStructure",
      children: [{
        path: 'salaryStructure',
        component: () => import('@/views/salaries/payslipManagement/salaryStructure'),
        name: '员工薪资结构',
        meta: {
          title: '员工薪资结构',
          noCache: true,
          ac: '/payslipManagement/salaryStructure'
        },
      },
      {
        path: 'createPayslips',
        component: () => import('@/views/salaries/payslipManagement/createPayslips'),
        name: '生成薪资单',
        meta: {
          title: '生成薪资单',
          noCache: true,
          ac: '/payslipManagement/createPayslips'
        },
      },
      {
        path: 'employeePayslips',
        component: () => import('@/views/salaries/payslipManagement/employeePayslips'),
        name: '员工薪资单',
        meta: {
          title: '员工薪资单',
          noCache: true,
          ac: '/payslipManagement/employeePayslips'
        },
      },
      {
        path: 'personalPayslip',
        component: () => import('@/views/salaries/payslipManagement/personalPayslip'),
        name: '员工个人薪资单',
        meta: {
          title: '员工个人薪资单',
          noCache: true,
          ac: '/payslipManagement/personalPayslip'
        },
      },
      {
        path: 'departmentPayslips',
        component: () => import('@/views/salaries/payslipManagement/departmentPayslips'),
        name: '部门员工薪资单',
        meta: {
          title: '部门员工薪资单',
          noCache: true,
          ac: '/payslipManagement/departmentPayslips'
        },
      },
      {
        path: 'payOut',
        component: () => import('@/views/salaries/payslipManagement/payOut'),
        name: '员工薪资发放',
        meta: {
          title: '员工薪资发放',
          noCache: true,
          ac: '/payslipManagement/payOut'
        },
      },
      {
        path: 'payslipRollback',
        component: () => import('@/views/salaries/payslipManagement/payslipRollback'),
        name: '薪资单回退',
        meta: {
          title: '薪资单回退',
          noCache: true,
          ac: '/payslipManagement/payslipRollback'
        },
      },
      {
        path: 'batchedOperation',
        component: () => import('@/views/salaries/payslipManagement/batchedOperation'),
        name: '批量操作',
        meta: {
          title: '批量操作',
          noCache: true,
          ac: '/payslipManagement/batchedOperation'
        },
      },
      {
        path: 'managePayslipDetail',
        component: () => import('@/views/salaries/payslipManagement/managePayslipDetail'),
        name: '薪资单管理详情',
        hidden: true,
        meta: {
          title: '薪资单管理详情',
          noCache: true,
          ac: '/payslipManagement/managePayslipDetail'
        },
      },
      {
        path: 'createPayslipDetail',
        hidden: true,
        component: () => import('@/views/salaries/payslipManagement/createPayslipDetail'),
        name: '生成薪资单详情',
        meta: {
          title: '生成薪资单详情',
          noCache: true,
          ac: '/payslipManagement/createPayslipDetail'
        },
      },
      ]
    }
  ]
}