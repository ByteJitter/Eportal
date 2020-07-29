
<template>
  <v-container wrap grid-list-xl>
    <v-layout align-center justify-start class="container" mb-5>
      <v-flex xs12 sm2 md2>
        <v-autocomplete label="请选择客户姓名" :items="customerids" item-value="_id"
          item-text="lastusername" v-model="cid" no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm6 md1 style="margin:5px 0 0px 50px; ">
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;"
          @click="searchcustomer()">
          <v-icon left>search</v-icon>搜索
        </v-btn>
      </v-flex>
    </v-layout>
    <v-card class="margin_card" style="padding-bottom: 10px">
      <v-flex xs12 md12 d-flex>
        <div class="mytitle">
          <p class="title_h">客户管理</p>
          <p class="text">客户列表</p>
        </div>
      </v-flex>
      <v-flex xs12 sm12 md12 d-flex>
        <v-card class="margin_card">
          <v-data-table v-model="selected" :headers="headers" :items="filterList" item-key="_id" class="elevation-1" no-data-text="暂无数据">
            <template v-slot:items="props">
              <td class="text-xs-center">{{props.item.lastusername}}</td>
              <td class="text-xs-center">{{props.item.lasttel}}</td>
              <td class="text-xs-center">{{props.item.lastaddress}}</td>
              <td class="text-xs-center">{{props.item.ordersum}}</td>
              <td class="text-xs-center">{{props.item.comname}}</td>
              <td class="text-xs-center">
                <v-btn small color="info" @click="downloadToExcel(props.item)">导出</v-btn>
              </td>
            </template>
          </v-data-table>
        </v-card>
      </v-flex>
    </v-card>
  </v-container>
</template>
<script>
import XLSX from "xlsx";
import { log } from "util";
import Common from "../../utils/common";
import { required } from "vuelidate/lib/validators";
export default {
  data() {
    return {
      y: "top",
      x: "right",
      mode: "",
      timeout: 3000,
      text: "",
      headers: [
        {
          text: "客户姓名",
          value: "lastusername",
          align: "center",
          sortable: false
        },
        {
          text: "联系方式",
          value: "lasttel",
          align: "center",
          sortable: false
        },
        {
          text: "联系地址",
          value: "lastaddress",
          align: "center",
          sortable: false
        },
        {
          text: "客户下单次数",
          value: "ordersum",
          align: "center",
          sortable: false
        },
        {
          text: "公司抬头",
          value: "comname",
          align: "center",
          sortable: false
        },
        { text: "操作", align: "center", sortable: false }
      ],
      list: [],
      filterList: [],
      singleSelect: false,
      selected: [],
      goodsdata: [],
      downloaddata: [],
      customerids: ["全部"],
      top: true,
      right: true,
      color: "",
      cid: "全部"
    };
  },
  mounted() {
    this.getlist(true);
  },
  methods: {
    async getlist(v) {
      //获取客户的信息
      let params = {};
      if (this.cid !== "" && this.cid !== "全部") {
        params = {
          cid: this.cid
        };
      }
      let res = await this.$request.fetch(
        "/api/individualOrder/downloadcustomerdata",
        params
      );
      if (res.data.status === 200) {
        this.filterList = [];
        this.list = res.data.result;
        this.list.filter(val => {
          if (val.ordernum !== 0) {
            this.filterList.push(val);
          }
        });
        this.filterList.forEach(item => {
          this.customerids.push(item);
          let k = {
            ordersum: item.ordernum, //下单次数
            lasttel: "", //最后一单的收件人的联系方式
            lastaddress: "", //最后一单的收件人的联系地址
            lastusername: "", //最后一单的收件人的联系地址
            comname: "无" //发票的公司抬头
          };
          let ids = item._id;
          k.lasttel = item.orderList[item.orderList.length - 1].addressInfo.tel;
          k.lastaddress =
            item.orderList[item.orderList.length - 1].addressInfo.address;
          k.lastusername =
            item.orderList[item.orderList.length - 1].addressInfo.userName;

          this.ordersum = item.ordernum;

          // 只要客户下订单的时候留过发票信息就显示出来，不一定是最后一笔订单
          let index = 0;
          while (
            item.orderList[index].invoiceData === "" ||
            index >= item.orderList.length
          ) {
            index++;
          }
          k.comname = item.orderList[index].invoiceData.titleInvoice; //公司抬头

          if (k.comname === "") {
            k.comname = "无";
          }

          item = Object.assign(item, k);
        });
        if (!v) {
          this.$snackbar().showStatus("search");
        }
      } else {
        this.$snackbar().showStatus("search", false);
      }
    },
    searchcustomer() {
      this.getlist();
    },
    downloadToExcel(item) {
      require.ensure([], () => {
        this.allorderprice = 0;
        const {
          export_json_to_excel
        } = require("../../excel/Export2Exceljiedan");
        const {
          export_get_title_time
        } = require("../../excel/Export2Exceljiedan");
        const { format_json } = require("../../excel/Export2Exceljiedan");
        // 这是excel表中要显示的标题头，即最上面那一行，这是根据具体业务需求设置的
        const tHeader = [
          "客户id",
          "下单编号",
          "下单时间",
          // "类型",
          "物料1",
          "纸张类型",
          "克重",
          "商品数量",
          "订单总额"
        ];
        // 这是excel下面对应标题头要显示的具体内容，要与list中的相对应，比如简单版本中与id、title等对应
        const filterVal = [
          "id",
          "orderId",
          "orderCreateDate",
          "metiralName",
          "pageType",
          "pageWeight",
          "productNum",
          "orderTotal"
        ];
        const list = item; //要处理的数据
        let node_c = filterVal.indexOf("orderId"); //订单编号
        let cart_c = filterVal.indexOf("orderTotal"); //总价
        let time_c = filterVal.indexOf("orderCreateDate"); //创建时间

        let current_r = 1; //从第一行开始
        let current_s_r = 1; //每条数据开始行
        let node_s_r = 1; //订单编号的开始行
        let card_s_r = 1; //类型的开始行
        let time_s_r = 1; //下单时间的开始行
        //   要合并集合
        let merges = [];
        let newList = []; //重构后的数据
        //emlement为item
        //   var element = item;
        for (let j = 0; j < item.orderList.length; j++) {
          const node = item.orderList[j];
          this.allorderprice += Number(node.orderTotal);
          for (let k = 0; k < node.goodsList.length; k++) {
            const part = node.goodsList[k];
            current_r++;
            //制造重复数据，重新构建数据
            let obj = {
              id: item._id.toString(),
              orderId: node.orderId.toString(),
              orderCreateDate: node.orderCreateDate.toString(),
              metiralName: part.metiralName.toString(),
              pageType: part.pageType.toString(),
              pageWeight: part.pageWeight.toString(),
              productNum: part.productNum.toString(),
              orderTotal: node.orderTotal.toString()
            };
            newList.push(obj);
          }

          if (card_s_r != current_r - 1) {
            //类型的合并单元
            let cardmerge = {
              s: {
                c: cart_c,
                r: card_s_r
              },
              e: {
                c: cart_c,
                r: current_r - 1
              }
            };
            merges.push(cardmerge);
          }
          card_s_r = current_r;
          if (node_s_r != current_r - 1) {
            //类型的合并单元
            let nodemerge = {
              s: {
                c: node_c,
                r: node_s_r
              },
              e: {
                c: node_c,
                r: current_r - 1
              }
            };
            merges.push(nodemerge);
          }
          node_s_r = current_r;
          if (time_s_r != current_r - 1) {
            //时间的合并单元
            let timemerge = {
              s: {
                c: time_c,
                r: time_s_r
              },
              e: {
                c: time_c,
                r: current_r - 1
              }
            };
            merges.push(timemerge);
          }
          time_s_r = current_r;
        }
        let oneline = {
          s: {
            c: 0,
            r: 1
          },
          e: {
            c: 0,
            r: current_r - 1
          }
        };
        merges.push(oneline);
        let lastline = [
          {
            id: "总计",
            orderId: this.ordersum.toString(),
            orderTotal: this.allorderprice.toString()
          },
          {}
        ];
        newList = [...newList, ...lastline];
        // newList.push(lastline)
        const data = format_json(filterVal, newList);
        let currentdate = export_get_title_time();
        export_json_to_excel(tHeader, data, "客户数据下载", merges);
      });
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