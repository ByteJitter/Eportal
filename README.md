<!--
 * @Author: your name
 * @Date: 2019-11-28 17:27:59
 * @LastEditTime: 2019-11-29 08:50:48
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edi
 * @FilePath: /eportal/README.md
 -->
# eportal

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```


### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Meeting record link

[会议记录](https://git.belstar.com.cn/bel-star/mis/rd/payslip/blob/master/%E9%98%B6%E6%AE%B5%E5%8F%8A%E4%BC%9A%E8%AE%AE%E8%AE%B0%E5%BD%95.md)

### 编码规范

1. 文件名使用小驼峰命名。

2. html 标签、属性名应全部 **小写**，不要大写。属性值全部使用 `""` 双引号，不要使用 `''` 单引号。

3. `class` 属性值一律使用 **小写英文字母** 和 **-** 命名。

4. 变量命名：js 中的变量和函数一律使用 **小驼峰命名法**。

5. `import` 引入模块命名一律使用 **大驼峰命名法**，首字母大写。

6. js 中字符串使用 **' '** 单引号；有变量或需要换行的时候，使用 **``** 反单引号。

[*参考链接 - Airbnb JavaScript Style Guide*](https://github.com/airbnb/javascript)

### API 请求

1. 请求接口数据使用 `this.$request.fetch()` 调用 `src -> utils -> request.js` 中的 `fetch` 方法。

2. 表单数据要有验证。

3. 接口返回数据要有 `status` 判断。`if` 里没有 `return`，必须有 `else`。

4. 每个页面渲染时（`mounted`）同时请求的接口数量尽量不要超过 3 个。

### 页面

1. 按照 `vue` 生命周期钩子函数的顺序写 js，先 `vue` 的钩子函数，最后写 `methods`。

2. 每个页面 `data` 的数量最好不要超过 `15` 个。

3. `methods` 里的方法要善于提取，最好一个函数只干一件事。

4. 不要保存 `this` 的引用，使用箭头函数或硬绑定 `call` 或 `apply`。

5. html 中不要嵌套 js 语法，主要是在点击事件时，即使只有一行代码也要定义在 `methods` 中。

6. html 中点击事件传参，尽量传下标，不要传整条数据。但由于 `vuetify` 的表格组件一旦翻页，下标就从 `0` 开始，因此，本项目中可传递 `item` 整条数据。

7. 引用尽量不要使用相对路径，vue 中 `@/` 代表 `src/`，关于 `src/` 内文件的引用都用 `@/` 代替。

### 组件

1. 页面提示信息，用法详见 `src/views/components/snackbarPlugin/README.md` 文档。

2. 确认删除弹框，使用组件`src -> views -> components -> confirmDialog.vue` 中的方法。

### 业务

1. 业务中的所有状态统一调用后端阈值表。
