<template>
  <v-container fluid grid-list-xl>
    <v-layout class="search">
      <v-flex xs12 sm2 md2>
        <v-autocomplete :items="selectPeriodData" label="请选择/输入周期" item-text="period" v-model="regulardate"  no-data-text="暂无数据"></v-autocomplete>
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
        <v-data-table :headers="headers" :items="bonusWaitData" class="elevation-1" no-data-text="暂无数据">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.bonus_pool_id.period_start + "~" + props.item.bonus_pool_id.period_end}}</td>
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
    regulardate: "全部",
    selectPeriodData: [],
    headers: [
      { text: "所属周期", align: "center", value: "period", sortable: false },
      { text: "绩效合计金额", align: "center", value: "amount", sortable: false},
      { text: "预计发放日期", align: "center",value: "estimate_pay_date", sortable: false},
      { text: "是否发放", align: "center", value: "is_paid", sortable: false },
      { text: "功能", align: "center", width: "100px", sortable: false }
    ],
    bonusWaitData: []
  }),
  mounted() {
    this.getPerformance();
  },
  methods: {
    async getPerformance() {
      let params = { thrType: "bonusType", thrId: "1003", personal: true}
      let res = await this.$request.fetch("/api/salaryStructure/bonuswaitInfoPerfor", params)
      if(res.data.status === 200){
        this.bonusWaitData = res.data.result;
        for (const iterator of this.bonusWaitData) {
          this.selectPeriodData.push(iterator);
          let period = iterator.bonus_pool_id.period_start + "~" + iterator.bonus_pool_id.period_end         
          this.employee_id = iterator.employee_id._id
          Object.assign(iterator,{period:period})
        }
        this.selectPeriodData.unshift("全部");
      }else{
        this.$refs.snackbar.showError();
      }
    },
    search:Common.throttle(
      async function(){
        let  params = { thrType: "bonusType", thrId: "1003" };
        params.employee_id = this.employee_id
        params.period = this.regulardate == "全部" ?  "" : this.regulardate
        let res = await this.$request.fetch("/api/salaryStructure/bonuswait",params)
        if(res.data.status === 200){
          this.bonusWaitData = res.data.result
          this.$refs.snackbar.showStatus("search");
        }else{
          this.$refs.snackbar.showStatus("search",false);
        }
      }
    ),
    checkClick(item) {
      this.$router.push({
        path: "checkPerfor",
        query: {
          employeeName: item.employee_id.name,
          _idCode: item._id,
          bonusType: "performance",
          emnployeeId: item.employee_id._id,
          period:item.bonus_pool_id.period_start + "~" + item.bonus_pool_id.period_end
        }
      });
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
