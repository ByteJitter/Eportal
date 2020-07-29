<!-- 商品管理商品列表页面-->
<template>
  <div>
    <v-layout>
      <v-flex md2>
        <v-autocomplete :items="searchItems" label="请选择/输入商品名称" v-model="selected" item-text="name"
          item-value="_id" no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm6 md1>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleSearch">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
      <v-flex xs12 sm6 md1>
        <v-btn color="info" style="margin-left: 40px; border-radius:10px;" @click="add">
          <v-icon>add</v-icon>增加
        </v-btn>
      </v-flex>
    </v-layout>
    <!-- 商品列表 -->
    <div class="classify-bg">
      <v-flex xs12 class="classify-bg-flex">
        <p>产品管理</p>
        <p>产品</p>
      </v-flex>
      <v-data-table :headers="headers" :items="products" class="elevation-1" no-data-text="暂无数据">
        <template v-slot:items="props">
          <td><img :src="'/api/'+props.item.productImage" width="80px" height="80px"></td>
          <td>{{ props.item.productName }}</td>
          <td class="text-xs-center">
            <v-btn color="info" dark @click="handleUpdate(props.item)">编辑</v-btn>
            <v-btn color="info" dark @click="confirmDialog(props.item.productId)">删除</v-btn>
          </td>
        </template>
      </v-data-table>
    </div>
    <!-- 确认删除弹框 -->
    <confirm-dialog ref="confirmDialog" @enableDelete="enableDelete" />
  </div>
</template>

<script>
import Common from "../../utils/common";
import confirmDialog from "../components/confirmDialog";
export default {
  data() {
    return {
      searchItems: [{ name: "全部", _id: "" }],
      selected: "",
      sendSelected: "",
      headers: [
        { text: "产品图片", value: "image", sortable: false },
        { text: "产品名称", value: "name", sortable: false },
        {
          text: "操作",
          align: "center",
          value: "function",
          sortable: false,
          width: "260px"
        }
      ],
      products: [],
      delItem: "",
      delProductId: ""
    };
  },
  components: { confirmDialog },
  created() {
    this.getList();
  },
  activated() {
    this.getSearchList();
    this.refreshSearch();
  },
  methods: {
    async getList(params, type) {
      let res = await this.$request.fetch(
        "/api/individual/goods/productList",
        params
      );
      res = res.data;
      if (res.status === 200) {
        this.products = res.result;
        await this.getSearchList();
        if (type === "search") {
          this.$snackbar().showStatus("search");
        }
      } else {
        this.$snackbar().showStatus("search", false);
        return;
      }
    },
    async getSearchList() {
      let res = await this.$request.fetch("/api/individual/goods/productList");
      res = res.data;
      if (res.status === 200 && res.result.length > 0) {
        this.searchItems = [{ name: "全部", _id: "" }];
        this.searchItems = this.searchItems.concat(
          res.result.map(item => {
            return { name: item.productName, _id: item._id };
          })
        );
        this.$forceUpdate();
      } else {
        this.searchItems = [{ name: "全部", _id: "" }];
      }
    },
    confirmDialog(item) {
      this.delItem = item;
      this.$refs.confirmDialog.show();
    },
    async enableDelete() {
      let params = { productId: this.delItem };
      let res = await this.$request.fetch(
        "/api/individualGood/product",
        params,
        "delete"
      );
      res = res.data;
      if (res.status === 200) {
        this.$snackbar().showStatus("delete");
        if (
          this.sendSelected === this.selected ||
          this.selected === this.delItem
        ) {
          this.selected = "";
          this.sendSelected = "";
        }
        await this.getList(this.sendSelected);
      } else {
        this.$snackbar().showStatus("delete", false);
        return;
      }
    },
    handleUpdate(item) {
      this.$router.push({
        path: "/orderStystem/product/addProduct",
        query: { item: item._id }
      });
    },
    add() {
      this.$router.push({ path: "/orderStystem/product/addProduct" });
    },
    handleSearch() {
      this.sendSelected = this.selected;
      let params = { id: this.sendSelected };
      this.getList(params, "search");
    },
    async refreshSearch() {
      this.sendSelected = this.selected;
      let params = { id: this.sendSelected };
      let res = await this.$request.fetch(
        "/api/individual/goods/productList",
        params
      );
      res = res.data;
      if (res.status === 200) {
        this.products = res.result;
      } else {
        this.$refs.snackbar.show("刷新重试", "error");
        return;
      }
    }
  }
};
</script>
<style scoped>
@import "../../assets/css/classify.css";
.classify-bg {
  margin-top: 30px;
}
</style>