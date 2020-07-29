<template>
  <v-container wrap grid-list-xl>
    <v-layout align-center justify-start class="container" mb-5>
      <v-flex xs12 sm2 md3 d-flex>
        <v-select :items="orderSend" label="请选择订单状态" v-model="orderStatus" @change="changestatus"
          no-data-text="暂无数据"></v-select>
      </v-flex>
      <v-flex xs12 sm2 md3 d-flex>
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
          <p class="title_h">订单管理</p>
          <p class="text">订单列表</p>
        </div>
      </v-flex>
      <v-flex xs12 sm12 md12 d-flex>
        <v-card class="margin_card">
          <v-data-table class="elevation-1" :headers="headers" :items="orders" no-data-text="暂无数据">
            <template v-slot:items="props">
              <td class="text-xs-center">{{ orders.indexOf(props.item)+1 }}</td>
              <td class="text-xs-center">{{ props.item.orderId }}</td>
              <td class="text-xs-center">{{ props.item.orderCreateDate }}</td>
              <td class="text-xs-center">
                {{ props.item.orderStatus=="3"?"待收货":(props.item.orderStatus=="2"? "待发货":(props.item.orderStatus=="1"? "待付款":"已收货")) }}
              </td>
              <td class="text-xs-center">{{ props.item.isInvoice==true?"是":'否'}}</td>
              <td class="text-xs-center">{{ props.item.goodsList.length }}</td>
              <td class="text-xs-center">
                {{ Number(props.item.orderTotal)+Number(props.item.freightPay) }}</td>
              <td class="text-xs-center">
                <!-- text-align:left -->
                <v-btn small color="info" @click="orderDetail(props.item.orderId,props.item.openId)"
                  :disabled="props.item.orderStatus==0?true:false">查看|编辑</v-btn>
              </td>
            </template>
          </v-data-table>
        </v-card>
      </v-flex>
    </v-card>
  </v-container>
</template>
<script>
import { log } from "util";
import Common from "../../utils/common";
import { required } from "vuelidate/lib/validators";

export default {
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
          text: "是否开票",
          value: "isInvoice",
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
        { text: "操作", value: "", align: "center", sortable: false }
      ],
      flag: false,
      orderIds: [],
      orderId: "全部",
      orderSend: ["全部", "待收货", "待发货", "待付款", "已收货"],
      orderStatus: "全部",
      orderidlist: ["全部"],
      statuscode: "0",
      dataorder: [],
      color: "",
      top: true,
      right: true,
      text: ""
    };
  },

  mounted() {
    let init = true;
    this.getList({ init });
  },
  activated() {
    this.refreshSearch();
  },
  methods: {
    changestatus() {
      this.orderidlist = ["全部"];
      this.orderId = "全部";
      if (this.orderStatus === "全部") {
        this.dataorder.forEach(item => {
          this.orderidlist.push(item.orderId);
        });
        this.statuscode = "0";
        return;
      }
      if (this.orderStatus === "待收货") {
        this.dataorder.filter(val => {
          if (val.orderStatus === "3") {
            this.orderidlist.push(val.orderId);
          }
        });
        this.statuscode = "3";
        return;
      }
      if (this.orderStatus === "待发货") {
        this.dataorder.filter(val => {
          if (val.orderStatus === "2") {
            this.orderidlist.push(val.orderId);
          }
        });
        this.statuscode = "2";
        return;
      }
      if (this.orderStatus === "待付款") {
        this.dataorder.filter(val => {
          if (val.orderStatus === "1") {
            this.orderidlist.push(val.orderId);
          }
        });
        this.statuscode = "1";
        return;
      }
      if (this.orderStatus === "已收货") {
        this.dataorder.filter(val => {
          if (val.orderStatus === "4") {
            this.orderidlist.push(val.orderId);
          }
        });
        this.statuscode = "4";
        return;
      }
    },
    searchfun() {
      // 0 全部订单 1 待付款 2待发货 3 待收货 4 已收货（交易成功）
      let params = {
        orderStatus: this.statuscode,
        orderId: this.orderId
      };
      if (this.orderId === "" || this.orderId === "全部") {
        params.orderId = "";
      }
      this.getList({ params });
    },
    async getList({ params, init }) {
      let res = await this.$request.fetch(
        "api/individualOrder/allorderlist",
        params
      );
      if (res.data.status === 200) {
        this.orders = res.data.result.sort((a, b) => {
          return b.orderCreateDate > a.orderCreateDate ? 1 : -1;
        });

        if (init) {
          this.dataorder = res.data.result;
          this.orders.forEach(item => {
            this.orderidlist.push(item.orderId);
          });
        } else {
          this.$snackbar().showStatus("search");
        }
      } else {
        this.$snackbar().showStatus("search", false);
      }
    },
    orderDetail(orderid, openid) {
      this.$router.push({
        path: "/orderStystem/Order/orderDetail",
        query: {
          id: orderid,
          openId: openid,
          logenter: false
        }
      });
    },
    async refreshSearch() {
      let params = {
        orderStatus: this.statuscode,
        orderId: this.orderId
      };
      if (this.orderId === "" || this.orderId === "全部") {
        params.orderId = "";
      }
      let res = await this.$request.fetch(
        "api/individualOrder/allorderlist",
        params
      );
      if (res.data.status === 200) {
        this.orders = res.data.result.sort((a, b) => {
          return b.orderCreateDate > a.orderCreateDate ? 1 : -1;
        });
      } else {
        this.$refs.snackbar.showError("刷新重试");
      }
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