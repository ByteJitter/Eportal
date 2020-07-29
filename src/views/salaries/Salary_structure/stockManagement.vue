<template>
  <v-container fluid grid-list-xl>
    <!-- 搜索 -->
    <v-layout class="search">
      <v-flex xs2 sm2 md3>
        <v-autocomplete :items="selectData" label="请选择/输入员工姓名" item-text="name" item-value="_id" v-model="employeeId" no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
      <v-flex xs1 sm1 md1>
        <v-btn color="info" @click="search()">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
      <v-flex xs1 sm1 md2 ml-5>
        <v-btn color="info" @click="addStockEmployee()">
          <v-icon>add</v-icon>新增股权人员
        </v-btn>
      </v-flex>
    </v-layout>
    <v-dialog v-model="dialog" max-width="500px" persistent>
      <v-card>
        <v-card-title>
          <v-flex class="headline" md4 offset-md1>添加股权人员</v-flex>
        </v-card-title>
        <v-card-text>
          <v-layout align-center ml-4>
            <v-flex xs12 sm6 md4>
              <v-subheader>员工姓名</v-subheader>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-autocomplete :items="selectEmployeeList" label="请选择员工" item-text="name" item-value="_id" v-model="addSelectEmployee" :error-messages="addSelectEmployeeErrors" required @change="$v.addSelectEmployee.$touch()" @blur="$v.addSelectEmployee.$touch()"  no-data-text="暂无数据"></v-autocomplete>
            </v-flex>
          </v-layout>
          <v-layout align-center ml-4>
            <v-flex xs12 sm6 md4>
              <v-subheader>股权数</v-subheader>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-text-field v-model="remainStock" placeholder="请输入数字" :error-messages="amountErrors" :counter="10" required @input="$v.remainStock.$touch()" @blur="$v.remainStock.$touch()">
              </v-text-field>
            </v-flex>
          </v-layout>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="close()">取消</v-btn>
          <v-btn color="blue darken-1" flat @click="saveAdd()">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
     <confirm-dialog ref="confirmDialog" @enableDelete="enableDelete" />
    <div class="bg">
      <v-flex class="headerlist" md12>
        <p>员工薪资结构</p>
        <p>股票管理</p>
      </v-flex>
      <v-flex md12>
        <v-data-table :headers="headers" :items="stockEmployeeList" class="elevation-1" :pagination.sync="pagination" no-data-text="暂无数据">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.name }}</td>
            <td class="text-xs-center">{{ props.item.remain_stock}}</td>
            <td class="text-xs-center">
              <v-btn small color="info" @click="checkClick(props.item)">查看详情</v-btn>
              <v-btn small color="info" @click="deleteItem(props.item)">删除</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
      <!-- 弹框 -->
      <snackbar ref="snackbar" />
    </div>
  </v-container>
</template>
<script>
import { log } from "util";
import { required, numeric, maxLength } from "vuelidate/lib/validators";
import Common from "@/utils/common";
import snackbar from "@/views/components/snackbar";
import confirmDialog from "@/views/components/confirmDialog";
export default {
  components: { snackbar,confirmDialog},
  validations: {
    addSelectEmployee: { required },
    remainStock: { required, numeric }
  },
  data: () => ({
    employeeId: "全部",
    currentEmployeeId:"全部",
    selectData: [],
    addSelectEmployee: "",
    pagination: { sortBy: "name" },
    selectEmployeeList: [],
    dialog: false,
    headers: [
      { text: "员工姓名", value: "name", align: "center", sortable: false },
      { text: "剩余股票数", value: "remain_stock", align: "center", sortable: false },
      { text: "功能", value: "", align: "center", sortable: false }
    ],
    stockEmployeeList: [],
    remainStock: ""
  }),
  mounted() {
    this.getEmployees(this.employeeId);
  },
  computed: {
    amountErrors() {
      const errors = [];
      if (!this.$v.remainStock.$dirty) return errors;
      !this.$v.remainStock.required && errors.push("请输入股票数");
      !this.$v.remainStock.numeric && errors.push("请输入数字");
      return errors;
    },
    addSelectEmployeeErrors() {
      const errors = [];
      if (!this.$v.addSelectEmployee.$dirty) return errors;
      !this.$v.addSelectEmployee.required && errors.push("请选择一个");
      return errors;
    }
  },
  methods: {
    async getEmployees(employeeId,type) {
      let param = employeeId && employeeId == "全部" ? {} : {employeeId: employeeId}
      let res = await this.$request.fetch("/api/salaryStructure/searchEmployee", param);
      if (res.data.status === 200) {
        this.stockEmployeeList = res.data.result;
        if(employeeId == "全部"){
          this.getSearchData(res.data.result)
        }
        if(type === "search"){
          this.$refs.snackbar.showStatus("search")
          this.currentEmployeeId = this.employeeId
        }
      }else{
        if(type === "search"){
          this.$refs.snackbar.showStatus("search",false)
        }else{
          this.$refs.snackbar.showError();
        }
      }
    },
    getSearchData(data) {
      this.selectData = ["全部"];
      data.forEach(item => {
        this.selectData.push(item);
      });
    },
    search: Common.throttle(async function() {
      this.getEmployees(this.employeeId,"search")
    },2000),
    close() {
      this.dialog = false;
    },
    async addStockEmployee(item) {
      this.$v.$reset();
      this.selectEmployeeList = [];
      this.dialog = true;
      let res = await this.$request.fetch("/api/salaryStructure/chooseEmployee");
      if(res.status === 200 ){
        for (const iterator of res.data.result) {
          this.selectEmployeeList.push(iterator);
        }
      }else{
        this.selectEmployeeList = []
      }
    },
    deleteItem(item) {
      this.stockEmployeeId = item._id;
      this.$refs.confirmDialog.show();
    },
    async enableDelete() {
      let param = { employee_id: this.stockEmployeeId }
      let res = await this.$request.fetch("/api/salaryStructure/employeeStock",param,"delete");
      if (res.data.status === 200) {
        this.close();
        if(this.stockEmployeeList.length === 1 || this.stockEmployeeId == this.employeeId){
          this.employeeId = "全部"
          this.currentEmployeeId = "全部"
        }
        this.getEmployees(this.currentEmployeeId,"delete");
        this.$refs.snackbar.showStatus("delete")

      } else {
        this.$refs.snackbar.showStatus("delete",false)
      }
    },
    async saveAdd() {
      this.$v.$touch();
      if(!this.remainStock || !this.addSelectEmployee){
        this.$refs.snackbar.show("内容不能为空","error")
        return 
      }
      let param = { remain_stock: Number(this.remainStock), employee_id: this.addSelectEmployee };
      let res = await this.$request.fetch("/api/salaryStructure/employeeStock",  param, "post"  );
      if (res.data.status === 200) {
        this.$refs.snackbar.showStatus("add")
        this.selectData.push(res.data.result)
        this.getEmployees(this.currentEmployeeId)
        this.close();
        this.remainStock = "";
        this.addSelectEmployee = "";
      } else {
        this.$refs.snackbar.showStatus("add",false)
        this.dialog = true;
      }
    },
    checkClick(item) {
      this.$router.push({
        path: "checkStock",
        query: {
          nameCode: item.name,
          remain_stockCode: item.remain_stock,
          _idCode: item._id
        }
      });
    },
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
