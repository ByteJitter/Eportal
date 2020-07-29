<template>
  <v-container fluid grid-list-xl>
    <v-layout pl-5>
      <v-flex xs12 sm6 md2>
        <v-menu v-model="datePicker" :close-on-content-click="false" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
          <template v-slot:activator="{ on }">
            <v-text-field v-model="date" label="请选择月份" prepend-icon="event" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker type="month" v-model="date" @input="datePicker = false" locale="zh-cn"></v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 sm6 md2 mt-1>
        <v-btn color="info" class="button" @click="handleSearch()">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
      <v-flex xs12 sm6 md2 mt-1>
        <v-btn color="info" class="button" @click="publishAll">批量发布</v-btn>
      </v-flex>
      <v-flex xs12 sm6 md2 mt-1>
        <v-btn color="info" class="button" @click="downloadPayslips">批量下载</v-btn>
      </v-flex>
      <v-flex xs12 sm6 md1 mt-1>
        <v-btn color="info" class="button">
          <input type="file" ref="upload" accept=".xls, .xlsx" background="none" />
        </v-btn>
      </v-flex>
    </v-layout>

    <v-card class="mt-5 pa-5">
      <page-title :title="title" :subtitle="subtitle" />
      <v-flex md12>
        <v-data-table v-model="selected" select-all item-key="name" :headers="headers" :items="payslipList"
          class="elevation-1" no-data-text="本月暂无薪资单">
          <template v-slot:items="props">
            <td>
              <v-checkbox v-model="props.selected" primary hide-details v-show="props.item.monthly_payslip.status=='草稿'"></v-checkbox>
            </td>
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.department_id.name }}</td>
            <td>{{ props.item.entry_time }}</td>
            <td>{{ props.item.monthly_payslip.basicSum }}</td>
            <td>{{ props.item.monthly_payslip.addedSum }}</td>
            <td>{{ props.item.monthly_payslip.create_date }}</td>
            <td>{{ props.item.monthly_payslip.status }}</td>
            <td class="text-xs-center">
              <v-btn small color="info" @click="editItem(props.item)">
                {{props.item.monthly_payslip.status=="草稿"?"编辑":"查看"}}</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </v-card>
    <!-- 弹框 -->
    <snackbar ref="snackbar" />
  </v-container>
</template>
<script>
import XLSX from "xlsx";
import Common from "@/utils/common";
import snackbar from "@/views/components/snackbar.vue";
import pageTitle from '@/views/components/pageTitle.vue';

export default {
  name: "employeePayslips",
  components: { snackbar, pageTitle },
  data: () => ({
    title: "员工薪资单",
    subtitle: "查看薪资单",
    date: new Date().toISOString().substr(0, 7),
    datePicker: false,
    selected: [],
    headers: [
      { text: "员工姓名", value: "name", sortable: false },
      { text: "所在部门", value: "department", sortable: false },
      { text: "入职日期", value: "date", sortable: false },
      { text: "基本薪资", value: "cash", sortable: false },
      { text: "每月加给", value: "monthAdd", sortable: false },
      { text: "月份", value: "month", sortable: false },
      { text: "状态", value: "status", sortable: false },
      { text: "操作", align: "center", sortable: false }
    ],
    payslipList: [], // 薪资单列表数据
    dateSearchValue: new Date().toISOString().substr(0, 7)
  }),
  mounted() {
    this.getEmployeePayslip(false);

    this.$refs.upload.addEventListener("change", e => {
      // 绑定监听excel导入事件
      this.alterAdjustByExcel(e);
    });
  },
  methods: {
    handleSearch(){
      this.dateSearchValue = this.date;
      this.selected = [];
      this.getEmployeePayslip(true);
    },
    async getEmployeePayslip(searchStep) {

      const param = { createDate: this.dateSearchValue };
      let res = await this.$request.fetch("/api/salaryList/allEmployeePayslip", param);
      res = res.data;
      if (res.status === 200) {
        this.payslipList = res.result;
        searchStep && this.$refs.snackbar.showStatus("search");
      } else {
        if (searchStep) {
          this.$refs.snackbar.showStatus("search", false);
          return;
        }
        this.$refs.snackbar.show("获取数据失败，请刷新重试", "error");
      }
    },
    // 下载
    async downloadPayslips() {
      let empIdArr = [];
      this.selected.forEach(item => {
        if (item.monthly_payslip.status === "草稿") {
          empIdArr.push(item._id);
        }
      });
      if (empIdArr.length === 0) {
        this.$refs.snackbar.show("下载失败，请选择正确的数据", "error");
      }
      const param = { createDate: this.date, empIdArr: empIdArr };
      let res = await this.$request.fetch("/api/salaryList/downloadPayslipsData", param);
      res = res.data;
      if (res.status === 200) {
        let adjustDataList = [];
        res.result.forEach(item => {
          let adjustDataObj = {
            monthlyPayslipId: item.monthly_payslip._id,
            name: item.name,
            createDate: item.monthly_payslip.create_date,
            departmentName: item.department_id.name,
            adjustType: '',
            adjustMemo: '',
            adjustAmount: ''
          };
          if (item.monthly_payslip.special_adjust.length !== 0) {
            item.monthly_payslip.special_adjust.forEach(adjust => {
              adjustDataObj['adjustType'] = adjust.adjust_type;
              adjustDataObj['adjustMemo'] = adjust.memo;
              adjustDataObj['adjustAmount'] = adjust.amount;
              adjustDataList.push(adjustDataObj);
            })
          } else {
            adjustDataList.push(adjustDataObj);
          }
        })
        require.ensure([], () => {
          const { export_json_to_excel } = require("@/excel/Export2Excel");
          // excel表头
          const tHeader = [ "薪资单id", "月份", "部门", "姓名", "调整类型", "内容", "金额" ];
          // excel具体内容，与表头和adjustDataObj中的数据相对应
          const filterVal = [ "monthlyPayslipId", "createDate", "departmentName", "name", "adjustType", "adjustMemo", "adjustAmount" ];
          const data = adjustDataList.map(v => filterVal.map(j => v[j]));
          export_json_to_excel(tHeader, data, this.date + "员工薪资单特别调整项");
          this.$refs.snackbar.show("下载成功");
        });
      } else {
        this.$refs.snackbar.show("下载失败，请刷新重试", "error");
        return;
      }
    },

    // 上传 excel 修改特别调整项
    alterAdjustByExcel(e) {
      const { files } = e.target;
      if (files.length === 0) {
        return this.$refs.snackbar.showError('请选择文件');
      }
      const regex = /\.(xls|xlsx)$/;
      if (!regex.test(files[0].name.toLowerCase())) {
        return this.$refs.snackbar.showError('文件格式不正确，请上传 xls 或 xlsx 格式');
      }
      const fileReader = new FileReader();
      let afterData = [];
      fileReader.onload = async ev => {
        const excelData = ev.target.result;
        const workbook = XLSX.read(excelData, {
          type: "binary"
        });
        const wsname = workbook.SheetNames[0]; // 取第一张表
        let ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]); // 生成json表格内容
        let tempArr = [];
        let adjust;
        for (let i = 0; i < ws.length; i++) {
          adjust = {
            adjust_type: ws[i].调整类型,
            memo: ws[i].内容,
            amount: ws[i].金额.toString()
          };
          if (!tempArr.includes(ws[i].薪资单id)) {
            afterData.push({
              _id: ws[i].薪资单id,
              special_adjust: [adjust]
            });
            tempArr.push(ws[i].薪资单id);
          } else {
            for (let j = 0; j < afterData.length; j++) {
              if (afterData[j]._id == ws[i].薪资单id) {
                afterData[j].special_adjust.push(adjust);
                break;
              }
            }
          }
        }
        const param = { uploadData: afterData };
        const { data } = await this.$request.fetch('/api/salaryList/specialAdjustByExcel', param ,'put');
        if (data.status === 200) {
          this.$refs.snackbar.show("上传成功");
        } else {
          this.$refs.snackbar.showError("上传失败，请刷新重试");
        }
        this.$refs.upload.value = "";
      };
      fileReader.readAsBinaryString(files[0]);
    },

    // 批量发布
    async publishAll() {
      let draftPays = this.selected.filter(item => {
        return item.monthly_payslip.status === "草稿";
      });
      if (draftPays.length === 0) {
        return this.$refs.snackbar.show("未选择草稿薪资单", "error");
      }
      let paysIdArr = [];
      draftPays.forEach(i => {
        paysIdArr.push(i.monthly_payslip._id);
      });
      let param = { idArray: paysIdArr };
      let res = await this.$request.fetch("/api/salaryList/updateMonthlyStatus", param, "post");
      res = res.data;
      if (res.status === 200) {
        this.getEmployeePayslip(false);
        this.$refs.snackbar.show("发布成功");
      } else {
        this.$refs.snackbar.show("发布失败，请刷新重试", "error");
      }
    },
    editItem(item) {
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
