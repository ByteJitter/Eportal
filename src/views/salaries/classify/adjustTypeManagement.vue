<template>
  <v-container fluid grid-list-xl>
    <v-layout wrap pl-5 align-center>
      <v-flex xs3>
        <v-select v-model="searchSelect" :items="searchItem" item-text="name" item-value="_id" label="请选择分类" no-data-text="暂无数据"></v-select>
      </v-flex>
      <v-btn color="info" class="button ml-5 mt-1" @click="searchAssign">
        <v-icon left>search</v-icon>搜索
      </v-btn>
      <v-btn color="info" class="button ml-5 mt-1" @click="handleAdd">
        <v-icon left>add</v-icon>增加
      </v-btn>
      <!-- 弹框 -->
      <v-dialog v-model="dialog" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <div class="headline pt-3 pl-3">{{formTitle}}</div>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout align-center justify-center>
                <v-flex xs12 sm6 md5>
                  <div class="title font-weight-regular">特别调整类型名称</div>
                </v-flex>
                <v-flex xs12 sm6 d-flex>
                  <v-text-field label="输入类型名称" v-model.trim="editedItem.name" @change="$v.editedItem.name.$touch()" :error-messages="nameErrors"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
            <v-btn color="blue darken-1" flat @click="save">确定</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
    <!-- 表格 -->
    <v-card class="mt-5 pa-5">
      <page-title :title="title" :subtitle="subtitle" />
      <v-data-table :headers="adjustTypeHeader" :items="adjustTypeData" class="elevation-1" no-data-text="暂无数据">
        <template v-slot:items="props">
          <td class="text-xs-left">{{ props.item.name }}</td>
          <td class="text-xs-center">
            <v-btn color="info" small @click="handleEdit(props.item)">编辑</v-btn>
            <v-btn color="info" small @click="confirmDialog(props.item)">删除</v-btn>
          </td>
        </template>
      </v-data-table>
    </v-card>
    <!-- 确认删除弹框 -->
    <confirm-dialog ref="confirmDialog" @enableDelete="enableDelete" />
  </v-container>
</template>
<script>
import Common from "../../../utils/common";
import confirmDialog from "../../components/confirmDialog";
import pageTitle from "@/views/components/pageTitle.vue";

import { required, numeric } from "vuelidate/lib/validators";
export default {
  name: "ClassifyManagement",
  components: { confirmDialog, pageTitle },
  validations: {
    editedItem: {
      name: { required }
    }
  },
  data() {
    return {
      title: "类别管理",
      subtitle: "特殊调整类型管理",
      dialog: false,
      editedIndex: -1,
      isAble: false,
      // addShow: false,
      searchSelect: "",
      editedItem: {
        name: ""
      },
      defaultItem: {
        name: ""
      },
      adjustTypeHeader: [
        { text: "类别名称", sortable: false, value: "name" },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ],
      adjustTypeData: [],
      searchItem: [],
      delItem: {},
      classifySearchValue: ""
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "增加特别调整项" : "编辑内容";
    },
    nameErrors() {
      const errors = [];
      if (!this.$v.editedItem.name.$dirty) return errors;
      !this.$v.editedItem.name.required && errors.push("不能为空");
      !this.$v.editedItem.name.required;
      return errors;
    }
  },
  mounted() {
    this.getAdjustTypeAccount();
    this.getSearchList();
  },
  methods: {
    async getSearchList() {
      let res = await this.$request.fetch("/api/classify/adjustTypeSearchList");
      if (res.data.status === 200) {
        this.searchItem = res.data.result;
      } else {
        this.$snackbar().showError("搜索列表数据获取失败");
      }
      this.searchItem.unshift({ name: "全部", _id: "" });
    },
    async getAdjustTypeAccount(isSearch = false) {
      let res = await this.$request.fetch("/api/classify/adjustTypeAccount");
      if (res.data.status === 200) {
        this.adjustTypeData = res.data.result;
        isSearch && this.$snackbar().showStatus("search");
      } else {
        isSearch
          ? this.$snackbar().showStatus("search")
          : this.$snackbar().showError();
      }
    },
    handleAdd() {
      this.dialog = true;
      this.isAble = false;
    },
    handleEdit(item) {
      this.dialog = true;
      this.isAble = true;
      this.editedIndex = this.adjustTypeData.indexOf(item);
      this.editedItem = Object.assign({}, item);
    },
    confirmDialog(item) {
      this.delItem = item;
      this.$refs.confirmDialog.show();
    },
    async enableDelete() {
      let res = await this.$request.fetch(
        "/api/classify/deleteAdjustType",
        { _id: this.delItem._id },
        "delete"
      );
      if (res.data.status === 200) {
        this.$refs.confirmDialog.close();
        this.handleSearch(false);
        this.$snackbar().showStatus("delete");
      } else {
        this.$snackbar().showStatus("delete", false);
      }
      this.getSearchList();
    },
    // 新增和编辑
    save: Common.throttle(async function() {
      this.$v.$touch();
      let data = {
        name: this.editedItem.name
      };
      if (this.editedIndex > -1) {
        data["_id"] = this.editedItem._id;
      }

      if (this.editedItem.name === "") {
        return false;
      }
      let res = await this.$request.fetch(
        "/api/classify/adjustType",
        {
          data: data
        },
        "post"
      );
      if (res.data.status === 200) {
        this.$snackbar().showStatus("add");
        this.handleSearch(false);
        this.getSearchList();
        this.close();
      } else if (res.data.status === 500) {
        this.$snackbar().showError("该特殊调整类型已存在");
      } else {
        this.$snackbar().showStatus("add", false);
      }
    }),

    close() {
      this.dialog = false;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedIndex = -1;
      this.$v.$reset();
    },

    searchAssign() {
      this.classifySearchValue = this.searchSelect;
      this.handleSearch();
    },

    async handleSearch(showSnackbar = true) {
      if (this.searchSelect === "全部" || !this.classifySearchValue) {
        this.getAdjustTypeAccount(showSnackbar);
      } else {
        let res = await this.$request.fetch("/api/classify/searchAdjustType", {
          adjustType_id: this.classifySearchValue
        });
        if (res.data.status === 200) {
          this.adjustTypeData = [res.data.result];
          showSnackbar && this.$snackbar().showStatus("search");
        } else {
          showSnackbar && this.$snackbar().showStatus("search", false);
        }
      }
    }
  }
};
</script>
<style scoped>
@import "../../../assets/css/common.css";
</style>
