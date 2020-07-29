<template>
  <v-container fluid grid-list-xl>
    <v-layout wrap pl-5 align-center>
      <v-flex xs3>
        <v-select v-model="searchSelect" :items="searchItem" label="请选择分类" no-data-text="暂无数据"></v-select>
      </v-flex>
      <v-btn color="info" class="button ml-5 mt-1" @click="searchAssign">
        <v-icon left>search</v-icon>搜索
      </v-btn>
      <v-btn color="info" class="button ml-5 mt-1" @click="handleAdd">
        <v-icon left>add</v-icon>增加
      </v-btn>
      <!-- 弹框 -->
      <v-dialog v-model="dialog" persistent max-width="600px">
        <v-card v-show="addShow">
          <v-card-title>
            <div class="headline pt-3 pl-3">{{formTitle}}</div>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap align-center v-if="isAble==false" justify-center>
                <v-flex xs12 sm6 md3>
                  <div class="title font-weight-regular">薪资组成</div>
                </v-flex>
                <v-flex xs12 sm6 d-flex>
                  <v-select :items="allClassify" item-text="category_type" v-model="categoryType" label="请选择" required
                    :disabled="isAble" :error-messages="typeErrors"></v-select>
                </v-flex>
              </v-layout>
              <v-layout align-center justify-center>
                <v-flex xs12 sm6 md3>
                  <div class="title font-weight-regular">类别名称</div>
                </v-flex>
                <v-flex xs12 sm6 d-flex>
                  <v-text-field label="输入分类名称" v-model.trim="editedItem.name" @change="$v.editedItem.name.$touch()"
                    :error-messages="nameErrors"></v-text-field>
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
      <v-data-table :headers="headers" :items="allCat" class="elevation-1" no-data-text="暂无数据">
        <template v-slot:items="props">
          <td class="text-xs-left">{{ props.item.name }}</td>
          <td>
            <v-switch v-model="props.item.is_use" @change="isUse(props.item)"></v-switch>
          </td>
          <td class="justify-center layout px-0">
            <v-btn color="info" small @click="handleEdit(props.item)">编辑</v-btn>
            <v-btn color="info" small @click="confirmDialog(props.item)">删除</v-btn>
          </td>
        </template>
      </v-data-table>
    </v-card>
    <!-- 确认删除弹框 -->
    <confirm-dialog ref="confirmDialog" @enableDelete="enableDelete" />
    <!-- 弹框 -->
    <snackbar ref="snackbar" />
  </v-container>
</template>
<script>
import Common from "../../../utils/common";
import snackbar from "../../components/snackbar";
import confirmDialog from "../../components/confirmDialog";
import pageTitle from '@/views/components/pageTitle.vue';

import { required, numeric } from "vuelidate/lib/validators";
export default {
  name: "ClassifyManagement",
  components: { snackbar, confirmDialog, pageTitle },
  validations: {
    categoryType: { required },
    editedItem: {
      name: { required }
    }
  },
  data() {
    return {
      title: '类别管理',
      subtitle: '分类管理',
      dialog: false,
      editedIndex: -1,
      isAble: false,
      addShow: false,
      searchSelect: "全部",
      categoryType: "",
      //编辑弹框绑定数据
      editedItem: {
        name: ""
      },
      defaultItem: {
        name: ""
      },
      headers: [
        { text: "类别名称", sortable: false, value: "name" },
        { text: "是否使用", sortable: false, value: "name" },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ],
      allCat: [],
      allClassify: ["基本薪资", "每月加给"],
      searchItem: ["全部"],
      delItem: {},
      classifySearchValue: ""
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "增加分类" : "编辑内容";
    },
    typeErrors() {
      const errors = [];
      if (!this.$v.categoryType.$dirty) return errors;
      !this.$v.categoryType.required && errors.push("不能为空");
      !this.$v.categoryType.required;
      return errors;
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
    this.getCategoryAccount();
  },
  methods: {
    // 获取数据
    async getCategoryAccount(isSearch = false) {
      let res = await this.$request.fetch("/api/classify/getCategoryAccount");
      let data = res.data.result;
      this.allCat = data;
      for (let i = 0; i < this.allCat.length; i++) {
        this.searchItem.push(this.allCat[i].category_type);
      }
      if (isSearch) {
        if (res.data.status === 200) {
          this.$refs.snackbar.show("搜索成功");
        } else {
          this.$refs.snackbar.showError("搜索失败，请刷新重试");
        }
      }
    },
    handleAdd() {
      this.dialog = true;
      this.isAble = false;
      this.addShow = true;
    },
    handleEdit(item) {
      this.dialog = true;
      this.isAble = true;
      this.addShow = true;
      this.editedIndex = this.allCat.indexOf(item);
      //点击编辑的时候绑定该行的数据(v-model="editedItem.name")
      this.editedItem = Object.assign({}, item);
      this.categoryType = this.editedItem.category_type;
    },
    confirmDialog(item) {
      this.delItem = item;
      this.$refs.confirmDialog.show();
    },
    async enableDelete() {
      let res = await this.$request.fetch(
        "/api/classify/deleteCategory",
        { _id: this.delItem._id },
        "delete"
      );
      if (res.data.status === 200) {
        // 前端页面上的假删除
        let index = this.allCat.indexOf(this.delItem);
        this.allCat.splice(index, 1);
        this.$refs.confirmDialog.close();
        //弹框提示
        this.$refs.snackbar.showStatus("delete");
      } else if (res.data.status === 504) {
        this.$refs.snackbar.showError("删除失败，该分类下存在等级");
      } else {
        this.$refs.snackbar.showStatus("delete", false);
        this.$refs.confirmDialog.close();
      }
    },
    //增、改,
    save: Common.throttle(async function() {
      this.$v.$touch();

      // if编辑else增加
      if (this.editedIndex > -1) {
        if (!this.editedItem.name) {
          return;
        }
        let res = await this.$request.fetch(
          "/api/classify/updateCategory",
          {
            name: this.editedItem.name,
            _id: this.editedItem._id
          },
          "post"
        );
        if (res.data.status === 200) {
          this.$refs.snackbar.showStatus("edit");
          // 在前端页面上编辑，不需要在重新调用获取所有数据的方法 this.getCategoryAccount();
          for (const v of this.allCat) {
            if (v._id === this.editedItem._id) {
              const index = this.allCat.indexOf(v);
              this.allCat.splice(index, 1, this.editedItem);
              break;
            }
          }
        } else if (res.data.status === 500) {
          this.$refs.snackbar.showError("该分类已存在");
        } else {
          this.$refs.snackbar.showStatus("edit", false);
        }
        this.close();
      } else {
        if (this.categoryType === "" || this.editedItem.name === "") {
          return false;
        }
        let res = await this.$request.fetch(
          "/api/classify/addCategory",
          {
            category_type: this.categoryType,
            name: this.editedItem.name
          },
          "post"
        );

        if (res.data.status === 200) {
          this.$refs.snackbar.showStatus("add");
          this.handleSearch(false);
        } else if (res.data.status === 500) {
          this.$refs.snackbar.showError("该分类已存在");
        } else {
          this.$refs.snackbar.showStatus("add", false);
        }
        this.close();
      }
    }),
    close() {
      this.dialog = false;
      this.editedItem = Object.assign({}, this.defaultItem);
      this.editedIndex = -1;
      this.categoryType = "";
      this.$v.$reset();
    },

    searchAssign() {
      this.classifySearchValue = this.searchSelect;
      this.handleSearch();
    },

    async handleSearch(showSnackbar = true) {
      if (this.searchSelect === "全部" || !this.classifySearchValue) {
        this.getCategoryAccount(showSnackbar);
      } else {
        let res = await this.$request.fetch(
          "/api/classify/searchCategoryAccount",
          { category_type: this.classifySearchValue }
        );
        if (res.data.status === 200) {
          this.allCat = res.data.result;
          showSnackbar && this.$refs.snackbar.showStatus("search");
        } else {
          showSnackbar && this.$refs.snackbar.showStatus("search", false);
        }
      }
    },
    async isUse(item) {
      let param = {
        category_id: item._id,
        is_use: item.is_use
      };

      let res = await this.$request.fetch(
        "/api/classify/salary_Structure",
        param,
        "post"
      );
      if (res.data.status === 200) {
        this.$refs.snackbar.showStatus("edit");
      } else {
        this.$refs.snackbar.showStatus("edit", false);
      }
    }
  }
};
</script>
<style scoped>
@import "../../../assets/css/common.css";
</style>
