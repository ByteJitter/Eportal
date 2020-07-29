<template>
  <v-container class="container">
    <p class="tit">{{enter==true?"查看订单":"编辑订单"}}</p>
    <div class="box">
      <v-layout row row_sty>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>订单编号</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="orderinfo.orderId" disabled></v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row row_sty>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>下单时间</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="orderinfo.orderCreateDate" disabled></v-text-field>
        </v-flex>
      </v-layout>

      <v-layout row>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>是否开票</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="orderinfo.hasInvo" disabled></v-text-field>
        </v-flex>
      </v-layout>
      <!-- -------------- -->
      <v-layout row row_sty>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>提取方式</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="orderinfo.distributionType" disabled></v-text-field>
        </v-flex>
      </v-layout>
      <!-- -------- -->
      <v-layout row v-if="orderinfo.orderStatus ==='3'">
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>寄件快递</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="orderinfo.shipCompany" disabled></v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row v-if="orderinfo.orderStatus ==='3'">
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>物流单号</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="orderinfo.shipNum" disabled></v-text-field>
        </v-flex>
      </v-layout>

      <v-layout row>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>收件人姓名 <span>*</span></v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model.trim="orderaddressInfo.userName"
            :disabled="orderinfo.orderStatus !=='1'" :error-messages="userNameErrors"
            @blur="$v.orderaddressInfo.userName.$touch()">
          </v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>
            收件人电话号码
            <span>*</span>
          </v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model.trim="orderaddressInfo.tel" :disabled="orderinfo.orderStatus !=='1'"
            :error-messages="telErrors" @blur="$v.orderaddressInfo.tel.$touch()"></v-text-field>
        </v-flex>
      </v-layout>
      <!-- ---------- -->
      <v-layout row v-if="orderinfo.distributionType=='快递'"
        :disabled="orderinfo.orderStatus !=='1'">
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>收件人地址 <span>*</span></v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model.trim="orderaddressInfo.address"
            :disabled="orderinfo.orderStatus !=='1'" :error-messages="addressErrors"
            @blur="$v.orderaddressInfo.address.$touch()">
          </v-text-field>
        </v-flex>
      </v-layout>
      <!-- --------------------- -->
      <v-layout row v-else>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>自提地址 <span>*</span></v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model.trim="orderinfo.sinceAddress"
            :disabled="orderinfo.orderStatus !=='1'" :error-messages="sinceAddressErrors"
            @blur="$v.orderinfo.sinceAddress.$touch()"></v-text-field>
        </v-flex>
      </v-layout>
      <!-- ----------------------- -->
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>订单金额 <span>*</span></v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model.trim="orderinfo.orderTotal" :disabled="orderinfo.orderStatus !=='1'"
            :error-messages="orderTotalErrors" @blur="$v.orderinfo.orderTotal.$touch()">
          </v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>物流费用 <span>*</span></v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model.trim="orderinfo.freightPay" :disabled="orderinfo.orderStatus !=='1'"
            :error-messages="freightPayErrors" @blur="$v.orderinfo.freightPay.$touch()">
          </v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row_lab_sty">
          <v-subheader>留言</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model="orderinfo.message" :disabled="orderinfo.orderStatus !=='1'">
          </v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs4 md12 lg2 class="row_lab_sty">
          <v-subheader>订单产品</v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <!-- <v-text-field v-model="desserts.item.name"></v-text-field> -->
        </v-flex>
      </v-layout>
      <!-- 订单商品列表 -->

      <v-layout>
        <v-flex md12>
          <v-data-table :headers="headers" :items="orderinfo.goodsList" class="elevation-1"
            no-data-text="暂无数据">
            <template v-slot:items="props">
              <td>{{ props.item.productId}}</td>
              <td>{{ props.item.productName }}</td>
              <td>{{ props.item.metiralName}}</td>
              <td>{{ props.item.pageWeight}}</td>
              <td>{{ props.item.pageType }}</td>
              <td>{{ props.item.productNum }}</td>
              <td>{{ props.item.salePrice || props.item.singlePrice }}</td>
              <td>{{ props.item.singleTotal || props.item.totalPrice}}</td>
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>
      <v-layout row class="btn_sty">
        <v-flex md4 lg2 btn>
          <v-btn color="info" dark @click="backToSave()" v-if="enter==false">确定</v-btn>
        </v-flex>
        <v-flex md4 lg2 btn>
          <v-btn color="info" dark @click="backToCancel()">返回</v-btn>
        </v-flex>
      </v-layout>
    </div>
    <snackbar ref="snackbar" />
  </v-container>
</template>

<script>
import { resolve } from "q";
import { log } from "util";
import Common from "../../utils/common";
import snackbar from "../components/snackbar";
import { required, numeric } from "vuelidate/lib/validators";
import { regex } from "vuelidate/lib/validators/common";
const phoneRoule = regex("numPhone", /(^1[345789]\d{9}$)|(^9\d{8}$)/); //手机号正则验证 加入台湾格式
const monRoule = regex(
  "numMoney",
  /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]{1,2}?$)/
); //金额验证可以包括小数

export default {
  name: "orderDetail",
  validations: {
    orderaddressInfo: {
      userName: { required },
      tel: { required, phoneRoule},
      address: { required }
    },
    orderinfo: {
      orderTotal: { required, monRoule },
      freightPay: { required, monRoule },
      sinceAddress: { required }
    }
  },
  data() {
    return {
      orderinfo: {},
      headers: [
        { text: "商品id", value: "orderId" },
        { text: "商品名称", value: "receiver" },
        { text: "纸张名称", value: "length" },
        { text: "纸张克重", value: "length" },
        { text: "纸张类型", value: "length" },
        { text: "商品数量", value: "hasInvo" },
        { text: "商品单价", value: "productNum" },
        { text: "商品总价", value: "productNum" }
      ],
      orderaddressInfo: {},
      openId: "",
      enter: false,
      orderid: ""
    };
  },
  components: {
    snackbar
  },
  computed: {
    userNameErrors() {
      const errors = [];
      if (!this.$v.orderaddressInfo.userName.$dirty) return errors;
      !this.$v.orderaddressInfo.userName.required &&
        errors.push("收件人姓名为必填字段");
      return errors;
    },
    telErrors() {
      const errors = [];
      if (!this.$v.orderaddressInfo.tel.$dirty) return errors;
      !this.$v.orderaddressInfo.tel.required && errors.push("不能为空");
      !this.$v.orderaddressInfo.tel.phoneRoule &&
        errors.push("格式有误,必须是13、14、15、16、17、18、19开头的11位数字或者是9开头的9位数字");
      return errors;
    },
    sinceAddressErrors() {
      const errors = [];
      if (!this.$v.orderinfo.sinceAddress.$dirty) return errors;
      !this.$v.orderinfo.sinceAddress.required &&
        errors.push("自提地址为必填字段");
      return errors;
    },
    addressErrors() {
      const errors = [];
      if (!this.$v.orderaddressInfo.address.$dirty) return errors;
      !this.$v.orderaddressInfo.address.required &&
        errors.push("收货地址为必填字段");
      return errors;
    },
    orderTotalErrors() {
      const errors = [];
      if (!this.$v.orderinfo.orderTotal.$dirty) return errors;
      !this.$v.orderinfo.orderTotal.required &&
        errors.push("订单金额为必填字段");
      !this.$v.orderinfo.orderTotal.monRoule && errors.push("请输入正确的金额");
      return errors;
    },
    freightPayErrors() {
      const errors = [];
      if (!this.$v.orderinfo.freightPay.$dirty) return errors;
      !this.$v.orderinfo.freightPay.required &&
        errors.push("物流费用为必填字段");
      !this.$v.orderinfo.freightPay.monRoule && errors.push("请输入正确的金额");
      return errors;
    }
  },
  activated() {
    this.orderdetailinfo();
  },
  mounted() {
    this.orderdetailinfo();
  },
  methods: {
    async orderdetailinfo() {
      this.enter = this.$route.query.logenter;
      this.openId = this.$route.query.openId;
      this.orderid = this.$route.query.id;
      this.orderStatus = this.$route.query.orderStatus;
      let params = {
        orderId: this.orderid,
        openId: this.openId
      };
      let res = await this.$request.fetch(
        "api/individualOrder/findOrderbyId",
        params
      );
      if (res.data.status === 200) {
        this.orderinfo = res.data.result[0];
        this.orderaddressInfo = Object.assign({}, this.orderinfo.addressInfo);
      }
    },
    backToCancel() {
      if (this.enter == true) {
        this.$router.push({
          path: "/orderStystem/Order/logisticsMange",
          query: {
            orderId: this.orderid,
            openId: this.openId,
            orderStatus: this.orderStatus
          }
        });
      } else {
        this.$router.push("/orderStystem/Order/allorders");
      }
    },
    async backToSave() {
      if (!this.orderinfo.sinceAddress && !this.orderaddressInfo.address) {
        return;
      }

      if (
        this.$v.orderaddressInfo.$invalid ||
        this.$v.orderinfo.freightPay.$invalid ||
        this.$v.orderinfo.orderTotal.$invalid
      ) {
        return;
      }

      //修改订单信息
      let params = {
        openId: this.openId,
        orderId: this.orderinfo.orderId,
        address: this.orderaddressInfo.address,
        message: this.orderinfo.message,
        tel: this.orderaddressInfo.tel,
        userName: this.orderaddressInfo.userName,
        ordertotal: this.orderinfo.orderTotal,
        freightPay: this.orderinfo.freightPay,
        sinceAddress: this.orderinfo.sinceAddress
      };
      let res = await this.$request.fetch(
        "api/individualOrder/editUserInfo",
        params,
        "post"
      );
      if (res.data.status === 200) {
        this.$refs.snackbar.show("修改订单信息成功");
        setTimeout(() => {
          this.$router.push("/orderStystem/Order/allorders");
        }, 600);
      } else {
        this.$refs.snackbar.showError("刷新重试");
      }
    }
  }
};
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
}
.tit {
  width: 80%;
  position: absolute;
  top: 40px;
  text-align: center;
  font-size: 30px;
  color: #4d4d4d;
}
.box {
  margin: 81px 31px 68px 31px;
}
.row_lab_sty {
  padding: 14px 0 16px 50px;
}
.row_lab_sty span {
  color: red;
  margin-left: 4px;
}
.select_sty {
  margin-bottom: 230px;
}
.btn_sty {
  margin: 50px 0 228px 600px;
}
.show_sty {
  padding: 14px 0 16px;
}
.btn {
  margin-right: 50px;
}
</style>