<!--
 * @Descripttion: pmo管理->PMO结案申请单列表页
 * @Author: Doris
 * @Date: 2019-12-27 16:51:54
 * @LastEditors: Doris
 * @LastEditTime: 2020-03-11 09:26:10
 -->
<template>
  <div class="container">
    <search-select :selectLists="itemsList" :defaultSelect="defaultSelect"
      v-on:search="search($event)"></search-select>

    <div class="cont-middle-Bg">
      <v-flex lg12 class="cont-middle">
        <p>PMO</p>
        <p>结案申请单</p>
      </v-flex>
      <v-data-table :headers="applyFormHeader" :items="applyFormData" class="elevation-1"
        no-data-text="暂无数据">
        <template v-slot:items="props">
          <td>{{ props.item.number }}</td>
          <td>{{ props.item.name }}</td>
          <td>{{ props.item.expect_close_date.substring(0,10) }}</td>
          <td>{{ props.item.manager && props.item.manager.name }}</td>
          <td>{{ props.item.level_name }}</td>
          <td class="text-xs-center">
            <v-btn color="info" dark @click="check(props.item)">查看</v-btn>
          </td>
        </template>
      </v-data-table>
    </div>
  </div>
</template>
<script>
import Common from "@/utils/common";
import SearchSelect from "../components/searchSelect";
import { getSelectData } from "@/utils/project";

export default {
  components: {
    SearchSelect
  },
  data() {
    return {
      itemsList: [],
      defaultSelect: null,
      applyFormData: [],
      applyFormHeader: [
        { text: "项目编号", value: "number", sortable: false },
        { text: "项目名称", value: "name", sortable: false },
        { text: "预定结案日期", value: "expect_close_date", sortable: false },
        { text: "项目经理", value: "manager", sortable: false },
        { text: "项目等级", value: "level", sortable: false },
        {
          text: "功能",
          align: "center",
          value: "function",
          sortable: false,
          width: "260px"
        }
      ],
      searchParam: {}
    };
  },
  activated() {
    this.judge();
  },
  methods: {
    search: Common.throttle(async function(param) {
      this.searchParam.item = param.item;
      this.searchParam.value = param.value;

      if (param.item === "all" || param.value === "all") {
        this.getApplyForm({}, "search");
      } else {
        this.getApplyForm(this.searchParam, "search");
      }
    }),
    check(item) {
      this.$router.push({
        path: "applyformdetail",
        query: {
          id: item._id
        }
      });
    },
    async getApplyForm(param, type) {
      let res = await this.$request.fetch(
        "/api/project/pmo/applyCompleteSelect",
        param
      );
      if (res.data.status === 200) {
        this.applyFormData = res.data.result;

        if (!param) {
          this.itemsList = getSelectData(this.applyFormData);
          this.itemsList.splice(3, 1);
        } else if (type === "search") {
          return this.$snackbar().showStatus("search");
        }
      } else {
        if (type === "search") {
          this.$snackbar().showStatus("search", false);
        }
        this.$snackbar().showError("刷新重试");
      }
    },
    async judge() {
      if (this.searchParam.value && this.searchParam.value !== "all") {
        await this.getApplyForm(this.searchParam);

        if (this.applyFormData.length === 0) {
          this.searchParam.value = "all";
          this.getApplyForm();
          this.defaultSelect = this.searchParam;
        }
      } else {
        this.getApplyForm();
      }
    }
  }
};
</script>
<style scoped>
.container {
  width: 100%;
  height: 100%;
  position: relative;
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
  margin-top: 50px;
  margin-bottom: 78.2px;
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
</style>