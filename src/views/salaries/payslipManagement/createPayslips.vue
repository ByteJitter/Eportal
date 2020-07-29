<template>
  <v-container fluid grid-list-xl>
    <v-layout pl-5>
      <v-flex xs12 sm2 md2>
        <v-autocomplete :items="empNameList" item-text="name" item-value="_id" label="请选择/输入员工" v-model="empId"
          no-data-text="暂无数据">
        </v-autocomplete>
      </v-flex>
      <v-flex xs12 sm6 md2>
        <v-menu v-model="datePicker" :close-on-content-click="false" :nudge-right="40" lazy
          transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
          <template v-slot:activator="{ on }">
            <v-text-field v-model="date" label="请选择月份" prepend-icon="event" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker type="month" v-model="date" @input="datePicker = false" locale="zh-cn" aria-placeholder="全部">
          </v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 sm6 md1 ml-2 mt-1>
        <v-btn color="info" class="button" @click="handleSerach">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
      <v-flex xs12 sm6 md2 ml-5 mt-1>
        <v-btn color="info" class="button" @click="createPayslipAll">批量生成薪资单</v-btn>
      </v-flex>
    </v-layout>

     <v-card class="mt-5 pa-5">
      <page-title :title="title" :subtitle="subtitle" />
      <v-flex md12>
        <v-data-table v-model="selected" :headers="headers" :items="payslipList" class="elevation-1" select-all
          item-key="name" no-data-text="暂无数据">
          <template v-slot:items="props">
            <td>
              <v-checkbox v-model="props.selected" primary hide-details v-show="props.item.status=='未生成'"></v-checkbox>
            </td>
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.department_id.name }}</td>
            <td>{{ props.item.status }}</td>
            <td class="text-xs-center">
              <v-btn small color="info" @click="createPayslip(props.item)"
                :disabled="props.item.status=='已生成'?true:false">生成薪资单</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </v-card>
    <!-- snackBar -->
    <snackbar ref="snackbar" />
  </v-container>
</template>
<script>
import snackbar from "@/views/components/snackbar.vue";
import pageTitle from '@/views/components/pageTitle.vue';
import Common from "@/utils/common.js";
import { EventBus } from "@/utils/eventBus.js";

export default {
  components: { snackbar, pageTitle },

  name: "createPayslips",
  data: () => ({
    title: "员工薪资单",
    subtitle: "生成薪资单",
    selected: [], // 多选的员工信息
    date: new Date().toISOString().substr(0, 7), // 当前月份
    datePicker: false, // 控制选择月份组件的显示与隐藏
    empNameList: [], // 员工姓名
    empId: "", // 员工Id
    headers: [
      { text: "员工姓名", value: "name", sortable: false },
      { text: "所在部门", value: "department", sortable: false },
      { text: "状态", value: "status", sortable: false },
      { text: "操作", align: "center", sortable: false }
    ],
    payslipList: [], //所有员工薪资单
    employeeSearchValue: '',
    dateSearchValue: new Date().toISOString().substr(0, 7)
  }),
  mounted() {
    this.getAllEmpPayslips();
  },
  methods: {
    // 根据列表数据筛选出员工姓名的列表并加入“全部”
    getNameList(payslipList) {
      let full = { name: "全部", _id: "" };
      payslipList.map(item => {
        this.empNameList.push({ name: item.name, _id: item._id });
        this.empNameList.unshift(full);
      });
    },

    async getAllEmpPayslips(snackbar = false) {
      let param = { createDate: this.date };
      let res = await this.$request.fetch( "/api/salaryList/allEmpPayslips", param );
      res = res.data;
      if (res.status === 200) {
        snackbar && this.$refs.snackbar.showStatus("search");
        this.payslipList = res.result;
        this.getNameList(res.result);
      } else {
        if(snackbar) return this.$refs.snackbar.showStatus("search", false);
        this.$refs.snackbar.showError();
      }
    },

    handleSerach(){
      this.employeeSearchValue = this.empId;
      this.dateSearchValue = this.date;
      this.searchPayslip();
      this.selected = [];
    },

    async searchPayslip(isSearch = true) {
      if (this.empId) {
        
        let param = { empId: this.employeeSearchValue, createDate: this.dateSearchValue };
        let res = await this.$request.fetch(
          "/api/salaryList/allEmpPayslips",
          param
        );
        res = res.data;
        if (res.status === 200) {
          isSearch && this.$refs.snackbar.showStatus("search");
          this.payslipList = res.result;
          this.getNameList(res.result);
        } else {
          isSearch && this.$refs.snackbar.showStatus("search", false);
        }
      } else {
        this.getAllEmpPayslips(isSearch);
      }
    },

    //批量生成薪资单
    createPayslipAll: Common.throttle(async function() {
      let notPayslips = this.selected.filter(element => {
        return element.status == "未生成";
      });
      if (notPayslips.length === 0) {
        return this.$refs.snackbar.show("未选择任何员工", "error");
      }
      let param = {
        createDate: this.dateSearchValue,
        notPayslips: notPayslips
      };
      let res = await this.$request.fetch("/api/salaryList/createPayslipAll", param, "post");
      res = res.data;
      if (res.status === 200) {
        this.selected = [];
        this.$refs.snackbar.show("批量生成薪资单成功");
        this.employeeSearchValue = '';
        this.dateSearchValue = this.date;
        this.searchPayslip(false);
      } else {
        this.selected = [];
        this.$refs.snackbar.show("生成失败，请刷新重试", "error");
      }
    }),

    createPayslip(item) {
      this.$router.push({
        path: "createPayslipDetail",
        query: {
          nameCode: item.name,
          departmentCode: item.department_id.name,
          monthCode: this.date,
          statusCode: item.status,
          employeeId: item._id,
          employee_salary_structure_ids: item.employee_salary_structure_ids
        }
      });
    }
  }
};
</script>
<style scoped>
@import "../../../assets/css/common.css";
</style>
