<!--
 * @Descripttion: pmo管理->PMO点数发放申请单列表页
 * @Author: Doris
 * @Date: 2019-12-27 16:51:54
 * @LastEditors: Doris
 * @LastEditTime: 2020-03-11 09:32:25
 -->
<template>
  <div class="container">
    <search-select :selectLists="selectLists" :defaultSelect="defaultSelect"
      v-on:search="search($event)"></search-select>

    <div class="cont-middle-Bg">
      <v-flex lg12 class="cont-middle">
        <p>PMO</p>
        <p>点数发放申请单</p>
      </v-flex>
      <v-data-table :headers="applyFormHeader" :items="applyFormData" class="elevation-1"
        no-data-text="暂无数据">
        <template v-slot:items="props">
          <td>{{ props.item.project_id.number }}</td>
          <td>{{ props.item.project_id.name }}</td>
          <td>{{ props.item.project_id.status_name}}</td>
          <td>{{ props.item.project_id.expect_close_date.substring(0,10) }}</td>
          <td>{{ props.item.applyStatus_name }}</td>
          <td>{{ props.item.project_id.manager.name }}</td>
          <td>{{ props.item.project_id.level_name }}</td>
          <td class="text-xs-center" id="belong-year-btn">
            <v-btn flat small @click="updateBelongYear(props.item)"
              v-if="props.item.status=='resolve'">
              {{props.item.belong_year}}</v-btn>
            <v-btn flat small disabled v-else>
              {{props.item.belong_year}}</v-btn>
          </td>
          <td class="text-xs-center">
            <v-btn color="info" dark @click="check(props.item)">查看</v-btn>
          </td>
        </template>
      </v-data-table>
    </div>

    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">归属年度</span>
        </v-card-title>
        <v-card-text>
          <v-layout wrap justify-center>
            <v-flex xs12 sm6>
              <v-select :items="belongYearArr" required v-model="belongYear" :label="label"
                no-data-text="暂无可更改的年度"></v-select>
            </v-flex>
          </v-layout>

        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="cancel()">取消</v-btn>
          <v-btn color="blue darken-1" flat @click="confirm()">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>

</template>
<script>
import Common from "@/utils/common";
import SearchSelect from "../components/searchSelect";
import { getSelectData, handleLists } from "@/utils/project";

export default {
  components: {
    SearchSelect
  },
  data() {
    return {
      selectLists: [],
      defaultSelect: null,
      applyFormHeader: [
        { text: "项目编号", value: "number", sortable: false },
        { text: "项目名称", value: "name", sortable: false },
        { text: "项目状态", value: "status", sortable: false },
        { text: "预定结案日期", value: "expect_close_date", sortable: false },
        { text: "申请单状态", value: "form_status", sortable: false },
        { text: "项目经理", value: "manager", sortable: false },
        { text: "项目等级", value: "level", sortable: false },
        {
          text: "归属年度",
          value: "belong_year",
          sortable: false,
          align: "center"
        },
        {
          text: "功能",
          align: "center",
          value: "function",
          sortable: false
        }
      ],
      applyFormData: [],
      dialog: false,
      belongYearArr: [],
      belongYear: 0,
      year: 0,
      label: "",
      applyId: "",
      searchParam: {}
    };
  },
  activated() {
    this.judge();
  },
  methods: {
    getSelectLists() {
      let projectLists = this.applyFormData.map(item => {
        return item.project_id;
      });
      let applyFormStatus = handleLists(
        this.applyFormData,
        "status",
        "applyStatus_name"
      );
      this.selectLists = [
        {
          value: "applyFormStatus",
          text: "申请单状态",
          itemsStatus: applyFormStatus
        }
      ];
      this.selectLists = this.selectLists.concat(
        getSelectData(projectLists, ["number", "name", "level", "manager"])
      );
    },
    // 发放点数列表信息
    async getProjectList(paramItem, type) {
      let res = await this.$request.fetch(
        "/api/project/pmo/applyGrantPointSelect",
        paramItem
      );
      if (res.data.status === 200) {
        this.applyFormData = res.data.result;

        if (!paramItem) {
          this.getSelectLists();
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
    search: Common.throttle(async function(param) {
      this.searchParam.item = param.item;
      this.searchParam.value = param.value;

      if (param.item === "all" || param.value === "all") {
        this.getProjectList({}, "search");
      } else {
        this.getProjectList(this.searchParam, "search");
      }
    }),
    check(item) {
      this.$router.push({
        path: "grantappformdetail",
        query: {
          id: item.project_id._id,
          point_log_id: item._id,
          status: item.status
        }
      });
    },
    updateBelongYear(item) {
      this.applyId = item._id;
      this.year = item.belong_year;
      this.label = `当前归属年度为 ${this.year}`;

      this.getAlreadyCount();
      this.dialog = true;
    },
    async getAlreadyCount() {
      let res = await this.$request.fetch(
        "/api/project/pmo/judgeAlreadyCount",
        {
          belong_year: this.year
        }
      );
      if (res.data.status === 200) {
        this.belongYearArr = res.data.result;
      } else {
        this.$snackbar().showError("可编辑归属年度获取失败，请刷新重试");
      }
    },
    cancel() {
      this.dialog = false;
    },
    confirm() {
      if (this.belongYear === 0) {
        this.$snackbar().showError("归属年度未改变");
      } else {
        this.saveBelongYear();
        this.dialog = false;
      }
    },
    async saveBelongYear() {
      let queryParam = {
        apply_id: this.applyId,
        belong_year: this.belongYear
      };

      let { data } = await this.$request.fetch(
        "/api/project/pmo/belongYearSave",
        queryParam,
        "post"
      );
      if (data.status === 200) {
        this.$snackbar().showStatus("edit");
        this.getProjectList();
      } else {
        this.$snackbar().showStatus("edit", false);
      }
      this.dialog = false;
    },
    async judge() {
      if (this.searchParam.value && this.searchParam.value !== "all") {
        await this.getProjectList(this.searchParam);

        if (this.applyFormData.length === 0) {
          this.searchParam.value = "all";
          this.getProjectList();
          this.defaultSelect = this.searchParam;
        }
      } else {
        this.getProjectList();
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
  margin-top: 50px;
  padding: 40px 20px 30px;
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
#belong-year-btn {
  padding: 0;
}
</style>