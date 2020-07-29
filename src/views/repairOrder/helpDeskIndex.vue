<template>
  <div>
    <!-- 顶部 -->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-form>
            <v-select filled chips item-text="status" item-value="_id" :items="orderStatus" v-model="searchOrderStatus" label="请选择" required multiple no-data-text="暂无数据"></v-select>
        </v-form>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="searchOrder('search')">
          <v-icon left>search</v-icon>搜索
        </v-btn>
      </v-layout>
    </v-container>
    <!-- 表格 -->
    <div class="classify-bg">
      <v-flex xs12 class="classify-bg-flex">
        <p>工单管理</p>
        <p>HelpDesk列表</p>
      </v-flex>
      <v-data-table :headers="headers" :items="allhelpDeskList" class="elevation-1" no-data-text="暂无数据" :pagination.sync
="pagination">
        <template v-slot:items="props">
          <tr @click="activerow(props.item)" class="orderTr">
            <td class="text-xs-left">{{  props.item.user_id.name }}</td>
            <td class="text-xs-left">{{ props.item.title }}</td>
             <td class="text-xs-left">{{ props.item.category_name }}</td>
            <td class="text-xs-left">{{ props.item.class_name }}</td>
            <td class="text-xs-left">{{ (props.item.estimate_time).substr(0,10) }}</td>
            <!-- <td class="text-xs-left">{{(props.item.expect_time).substring(0,10)}}</td> -->
            <!-- <td class="text-xs-left">{{ props.item.priority_name }}</td> -->
            <td class="text-xs-left">{{ props.item.status.status }}</td>
          </tr>
        </template>
      </v-data-table>
    </div>
    <snackbar ref="snackbar" />
  </div>
</template>
<script>
import snackbar from "../components/snackbar";
import Common from "../../utils/common";
export default {
  name: "helpDeskIndex",
  components: { snackbar },
  data() {
    return {
      headers: [
        { text: "申请人", sortable: false, value: "username" },
        { text: "标题", sortable: false, value: "title" },
        { text: "工单分类", sortable: false, value: "category" },
        { text: "工单类型", sortable: false, value: "class" },
        { text: "期待完成时间", sortable: false, value: "estimate_time" },
        // { text: "预计完成时间", sortable: false, value: "expect_time" },
        // { text: "优先级", sortable: false, value: "priority" },
        { text: "工单状态", sortable: false, value: "status" }
      ],
      allhelpDeskList: [],
      orderStatus: [],
      //搜索时的状态/id
      searchOrderStatus: [1002, 1004],
      pagination:{
        rowsPerPage:this.$store.state.global.rowsPerPage
      }
    };
  },
  activated() {
    this.searchOrder();
  },
  async mounted() {
    await this.getAllhelpdesk();
    this.searchOrder();
  },
  methods: {
    async getAllhelpdesk() {
      let res2 = await this.$request.fetch("/api/repairorder/repairThreshold", {
        userType: 1
      });
      if (res2.data.status === 200) {
        this.orderStatus = res2.data.result;
      } else {
        this.$snackbar().showError("获取列表数据失败，请刷新重试");
      }
    },
    activerow(item) {
      this.$router.push({
        path: "/repairOrder/helpDeskCheckout",
        query: { _id: item._id }
      });
    },
    //工单搜索&&列表
    searchOrder: Common.throttle(async function(type) {
      if (this.searchOrderStatus.length === 0) {
        this.$snackbar().showError("请至少选择一个工单状态");
        return;
      }
      let res = await this.$request.fetch(
        "/api/repairorder/searchHelpDeskOrderList",
        { statusId: this.searchOrderStatus }
      );
      if (res.data.status === 200) {
        this.allhelpDeskList = res.data.result;
        if(type === "search"){
          this.$snackbar().showStatus("search");
        }
      } else {
        if(type === "search"){
          this.$snackbar().showStatus("search",false);
        }else{
          this.$snackbar().showError("获取列表数据失败，请刷新重试");
        }
      }
    })
  }
};
</script>
<style scoped>
@import "../../assets/css/classify.css";
.baseTitle {
  margin-right: 35px;
  margin-left: 65px;
  display: inline-block;
  font-size: 18px;
  margin-top: 22px;
}
.layout {
  align-items: center !important;
}
.delcontainer {
  padding: 30px;
  font-size: 20px;
  position: relative;
}
.delSpan {
  position: absolute;
  top: 15px;
  right: 25px;
  cursor: pointer;
}
.orderTr {
  cursor: pointer;
}
</style>

