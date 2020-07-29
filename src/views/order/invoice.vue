<template>
  <v-container>
    <v-layout class="search">
      <v-flex d-flex md3>
        <v-autocomplete label="请选择订单编号" :items="orderidlist" v-model="orderId" no-data-text="暂无数据">
        </v-autocomplete>
      </v-flex>
      <v-flex xs12 sm6 md1 style="margin:5px 0 0px 50px; ">
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;"
          @click="searchOrder(true)">
          <v-icon left>search</v-icon>搜索
        </v-btn>
      </v-flex>
    </v-layout>
    <div class="classify-bg">
      <v-flex xs12 class="classify-bg-flex">
        <p>发票管理</p>
        <p>发票列表</p>
      </v-flex>
      <v-data-table :headers="headers" :items="orders" class="elevation-1"
        :sort-by="['orderCreateDate']" :sort-desc="[true]" multi-sort no-data-text="暂无数据">
        <template v-slot:items="props">
          <td class="text-xs-center">{{ props.item.orderId }}</td>
          <td class="text-xs-center">{{ props.item.orderCreateDate }}</td>
          <td class="text-xs-center">
            {{props.item.orderStatus=="3"?"待收货":(props.item.orderStatus=="2"? "待发货":(props.item.orderStatus=="1"? "待付款":"已收货"))}}
          </td>
          <td class="text-xs-center">{{ props.item.isInvoice==true?"是":'否'}}</td>
          <td class="text-xs-center">{{ props.item.orderTotal }}</td>
          <td>
            <v-btn :disabled="!props.item.isInvoice" color="info" small
              @click="viewInvoice(props.item.orderId,props.item.openId ,props.item.invoiceNumber)">
              查看发票信息</v-btn>
          </td>
          <td id="td">
            <v-btn v-if="props.item.hasInvo==='2'&& props.item.isInvoice" small color="success"
              @click="createInvoice(props.item.orderId,props.item.openId )">开票中</v-btn>
            <v-btn v-else-if="!props.item.isInvoice" disabled small color="info"
              @click="createInvoice(props.item.orderId,props.item.openId )">开票</v-btn>
            <v-btn v-if="props.item.hasInvo==='1' && !props.item.invoiceNumber" small color="info"
              @click="createLogistic(props.item.orderId,props.item.openId )">填写物流信息</v-btn>
            <v-btn v-if="props.item.invoiceCompany&&props.item.invoiceCompany!==''" color="info"
              small
              @click="viewLogistic(props.item.orderId,props.item.openId,props.item.invoiceCompany,props.item.invoiceNumber)">
              查看物流信息</v-btn>
          </td>
        </template>
      </v-data-table>
    </div>
    <!-- 填写物流信息弹框 -->
    <v-dialog v-model="flag" max-width="290" persistent>
      <v-card>
        <v-card-title class="headline">{{isEdit?'请物流信息':'物流信息'}}</v-card-title>
        <v-card-text>
          <v-text-field v-model="invoiceCompany" label="快递公司" required :disabled="!isEdit"
            :error-messages="invoiceCompanyErrors" @change="$v.invoiceCompany.$touch()"
            @blur="$v.invoiceCompany.$touch()"></v-text-field>
          <v-text-field v-model="invoiceNumber" label="运单编号" required :disabled="!isEdit"
            :error-messages="invoiceNumberErrors" @change="$v.invoiceNumber.$touch()"
            @blur="$v.invoiceNumber.$touch()">
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat="flat" @click="handle()">确定</v-btn>
          <v-btn color="blue darken-1" flat="flat" @click="close">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 查看发票信息 -->
    <v-dialog v-model="invoiceflag" max-width="500" max-height="500" persistent>
      <v-card>
        <v-card-title class="headline">发票信息</v-card-title>
        <v-card-text v-if="invoiceList.length===0">
          <v-text-field required disabled value="暂无发票信息"></v-text-field>
        </v-card-text>
        <v-card-text v-for="(invoice,index) in invoiceList" :key="index" v-else>
          <v-text-field v-model="invoice.invoiceData.titleInvoice" label="公司名称" required disabled>
          </v-text-field>
          <v-text-field v-model="invoice.invoiceData.identyInvoice" label="税号" required disabled>
          </v-text-field>
          <v-text-field v-model="invoice.invoiceData.buyAdderssInvoice" label="单位地址" required
            disabled></v-text-field>
          <v-text-field v-model="invoice.invoiceData.telInvoice" label="电话号码" required disabled>
          </v-text-field>
          <v-text-field v-model="invoice.invoiceData.emailInvoice" label="收票人邮箱" required disabled>
          </v-text-field>
          <v-text-field v-model="invoice.invoiceData.buyBackInput" label="开户银行" required disabled>
          </v-text-field>
          <v-text-field v-model="invoice.invoiceData.buyCountInvoice" label="银行账户" required
            disabled></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat="flat" @click="invoiceflag=false">确定</v-btn>
          <v-btn color="blue darken-1" flat="flat" @click="invoiceflag=false;">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { log } from "util";
import Common from "../../utils/common";
import { required } from "vuelidate/lib/validators";
import { regex } from "vuelidate/lib/validators/common";
const letterRoule = regex("letter", /^[a-z]+$/); // 验证快递公司只能是小写字母
const numRoule = regex("num", /^[0-9a-zA-Z]+$/); // 验证快递编号只能是英文和数字

export default {
  name: "invoice",
  validations: {
    invoiceCompany: { required, letterRoule },
    invoiceNumber: { required, numRoule }
  },
  props: {},
  data() {
    return {
      isEdit: false,
      invoiceList: [],
      invoiceflag: false,
      invoiceCompany: "",
      invoiceNumber: "",
      flag: false,
      y: "top",
      x: "right",
      mode: "",
      timeout: 3000,
      text: "",
      orders: [],
      orderIds: [],
      orderId: "全部",
      orderSend: ["全部", "待付款", "待发货", "待收货", "已收货"],
      orderStatus: "全部",
      orderidlist: ["全部"],
      statuscode: "0",
      dataorder: [],
      headers: [
        {
          text: "订单编号",
          align: "center",
          value: "orderId",
          sortable: false
        },
        {
          text: "下单时间",
          align: "center",
          value: "orderCreateDate",
          sortable: false
        },
        {
          text: "订单状态",
          align: "center",
          value: "orderStatus",
          sortable: false
        },
        {
          text: "是否需要开票",
          align: "center",
          value: "isInvoice",
          sortable: false
        },
        {
          text: "订单/发票金额",
          align: "center",
          value: "orderTotal",
          sortable: false
        },
        { text: "查看", value: "", align: "center", sortable: false },
        { text: "功能", value: "", align: "center", sortable: false }
      ]
    };
  },
  mounted() {
    let init = true;
    this.getList(init);
  },
  methods: {
    async getList(init) {
      let res = await this.$request.fetch("api/individualOrder/allorderlist");
      if (res.data.status === 200) {
        let orders = res.data.result;
        orders = orders.filter(order => {
          return order.orderStatus !== "1" && order.isInvoice;
        });
        this.orders = orders.reverse();
        //获取所有订单id
        this.orders.forEach(item => {
          this.orderidlist.push(item.orderId);
        });

        if (!init) {
          this.$snackbar().showStatus("search");
        }
      } else {
        this.$snackbar().showStatus("search", false);
      }
    },
    async searchOrder(init) {
      if (this.orderId === "" || this.orderId === "全部") {
        await this.getList(true);
        return;
      }
      let params = { orderId: this.orderId };
      let res = await this.$request.fetch(
        "api/individualOrder/findOrderbyId",
        params
      );
      if (res.data.status === 200) {
        this.orders = [];
        this.orders = res.data.result;
        if (init) {
          this.$snackbar().showStatus("search");
        }
      } else {
        this.$snackbar().showStatus("search", false);
      }
    },
    async createInvoice(orderid, openid) {
      let params = {
        orderId: orderid,
        openId: openid
      };
      let res = await this.$request.fetch(
        "api/individualOrder/editUserInfo",
        params,
        "post"
      );
      if (res.data.status === 200) {
        this.searchOrder();
        this.$snackbar().showOk("开票成功");
      } else {
        this.$snackbar().showError(res.data.msg);
      }
    },
    createLogistic(orderid, openid) {
      this.isEdit = true;
      this.flag = true;
      this.orderid = orderid;
      this.openid = openid;
    },
    viewLogistic(orderid, openid, invoiceCompany, invoiceNumber) {
      this.isEdit = false;
      this.invoiceCompany = invoiceCompany;
      this.invoiceNumber = invoiceNumber;
      this.flag = true;
    },
    async handle() {
      if (this.$v.$invalid) {
        return;
      }

      if (this.isEdit === false) {
        this.close();
      } else {
        await this.handleCreate();
      }
    },
    async handleCreate() {
      if (
        this.invoiceCompanyErrors.length === 0 &&
        this.invoiceNumberErrors.length === 0
      ) {
        let res = await this.$request.fetch(
          "api/individualOrder/editUserInfo",
          {
            invoiceNumber: this.invoiceNumber,
            invoiceCompany: this.invoiceCompany,
            orderId: this.orderid,
            openId: this.openid
          },
          "post"
        );
        if (res.data.status === 200) {
          this.text = res.data.msg;
          this.invoiceNumber = "";
          this.invoiceCompany = "";
          let init = true;
          this.getList(init);
          this.$refs.snackbar.show("物流信息填写成功");
        } else {
          this.$refs.snackbar.showError("刷新重试");
        }
        this.flag = false;
      }
    },
    async viewInvoice(orderid, openid, invoiceNumber) {
      this.invoiceNumber = invoiceNumber;
      let res = await this.$request.fetch(
        "api/individualOrder/getInvoiceByOrderId",
        {
          openid: openid,
          orderid: orderid
        }
      );
      if (res.data.status === 200) {
        this.invoiceList = res.data.result;
        this.invoiceflag = true;
      }
    },
    close() {
      this.flag = false;
      this.invoiceCompany = "";
      this.invoiceNumber = "";
      this.$v.$reset();
      return;
    }
  },
  computed: {
    invoiceCompanyErrors() {
      const errors = [];
      if (!this.$v.invoiceCompany.$dirty) return errors;
      !this.$v.invoiceCompany.required && errors.push("请输入快递公司名称");
      !this.$v.invoiceCompany.letterRoule &&
        errors.push("请输入小写字母（参照操作手册）");
      return errors;
    },

    invoiceNumberErrors() {
      const errors = [];
      if (!this.$v.invoiceNumber.$dirty) return errors;
      !this.$v.invoiceNumber.required && errors.push("请输入运单编号");
      !this.$v.invoiceNumber.numRoule && errors.push("只能输入英文或数字");
      return errors;
    }
  }
};
</script>
<style  scoped>
@import "../../assets/css/classify.css";
.classify-bg {
  margin-top: 30px;
}
</style>