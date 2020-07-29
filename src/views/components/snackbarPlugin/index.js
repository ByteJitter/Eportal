import SnackBarComponent from './SnackBar.vue';

const SnackBar = {};

SnackBar.install = (Vue, {router})=>{
  const vue = Vue;
  const SnackBarClass = vue.extend(SnackBarComponent);

  const instance = new SnackBarClass();
  instance.$mount(document.createElement('div'));
  document.body.appendChild(instance.$el);

  const showMethods = {
    showOk(titleTip = '搜索成功'){
      instance.show(titleTip, "info");
    },
    showError(titleTip = '获取数据失败，请刷新重试'){
      instance.show(titleTip, "error", 'add_alert');
    },
    showStatus(operate, status = true){
      switch (operate) {
      case 'search':
        status ? this.showOk('搜索成功') : this.showError('搜索失败，请刷新重试');
        break;
      case 'delete':
        status ? this.showOk('删除成功') : this.showError('删除失败，请刷新重试');
        break;
      case 'edit':
        status ? this.showOk('编辑成功') : this.showError('编辑失败，请刷新重试');
        break;
      case 'add':
        status ? this.showOk('新增成功') : this.showError('新增失败，请刷新重试');
        break;
      default:
        break;
      }
    }
  }

  vue.prototype.$snackbar = function (extend){
    router.afterEach(() => {
      if(!extend){
        instance.close();
      }
    })
    return {...showMethods};
  }
  
}

export default SnackBar