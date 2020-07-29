<template>
  <v-container fluid grid-list-xl>
    <v-layout class="search">
      <v-flex xs12 sm2 md2>
        <v-autocomplete :items="selectData" label="请选择/输入员工" item-text="name" item-value="_id.employee_id" v-model="selectEmployeeId" no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm2 md2>
        <v-autocomplete :items="selectPeriodData" label="请选择/输入所属周期" item-text="employeename" item-value="_id.employee_id" v-model="periodSeleted" no-data-text="暂无数据"></v-autocomplete>
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
        <p>分红管理</p>
      </v-flex>
      <v-flex md12>
        <v-data-table :headers="headers" no-data-text="暂无数据" :items="shaerBonusData" class="elevation-1">
          <template v-slot:items="props">
            <td class="text-xs-center">{{props.item.name}}</td>
            <td class="text-xs-center">{{ props.item.period_start + "~" + props.item.period_end}}</td>
            <td class="text-xs-center">{{ props.item.sum }}</td>
            <td class="text-xs-center">{{ props.item.estimate_pay_date }}</td>
            <td class="text-xs-center">{{ props.item.is_paid==true?"是":"否"}}</td>
            <td class="text-xs-center">
              <v-btn small color="info" @click="checkClick(props.item)">查看详情</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </div>
       <snackbar ref="snackbar" />
  </v-container>
</template>
<script>
import Common from "@/utils/common";
import snackbar from "@/views/components/snackbar";
export default {
  name: "shareBonus",
  components: { snackbar },
  data: () => ({
    periodSeleted:'全部',
    bonusType:"分红",
    selectEmployeeId:"全部",
    selectData: ["全部"],
    selectPeriodData:["全部"],
    editedItem:{
      _id:"",
      name:""
    },
    headers: [
      {text: "员工姓名",align: 'center',sortable: false,value: "name"},
      { text: "所属周期", align: 'center',value: "period", sortable: false },
      { text: "分红合计金额", align: 'center',value: "amount", sortable: false },
      { text: "分红日期",align: 'center', value: "estimate_pay_date", sortable: false },
      { text: "是否发放", align: 'center',value: "is_paid", sortable: false },
      { text: "功能", align: "center",sortable: false }
    ],
    shaerBonusData: [],
  }),
  mounted() {
    this.getBonuswait(this.selectEmployeeId,this.periodSeleted);
  },
  methods: {
    async getBonuswait(selectEmployeeId,periodSeleted,type) {
      let params = {}
      params.employee_id = selectEmployeeId === "全部" ? "" : selectEmployeeId;
      params.period = periodSeleted === "全部" ? "" : periodSeleted;
      let res = await this.$request.fetch("/api/salaryStructure/sharesBonuswait",params)
      if(res.data.status === 200){
        this.shaerBonusData = res.data.result
        for (const iterator of res.data.result) {
          this.selectData.push(iterator)
          let period = iterator.period_start + "~" + iterator.period_end
          Object.assign(iterator,{period:period})
          this.selectPeriodData.push(iterator)
        }
        if(type === "search"){
          this.$refs.snackbar.showStatus("search");
        }
      } else{
        if(type === "search"){
          this.$refs.snackbar.showStatus("search",false);
        }else{
          this.$refs.snackbar.showError();
        }
      }
    },
    search:Common.throttle(
      async function(){
        await this.getBonuswait(this.selectEmployeeId,this.periodSeleted,"search");
      }
    ),
    checkClick(item){
      this.$router.push({ 
        path:"checkPerfor",
        query: {
          employeeName:item.name,
          emnployeeId:item._id.employee_id,
          period:item.period,
          bonusType:"shareBonus"
        }
      })
    },
    async getPeriod(){
      let params = {};
      params.employee_id = this.selectEmployeeId == "全部" ?  "" : this.selectEmployeeId
      this.selectPeriodData = ["全部"]
      let res = await this.$request.fetch("/api/salaryStructure/sharesBonuswait",params)
      for (const iterator of res.data.result) {
        let period = iterator.period_start + "~" + iterator.period_end
        Object.assign(iterator,{period:period})
        this.selectPeriodData.push(iterator)
      }
    },
  },
  watch:{
    selectEmployeeId(val){
      this.periodSeleted = "全部"
      this.getPeriod()
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
