<template>
  <v-container fluid grid-list-xl>
    <div class="bg">
      <v-flex class="headerList" md12>
        <p>员工薪资结构</p>
        <p>股票管理</p>
      </v-flex>
      <v-flex md12>
        <v-data-table  :headers="headers" :items="bonusWaitData" class="elevation-1" no-data-text="暂无数据">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.name }}</td>
            <td class="text-xs-center">{{ props.item.remain_stock}}</td>
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
import snackbar from "@/views/components/snackbar";
import { log } from "util";
export default {
  components: { snackbar },
  data: () => ({
    items: [],
    editedIndex: -1,
    defaultItem: {},
    headers: [
      { text: "员工姓名", sortable: false, align: "center", value: "name" },
      { text: "剩余股票数", value: "remain_stock", align: "center", sortable: false},
      { text: "功能", align: "center", sortable: false }
    ],
    bonusWaitData: []
  }),
  mounted() {
    this.getEmployees();
  },
  methods: {
    async getEmployees() {
      let res = await this.$axios.get("/api/salaryStructure/employeeStockPersonal", {});
      if (res.data.status === 200) {
        if(res.data.result == null ){
          this.bonusWaitData = []
          return 
        }
        this.bonusWaitData.push(res.data.result);
      }else{
        this.$refs.snackbar.showError();
      }
    },
    checkClick(item) {
      this.$router.push({
        path: "checkStock",
        query: {
          nameCode: item.name,
          remain_stockCode: item.remain_stock,
          _idCode: item._id,
          is_show: "unshow"
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
.deleteTitle {
  padding: 40px;
  font-size: 20px;
  display: inline-block;
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
