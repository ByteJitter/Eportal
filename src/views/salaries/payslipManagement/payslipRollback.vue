<template>
  <v-container fluid grid-list-xl>
    <!-- 搜索 -->
    <v-layout pl-5>
      <v-flex xs12 sm2 md2>
        <v-autocomplete :items="employeeList" item-text="name" item-value="_id" label="请选择/输入员工" v-model="employeeId" no-data-text="暂无数据">
        </v-autocomplete>
      </v-flex>
      <v-flex xs12 sm2 md2 ml-2>
        <!-- 日期选择器 -->
        <v-menu v-model="datePicker" :close-on-content-click="false" :nudge-right="40" lazy transition="scale-transition"
          offset-y full-width min-width="100px">
          <template v-slot:activator="{ on }">
            <v-text-field v-model="date" label="请选择日期" prepend-icon="event" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="date" type="month" locale="zh-cn" @input="datePicker = false"></v-date-picker>
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
        <v-data-table :headers="headers" :items="payslipsList" class="elevation-1" no-data-text="暂无数据">
          <template v-slot:items="props">
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.department_id.name }}</td>
            <td>{{ props.item.monthly_payslip.basicSum }}</td>
            <td>{{ props.item.monthly_payslip.addedSum }}</td>
            <td>{{ props.item.monthly_payslip.create_date }}</td>
            <td>{{ props.item.monthly_payslip.status }}</td>
            <td class="text-xs-center">
              <v-btn small color="primary" class="btn_pay" @click="unpaidToDraft(props.item)">转为草稿</v-btn>
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

export default {
  name: "payslipRollback",
  components: { snackbar, pageTitle },
  data: () => ({
    title: '员工薪资单',
    subtitle: '薪资单回退',
    date: new Date().toISOString().substr(0, 7),
    datePicker: false,
    headers: [
      { text: "员工姓名", sortable: false, value: "name" },
      { text: "所在部门", value: "department", sortable: false },
      { text: "基本薪资", value: "cash", sortable: false },
      { text: "每月加给", value: "monthAdd", sortable: false },
      { text: "月份", value: "month", sortable: false },
      { text: "状态", value: "status", sortable: false },
      { text: "操作", align: "center", width: "100px", sortable: false }
    ],
    payslipsList: [],
    employeeId: "",
    employeeList: [{ name: "全部", _id: "" }],
    employeeSearchValue: '',
    dateSearchValue: new Date().toISOString().substr(0, 7)
  }),
  mounted() {
    this.getUnpaidPayslip();
  },
  methods: {
    getNameList(payslipList) {
      this.empNameList = [{ name: "全部", _id: "" }];
      payslipList.map(item => {
        this.employeeList.push({ name: item.name, _id: item._id });
      });
    },

    handleSearch(){
      this.dateSearchValue = this.date;
      this.employeeSearchValue = this.employeeId;
      this.getUnpaidPayslip(true);
    },

    async getUnpaidPayslip(search) {
      let param = { createDate: this.dateSearchValue, status: "待支付"};
      if (search) {
        param.empId = this.employeeId;
      }
      let res = await this.$request.fetch('/api/salaryList/allEmployeePayslip', param);
      res = res.data;
      if(res.status === 200){
        this.payslipsList = res.result;
        this.getNameList(res.result);
        search && this.$refs.snackbar.showStatus('search');
      } else {
        if (search) {
          this.$refs.snackbar.showStatus('search', false);
          return;
        }
        this.$refs.snackbar.showError();
      }
    },

    async unpaidToDraft(payslip) {
      let param = { payslip_id: payslip.monthly_payslip._id, status: "草稿" };
      let res = await this.$request.fetch('/api/salaryList/payslipStatus', param, 'put');
      res = res.data;
      if (res.status === 200) {
        this.$refs.snackbar.show('操作成功');
        this.getUnpaidPayslip();
      } else {
        this.$refs.snackbar.showError('操作失败，请刷新重试');
      }
    }
  }
};
</script>
<style scoped>
@import "../../../assets/css/common.css";
</style>
