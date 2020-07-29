<template>
  <v-container fluid grid-list-xl>
    <v-layout wrap pl-5 align-center>
      <v-flex xs3 d-flex>
        <v-autocomplete v-model="selectCategory" :items="categoryList" item-text="name" item-value="_id"
          label="请选择/输入类别" no-data-text="暂无数据">
        </v-autocomplete>
      </v-flex>
      <v-btn color="info" class="button ml-5 mt-1" @click="handleSearch">
        <v-icon left>search</v-icon>搜索
      </v-btn>
      <v-btn color="info" class="button ml-5 mt-1" @click="handleAddAndEdit('add')">
        <v-icon left>add</v-icon>增加
      </v-btn>
      <!-- 点击增加出现的弹框 -->
      <v-dialog v-model="showDialog" persistent max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">{{ operate }}内容</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap justify-center align-center>
                <v-flex xs12 sm6 md3>
                  <div class="title font-weight-regular">类别名称</div>
                </v-flex>
                <v-flex xs12 sm6 d-flex>
                  <v-select :label="categoryLabel" :items="addCategoryList" item-text="name" item-value='_id'
                    @change="$v.categoryId.$touch()" :error-messages="categoryNameErrors" :disabled="notCategory"
                    v-model="categoryId"></v-select>
                </v-flex>
              </v-layout>
              <v-layout justify-center align-center wrap>
                <v-flex xs12 sm6 md3>
                  <div class="title font-weight-regular">类别等级</div>
                </v-flex>
                <v-flex xs12 sm6 d-flex>
                  <v-text-field label="输入等级名称" v-model.trim="gradeName" @change="$v.gradeName.$touch()"
                    :error-messages="gradeNameErrors"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="closeDialog">取消</v-btn>
            <v-btn color="blue darken-1" flat @click="saveAddOrEdit">确定</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
    <!-- 表格 -->
    <v-card class="mt-5 pa-5">
      <page-title :title="title" :subtitle="subtitle" />
      <v-data-table :headers="headers" :items="gradeDataList" class="elevation-1" no-data-text="暂无数据">
        <template v-slot:items="props">
          <td class="text-xs-left" v-if="!props.item.category">{{props.item.category_id.name}}</td>
          <td class="text-xs-left" v-else-if="props.item.category">{{props.item.category.name}}</td>
          <td class="text-xs-left" v-if="props.item">{{props.item.name}}</td>
          <td class="text-xs-left" v-else-if="!props.item"></td>
          <td class="text-xs-center">
            <v-btn small color="info" @click="handleAddAndEdit('edit', props.item)">编辑</v-btn>
            <v-btn small color="info" @click="showDeleteDialog(props.item)">删除</v-btn>
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

import { required } from "vuelidate/lib/validators";
export default {
  name: "rankManagement",
  components: { snackbar, confirmDialog, pageTitle },
  validations: {
    categoryId: { required },
    gradeName: { required }
  },
  data() {
    return {
      title: "类别管理",
      subtitle: "等级管理",
      showDialog: false, // 显示增加和编辑的 dialog
      operate: "", // dialog操作类型
      notCategory: false, // 编辑时不可编辑category
      selectCategory: "", // 下拉菜单选中的categoryid
      searchCategory: "", // 搜索中间变量
      categoryId: "", // dialog中的类别名
      gradeName: "", // 编辑/新增时的等级名
      gradeId: "", // 编辑时的等级ID
      categoryLabel: "请选择",
      headers: [
        { text: "类别名称", sortable: false, value: "name" },
        { text: "等级名称", sortable: false, value: "name" },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ],
      gradeDataList: [],
      categoryList: [],
      addCategoryList: [], // 增加时的分类数据
      deleteGradeId: "",
      deleteCategoryId: ""
    };
  },
  computed: {
    categoryNameErrors() {
      const errors = [];
      if (!this.$v.categoryId.$dirty) return errors;
      !this.$v.categoryId.required && errors.push("不能为空");
      return errors;
    },
    gradeNameErrors() {
      const errors = [];
      if (!this.$v.gradeName.$dirty) return errors;
      !this.$v.gradeName.required && errors.push("不能为空");
      return errors;
    }
  },
  mounted() {
    this.getGradeList();
    this.getCategoryList();
  },
  methods: {
    async getGradeList(isSearch = false) {
      const { data } = await this.$request.fetch(
        "/api/classify/getGradeAccount"
      );
      if (data.status === 200) {
        isSearch && this.$refs.snackbar.showStatus("search");
        this.gradeDataList = data.result;
      } else {
        if (isSearch) {
          this.$refs.snackbar.showStatus("search", false);
          return;
        }
        this.$refs.snackbar.showError();
      }
    },
    async getCategoryList() {
      const { data: categoryList } = await this.$request.fetch(
        "/api/classify/getGradeByCategory"
      );
      categoryList.result.map(item => {
        this.categoryList.push(item);
        this.addCategoryList.push(item);
      })
      this.categoryList.unshift({ name: "全部", _id: "" });
    },
    handleAddAndEdit(operate, item) {
      this.showDialog = true;
      if (operate === "edit") {
        this.notCategory = true;
        this.operate = "编辑";
        this.gradeName = item.name;
        this.categoryLabel = item.category_id.name;
        if (this.searchCategory) {
          this.gradeId = item._id;
        } else {
          this.gradeId = item._id._id;
        }
      } else {
        this.operate = "增加";
      }
    },
    saveAddOrEdit: Common.throttle(async function() {
      if (this.operate === "增加") {
        this.$v.$touch();
        if (this.$v.$invalid) return;
        let param = { cat_id: this.categoryId, grade_name: this.gradeName };
        let { data } = await this.$request.fetch(
          "/api/classify/addGrade",
          param,
          "post"
        );

        if (data.status === 200) {
          this.$refs.snackbar.showStatus("add");
          this.searchCategory ? this.search(false) : this.getGradeList();
        } else if (data.status === 500) {
          this.$refs.snackbar.showError("该等级已存在");
        } else {
          this.$refs.snackbar.showStatus("add", false);
        }
      } else {
        this.$v.gradeName.$touch();
        if (this.$v.gradeName.$invalid) return;
        const param = { name: this.gradeName, _id: this.gradeId };
        let { data } = await this.$request.fetch(
          "/api/classify/updateGrade",
          param,
          "put"
        );
        if (data.status === 200) {
          this.$refs.snackbar.showStatus("edit");
          this.searchCategory ? this.search(false) : this.getGradeList();
        } else if (data.status === 500) {
          this.$refs.snackbar.showError("该等级已存在");
        } else {
          this.$refs.snackbar.showStatus("edit", false);
        }
      }
      this.closeDialog();
    }),

    showDeleteDialog(value) {
      if (this.searchCategory) {
        // 搜索后和初始渲染的列表数据结构不同，需判断
        this.deleteGradeId = value._id;
      } else {
        this.deleteGradeId = value._id._id;
      }
      this.deleteCategoryId = value.category_id._id;
      this.$refs.confirmDialog.show();
    },

    async enableDelete() {
      let res = await this.$request.fetch(
        "/api/classify/deleteGrade",
        {
          _id: this.deleteGradeId,
          category_id: this.deleteCategoryId
        },
        "delete"
      );

      if (res.data.status === 200) {
        this.$refs.snackbar.showStatus("delete");
        this.searchCategory ? this.search(false) : this.getGradeList();
      } else if (res.data.status === 504) {
        this.$refs.snackbar.showError("删除失败，该等级正在被使用");
      } else {
        this.$refs.snackbar.showStatus("delete", false);
      }
    },

    closeDialog() {
      this.showDialog = false;
      this.$v.$reset();
      this.categoryId = "";
      this.gradeName = "";
      this.notCategory = false;
      this.categoryLabel = "请选择";
      if (this.categoryList[0].name !== "全部") {
        this.categoryList.unshift({ name: "全部", _id: "" });
      }
    },

    handleSearch() {
      this.searchCategory = this.selectCategory;
      this.search();
    },

    async search(showSnackbar = true) {
      if (!this.searchCategory) {
        this.getGradeList(showSnackbar);
        return;
      }
      const {
        data
      } = await this.$request.fetch("/api/classify/getGradeBycateGory_list", {
        _id: this.searchCategory
      });
      if (data.status === 200) {
        this.gradeDataList = data.result;
        showSnackbar && this.$refs.snackbar.showStatus("search");
      } else {
        showSnackbar && this.$refs.snackbar.showStatus("search", false);
      }
    }
  }
};
</script>
<style scoped>
@import "../../../assets/css/common.css";
</style>
