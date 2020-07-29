<template>
  <v-container fluid grid-list-xl>
    <!-- 搜索 -->
    <v-layout pl-5>
      <v-flex xs12 sm2 md2>
        <v-autocomplete
          :items="optionsList"
          label="请选择/输入导出数据类型"
          v-model="optionsType"
          no-data-text="暂无数据"
        ></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm2 md2 ml-2 v-if="isWorker">
        <!-- 日期选择器 -->
        <v-menu
          v-model="datePicker"
          :close-on-content-click="false"
          :nudge-right="40"
          lazy
          transition="scale-transition"
          offset-y
          full-width
          min-width="100px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field v-model="date" label="请选择日期" prepend-icon="event" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="date" type="month" locale="zh-cn" @input="datePicker = false"></v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 sm6 md2 mt-1>
        <v-btn color="info" class="button" @click="exportInfo">
          <v-icon>search</v-icon>导出
        </v-btn>
      </v-flex>
    </v-layout>

    <v-card class="mt-5 pa-5">
      <page-title :title="title" :subtitle="subtitle" />
      <v-flex md12>
        <v-data-table
          item-key="name"
          v-model="selected"
          select-all
          :headers="headers"
          :items="empList"
          class="elevation-1"
          no-data-text="暂无数据"
        >
          <template v-slot:items="props">
            <td>
              <v-checkbox v-model="props.selected" primary hide-details></v-checkbox>
            </td>
            <td class="text-xs">{{ props.item.name }}</td>
            <td class="text-xs">{{ props.item.entry_time }}</td>
            <td class="text-xs">{{ props.item.is_manager==true ? '是':'否'}}</td>
            <td class="text-xs">{{ props.item.itemDep[0].name}}</td>
            <td class="text-xs">{{ props.item.task_count}}</td>
            <td class="text-xs">{{ props.item.value_index}}</td>
          </template>
        </v-data-table>
      </v-flex>
    </v-card>
  </v-container>
</template>

<script>
import pageTitle from "@/views/components/pageTitle.vue";
export default {
  name: "batchedOperation",
  components: { pageTitle },
  data() {
    return {
      title: "员工薪资单",
      subtitle: "批量操作",
      optionsList: ["薪资变更记录", "员工信息", "员工薪资单"],
      optionsType: "",
      datePicker: false,
      date: "",
      isWorker: false,
      headers: [
        { text: "姓名", sortable: false, value: "name" },
        { text: "入职日期", sortable: false, value: "entry_time" },
        { text: "是否为主管", sortable: false, value: "is_manager" },
        { text: "所在部门", sortable: false, value: "dapartment" },
        { text: "任务点数", sortable: false, value: "point" },
        { text: "Value Index", sortable: false, value: "value_index" }
      ],
      empList: [],
      selected: []
    };
  },
  mounted() {
    this.getAllEmp();
  },
  watch: {
    optionsType(val) {
      if (val === "员工薪资单") {
        this.isWorker = true;
      } else if (val === "薪资变更记录") {
        this.isWorker = false;
      } else if (val === "员工信息") {
        this.isWorker = false;
      }
    }
  },
  methods: {
    // 获取全部的员工信息
    async getAllEmp() {
      let allEmp = await this.$request.fetch(
        "/api/employee/getEmployee_department"
      );
      if (allEmp.data.status === 200) {
        this.empList = allEmp.data.result;
      } else {
        this.$snackbar().showError();
      }
    },
    async exportInfo() {
      let empId = [];
      let empDataList = [];
      this.selected.forEach(item => {
        empId.push(item._id);
      });
      if (this.selected.length === 0) {
        this.$snackbar().showError("未选择任何员工");
        return;
      }
      if (this.optionsType === "") {
        this.$snackbar().showError("未选择任何操作");
        return;
      }
      if (this.optionsType === "薪资变更记录") {
        // this.isWorker = false;
        console.log("薪资变更记录", empId);
      } else if (this.optionsType === "员工信息") {
        // this.isWorker = false;
        console.log("员工信息", empId);
        // 根据ID获取员工信息并打印
        // let res = await this.$request.fetch("/api/salaryList/exportEmpInfo", {
        //   emp: empId
        // });
        for (let i = 0; i < empId.length; i++) {
          for (let j = 0; j < this.empList.length; j++) {
            if (empId[i] === this.empList[j]._id) {
              empDataList.push(this.empList[j]);
            }
          }
        }
        let empList = [];
        empDataList.forEach(item => {
          let empObj = {
            empId: item._id,
            name: item.name,
            email: item.email,
            tel: item.tel,
            education: item.education,
            date_of_birth: item.date_of_birth,
            native_place: item.native_place,
            entry_time: item.entry_time,
            employee_no: item.employee_no,
            department: item.itemDep[0].name,
            employee_type: item.employee_type,
            is_manager: item.is_manager,
            double_pay_issued: item.double_pay_issued,
            workplace: item.workplace,
            value_index: item.value_index,
            last_value_index_time: item.last_value_index_time,
            relevant_certificate: item.relevant_certificate,
            endowment_insurance: item.endowment_insurance,
            medical_insurance: item.medical_insurance,
            unemployment_insurance: item.unemployment_insurance,
            housing_provident_fund: item.housing_provident_fund
          };
          if(empObj.is_manager === "true") {
            empObj.is_manager = "是"
          }else {
            empObj.is_manager = "否"
          }
          if(empObj.double_pay_issued === "true") {
            empObj.double_pay_issued = "是"
          }else {
            empObj.double_pay_issued = "否"
          }
          empList.push(empObj);
        });
        require.ensure([], () => {
          const { export_json_to_excel } = require("@/excel/Export2Excel");
          // excel表头
          const tHeader = [
            "员工id",
            "姓名",
            "邮箱地址",
            "手机号",
            "学历",
            "出生年月",
            "户籍",
            "入职时间",
            "员工号",
            "所属部门",
            "员工类型",
            "是否为经理",
            "是否双薪",
            "工作地点",
            "value_index",
            "最后一次计算value_index时间",
            "证书情况",
            "养老保险",
            "医疗保险",
            "失业保险",
            "住房公积金"
          ];
          // excel具体内容，与表头和adjustDataObj中的数据相对应
          const filterVal = [
            "empId",
            "name",
            "email",
            "tel",
            "education",
            "date_of_birth",
            "native_place",
            "entry_time",
            "employee_no",
            "department",
            "employee_type",
            "is_manager",
            "double_pay_issued",
            "workplace",
            "value_index",
            "last_value_index_time",
            "relevant_certificate",
            "endowment_insurance",
            "medical_insurance",
            "unemployment_insurance",
            "housing_provident_fund"
          ];
          const data = empDataList.map(v => filterVal.map(j => v[j]));
          export_json_to_excel(
            tHeader,
            data,
            this.date + "员工信息"
          );
          this.$snackbar().showOk("下载成功");
        });
      }
    }
  }
};
</script>

<style>
@import "../../../assets/css/common.css";
</style>