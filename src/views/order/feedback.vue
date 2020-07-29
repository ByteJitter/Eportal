<template>
  <v-container>
    <v-layout class="search">
      <v-flex xs12 sm2 md2>
        <!-- <v-select :items="name" label="请选择客户姓名" v-model="customerName" item-value="_id" item-text="name" no-data-text="暂无数据"></v-select> -->
        <v-select :items="name" label="请选择客户姓名" v-model="customerName" item-text="name"
          no-data-text="暂无数据"></v-select>
      </v-flex>
      <v-flex xs12 sm6 md1 style="margin:5px 0 0px 50px; ">
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleSearch">
          <v-icon left>search</v-icon>搜索
        </v-btn>
      </v-flex>
    </v-layout>
    <div class="classify-bg">
      <v-flex xs12 class="classify-bg-flex">
        <p>意见反馈管理</p>
        <p>反馈列表</p>
      </v-flex>
      <v-data-table :headers="headers" :items="customerinfo" no-data-text="暂无数据"
        class="elevation-1">
        <template v-slot:items="props">
          <td>{{ props.item.customerName }}</td>
          <td>{{ props.item.callType }}</td>
          <td>{{ props.item.feedBackText }}</td>
          <td class="text-align:left">
            <v-btn small color="info" @click="customerDetail(props.item.feedBackText)">查看反馈信息
            </v-btn>
          </td>
        </template>
      </v-data-table>
    </div>
    <!-- 查看反馈信息 -->
    <v-dialog v-model="dialodflag" max-width="500" max-height="500" persistent>
      <v-card>
        <v-card-title class="headline">反馈信息</v-card-title>
        <v-text-field background-color="light-white" color="black" v-model="feedtext"
          style="margin:30px;" disabled></v-text-field>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat="flat" @click="dialodflag = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
<script>
import { log } from "util";
import Common from "../../utils/common";

export default {
  data() {
    return {
      headers: [
        { text: "客户姓名", value: "customerName", sortable: false },
        { text: "联系方式", value: "callType", sortable: false },
        { text: "反馈信息", value: "feedBackText", sortable: false },
        { text: "操作", value: "", sortable: false }
      ],
      customerName: "全部",
      customerinfo: [],
      color: "",
      top: true,
      right: true,
      text: "",
      name: ["全部"],
      dialodflag: false,
      feedtext: "",
      dialogflag: false
    };
  },

  mounted() {
    let init = true;
    this.getList({ init });
  },
  methods: {
    async handleSearch(init) {
      let params = {};
      if (this.customerName === "" || this.customerName === "全部") {
        params = {};
      } else {
        params = {
          // cid: this.customerName
          name: this.customerName
        };
      }
      await this.getList({ params });
    },
    async getList({ params, init }) {
      if (!params) {
        let params = {};
      }
      let res = await this.$request.fetch(
        "api/individualOrder/feedbacklist",
        params
      );
      if (res.data.status === 200) {
        this.customerinfo = res.data.result.reverse();
        if (init) {
          this.customerinfo.forEach(item => {
            // this.name.push({ _id: item._id, name: item.customerName });
            this.name.push(item.customerName);
          });
        } else {
          this.$snackbar().showStatus("search");
        }
      } else {
        this.$snackbar().showStatus("search", false);
      }
    },
    async customerDetail(feedBackText) {
      this.feedtext = feedBackText;
      this.dialodflag = true;
    }
  }
};
</script>
<style scoped>
@import "../../assets/css/classify.css";
.classify-bg {
  margin-top: 30px;
  margin-left: -20px;
}
.table {
  width: 960px;
  height: 60px;
  text-align: left;
}
.table tr th {
  width: 50px;
  padding: 5px;
}
.table2 .scontainer td {
  width: 90px;
  text-align: left;
}
</style>