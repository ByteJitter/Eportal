<template>
  <v-container fluid grid-list-xl>
    <v-flex class="headerlist" md12>
      <p>{{employeeName}}的{{isShow ? "绩效": "分红"}}</p>
    </v-flex>
    <div class="bg">
      <v-flex md12>
        <v-data-table   v-if="isShow" :headers="headers" :items="bonusManageData" class="elevation-1">
          <template v-slot:items="props">
            <td class="text-xs-center" v-if="isShow ">{{ props.item.bonus_pool_id.period_start +'~'+ props.item.bonus_pool_id.period_end}}</td>
            <td class="text-xs-center" v-if="isShow ">{{ props.item.amount}}</td>
            <td class="text-xs-center" v-if="isShow">{{ props.item.estimate_pay_date}}</td>
          </template>
        </v-data-table>
        <v-data-table v-if="!isShow && bonusManageData.length > 0 "  :headers="headers" :items="bonusManageData[0].alldata" class="elevation-1" no-data-text="暂无数据">
          <template v-slot:items="props">
            <td class="text-xs-center" >{{ props.item.bonusType}}</td>
            <td class="text-xs-center" >{{ props.item.estimate_pay_date}}</td>
            <td class="text-xs-center" >{{ props.item.amount}}</td>
          </template>
        </v-data-table>
      </v-flex>
      <v-layout class="returnback">
        <v-flex>
          <span @click="returnBack()">
            <v-btn color="info">返回</v-btn>
          </span>
        </v-flex>
      </v-layout>
    </div>
  </v-container>
</template>
<script>
export default {
  name: "checkPerfor",
  data: () => ({
    employeeName: "",
    headers: [
      { text: "绩效迄止日期", align: "center", value: "startDate",  sortable: false},
      { text: "绩效金额", align: "center", value: "origin_amount", sortable: false},
      { text: "绩效发放日期", align: "center", value: "calculateDate", sortable: false},
      { text: "分红类型",align: 'center', value: "bonus_type", sortable: false },
      { text: "分红时间",align: 'center', value: "estimate_pay_date", sortable: false },
      { text: "分红金额", align: 'center',value: "origin_amount", sortable: false },
    ],
    bonusManageData: [],
    isShow:true
  }),
  mounted(){
    this.initialize();
    this.getCheckPerfor();
   
  },
  methods: {
    initialize() {
      this.employeeName = this.$route.query.employeeName; //员工name
      this.employeeId = this.$route.query.emnployeeId; //bonuswait的id
      this.bonusType = this.$route.query.bonusType //绩效、分红
      this.period = this.$route.query.period
      if(this.bonusType == "performance"){
        this.isShow = true
        this.headers.splice(3,5)
      }else if(this.bonusType == "shareBonus"){
        this.isShow = false
        this.headers.splice(0,3)
      }
    },
    async getCheckPerfor() {
      let result;
      if(this.isShow){
        let param = { thrType: "bonusType",  thrId: 1003,  employee_id: this.employeeId,period:this.period}
        result = await this.$request.fetch("/api/salaryStructure/bonuswait", param)
      
      }else if(!this.isShow ){
        let param = {employee_id: this.employeeId, period: this.period}
        result = await this.$request.fetch("/api/salaryStructure/sharesBonuswait", param)
      }
      if(result.data.status === 200){
        this.bonusManageData = result.data.result;
      }else{
        this.$refs.snackbar.showError();
      }
    },
    returnBack() {
      history.go(-1);
    }
  }
};
</script>
<style scoped>
.headerlist {
  background-color: #e0e1e2;
  padding: 10px 20px;
  text-align: center;
}
.headerlist p {
  color: #333333;
  font-size: 15px;
  margin-top: 15px;
}
.bg {
  box-shadow: 0 0 5px #979797;
  padding: 50px;
}
.returnback {
  text-align: right;
  padding-right: 40px;
  padding-top: 40px;
}
.returnback span {
  cursor: pointer;
}
</style>
