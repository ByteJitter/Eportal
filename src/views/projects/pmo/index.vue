<!--
 * @Descripttion: pmo管理->PMO项目列表页
 * @Author: Doris
 * @Date: 2019-12-27 16:51:54
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-04-10 14:50:32
 -->
<template>
  <div class="container">
    <search-select :selectLists="itemsList" v-on:search="search" :defaultSelect="defaultSelect">
    </search-select>
    <div class="cont-middle-Bg">
      <v-flex lg12 class="cont-middle">
        <p>PMO</p>
        <p>项目列表</p>
      </v-flex>
      <v-data-table :headers="indexHeader" :items="indexData" class="elevation-1" no-data-text="暂无数据">
        <template v-slot:items="props">
          <td>{{ props.item.number }}</td>
          <td><a :href="props.item.proj_href" target="_blank" class="item-name">{{ props.item.name }}</a></td>
          <td>{{ props.item.expect_close_date.substring(0,10) }}</td>
          <td>{{ props.item.manager && props.item.manager.name }}</td>
          <td>{{ props.item.status_name}}</td>
          <td>{{ props.item.level_name }}</td>
          <td class="text-xs-center">
            <v-btn color="info" dark @click="edit(props.item)" :disabled="props.item.status.startsWith('end-')">编辑</v-btn>
            <v-btn color="info" dark v-show="props.item.status == 'draft' ? false : true " @click="check(props.item)">查看</v-btn>
            <v-btn color="info" dark v-show="props.item.status == 'draft' ? true : false" @click="setting(props.item)">项目设定</v-btn>
          </td>
        </template>
      </v-data-table>
    </div>
  </div>
</template>
<script>
import Common from "@/utils/common";
import SearchSelect from "@/views/projects/components/searchSelect";
import { getSelectData } from "@/utils/project";
export default {
  components: { SearchSelect },
  data() {
    return {
      itemsList: [],
      indexHeader: [
        { text: "项目编号", value: "number", sortable: false },
        { text: "项目名称", value: "name", sortable: false },
        { text: "预定结案日期", value: "expect_close_date", sortable: false },
        { text: "项目经理", value: "manager", sortable: false },
        { text: "项目状态", value: "status", sortable: false },
        { text: "项目等级", value: "level_name", sortable: false },
        { text: "功能", align: "center", value: "function", sortable: false }
      ],
      indexData: [],
      pmoList: [],
      searchParam: {},
      defaultSelect: null
    };
  },
  activated() {
    this.searchConfirm();
  },
  methods: {
    async getDataFromApi(params, type) {
      let { data } = await this.$request.fetch(
        "/api/project/pmo/projectList",
        params
      );
      if (data.status === 200) {
        this.indexData = data.result;
        if (!params) {
          this.itemsList = getSelectData(this.indexData);
        } else if (type === "search") {
          return this.$snackbar().showOk();
        }
      } else {
        if (type === "search") {
          this.$snackbar().showStatus("search", false);
        }
        this.$snackbar().showError("刷新重试");
      }
    },
    search: Common.throttle(async function(param) {
      this.searchParam.item = param.item;
      this.searchParam.value = param.value;
      if (param.item === "all" || param.value === "all") {
        this.getDataFromApi('undefined',"search");
      } else {
        this.getDataFromApi(this.searchParam, "search");
      }
    }),
    async searchConfirm() {
      let { data } = await this.$request.fetch(
        "/api/project/pmo/projectList",
        {}
      );
      if (data.status === 200) {
        this.itemsList = getSelectData(data.result);
      }

      if (this.searchParam.value && this.searchParam.value !== "all") {
        await this.getDataFromApi(this.searchParam);
        if (this.indexData.length === 0) {
          this.searchParam.value = "all";
          this.getDataFromApi();
          this.defaultSelect = this.searchParam;
        }
      } else {
        this.getDataFromApi();
      }
    },
    check(item) {
      this.$router.push({
        path: "editcase",
        query: {
          module: "pmoList",
          proType: item.status,
          id: item._id,
          btnEdit: "check"
        }
      });
    },
    edit(item) {
      // 草稿状态的按钮为 编辑 和 项目设定
      if (item.status === "draft") {
        this.$router.push({
          path: "/projects/projectManagement/addProj",
          query: { id: item._id }
        });
      } else {
        this.$router.push({
          path: "editcase",
          query: {
            module: "pmoList",
            proType: item.status,
            id: item._id
          }
        });
      }
    },
    async setting(item) {
      let { data } = await this.$request.fetch(
        "/api/project/pmo/projectListById",
        { _id: item._id },
        "put"
      );
      if (data.status === 200) {
        item.status = "setting";
        item.status_name = "PMO设定完成";
        if (
          this.searchParam.item === "all" ||
          this.searchParam.value === "all"
        ) {
          this.getDataFromApi();
        } else {
          await this.searchConfirm(this.searchParam);
        }
        this.$snackbar().showOk("项目设定成功");
      } else {
        this.$snackbar().showError("项目设定失败");
      }
    }
  }
};
</script>
<style scoped>
.container {
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
}
.cont-top {
  background: rgba(255, 255, 255, 0.1);
  line-height: 26.4px;
  margin-bottom: 50px;
}
.top-item {
  margin-right: 55px;
}
.cont-middle-Bg {
  padding: 40px 20px 30px;
  margin-bottom: 278.2px;
  box-shadow: 0px 0px 6px 1px #ccc;
  position: relative;
}
.cont-middle {
  background: #e0e1e2;
  border-radius: 10px;
  padding: 10px 20px;
  margin: -65px 0 35px;
}
.cont-middle p {
  margin-bottom: 0px;
}
.cont-middle p:nth-of-type(1) {
  color: #333300;
  font-size: 20px;
  margin-bottom: 5px;
}
.cont-middle p:nth-of-type(1) {
  color: #333333;
  font-size: 15px;
}
.theme--dark.v-btn.v-btn--disabled:not(.v-btn--icon):not(.v-btn--flat):not(.v-btn--outline) {
  background-color: #b9b6b6 !important;
  color: #fff !important;
}
.item-name {
  text-decoration: none;
  color: rgba(0, 0, 0, 0.87);
}
</style>