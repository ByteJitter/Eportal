<template>
  <v-container fluid grid-list-xl>
    <!-- 搜索 -->
    <v-layout pl-5>
      <v-flex xs12 sm2 md2>
        <v-autocomplete v-model="employeeId" item-text="name" item-value="_id" :items="employeesList" label="请选择/输入员工"
          no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm6 md2>
        <v-menu v-model="datePicker" :close-on-content-click="false" :nudge-right="40" lazy transition="scale-transition"
          offset-y full-width max-width="290px" min-width="290px">
          <template v-slot:activator="{ on }">
            <v-text-field v-model="date" label="请选择月份" prepend-icon="event" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker type="month" v-model="date" @input="datePicker = false" locale="zh-cn" aria-placeholder="全部">
          </v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 sm6 md2 mt-1>
        <v-btn color="info" class="button" @click="getDepartmentPayslips(true)">
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
            <td>{{ props.item.entry_time }}</td>
            <td>{{ props.item.monthly_payslip.basicSum }}</td>
            <td>{{ props.item.monthly_payslip.addedSum }}</td>
            <td>{{ props.item.monthly_payslip.create_date }}</td>
            <td>{{ props.item.monthly_payslip.status }}</td>
            <td class="text-xs-center">
              <v-btn small color="info" @click="checkItem(props.item)">查看</v-btn>
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
  name: "departmentPayslips",
  components: { snackbar, pageTitle },
  data: () => ({
    title: "员工薪资单",
    subtitle: "部门员工薪资单",
    date: new Date().toISOString().substr(0, 7),
    datePicker: false,
    employeesList: [],
    employeeId: "",
    headers: [
      { text: "员工姓名", sortable: false, value: "name" },
      { text: "所在部门", value: "department", sortable: false },
      { text: "入职日期", value: "date", sortable: false },
      { text: "基本薪资", value: "cash", sortable: false },
      { text: "每月加给", value: "monthAdd", sortable: false },
      { text: "月份", value: "month", sortable: false },
      { text: "状态", value: "status", sortable: false },
      { text: "操作", align: "center", sortable: false }
    ],
    payslipsList: []
  }),
  mounted() {
    this.getDepartmentPayslips();
  },
  methods: {
    getNameList(payslipList) {
      let full = { name: "全部", _id: "" };
      payslipList.map(item => {
        this.employeesList.push({ name: item.name, _id: item._id });
        this.employeesList.unshift(full);
      });
    },

    async getDepartmentPayslips(isSearch = false) {
      const param = { employeeId: this.employeeId, createDate: this.date };
      let { data } = await this.$request.fetch('/api/salaryList/departmentPayslips', param);
      if (data.status === 200) {
        isSearch && this.$refs.snackbar.showStatus('search');
        this.payslipsList = data.result;
        this.getNameList(data.result);
      } else if(data.status === 500){
        this.$refs.snackbar.showError('暂无权限');
      } else {
        this.$refs.snackbar.showError();
      }
    },
    checkItem(item) {
      this.$router.push({
        path: "managePayslipDetail",
        query: {
          nameCode: item.name,
          departmentCode: item.department_id.name,
          monthCode: item.monthly_payslip.create_date,
          statusCode: item.monthly_payslip.status,
          employeeId: item._id,
          employee_salary_structure_ids: item.employee_salary_structure_ids,
          showOperate: true
        }
      });
    }
  }
};
</script>
<style scoped>
@import "../../../assets/css/common.css";
</style>
