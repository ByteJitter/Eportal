<template>
  <v-container wrap grid-list-xl>
    <v-layout align-center justify-start class="container" mb-5>
      <v-flex xs12 sm2 md2>
        <v-select :items="orderSend" label="请选择订单状态" v-model="orderStatus" @change="changestatus"
          no-data-text="暂无数据"></v-select>
      </v-flex>
      <v-flex d-flex md2 style="margin-left:50px;">
        <v-select label="请选择订单编号" :items="orderidlist" v-model="orderId" no-data-text="暂无数据">
        </v-select>
      </v-flex>
      <v-flex xs12 sm6 md1 style="margin:5px 0 0px 50px; ">
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="searchfun">
          <v-icon left>search</v-icon>搜索
        </v-btn>
      </v-flex>
    </v-layout>
    <v-card class="margin_card" style="padding-bottom: 10px">
      <v-flex xs12 md12 d-flex>
        <div class="mytitle">
          <p class="title_h">物流管理</p>
          <p class="text">物流列表</p>
        </div>
      </v-flex>
      <v-flex xs12 sm12 md12 d-flex>
        <v-card class="margin_card">
          <v-data-table :headers="headers" :items="orders" class="elevation-1" no-data-text="暂无数据">
            <template v-slot:items="props">
              <td class="text-xs-center">{{ orders.indexOf(props.item)+1 }}</td>
              <td class="text-xs-center">{{ props.item.orderId }}</td>
              <td class="text-xs-center">{{ props.item.orderCreateDate }}</td>
              <td class="text-xs-center">
                {{ props.item.orderStatus=="3"?"待收货":(props.item.orderStatus=="2"? "待发货":"已收货") }}
              </td>
              <td class="text-xs-center">{{ props.item.goodsList.length }}</td>
              <td class="text-xs-center">
                {{ Number(props.item.orderTotal)+Number(props.item.freightPay) }}</td>
              <td class="text-xs-center">
                <v-btn small color="info"
                  @click="orderDetail(props.item.orderId,props.item.openId)">查看订单详情</v-btn>
              </td>
              <td class="text-xs-center">
                <v-btn small color="info" @click="seelog(props.item.shipCompany,props.item.shipNum)"
                  v-if="props.item.orderStatus!=='2' && props.item.distributionType !=='自提'">查看物流信息
                </v-btn>
                <v-btn color="green " style="color:white;" small
                  @click="writelog(props.item.openId,props.item.orderId)"
                  v-if="props.item.orderStatus=='2' && props.item.distributionType !=='自提'">
                  填写物流信息</v-btn>
                <v-btn color="green " style="color:white;" small
                  @click="sinceStatus(props.item.openId,props.item.orderId)"
                  v-if="props.item.distributionType=='自提'&& props.item.orderStatus=='2' ">待提取
                </v-btn>
                <v-btn color="gray" style="color:white;" small
                  @click="sinceStatus(props.item.openId,props.item.orderId)"
                  v-if="props.item.distributionType=='自提'&& props.item.orderStatus=='4'" disabled>
                  已提取</v-btn>
              </td>
            </template>
          </v-data-table>
        </v-card>
      </v-flex>
    </v-card>
    <!-- 填写物流弹框详情 -->
    <v-dialog v-model="flag" max-width="300" max-height="500" persistent>
      <v-card>
        <v-card-title class="headline">{{isEdit ? '填写物流信息' : '查看物流信息'}}</v-card-title>
        <v-card-text>
          <v-text-field v-model="logcompany" label="快递公司" required :disabled="!isEdit"
            :error-messages="logcompanyErrors" @change="$v.logcompany.$touch()"
            @blur="$v.logcompany.$touch()">
          </v-text-field>
          <v-text-field v-model="lognum" label="运单编号" required :disabled="!isEdit"
            :error-messages="lognumErrors" @change="$v.lognum.$touch()" @blur="$v.lognum.$touch()">
          </v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat="flat" @click="handle()">确定</v-btn>
          <v-btn color="blue darken-1" flat="flat" @click="close()">取消</v-btn>
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
const lowerCaseRule = regex("letter", /^[a-z]+$/); // 验证快递公司只能是小写字母
const logNumRule = regex("num", /^[0-9a-zA-Z]+$/); // 验证快递编号只能是英文和数字

export default {
  name: "logisticsMange",
  validations: {
    logcompany: { required, lowerCaseRule },
    lognum: { required, logNumRule }
  },
  data() {
    return {
      orders: [],
      headers: [
        { text: "编号", value: "num", align: "center", sortable: false },
        {
          text: "订单编号",
          value: "orderId",
          align: "center",
          sortable: false
        },
        {
          text: "下单时间",
          value: "orderCreateDate",
          align: "center",
          sortable: false
        },
        {
          text: "订单状态",
          value: "orderStatus",
          align: "center",
          sortable: false
        },
        {
          text: "商品数量",
          value: "goodsList",
          align: "center",
          sortable: false
        },
        {
          text: "订单金额",
          value: "orderTotal",
          align: "center",
          sortable: false
        },
        { text: "查看详情", value: "", align: "center", sortable: false },
        { text: "物流信息", value: "", align: "center", sortable: false }
      ],
      filterOrders: [],
      isEdit: false,
      flag: false,
      orderIds: [],
      orderId: "全部",
      orderSend: ["全部", "待收货", "待发货", "已收货"],
      orderidlist: ["全部"],
      statuscode: "0",
      dataorder: [],
      shipCompany: "",
      shipNum: "",
      openId: "",
      text: "",
      color: "",
      top: true,
      right: true,
      seelogdata: false,
      catlog: false, //显示查看物流详情
      lognum: "",
      logcompany: "",
      catflag: false,
      orderStatus: "全部"
    };
  },
  mounted() {
    this.getList();
  },
  computed: {
    logcompanyErrors() {
      const errors = [];
      if (!this.$v.logcompany.$dirty) return errors;
      !this.$v.logcompany.required && errors.push("请填写快递公司名称");
      !this.$v.logcompany.lowerCaseRule &&
        errors.push("只能输入小写字母（参照操作手册）");
      return errors;
    },
    lognumErrors() {
      const errors = [];
      if (!this.$v.lognum.$dirty) return errors;
      !this.$v.lognum.required && errors.push("请填写运单编号");
      !this.$v.lognum.logNumRule && errors.push("只能输入英文或数字");
      return errors;
    }
  },
  methods: {
    async getList() {
      let params = {
        hanopay: true
      };
      let res = await this.$request.fetch(
        "api/individualOrder/allorderlist",
        params
      );
      if (res.data.status === 200) {
        // 0 全部订单 1 待付款 2待发货 3 待收货 4 已收货（交易成功）
        let orders = [];
        let dataorder = [];
        this.dataorder = res.data.result;
        this.orderStatus = "待发货";
        this.statuscode = "2";
        res.data.result.forEach(orderitem => {
          if (orderitem.orderStatus == "2") {
            orders.push(orderitem);
            this.orderidlist.push(orderitem.orderId);
          }
        });
        this.orders = orders.reverse();
        this.changestatus();
      } else {
        this.$snackbar().showError("刷新重试");
      }
    },
    changestatus() {
      this.orderidlist = ["全部"];
      this.orderId = "全部";
      if (this.orderStatus === "全部") {
        this.dataorder.filter(val => {
          if (val.orderStatus !== "1") {
            this.orderidlist.push(val.orderId);
          }
        });
        this.statuscode = "0";
      } else if (this.orderStatus === "待收货") {
        this.dataorder.filter(val => {
          if (val.orderStatus === "3") {
            this.orderidlist.push(val.orderId);
          }
        });
        this.statuscode = "3";
      } else if (this.orderStatus === "待发货") {
        this.dataorder.filter(val => {
          if (val.orderStatus === "2") {
            this.orderidlist.push(val.orderId);
          }
        });
        this.statuscode = "2";
      } else if (this.orderStatus === "已收货") {
        this.dataorder.filter(val => {
          if (val.orderStatus === "4") {
            this.orderidlist.push(val.orderId);
          }
        });
        this.statuscode = "4";
      }
    },
    async searchfun() {
      // 0 全部订单 1 待付款 2待发货 3 待收货 4 已收货（交易成功）
      let params = {
        orderStatus: this.statuscode,
        orderId: this.orderId,
        hanopay: true
      };
      if (this.orderId === "" || this.orderId === "全部") {
        params.orderId = "";
      }
      this.searchOrder(params);
    },
    async searchOrder(params) {
      this.filterOrders = [];
      let res = await this.$request.fetch(
        "api/individualOrder/allorderlist",
        params
      );

      if (res.data.status === 200) {
        res.data.result.filter(val => {
          if (val.orderStatus !== "1") {
            this.filterOrders.push(val);
          }
        });
        this.orders = this.filterOrders.reverse();
        this.$refs.snackbar.showStatus("search");
      } else {
        this.$snackbar().showStatus("search", false);
      }
    },
    seelog(k, v) {
      this.isEdit = false;
      this.seelogdata = true;
      this.flag = true;
      this.logcompany = k;
      this.lognum = v;
    },
    writelog(k, v) {
      this.isEdit = true;
      this.flag = true;
      this.openId = k;
      this.orderId = v;
    },
    async handle() {
      if (this.$v.$invalid) {
        return;
      }

      if (this.isEdit === false) {
        this.close();
      } else {
        await this.handleCreate();
        this.changestatus();
      }
    },
    async handleCreate() {
      if (
        this.logcompanyErrors.length === 0 &&
        this.lognumErrors.length === 0
      ) {
        let res = await this.$request.fetch(
          "api/individualOrder/editUserInfo",
          {
            shipNum: this.lognum,
            shipCompany: this.logcompany,
            orderId: this.orderId,
            openId: this.openId
          },
          "post"
        );
        if (res.data.status === 200) {
          this.flag = false;
          this.lognum = "";
          this.logcompany = "";
          let index = this.orders.indexOf(res.data.result);
          this.orders.splice(index, 1);
          this.catlog = true;
          this.$refs.snackbar.show("物流信息填写成功");
          this.getList();
          this.close();
        }
      }
    },
    async sinceStatus(K, V) {
      this.openId = K;
      let orderId = V;
      let res = await this.$request.fetch(
        "api/individualOrder/editUserInfo",
        {
          orderId: orderId,
          openId: this.openId,
          hasRecieve: "true"
        },
        "post"
      );
      if (res.data.status === 200) {
        this.flag = false;
        this.shipNum = "";
        this.shipCompany = "";
        this.getList();
        this.catlog = true;
        this.$refs.snackbar.show("提取成功");
        this.changestatus();
      } else {
        this.$snackbar().showError("刷新重试");
      }
    },
    orderDetail(orderid, openid) {
      this.$router.push({
        path: "/orderStystem/Order/orderDetail",
        query: {
          id: orderid,
          openId: openid,
          orderStatus: this.statuscode,
          logenter: true
        }
      });
    },
    close() {
      this.flag = false;
      this.logcompany = "";
      this.lognum = "";
      this.$v.$reset();
      return;
    }
  }
};
</script>
<style scoped>
.mytitle {
  width: 100%;
  height: 67px;
  background-color: #e0e1e2;
  margin: -46px 20px 10px;
  border-radius: 11px;
}
.title_h,
.text {
  line-height: 20px;
  color: #333300;
  letter-spacing: 4px;
  margin-left: 30px;
  cursor: pointer;
}
.title_h {
  margin-top: 15px;
  margin-bottom: 5px;
  font-size: 16px;
}
.text {
  font-size: 16px;
}
.margin_card {
  margin: 20px;
  position: relative;
}
.message {
  font-size: 22px;
  padding: 30px;
  padding-bottom: 100px;
}
.close {
  position: absolute;
  top: 0;
  right: 0;
}
.dialog_title {
  font-size: 30px;
  margin-left: 20px;
  margin-top: 30px;
}
</style>