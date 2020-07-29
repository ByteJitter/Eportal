<template>
    <v-container fluid grid-list-xl>
        <v-layout pl-5>
            <v-flex xs12 sm6 md2>
                <v-menu v-model="menu" :close-on-content-click="false" :nudge-right="40" lazy transition="scale-transition"
                        offset-y full-width max-width="290px" min-width="290px">
                    <template v-slot:activator="{ on }">
                        <v-text-field v-model="date" label="请选择月份" prepend-icon="event" readonly v-on="on"></v-text-field>
                    </template>
                    <v-date-picker type="month" v-model="date" @input="menu = false" locale="zh-cn"></v-date-picker>
                </v-menu>
            </v-flex>
            <v-flex xs12 sm6 md2 mt-1>
                <v-btn color="info" class="button" @click="getEmployeePayslip(true)">
                    <v-icon>search</v-icon>搜索
                </v-btn>
            </v-flex>
        </v-layout>
        <v-card class="mt-5 pa-5">
            <page-title :title="title" :subtitle="subtitle" />
            <v-flex md12>
                <v-data-table  :headers="headers" :items="flag" class="elevation-1" no-data-text="暂无数据">
                    <template v-slot:items="props">
                        <td>{{ props.item.no}}</td>
                        <td>{{ props.item._id}}</td>
                        <td>{{ props.item.dep}}</td>
                        <td>{{ props.item.type.projectBonus}}</td>
                        <td>{{ props.item.type.performanceBonus}}</td>
                        <td>{{ props.item.type.gift_money}}</td>
                        <td>{{ props.item.type.equityBonus}}</td>
                        <td>{{ props.item.type.double_sal}}</td>
                        <td>{{ props.item.type.double_sal}}</td>
                    </template>
                </v-data-table>
            </v-flex>
        </v-card>
    </v-container>
</template>
<script>
import pageTitle from '@/views/components/pageTitle.vue';

export default {
  name: "personalPayslip",
  components: { pageTitle },
  data: () => ({
    title: '员工薪资单',
    subtitle: '奖金合计',
    date: new Date().toISOString().substr(0, 4),
    menu: false,
    headers: [
      { text: "工号", value: "number", sortable: false },
      { text: "姓名", value: "name", sortable: false },
      { text: "部门", value: "department", sortable: false },
      { text: "项目奖金", value: "projectBonus", sortable: false },
      { text: "绩效奖金", value: "performanceBonus", sortable: false },
      { text: "一般分红", value: "normalBonus", sortable: false },
      { text: "股权分红", value: "equityBonus", sortable: false },
      { text: "双薪", value: "doublePay", sortable: false },
      { text: "奖金合计", value: "bonusTotal", sortable: false },
    ],
    bonusData: [],
    flag: []
  }),
  async mounted() {
    let res = await this.getEmployee();
    if (res.data.status === 200) {
      this.bonusData = res.data.result;
      let bonus = res.data.result;
      this.flag = res.data.result;
      for (let i = 0; i < bonus.length; i++) {
        if (bonus[i].type[0] === null){
          bonus[i].type = [{double_sal: 0,equityBonus: 0,gift_money: 0,performanceBonus: 0,projectBonus:0}];
        } else {
          bonus[i].type = bonus[i].type;
        }
        let change = bonus[i].type;
        let obj = {};
        change.forEach(item => {
          let keys = Object.keys(item);
          keys.forEach(list => {
            obj[list] = item[list];
          })
        });
        this.flag[i].type = obj;
      }
    }
  },
  methods: {
    async getEmployee() {
      let allEmp;
      return   allEmp = await this.$request.fetch("/api/salaryList/bonusTotal");
    }
  }
};
</script>
<style scoped>
    @import "../../../assets/css/common.css";
</style>
