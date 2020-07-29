<template>
  <v-container fluid grid-list-xl>
    <!-- 搜索 -->
    <v-layout class="search">
      <v-flex xs12 sm2 md2>
        <v-autocomplete :items="searchData" label="请选择/输入员工姓名" v-model="selectBindName"  item-text="name"   item-value="_id" no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm2 md2  >
        <v-menu  v-model="isDatePicker"  :close-on-content-click="false"  :nudge-right="40" lazy transition="scale-transition"  offset-y   full-width  min-width="100px">
          <template v-slot:activator="{ on }">
            <v-text-field v-model="expectDate" label="请选择预计发放日期" prepend-icon="event" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="expectDate" locale="zh-cn" @input="showDatePicker()"  type="month"></v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 sm6 md2>
        <v-btn color="info" @click="search()">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
    </v-layout>
    <div class="bg">
      <v-flex class="headerlist" md12>
        <p>员工薪资信息</p>
        <p>员工待发奖金档</p> 
      </v-flex>
      <v-flex md12>
        <v-data-table  v-model="checkSelected" :headers="headers" :items="bonusData" :pagination.sync="pagination" select-all item-key="_id" class="elevation-1" no-data-text="暂无数据">
          <template v-slot:headers="props">
            <tr>
              <th>
                <v-checkbox :input-value="props.all" :indeterminate="props.indeterminate" primary  hide-details @click.stop="toggleAll"></v-checkbox>
              </th>
              <th v-for="header in props.headers" :key="header.text">{{ header.text }}</th>
            </tr>
          </template> 
          <template v-slot:items="props">
            <tr :active="props.selected" @click="props.selected = !props.selected" >
              <td class="text-xs-center">
                <v-checkbox :input-value="props.selected" primary hide-details v-show="props.item.status=='确认'" ></v-checkbox>
              </td>
              <td class="text-xs-center">{{ props.item.employee_id.name}}</td>
              <td class="text-xs-center">{{ props.item.department_id.name}}</td>
              <td class="text-xs-center">{{ props.item.bonus_type }}</td>
              <td class="text-xs-center" v-if="props.item.bonus_type=='双薪'">{{ props.item.origin_amount}}</td>
              <td class="text-xs-center" v-else>{{ props.item.amount}}</td>
              <td class="text-xs-center">{{ props.item.estimate_pay_date }}</td>
              <td class="text-xs-center">{{ props.item.status}}</td>
              <td class="text-xs-center">
                <v-btn small color="info" @click="checkClick(props.item)">查看</v-btn>
              </td>
            </tr>
          </template>
        </v-data-table>
      </v-flex>
    </div>
    <v-layout right>
      <v-flex>
        <v-btn small color="info" @click="auditing()">审核</v-btn>
        <v-btn small color="info" @click="goBack()">退回</v-btn>
      </v-flex>
    </v-layout>
    <snackbar ref="snackbar" />
  </v-container>
</template>
<script>
import Common from "../../../utils/common"
import snackbar from "../../components/snackbar";
export default {
  components: { snackbar },
  data: () => ({
    selectBindName: "全部",
    expectDate: new Date().toISOString().substr(0, 7),
    isDatePicker: false,
    //TODO 分页的排序 待修改
    pagination: {
      sortBy: "employee.name"
    },
    checkSelected: [],//复选框勾选的数据
    searchData: [],//搜索下拉的内容
    headers: [
      {text: "员工姓名", align: "center", sortable: false, value: "name" },
      {text: "所属部门", align: "center", value: "department",sortable: false},
      { text: "类型", align: "center", value: "type", sortable: false },
      { text: "金额", align: "center", value: "cash", sortable: false },
      { text: "预计发放日期", align: "center", value: "date", sortable: false },
      { text: "状态", align: "center", value: "status", sortable: false },
      { text: "功能", align: "center", sortable: false }
    ],
    bonusData: []
  }),
  mounted() {
    this.getBonusDeMoment(this.selectBindName,this.expectDate);
  },
  methods: {
    async getBonusDeMoment(name,date,type) {
      let param = name && name === "全部" ? {} : {employeeId:name }
      if(date){
        param.choosenMonth = date
      }
      let res = await this.$request.fetch("/api/salaryStructure/employeeShareSearch",param)
      if(res.data.status === 200){
        this.bonusData = res.data.result;
        for (let index = 0; index < res.data.result.length; index++) {
          this.searchData.push(res.data.result[index].employee_id);
        }
        this.searchData.unshift("全部");
        if(type == "search"){
          this.$refs.snackbar.showStatus("search")
        }
      }else{
        if(type == "search"){
          this.$refs.snackbar.showStatus("search","false")
        }else{
          this.$refs.snackbar.showError();
        }
      }
    },
    showDatePicker(){
      this.isDatePicker = false
    },
    async  auditing() {  
      let bonusWaitData = [];
      if(this.checkSelected.length === 0){
        this.$refs.snackbar.show("至少选择一个员工","error")
        return 
      }
      for(let i = 0;i < this.checkSelected.length;i++){
        bonusWaitData.push( this.checkSelected[i]._id)
      }
      let param = { bonusWaitIds:bonusWaitData , thrType: "bonusStatus",  thrId:1002}
      let res = await this.$request.fetch("/api/salaryStructure/updateStatus",param,"put")
      if(res.data.status === 200){
        this.getBonusDeMoment(this.selectBindName,this.expectDate);
        this.$refs.snackbar.show("审核成功")
      }else{
        this.$refs.snackbar.show("审核失败")
      }   
    },
    async  goBack() {
      let bonusWaitData = []
      if(this.checkSelected.length === 0){
        this.$refs.snackbar.show("至少选择一个员工","error")
        return 
      }
      for(let i = 0;i < this.checkSelected.length;i++){
        bonusWaitData.push(this.checkSelected[i]._id)
      }
      let param = { bonusWaitIds: bonusWaitData, thrType: "bonusStatus", thrId:1001}
      let res = await this.$request.fetch("/api/salaryStructure/updateStatus",param,"put")
      if(res.data.status === 200){
        this.getBonusDeMoment(this.selectBindName,this.expectDate);
        this.$refs.snackbar.show("退回成功")
      }else{
        this.$refs.snackbar.show("退回失败")
      }
    },
    checkClick(item) {
      this.$router.push({
        path: "departmentPerfor",
        query: {
          nameCode: item.employee_id.name,
          bonusId: item._id,
          auditAndConfirm: "employeeBonusWait",
          bonusType:item.bonus_type
        }
      });
    },
    search: Common.throttle(async function() {
      this.getBonusDeMoment(this.selectBindName,this.expectDate,"search");
    },2000),
    toggleAll() {
      if (this.checkSelected.length) {
        this.checkSelected = [];
      } else {
        this.checkSelected = this.bonusData;
      }
    },
    //TODO 分页的排序，待修改
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    }
  }
};
</script>
<style scoped>
.btn_color {
  background: rgb(148, 147, 147) !important;
  color: black !important;
}
.search {
  padding-left: 60px;
}
.search button {
  border-radius: 10px;
  margin-top: 15px;
}
.headerlist {
  background-color: #e0e1e2;
  border-radius: 10px;
  padding: 10px 20px;
  margin: -75px 0 30px;
}
.headerlist p:nth-of-type(2) {
  color: #333333;
  font-size: 13px;
  margin-top: -15px;
  margin-bottom: 0px;
}
.bg {
  box-shadow: 0 0 5px #979797;
  padding: 50px;
  margin-top: 50px;
}
</style>
