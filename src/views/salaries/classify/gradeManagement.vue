<template>
  <v-container fluid grid-list-xl>
    <v-layout wrap pl-5 align-center>
      <v-flex xs3 d-flex>
        <v-autocomplete :items="allCategory" v-model="categorySelectId" item-text="name" item-value="_id"
          label="请选择/输入类别" @change="getLevel" no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
      <v-flex xs3 d-flex>
        <v-autocomplete :items="selectGradedata" v-model="gradeSelectId" item-text="name" item-value="_id"
          label="请选择/输入等级" no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
      <v-btn color="info" class="button ml-5 mt-1" @click="handleSearch">
        <v-icon left>search</v-icon>搜索
      </v-btn>
      <v-btn color="info" class="button ml-5 mt-1" @click="handleAdd">
        <v-icon left>add</v-icon>增加
      </v-btn>

      <!-- 点击增加出现的弹框 -->
      <v-dialog v-model="dialog" persistent max-width="600px">
        <v-card v-show="addShow">
          <v-card-title>
            <span class="headline pt-3 pl-3">增加级别</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout wrap justify-center align-center>
                <v-flex xs12 sm6 md3>
                  <div class="title font-weight-regular">类别名称</div>
                </v-flex>
                <v-flex xs12 sm6 d-flex>
                  <v-select :items="addCategoryList" item-text="name" item-value="_id" v-model="categoryAddSelectId"
                    label="请选择" @change="addGetlevel" :error-messages="categoryErrors"></v-select>
                </v-flex>
              </v-layout>
              <v-layout wrap justify-center align-center>
                <v-flex xs12 sm6 md3>
                  <div class="title font-weight-regular">类别等级</div>
                </v-flex>
                <v-flex xs12 sm6 d-flex>
                  <v-select :items="addDessertsGrade" item-text="name" item-value="_id" v-model="gradeAddSelectId"
                    label="请选择" :error-messages="gradeErrors">
                  </v-select>
                </v-flex>
              </v-layout>
              <v-layout wrap justify-center align-center>
                <v-flex xs12 sm6 md3>
                  <div class="title font-weight-regular">等级级别</div>
                </v-flex>
                <v-flex xs12 sm6 d-flex>
                  <v-text-field v-model.trim="editedItem.name" @change="$v.editedItem.name.$touch()" label="输入级别名称"
                    :error-messages="rankErrors"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
            <v-btn color="blue darken-1" flat @click="addSave">确定</v-btn>
          </v-card-actions>
        </v-card>
        <v-card v-show="editShow">
          <v-card-title>
            <span class="headline">编辑内容</span>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout justify-center align-center>
                <v-flex xs12 sm6 md3>
                  <div class="title font-weight-regular">等级级别</div>
                </v-flex>
                <v-flex xs12 sm6 d-flex>
                  <v-text-field v-model="level.name" label="输入级别名称" @change="$v.level.name.$touch()"
                    :error-messages="levelNameErrors"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
            <v-btn color="blue darken-1" flat @click="editSave">确定</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
    <!-- 表格 -->
    <v-card class="mt-5 pa-5">
      <page-title :title="title" :subtitle="subtitle" />
      <v-data-table :headers="headers" :items="allGrade" class="elevation-1" no-data-text="暂无数据">
        <template v-slot:items="props">
          <td class="text-xs-left">{{ props.item.category.name }}</td>
          <td class="text-xs-left">{{ props.item.name }}</td>
          <td class="text-xs-left">{{ props.item.level.name }}</td>
          <td class="text-xs-center">
            <v-btn small color="info" @click="handleEdit(props.item)">编辑</v-btn>
            <v-btn small color="info" @click="confirmDialog(props.item)">删除</v-btn>
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
import pageTitle from "@/views/components/pageTitle.vue";

import { required } from "vuelidate/lib/validators";
export default {
  name: "gradeManagement",
  components: { snackbar, confirmDialog, pageTitle },
  validations: {
    categoryAddSelectId: { required },
    gradeAddSelectId: { required },
    editedItem: { name: { required } },
    level: { name: { required } }
  },
  computed: {
    categoryErrors() {
      const errors = [];
      if (!this.$v.categoryAddSelectId.$dirty) return errors;
      !this.$v.categoryAddSelectId.required && errors.push("不能为空");
      return errors;
    },
    gradeErrors() {
      const errors = [];
      if (!this.$v.gradeAddSelectId.$dirty) return errors;
      !this.$v.gradeAddSelectId.required && errors.push("不能为空");
      return errors;
    },
    rankErrors() {
      const errors = [];
      if (!this.$v.editedItem.name.$dirty) return errors;
      !this.$v.editedItem.name.required && errors.push("不能为空");
      return errors;
    },
    levelNameErrors() {
      const errors = [];
      if (!this.$v.level.name.$dirty) return errors;
      !this.$v.level.name.required && errors.push("不能为空");
      return errors;
    }
  },
  data() {
    return {
      title: "类别管理",
      subtitle: "级别管理",
      dialog: false,
      addShow: false,
      editShow: false,
      delShow: false,
      //编辑弹框绑定数据
      editedItem: {
        name: ""
      },
      editedIndex: -1,
      headers: [
        { text: "类别名称", sortable: false, value: "name" },
        { text: "等级名称", sortable: false, value: "name" },
        { text: "级别名称", sortable: false, value: "name" },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ],
      allGrade: [],
      categorySelectId: "", //搜索select绑定的值
      categoryAddSelectId: "",
      gradeSelectId: "",
      gradeAddSelectId: "",
      addCategoryList: [],
      addDessertsGrade: [],
      category: {
        name: ""
      },
      level: {
        name: "",
        _id: ""
      },
      allCategory: [],
      selectGradedata: [],
      conformValue: {},
      categorySearchValue: "",
      gradeSearchValue: ""
    };
  },
  mounted() {
    this.getLevelAccount();
    this.showCategory();
    this.showGrade();
  },
  methods: {
    async getLevelAccount(isSearch = false) {
      let allGradeData = await this.$request.fetch(
        "/api/classify/getLevelAccount"
      );
      if (allGradeData.data.status === 200) {
        this.allGrade = allGradeData.data.result.filter(item => {
          return (
            item.category &&
            item.level &&
            item.category.category_type === "基本薪资"
          );
        });
        isSearch && this.$refs.snackbar.showStatus("search");
      } else {
        isSearch
          ? this.$refs.snackbar.showStatus("search")
          : this.$refs.snackbar.showError();
      }
    },
    async showCategory() {
      let allCategoryData = await this.$request.fetch(
        "/api/classify/getCategoryAccount"
      );
      let allCategoryList = allCategoryData.data.result.filter(item => {
        return item.category_type === "基本薪资";
      });
      this.allCategory.unshift({ name: "全部", _id: "" });
      for (const iterator of allCategoryList) {
        this.allCategory.push(iterator);
        this.addCategoryList.push(iterator);
      }
    },
    async showGrade() {
      let selGradeData = await this.$request.fetch(
        "/api/classify/getGradeAccount"
      );
      let selectGradedata = selGradeData.data.result.filter(item => {
        return item.category_id.category_type === "基本薪资";
      });
      this.selectGradedata.length = 0;
      for (const iterator of selectGradedata) {
        this.selectGradedata.push(iterator._id);
        this.addDessertsGrade.push(iterator._id);
      }
      this.selectGradedata.unshift({ name: "全部", _id: "" });
    },
    async getLevel() {
      if (!this.categorySelectId) {
        this.showGrade();
      } else {
        let selectGradedata = await this.$request.fetch(
          "api/classify/getCategoryByGrade",
          {
            _id: this.categorySelectId //分类的id
          }
        );
        if (selectGradedata.data.status === 200) {
          this.selectGradedata.length = 0;
          this.selectGradedata = selectGradedata.data.result;
          this.selectGradedata.unshift({ name: "全部", _id: "" });
          this.gradeSelectId = "";
        } else {
          this.$refs.snackbar.showError();
        }
      }
    },
    async addGetlevel() {
      this.gradeAddSelectId = "";
      this.editedItem.name = "";
      let addDessertsGrade = await this.$request.fetch(
        "api/classify/getCategoryByGrade",
        {
          _id: this.categoryAddSelectId //分类的id
        }
      );
      if (addDessertsGrade.data.status === 200) {
        this.addDessertsGrade = addDessertsGrade.data.result;
      } else {
        this.$refs.snackbar.showError();
      }
    },
    handleAdd() {
      this.dialog = true;
      this.addShow = true;
      this.editShow = false;
      this.delShow = false;
    },
    // 增加
    addSave: Common.throttle(async function() {
      this.$v.categoryAddSelectId.$touch();
      this.$v.editedItem.name.$touch();
      this.$v.gradeAddSelectId.$touch();

      if (
        this.$v.categoryAddSelectId.$invalid ||
        this.$v.editedItem.name.$invalid ||
        this.$v.gradeAddSelectId.$invalid
      )
        return;
      let res = await this.$request.fetch(
        "/api/classify/addLevel",
        {
          category_id: this.categoryAddSelectId,
          grade_id: this.gradeAddSelectId,
          name: this.editedItem.name
        },
        "post"
      );

      this.categoryAddSelectId = "";
      this.gradeAddSelectId = "";
      if (res.data.status === 200) {
        this.$refs.snackbar.showStatus("add");
        if (this.categorySearchValue === "" && this.gradeSearchValue === "") {
          this.getLevelAccount();
        } else {
          this.searchLevel(false);
        }
      } else if (res.data.status === 500) {
        this.$refs.snackbar.showError("该薪资项已存在");
      } else {
        this.$refs.snackbar.showStatus("add", false);
      }
      this.close();
    }),
    handleEdit(item) {
      this.dialog = true;
      this.addShow = false;
      this.editShow = true;
      this.delShow = false;
      this.level.name = item.level.name;
      this.level._id = item.level._id;
    },
    confirmDialog(value) {
      this.conformValue = value;
      this.$refs.confirmDialog.show();
    },
    async enableDelete() {
      let res = await this.$request.fetch(
        "/api/classify/deleteLevel",
        {
          _id: this.conformValue.level._id
        },
        "delete"
      );
      if (res.data.status === 200) {
        let index = this.allGrade.indexOf(this.conformValue);
        this.allGrade.splice(index, 1);
        this.$refs.confirmDialog.close();
        // 弹框提示
        this.$refs.snackbar.showStatus("delete");
      } else if (res.data.status === 504) {
        this.$refs.snackbar.showError("删除失败，该级别正在被使用");
        this.$refs.confirmDialog.close();
      } else {
        this.$refs.snackbar.showStatus("delete", false);
        this.$refs.confirmDialog.close();
      }
    },
    // 编辑
    async editSave() {
      this.$v.level.name.$touch();
      if (this.$v.level.name.$invalid) return;
      let res = await this.$request.fetch(
        "/api/classify/updateLevel",
        {
          _id: this.level._id,
          name: this.level.name
        },
        "put"
      );

      if (res.data.status === 200) {
        this.$refs.snackbar.showStatus("edit");
        if (this.categorySearchValue === "" && this.gradeSearchValue === "") {
          this.getLevelAccount();
        } else {
          this.searchLevel(false);
        }
      } else if (res.data.status === 500) {
        this.$refs.snackbar.showError("该等级已存在");
      } else {
        this.$refs.snackbar.showStatus("edit", false);
      }
      this.close();
      if (this.categorySelectId === "" && this.gradeSelectId === "") {
        this.getLevelAccount();
      } else {
        this.searchLevel(false);
      }
    },
    close() {
      this.dialog = false;
      this.categoryAddSelectId = "";
      this.gradeAddSelectId = "";
      this.editedItem.name = "";
      this.$v.$reset();
    },
    // 搜索
    handleSearch() {
      this.categorySearchValue = this.categorySelectId;
      this.gradeSearchValue = this.gradeSelectId;
      this.searchLevel();
    },

    async searchLevel(showSnackbar = true) {
      if (!this.categorySelectId) {
        if (!this.gradeSelectId) {
          this.getLevelAccount(true);
        } else {
          let res = await this.$request.fetch("/api/classify/getGradeByLevel", {
            _id: this.gradeSearchValue
          });
          this.allGrade = res.data.result;
          showSnackbar && this.$refs.snackbar.showStatus("search");
        }
      } else {
        if (!this.gradeSelectId) {
          const param = { category_id: this.categorySearchValue };
          let res = await this.$request.fetch( "/api/classify/getLevelByCategoryGrade_list", param );
          if (res.data.status === 200) {
            this.allGrade = res.data.result;
            showSnackbar && this.$refs.snackbar.showStatus("search");
          } else {
            showSnackbar && this.$refs.snackbar.showStatus("search", false);
          }
        } else {
          let res = await this.$request.fetch(
            "api/classify/getLevelByCategoryGrade_list",
            {
              grade_id: this.gradeSearchValue,
              category_id: this.categorySearchValue
            }
          );
          if (res.data.status === 200) {
            showSnackbar && this.$refs.snackbar.showStatus("search");
            this.allGrade = res.data.result;
          } else {
            showSnackbar && this.$refs.snackbar.showStatus("search", false);
          }
        }
      }
    }
  }
};
</script>
<style scoped>
@import "../../../assets/css/common.css";
</style>
