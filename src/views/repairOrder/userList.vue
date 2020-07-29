<template>
  <div>
    <v-container fluid grid-list-xl>
      <v-layout  align-center justify-start > 
        <v-flex md6>
          <v-form >
            <v-select filled chips v-model="selectOrderStatus" :items="orderStatus" item-text="status" item-value="_id" label="请选择" multiple no-data-text="暂无数据">
              <template v-slot:prepend-item>
                <v-list-tile ripple @click="toggle">
                  <v-list-tile-action>
                    <v-icon :color="selectOrderStatus.length > 0 ? 'indigo darken-4' : ''">{{ icon }}</v-icon>
                  </v-list-tile-action>
                  <v-list-tile-content>
                    <v-list-tile-title>选择全部</v-list-tile-title>
                  </v-list-tile-content>
                </v-list-tile>
                <v-divider class="mt-2"></v-divider>
              </template>
            </v-select>
          </v-form>
        </v-flex>
        <v-flex md2 >
          <v-btn color="info" class="searchButton" @click="searchOrder(selectOrderStatus,'search')">
            <v-icon left>search</v-icon>搜索
          </v-btn>
        </v-flex>
        <v-flex md2>
          <v-btn color="info" class="searchButton" @click="addOrder">
           <v-icon left>add</v-icon>新建工单
          </v-btn>
        </v-flex>
        
      </v-layout>
    </v-container>
    <div class="classify-bg">
      <v-flex xs12 class="classify-bg-flex">
        <p>工单管理</p>
        <p>一般用户列表</p>
      </v-flex>
      <v-data-table :headers="headers" :items="allOrderList" class="elevation-1" no-data-text="暂无数据" :pagination.sync
="pagination">
        <template v-slot:items="props">
          <tr @click="activerow(props.item)" class="orderTr">
            <td class="text-xs-left">{{props.item.title}}</td>
            <td class="text-xs-left">{{props.item.category_name}}</td>
            <td class="text-xs-left">{{props.item.class_name}}</td>
            <td class="text-xs-left">{{(props.item.estimate_time).substring(0,10)}}</td>
            <!-- <td class="text-xs-left">{{(props.item.expect_time).substring(0,10)}}</td> -->
            <!-- <td class="text-xs-left">{{props.item.priority_name}}</td> -->
            <td class="text-xs-left">{{props.item.status.status}}</td>
          </tr>
        </template>
      </v-data-table>
    </div>
    <snackbar ref="snackbar" />
  </div>
</template>
<script>
import Common from "../../utils/common";
import snackbar from "../components/snackbar";
export default {
  name: "baseSalary",
  components: { snackbar },
  data() {
    return {
      headers: [
        { text: "标题", sortable: false, value: "title" },
        { text: "工单分类", sortable: false, value: "category" },
        { text: "工单类型", sortable: false, value: "class" },
        { text: "期待完成时间", sortable: false, value: "estimate_time" },
        // { text: "预计完成时间", sortable: false, value: "expect_time" },
        // { text: "优先级", sortable: false, value: "priority" },
        { text: "工单状态", sortable: false, value: "status" }
      ],
      allOrderList: [],
      orderStatus: [],
      selectOrderStatus: [1001,1002,1003,1004,1005],
      selectInfo: "",
      pagination:{
        rowsPerPage:this.$store.state.global.rowsPerPage
      }
    };
  },
  activated() {
    this.searchOrder(this.selectOrderStatus);
  },
  mounted() {
    this.getOrderStatus();
    this.searchOrder(this.selectOrderStatus);
  },
  computed: {
    selectAll() {
      return this.selectOrderStatus.length === this.orderStatus.length;
    },
    selectSome() {
      return this.selectOrderStatus.length > 0 && !this.selectAll;
    },
    icon() {
      if (this.selectAll) return "mdi-close-box";
      if (this.selectSome) return "mdi-minus-box";
      return "mdi-checkbox-blank-outline";
    }
  },
  methods: {
    async getOrderStatus() {
      let res = await this.$request.fetch("/api/repairorder/repairThreshold", {
        userType: 0
      });
      if (res.data.status === 200) {
        this.orderStatus = res.data.result;
      } else {
        this.$snackbar().showError("工单状态数据获取失败，请刷新重试");

      }
    },
    toggle() {
      this.$nextTick(() => {
        if (this.selectAll) {
          this.selectOrderStatus = [];
        } else {
          this.selectOrderStatus = this.orderStatus.slice();
        }
      });
    },
    searchOrder: Common.throttle(async function(selectOrderStatus,type) {
      if (selectOrderStatus.length === 0) {
        this.$snackbar().showError("请至少选择一个工单状态");
        return;
      }
      if (this.selectAll) {
        let res = await this.$request.fetch("/api/repairorder/orderList");
        if (res.data.status === 200) {
          this.allOrderList = res.data.result;
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
      } else if (this.selectSome) {
        let res = await this.$request.fetch(
          "/api/repairorder/searchOrderList",
          {
            statusId: selectOrderStatus
          }
        );
        if (res.data.status === 200) {
          this.allOrderList = res.data.result;
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
      } 
    }),
    addOrder() {
      this.$router.push({
        path: "/repairOrder/addOrder"
      });
    },
    activerow(item) {
      //判断状态，草稿状态跳转至editOrder，其他跳转至detailOrder
      if (item.status.status === "草稿") {
        this.$router.push({
          path: "/repairOrder/editOrder",
          query: {
            edit: 1,
            _id: item._id
          }
        });
      } else {
        this.$router.push({
          path: "/repairOrder/detailOrder",
          query: { _id: item._id }
        });
      }
    }
  }
};
</script>
<style scoped>
@import "../../assets/css/classify.css";
.searchButton {
  border-radius: 10px;
}
.layout {
  align-items: center !important;
}
.orderTr {
  cursor: pointer;
}
</style>

