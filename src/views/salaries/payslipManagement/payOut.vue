<template>
  <v-container fluid grid-list-xl>
    <!-- 搜索 -->
    <v-layout pl-5>
      <v-flex xs12 sm2 md2>
        <v-autocomplete :items="empNameList" label="请选择/输入员工" item-text="name" item-value="_id"
          v-model="empId" no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm2 md2 ml-2>
        <!-- 日期选择器 -->
        <v-menu v-model="datePicker" :close-on-content-click="false" :nudge-right="40" lazy transition="scale-transition"
          offset-y full-width min-width="100px">
          <template v-slot:activator="{ on }">
            <v-text-field v-model="date" label="请选择月份" prepend-icon="event" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker type="month" v-model="date" @input="datePicker = false" locale="zh-cn" aria-placeholder="全部">
          </v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 sm6 md2 mt-1>
        <v-btn color="info" class="button" @click="handleSearch">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
    </v-layout>
    <v-card class="mt-5 pa-5">
      <page-title :title="title" :subtitle="subtitle" />
      <v-flex md12>
        <v-data-table :headers="headers" :items="payslipList" class="elevation-1" no-data-text="暂无数据">
          <template v-slot:items="props">
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.department_id.name }}</td>
            <td>{{ props.item.monthly_payslip.basicSum }}</td>
            <td>{{ props.item.monthly_payslip.addedSum }}</td>
            <td>{{ props.item.monthly_payslip.create_date }}</td>
            <td>{{ props.item.monthly_payslip.amount}}</td>
            <td>{{ props.item.monthly_payslip.status }}</td>
            <td class="text-xs-center">
              <v-btn small color="info" @click="paySalary(props.item)">支付</v-btn>
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
import Common from "@/utils/common";
import snackbar from "@/views/components/snackbar.vue";
import pageTitle from '@/views/components/pageTitle.vue';

export default {
  name: "employees",
  components: { snackbar, pageTitle },

  data: () => ({
    title: "员工薪资单",
    subtitle: "员工薪资发放",
    date: new Date().toISOString().substr(0, 7),
    datePicker: false,
    headers: [
      { text: "员工姓名", value: "name", sortable: false},
      { text: "所在部门", value: "department", sortable: false },
      { text: "基本薪资", value: "cash", sortable: false },
      { text: "每月加给", value: "monthAdd", sortable: false },
      { text: "月份", value: "month", sortable: false },
      { text: "本月薪资", value: "monthCash", sortable: false },
      { text: "状态", value: "status", sortable: false },
      { text: "操作", align: "center", sortable: false }
    ],
    payslipList: [],
    empNameList: [{ name: "全部", _id: "" }],
    empId: "",
    dateSearchValue: new Date().toISOString().substr(0, 7),
    employeeSearchValue: ''
  }),

  mounted() {
    this.getAllUnpaidPayslips();
  },
  methods: {

    getNameList(payslipList) {
      this.empNameList = [{ name: "全部", _id: "" }];
      payslipList.map(item => {
        this.empNameList.push({ name: item.name, _id: item._id });
      });
    },

    async getAllUnpaidPayslips(searchStep = false, param = { createDate: this.dateSearchValue, status: "待支付" }) {
      let res = await this.$request.fetch("/api/salaryList/allEmployeePayslip", param);
      res = res.data;
      if (res.status === 200) {
        this.payslipList = res.result;
        this.getNameList(res.result);
        searchStep && this.$refs.snackbar.showStatus("search");
      } else {
        if (searchStep){
          this.$refs.snackbar.showStatus("search", false);
          return;
        }
        this.$refs.snackbar.showError();
      }
    },

    handleSearch(){
      this.dateSearchValue = this.date;
      this.employeeSearchValue = this.empId;
      this.search();
      this.payslipList = [];
    },

    async search(snackBarStep = true) {
      if (this.empId) {
        const param = { empId: this.employeeSearchValue, createDate: this.dateSearchValue, status: "待支付"};
        this.getAllUnpaidPayslips(snackBarStep, param);
      } else {
        this.getAllUnpaidPayslips(snackBarStep);
      }
    },

    async paySalary(item) {
      const param = { payslip_id:  item.monthly_payslip._id, status: "已支付"};
      let res = await this.$request.fetch("/api/salaryList/payslipStatus", param, "put");
      res = res.data;
      if (res.status === 200) {
        this.$refs.snackbar.show("支付成功");
        this.search(false);
      }else {
        this.$refs.snackbar.showError("支付失败，请刷新重试");
      }
    }
  }
};
</script>
<style scoped>
@import "../../../assets/css/common.css";
</style>
