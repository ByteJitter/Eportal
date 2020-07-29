import request from "../../utils/request"

const statusTransform = {
  state: {
    statusList: {},
    currentInfo: {}
  },
  mutations: {
    getStatus: (state, statusList) => {
      state.statusList = statusList;
    },
    getCurrentUserInfo: (state, currentInfo) => {
      state.currentInfo = currentInfo;
    }
  },
  actions: {
    getStatus: async ({
      commit
    }) => {
      let param = {
        thrType: 'projectLevel'
      };
      let {
        data
      } = await request.fetch("/api/thr/getThr", param);
      if (data.status === 200) {
        return commit('getStatus', data.result);
      }
    },
    // 获取当前登录用户信息
    getCurrentUserInfo: async ({
      commit
    }) => {
      let {
        data
      } = await request.fetch("/api/project/projectQueries/getPersonalInfo");
      if (data.status === 200) {
        return commit('getCurrentUserInfo', data.result);
      }
    }
  },

}
export default statusTransform;