<template>
  <v-container fluid grid-list-xl>
    <!-- 搜索 -->
    <v-layout class="search">
      <v-flex xs12 sm2 md2>
        <v-autocomplete :items="selectDdata" label="请选择" v-model="selectBindData" item-text="employee_id.name" item-value="employee_id._id" no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
        <v-flex xs12 sm2 md2 >
        <v-menu  v-model="isShowDate" :close-on-content-click="false" :nudge-right="40" lazy transition="scale-transition" offset-y full-width min-width="100px">
          <template v-slot:activator="{ on }">
            <v-text-field v-model="expectDate" label="请选择预计发放日期" prepend-icon="event" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="expectDate" locale="zh-cn" @input="closeDatePicker()" type="month"></v-date-picker>
        </v-menu>
      </v-flex>
      <v-flex xs12 sm6 md1>
        <v-btn color="info" @click="search()">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
    </v-layout>
    <div class="bg">
      <v-flex class="headerlist" md12>
        <p>员工薪资结构</p>
        <p>部门员工待发奖金</p>
      </v-flex>
      <v-flex md12>
        <v-data-table :headers="headers" :items="bonusData" class="elevation-1" no-data-text="暂无数据">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.employee_id.name }}</td>
            <td class="text-xs-center">{{ props.item.department_id.name}}</td>
            <td class="text-xs-center">{{ props.item.estimate_pay_date}}</td>
            <td class="text-xs-center">{{ props.item.status}}</td>
            <td class="text-xs-center">{{ props.item.bonus_type}}</td>
            <td class="text-xs-center">
              <v-btn small color="info" @click="checkClick(props.item)">查看详情</v-btn>
              <v-btn small color="info" @click="confirmItem(props.item)" :disabled="props.item.status=='确认' || props.item.status=='核准'">确认</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </div>
       <snackbar ref="snackbar" />

  </v-container>

</template>
<script>
import Common from "../../../utils/common";
import snackbar from "../../components/snackbar";
export default {
  components:{snackbar},
  data: () => ({
    selectBindData: "",
    selectDdata: [],
    headers: [
      { text: "员工姓名", align: "center", sortable: false },
      { text: "所属部门", align: "center", sortable: false },
      { text: "预计发放日期", align: "center", sortable: false },
      { text: "状态", align: "center", sortable: false },
      { text: "奖金类型", align: "center", sortable: false },
      { text: "功能", align: "center", sortable: false }
    ],
    bonusData: [],
    managerId:"",
    expectDate: new Date().toISOString().substr(0, 7),
    isShowDate:false
  }),
  computed: {},
  mounted() {
    this.getBonusDepartment(this.selectBindData);
  },
  methods: {
    async getBonusDepartment(selectBindData,type){
      let param = {}
      param.employeeId = this.selectBindData && this.selectBindData == "全部" ? "" : this.selectBindData 
      param.date = this.expectDate 
      let res = await this.$request.fetch("/api/salaryStructure/departmentBonuswait",param)
      if(res.data.status === 200){
        this.bonusData = res.data.result
        if(!selectBindData){
          this.selectBindData = "全部"
          this.selectDdata = ["全部"]
          res.data.result.forEach(item=>{
            this.selectDdata.push(item)
          })
        }
        if(type == "search"){
          this.$refs.snackbar.showStatus("search");
        }
        if(this.bonusData.length > 0) {
          this.managerId = this.bonusData[this.bonusData.length - 1].department_id.manager_id  
          return 
        }
      }else if(res.data.status === 501){
        this.$refs.snackbar.show("未找到当前用户信息","error")
      }else if(res.data.status === 502){
        this.$refs.snackbar.show("权限不足","error")
      }else {
        if(type == "search"){
          this.$refs.snackbar.showStatus("search",false);
        }else{
          this.$refs.snackbar.showError();
        }
        
      }
    },
    async confirmItem(item){
      if( item.status == "草稿"){
        let bonusWaitData = [item._id]
        let res = await this.$request.fetch("/api/salaryStructure/updateStatus",{bonusWaitIds: bonusWaitData, thrType:"bonusStatus", thrId:1003},"put" )
        if(res.data.status === 200){
          this.$refs.snackbar.show("确认成功","info")
          this.getBonusDepartment();
        }else{
          this.$refs.snackbar.show("确认失败","error")
        }
      }
    },
    search:Common.throttle(
      async function(){
        this.getBonusDepartment(this.selectBindData,"search");
      }
    ) ,
    checkClick(item) {
      this.$router.push({
        path: "departmentPerfor",
        query: {
          bonusId: item._id,
          nameCode: item.employee_id.name,
          auditAndConfirm: "departmentBonusWait",
          bonusType:item.bonus_type,
          managerId:this.managerId
        }
      });
    },
    closeDatePicker() {
      this.isShowDate = false;
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
