// 状态转换
import store from "../store/index";

async function getStatus() {
  if (Object.keys(store.state.statusTransform.statusList).length > 0) {
    return store.state.statusTransform.statusList;
  }
  await store.dispatch('getStatus');
  return store.state.statusTransform.statusList;
}

async function getCurrentUserInfos() {
  if (Object.keys(store.state.statusTransform.currentInfo).length > 0) {
    return store.state.statusTransform.currentInfo;
  }
  await store.dispatch('getCurrentUserInfo');
  return store.state.statusTransform.currentInfo;
}
export {
  getStatus,
  getCurrentUserInfos
}