## 页面提示信息用法详解

页面提示信息 `snackbar` 的用法：

页面中不需要再引入 Snackbar 组件，之前页面中有引入的可以删掉。使用的时候直接在页面的 js 模块通过 `this.$snackbar().xxx` 调用即可。

### $snackbar() 的参数

- 默认可不传参：即切换页面的时候，提示框会关闭。`this.$snackbar().showStatus('search', true)`

- 传入 `extend` 字符串参数：切换页面的时候，提示框仍然显示，主要用于跨页面提示信息。`this.$snackbar('extend').showStatus('edit', false)`

### snackbar 的主要方法

- `showOk(msg)`：传入字符串，用于显示正常信息。

- `showError(msg)`：传入字符串，用于显示错误信息。

- `showStatus(operate, status)`：为保证各个模块各个操作下的 snackbar 提示文字统一化，页面基本 CRUD 操作的提示应调用组件中的`showStatus()`方法，传入操作名和是否成功两个参数。

    - `operate`：字符串形式，`search`、`delete`、`edit`、`add`。

    - `status`：布尔值类型，`true`（默认，成功） / `false`（失败）