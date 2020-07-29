<!--
 * @Descripttion: 项目管理->项目列表页
 * @Author: Doris
 * @Date: 2019-12-27 17:08:24
 * @LastEditors: Doris
 * @LastEditTime: 2020-03-11 09:42:06
 -->
<template>
  <div>
    <v-container fluid grid-list-xl>
      <search-select :select-lists="selectLists" @search="search"></search-select>
      <v-layout wrap align-center>
        <v-flex md d-flex>
          <div class="table-title">
            <v-flex class="table-titleFlex">
              <div class="xmgl">项目管理</div>
              <div class="xmlb">项目列表</div>
            </v-flex>
            <div class="table">
              <v-data-table :headers="projectListHeader" :items="projectListData" class="elevation-1" no-data-text="暂无数据">
                <template v-slot:items="props">
                  <td>{{ props.item.number}}</td>
                  <td style="cursor: pointer" @click="getProjectUrl(props.item.proj_href)">{{ props.item.name }}</td>
                  <td>{{ props.item.expect_close_date.substring(0,10) }}</td>
                  <td>{{ props.item.manager && props.item.manager.name}}</td>
                  <td>{{ props.item.status_name}}</td>
                  <td>{{ props.item.level_name}}</td>
                  <td class="text-xs-center">
                    <v-btn small color="info" @click="lookFunction(props.item,'look')">查看</v-btn>
                  </td>
                </template>
              </v-data-table>
            </div>
          </div>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>
<script>

import searchSelect from "../components/searchSelect";
import {getSelectData} from "../../../utils/project";

export default {
  name: "projectList",
  components:{
    "search-select" : searchSelect
  },
  data() {
    return {
      selectLists:[],
      select: '',
      select2 : '',
      projectListHeader: [
        { text: "项目编号", align: "left" },
        { text: "项目名称" },
        { text: "预计结案日期" },
        { text: "项目经理" },
        { text: "项目状态" },
        { text: "项目等级" },
        { text: "功能", align: "center", sortable: false }
      ],
      projectListData: []
    };
  },
  async mounted() {
    let res = await this.getProjectList();
    if (res.data.status === 200) {
      this.projectListData = res.data.result;
      this.selectLists = getSelectData(this.projectListData);
    } else {
      this.$snackbar().showError("刷新重试");
    }
  },
  methods: {
    async getProjectList() {
      return await this.$request.fetch("/api/projectManagement/projectList", {
        item1: this.selected,
        item2: this.selected2
      });
    },
    async search (data){
      this.selected = data.item;
      this.selected2 = data.value;
      let res = await this.getProjectList();
      if (res.data.status === 200) {
        this.projectListData = res.data.result;
        this.$snackbar().showOk("搜索成功")
      } else {
        this.$snackbar().showError("搜索失败")
      }
    },
    lookFunction(item,flag) {
      this.$router.push({
        path: "/projects/projectManagement/myProject/manage",
        query: {
          module: "projectList",
          proType: item.status,
          id: item._id,
          flag: flag
        }
      });
    },
    async getProjectUrl(url) {
      window.open(url,"_blank");
    }
  }
};
</script>
<style scoped>
.container {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  width: 100%;
  padding-bottom: 150px;
}
.table-title {
  background: #ffffff;
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.5);
  margin-top: 20px;
  padding: 40px 20px 45px 20px;
  position: relative;
}
.table-titleFlex {
  background: #e0e1e2;
  border-radius: 10px;
  padding: 10px 20px;
  margin: -65px 0 35px;
}
.xmgl {
  font-family: PingFangSC-Regular;
  font-size: 20px;
  color: #333300;
  padding-left: 18px;
  padding-top: 8px;
}
.xmlb {
  font-family: PingFangSC-Regular;
  font-size: 15px;
  color: #333333;
  letter-spacing: 4px;
  padding-left: 18px;
}
.table {
  background: #ffffff;
  box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.5);
}
</style>