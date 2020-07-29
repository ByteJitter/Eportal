<template>
  <v-container fluid grid-list-xl>
    <!-- 搜索 -->
    <v-layout class="search">
      <v-flex xs12 sm2 md2>
        <v-autocomplete :items="selectData" label="请选择/输入员工" item-text="name" item-value="_id" v-model="selectEmployeeId" no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
      <!-- <v-flex xs12 sm2 md2>
        <v-text-field label="输入周期" v-model="periodSeleted"></v-text-field>
      </v-flex> -->
      <v-flex xs12 sm2 md2 >
          <v-autocomplete  :items="selectBonusDate" label="请选择/输入所属周期" v-model="periodSeleted" item-text="name" item-value="_id" no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm6 md1>
        <v-btn color="info" @click="search()">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
    </v-layout>
    <div class="bg">
      <v-flex class="headerList" md12>
        <p>员工薪资结构</p>
        <p>绩效管理</p>
      </v-flex>
      <v-flex md12>
        <v-data-table :headers="headers" :items="performanceData" class="elevation-1" no-data-text="暂无数据"> 
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.employee_id.name}}</td>
            <td class="text-xs-center" >{{ props.item.bonus_pool_id.period_start +'~'+ props.item.bonus_pool_id.period_end}}</td>
            <td class="text-xs-center">{{props.item.amount}}</td>
            <td class="text-xs-center">{{ props.item.estimate_pay_date }}</td>
            <td class="text-xs-center">{{ props.item.is_paid==true?"是":"否"}}</td>
            <td class="text-xs-center">
              <v-btn small color="info" @click="checkClick(props.item)">查看详情</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
      <snackbar ref="snackbar" />
    </div>
  </v-container>
</template>
<script>
import Common from "@/utils/common";
import snackbar from "@/views/components/snackbar";
export default {
  components: { snackbar },
  data: () => ({
    periodSeleted: "全部",
    selectEmployeeId:"全部",
    selectData: [],
    selectBonusDate:[],
    editedItem: {
      _id: "全部"
    },
    headers: [
      { text: "员工姓名", align: "center", sortable: false, value: "name" },
      { text: "所属周期", align: "center", value: "period", sortable: false },
      { text: "绩效合计金额", align: "center", value: "amount", sortable: false },
      { text: "预计发放日期", align: "center", value: "estimate_pay_date", sortable: false },
      { text: "是否发放", align: "center", value: "is_paid", sortable: false },
      { text: "功能", align: "center", width: "100px", sortable: false }
    ],
    performanceData: []
  }),
  mounted() {
    this.getPerformance(this.selectEmployeeId,this.periodSeleted);
  },
  methods: {
    async getPerformance(selectEmployeeId,periodSeleted,type) {
      let params = { thrType: "bonusType", thrId: "1003" };
      params.employee_id = selectEmployeeId == "全部" ?  "" : selectEmployeeId
      params.period = periodSeleted == "全部" ?  "" : periodSeleted
      let res = await this.$request.fetch("/api/salaryStructure/bonuswait",params)
      if (res.data.status === 200) {
        this.performanceData = res.data.result;
        for (const iterator of this.performanceData) {
          this.selectData.push(iterator.employee_id);
          let period = iterator.bonus_pool_id.period_start + "~" + iterator.bonus_pool_id.period_end
          this.selectBonusDate.push(period)
        }
        if(type == "search"){
          this.$refs.snackbar.showStatus("search");
        }
        this.selectData.unshift("全部");
        this.selectBonusDate.unshift("全部");
      }else{
        if(type == "search"){
          this.$refs.snackbar.showStatus("search",false);
        }else{
          this.$refs.snackbar.showError();
        }
      }
    },
    async getPeriod(){
      let params = { thrType: "bonusType", thrId: "1003" };
      params.employee_id = this.selectEmployeeId == "全部" ?  "" : this.selectEmployeeId
      params.period = this.periodSeleted == "全部" ?  "" : this.periodSeleted
      this.selectBonusDate = ["全部"]
      let res = await this.$request.fetch("/api/salaryStructure/bonuswait",params)
      for (const iterator of res.data.result) {
        let period = iterator.bonus_pool_id.period_start + "~" + iterator.bonus_pool_id.period_end
        this.selectBonusDate.push(period)
      }
    },
    search:Common.throttle(
      async function(){
        await this.getPerformance(this.selectEmployeeId,this.periodSeleted,"search");
      }
    ),
    checkClick(item) {

      this.$router.push({
        path: "checkPerfor",
        query: {
          employeeName: item.employee_id.name,
          emnployeeId: item.employee_id._id,
          bonusType: "performance",
          period:item.bonus_pool_id.period_start + "~" + item.bonus_pool_id.period_end
        }
      });
    }
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
.headerList {
  background-color: #e0e1e2;
  border-radius: 10px;
  padding: 10px 20px;
  margin: -75px 0 30px;
}
.headerList p:nth-of-type(2) {
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
