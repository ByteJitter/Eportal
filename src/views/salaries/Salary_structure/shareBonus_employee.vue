<template>
  <v-container fluid grid-list-xl>
    <v-layout class="search">
      <v-flex xs12 sm2 md2>
        <v-autocomplete :items="selectPeriodData" label="请输入周期"  item-text="period" v-model="regulardate"  no-data-text="暂无数据"></v-autocomplete>
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
        <p>分红管理</p>
      </v-flex>
      <v-flex md12>
        <v-data-table :headers="headers" :items="bonusWaitData" class="elevation-1" no-data-text = "暂无数据">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.period }}</td>
            <td class="text-xs-center">{{ props.item.sum }}</td>
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
    regulardate:'全部',
    selectPeriodData: ["全部"],
    headers: [
      { text: "所属周期", align: 'center',value: "period", sortable: false },
      { text: "分红合计金额", align: 'center',value: "amount", sortable: false },
      { text: "分红日期",align: 'center', value: "estimate_pay_date", sortable: false },
      { text: "是否发放", align: 'center',value: "is_paid", sortable: false },
      { text: "功能", align: "center",sortable: false }
    ],
    bonusWaitData: []
  }),
  created() {
    this.getBonuswait(this.regulardate);
  },
  methods: {
    async getBonuswait(regulardate,type) {
      let params = { personal: true}
      params.period = regulardate === "全部" ? "" : regulardate;
      let res = await this.$request.fetch("/api/salaryStructure/sharesBonuswait", params)
      if(res.data.status === 200){
        this.bonusWaitData = res.data.result;
        for (const iterator of this.bonusWaitData) {
          let period = iterator.period_start + "~" + iterator.period_end         
          Object.assign(iterator,{period:period})
          this.selectPeriodData.push(iterator);
        }
        this.selectPeriodData.unshift("全部");
        if(type === "search"){
          this.$refs.snackbar.showStatus("search")
        }
      }else{
        if(type === "search"){
          this.$refs.snackbar.showStatus("search",false)
        }else{
          this.$refs.snackbar.showError();
        }
      }
    },
    search:Common.throttle(
      async function(){
        await this.getBonuswait(this.regulardate,"search");
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
      })}
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
