<template>
  <div class="container">
    <v-layout class="cont-top">
      <!-- 员工选择 -->
      <v-flex lg2 d-flex class="top-top">
        <v-autocomplete
          label="请选择员工姓名"
          :items="selectList"
          item-text="name"
          item-value="_id"
          v-model="tempEmployeeId"
          no-data-text="暂无数据"
        ></v-autocomplete>
      </v-flex>
      <!-- 年份选择 -->
      <v-flex lg2 d-flex class="top-top">
        <v-autocomplete label="请选择年份日期" :items="dateList" v-model="dateId" no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
      <v-flex xs1 md1 lg1 d-flex class="top-top">
        <!-- 搜索 -->
        <v-btn
          round
          color="info"
          style="margin-left: 20px; border-radius:10px;"
          dark
          @click="getAllcredits('search')"
        >
          <v-icon dark>search</v-icon>搜索
        </v-btn>
        <!-- 批量导出 -->
        <v-btn
          round
          color="info"
          style="margin-left: 20px; border-radius:10px;"
          dark
          @click="downloadToExcels"
        >批量导出</v-btn>
      </v-flex>
    </v-layout>
    <div class="cont-middle">
      <v-flex xs12 class="cont-middle-top">
        <p>PMO</p>
        <p>导出点数统计</p>
      </v-flex>
      <v-card class="margin-card">
        <v-flex md12>
          <v-data-table
            class="elevation-1"
            v-model="selected"
            select-all
            item-key="name"
            :headers="headers"
            :items="points"
            no-data-text="暂无数据"
          >
            <template v-slot:items="props">
              <td class="text-xs-center">
                <v-checkbox primary v-model="props.selected" hide-details></v-checkbox>
              </td>
              <td class="text-xs-center">{{ props.item.name }}</td>
              <td class="text-xs-center">{{ props.item.email }}</td>
              <td class="text-xs-center">{{ props.item.point_num }}</td>
              <td class="text-xs-center">
                <v-btn
                  color="info"
                  style="margin-left: 20px; border-radius:10px;"
                  @click="downloadToExcel(props.item)"
                >导出</v-btn>
              </td>
            </template>
          </v-data-table>
        </v-flex>
      </v-card>
    </div>
  </div>
</template>

<script>
// import XLSX from "xlsx";
// import { log } from "util";
// import Common from "../../../utils/common";
// import { required } from "vuelidate/lib/validators";
export default {
  name: "exportCredits",
  data() {
    return {
      selectList: [],
      dateList: [],
      tempEmployeeId: { name: "全部", _id: "" },
      dateId: new Date().getFullYear(),
      selected: [], // 多选的员工信息
      datePicker: false,
      headers: [
        { text: "员工姓名", align: "center", sortable: false },
        { text: "邮箱", align: "center", sortable: false },
        { text: "个人项目点数", align: "center", sortable: false },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ],
      points: []
    };
  },
  async mounted() {
    await this.getAllexport();
    this.getAllcredits('');
  },
  methods: {
    // 获取员工列表,年份时间列表
    async getAllexport() {
      let allExport = await this.$request.fetch(
        "/api/project/lockAndDelete/pointsExport"
      );
      this.dateList = [];
      allExport.data.result.forEach(item => {
        item.date.forEach(element => {
          this.dateList.push(element);
          this.dateList.unshift(this.dateId)
        });
      });
      this.selectList = [this.tempEmployeeId, ...allExport.data.result];
    },
    // 获取项目点数信息（pm + cc）
    async getAllcredits(type) {
      let empId = this.tempEmployeeId;
      let datetime = this.dateId;
      const matchObj = Object.create(null);
      if (typeof empId === 'string') {
        matchObj.empId = empId;
      }
      matchObj.datetime = datetime;
      let allEmp = await this.$request.fetch(
        "/api/project/lockAndDelete/pointsExport",
        matchObj
      );
      if (allEmp.data.status === 200) {
        this.points = allEmp.data.result;
      } else {
        this.$snackbar().showError("刷新重试", false);
      }
      // 搜索时，展现提示框
      if (empId !== 100 && type === "search") {
        this.$snackbar().showStatus("search");
      }
    },
    //  导出单个员工信息
    downloadToExcel(item) {
      require.ensure([], () => {
        const {
          export_json_to_excel,
          export_get_title_time,
          format_json
        } = require("../../../excel/Export2Exceljiedan");
        // 这是excel表中要显示的标题头，即最上面那一行，这是根据具体业务需求设置的
        const tHeader = ["员工姓名", "员工邮箱", "个人项目点数"];
        // 这是excel下面对应标题头要显示的具体内容
        const filterVal = ["name", "email", "point_num"];
        let newList = []; //重构后的数据
        let obj = {
          name: item.name,
          email: item.email,
          point_num: item.point_num.toString()
        };
        newList.push(obj);
        const data = format_json(filterVal, newList);
        let currentdate = this.dateId;
        export_json_to_excel(tHeader, data, currentdate + "年度员工点数统计表");
      });
    },
    //批量导出员工信息
    downloadToExcels(item) {
      require.ensure([], () => {
        this.allorderprice = 0;
        const {
          export_json_to_excel,
          export_get_title_time,
          format_json
        } = require("../../../excel/Export2Exceljiedan");
        // 这是excel表中要显示的标题头，即最上面那一行，这是根据具体业务需求设置的
        const tHeader = ["年度", "员工姓名", "员工邮箱", "个人项目点数"];
        // 这是excel下面对应标题头要显示的具体内容
        const filterVal = ["dateId", "name", "email", "point_num"];
        let time_c = filterVal.indexOf("dateId"); //年度时间
        let start_r = 1; //从第一行开始
        let start_s_r = 1; //每条数据开始行
        let time_s_r = 1; //年度时间的开始行
        //   要合并集合
        let merges = [];
        let newList = []; //重构后的数据

        if (this.selected.length === 0) {
          return this.$snackbar().showError("未选择员工信息");
        }
        this.selected.forEach(item => {
          newList.push({
            name: item.name,
            email: item.email,
            point_num: item.point_num.toString(),
            dateId: item.date.toString()
          });
        });
        for (let i = 0; i < this.selected.length; i++) {
          const node = this.selected[i];
          this.allorderprice += Number(node.point_num);
          start_r++;
        }
        let oneline = {
          s: {
            c: 0,
            r: 1
          },
          e: {
            c: 0,
            r: start_r - 1
          }
        };
        merges.push(oneline);
        let lastline = [
          {
            dateId: "总计",
            point_num: this.allorderprice.toString()
          },
          {
            dateId: "",
            point_num: ""
          }
        ];
        newList = [...newList, ...lastline];
        const data = format_json(filterVal, newList);
        let currentdate = this.dateId;
        export_json_to_excel(
          tHeader,
          data,
          currentdate + "年度员工点数统计表",
          merges
        );
      });
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
.top-top {
  margin-right: 55px;
}
.cont-middle {
  padding: 40px 20px 30px;
  margin-bottom: 278.2px;
  box-shadow: 0px 0px 6px 1px #ccc;
  position: relative;
}
.cont-middle-top {
  background: #e0e1e2;
  border-radius: 10px;
  padding: 10px 20px;
  margin: -65px 0 35px;
}
.cont-middle-top p {
  margin-bottom: 0px;
}
.cont-middle-top p:nth-of-type(1) {
  color: #333300;
  font-size: 20px;
  margin-bottom: 5px;
}
.cont-middle-top p:nth-of-type(1) {
  color: #333333;
  font-size: 15px;
}
.margin-card {
  margin: 20px;
  position: relative;
}
</style>