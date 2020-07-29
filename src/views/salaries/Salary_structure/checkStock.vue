<template>
  <v-container fluid grid-list-xl>
    <v-dialog v-model="dialog" max-width="500px">
      <v-card >
        <v-card-title>
          <v-flex class="headline" md4 offset-md1>{{dialogTitle}}</v-flex>
        </v-card-title>
        <v-card-text>
          <v-layout align-center ml-4>
            <v-flex xs12 sm6 md4>
              <v-subheader>员工姓名</v-subheader>
            </v-flex>
            <v-flex xs12 sm6 md4>{{tableName}}</v-flex>
          </v-layout>
          <v-layout align-center ml-4>
            <v-flex xs12 sm6 md4>
              <v-subheader>股票交易类型</v-subheader>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-select :items="stockType"  v-model="editedItem.transaction_type" :error-messages="transaction_typeErrors" required
                @change="$v.editedItem.transaction_type.$touch()" @blur="$v.editedItem.transaction_type.$touch()"></v-select>
            </v-flex>
          </v-layout>
          <v-layout align-center ml-4>
            <v-flex xs12 sm6 md4>
              <v-subheader>股票交易时间</v-subheader>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-menu v-model="isDateOpen" :close-on-content-click="false" :nudge-right="40" lazy transition="scale-transition" offset-y full-width min-width="100px">
                <template v-slot:activator="{ on }">
                  <v-text-field v-model="stockDate" label="请选择" prepend-icon="event" readonly v-on="on"></v-text-field>
                </template>
                <v-date-picker v-model="stockDate" @input="isDateOpen = false"></v-date-picker>
              </v-menu>
            </v-flex>
          </v-layout>
          <v-layout align-center ml-4>
            <v-flex xs12 sm6 md4>
              <v-subheader>交易股票数</v-subheader>
            </v-flex>
            <v-flex xs12 sm6 md4>
              <v-text-field placeholder="请输入数字" v-model="editedItem.qty" :error-messages="qtyErrors" required  @blur="$v.editedItem.qty.$touch()" @change="$v.editedItem.qty.$touch()">
              </v-text-field>
            </v-flex>
          </v-layout>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="close()">取消</v-btn>
          <v-btn color="blue darken-1" flat @click="saveAdd()" v-if = "isAddButton == -1">确定</v-btn>
          <v-btn color="blue darken-1" flat @click="saveEdit()" v-else>确定</v-btn>
        </v-card-actions>
      </v-card>
      <confirm-dialog ref="confirmDialog" @enableDelete="enableDelete" />
    </v-dialog>
    <v-flex class="headerlist" md12>
      <p>{{tableName}}的股票管理数</p>
    </v-flex>
    <div class="bg">
      <v-flex xs12 sm6 md1 class="search" v-if="isShow">
        <v-btn color="info" @click="addItem()">
          <v-icon>add</v-icon>新增交易记录
        </v-btn>
      </v-flex>
      <v-flex md12>
        <v-data-table :headers="headers" :items="stockData" class="elevation-1" no-data-text="暂无数据">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.transaction_type}}</td>
            <td class="text-xs-center">{{ props.item.transaction_time}}</td>
            <td class="text-xs-center">{{(props.item.transaction_type=="购买"||props.item.transaction_type=="发放")?props.item.qty:-props.item.qty}}</td>
            <td class="text-xs-center">{{props.item.remain_qty}}</td>
            <td class="text-xs-center">
              <v-btn v-if="isShow" small color="info" @click="editItem(props.item)">编辑</v-btn>
              <v-btn v-if="isShow" small color="info" @click="deleteItem(props.item)">删除</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </div>
    <v-layout>
      <v-flex md12 class="headertitle">
        <span @click="returnback()">
          <v-btn small color="info">返回</v-btn>
        </span>
      </v-flex>
    </v-layout>
    <snackbar ref="snackbar" />
  </v-container>
</template>
<script>
import { required, numeric } from "vuelidate/lib/validators";
import Common from "@/utils/common";
import snackbar from "@/views/components/snackbar.vue";
import confirmDialog from "@/views/components/confirmDialog";
export default {
  components: { snackbar, confirmDialog },
  validations: {
    editedItem: {
      transaction_type: { required },
      qty: { required, numeric }
    }
  },
  data: () => ({
    stockDate: new Date().toISOString().substr(0, 10),
    isDateOpen: false,
    qty: "",
    stockType: ["发放", "购买", "卖出", "转移"],
    dialog: false,
    tableName: "",
    editedItem: {
      transaction_type: "",
      transaction_time: "",
      qty: "",
      remain_qty: ""
    },
    isAddButton: -1,
    defaultItem: {},
    headers: [
      { text: "股票交易类型", align: "center", value: "transaction_type", sortable: false},
      { text: "股票交易时间",align: "center", value: "transaction_time",sortable: false },
      { text: "交易股票数", align: "center", value: "qty", sortable: false },
      { text: "剩余总股数", align: "center", value: "remain_qty", sortable: false },
      { text: "功能", align: "center", sortable: false }
    ],
    stockData: [],
    isShow: true,
    addRemainStock:0
  }),
  computed: {
    dialogTitle() {
      return this.isAddButton === -1 ? "添加记录" : "编辑内容";
    },
    qtyErrors() {
      const errors = [];
      if (!this.$v.editedItem.qty.$dirty) return errors;
      !this.$v.editedItem.qty.required && errors.push("内容不能为空");
      !this.$v.editedItem.qty.numeric && errors.push("请输入数字");
      return errors;
    },
    transaction_typeErrors() {
      const errors = [];
      if (!this.$v.editedItem.transaction_type.$dirty) return errors;
      !this.$v.editedItem.transaction_type.required &&
        errors.push("请选择内容");
      return errors;
    }
  },
  mounted() {
    this.initialize();
    this.getStock();
  },
  methods: {
    initialize() {
      this.remain_qty = this.$route.query.remain_stockCode;
      this.tableName = this.$route.query.nameCode;
      this._id = this.$route.query._idCode;
      if (this.$route.query.is_show == "show") {
        this.isShow = true;
      } else if (this.$route.query.is_show == "unshow") {
        this.isShow = false;
        this.headers[this.headers.length - 1].text = "";
      }
    },
    async getStock() {
      let param = {_id: this._id }
      let res = await  this.$request.fetch("/api/salaryStructure/managestock",param)
      if(res.data.status == 200){
        this.stockData = res.data.result;
        if(this.stockData.length > 0){
          this.addRemainStock = this.stockData[ this.stockData.length - 1].remain_qty;
        }else{
          this.addRemainStock = 0
        }
        
      }else{
        this.$refs.snackbar.showError()
      }
    },
    returnback() {
      history.go(-1);
    },
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.isAddButton = -1;
      }, 300);
      this.$v.$reset();
    },
    addItem() {
      this.dialog = true;
      this.isAddButton = -1
    },
    editItem(item) {
      this.dialog = true;
      this.editedItem = Object.assign({}, item);
      this.isAddButton = 1
    },
    deleteItem(item) {
      this.item_id = item._id;
      this.$refs.confirmDialog.show();
    },
    async enableDelete() {
      let param = { _id: this.item_id, employee_id: this._id}
      let res = await this.$request.fetch("/api/salaryStructure/deleteStock",param,"post")
      if (res.data.status == 200) {
        this.$refs.snackbar.showStatus("delete");
        this.getStock();
        this.close()
      }else if(res.data.status === 504){
        this.$refs.snackbar.show(res.data.msg, "error");
      }else{
        this.$refs.snackbar.showStatus("delete", false);
      }
    },
    async  saveAdd() {
      this.$v.$touch();
      if ( this.editedItem.qty == "" ||  this.editedItem.transaction_type == "" || !/^[0-9]*$/.test(this.editedItem.qty) ) {
        this.$refs.snackbar.show("输入格式有错误","error")
        return false;
      }
      this.qty = this.editedItem.qty;
      let lastStock;
      if(this.editedItem.transaction_type == "转移" || this.editedItem.transaction_type == "卖出"){
        lastStock = Number(this.addRemainStock) - Number(this.qty) 
      } else {
        lastStock = Number(this.qty) + Number(this.addRemainStock)
      }
      if(lastStock < 0){
        this.$refs.snackbar.show("总股票数不能为负","error")
        return false
      }
      let param = {_id: this._id, transaction_type: this.editedItem.transaction_type, transaction_time: this.stockDate, qty: this.qty, remain_qty: this.remain_qty}
      let res = await this.$request.fetch("/api/salaryStructure/addStock",param,"post")
      if(res.data.status === 200){
        this.$refs.snackbar.showStatus("add");
        this.getStock();
        this.close();
      }else if (res.data.status === 504) {
        this.$refs.snackbar.show(res.data.msg, "error");
      }else{
        this.$refs.snackbar.showStatus("add", false);
      }
    },
    async saveEdit() {
      this.$v.$touch()
      if ( this.editedItem.qty == ""  || !/^[0-9]*$/.test(this.editedItem.qty) ) {
        this.$refs.snackbar.show("输入格式有错误","error")
        return false;
      }
      let param = { _id: this.editedItem._id, transaction_time: this.stockDate, qty: this.editedItem.qty, type: this.editedItem.transaction_type, employee_id: this._id }
      let res = await this.$request.fetch("/api/salaryStructure/updateStock",param,"put")
      if(res.data.status === 200){
        this.getStock();
        this.close();
        this.$refs.snackbar.showStatus("edit");
      }else if (res.data.status === 504) {
        this.$refs.snackbar.show(res.data.msg, "error");
      } else{
        this.$refs.snackbar.showStatus("edit", false);
      }
    }
  }
};
</script>
<style scoped>
.headetitle {
  text-align: right;
}
.headertitle span {
  cursor: pointer;
  font-size: 15px;
}
.search {
  margin-top: -20px;
  margin-bottom: 20px;
}
.deletetitle {
  padding: 40px;
  font-size: 20px;
  display: inline-block;
}
.search button {
  border-radius: 10px;
  margin-top: 15px;
}
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
</style>
