<template>
    <v-container fluid grid-list-xl>
      <v-layout pl-5 wrap align-center>
        <v-flex xs4 sm2 md2>
          <v-autocomplete :items="allCat" item-text="name" item-value="_id" v-model="searchCategoryId"
            @change="getGrade" label="请选择分类" no-data-text="暂无数据"></v-autocomplete>
        </v-flex>
        <v-flex xs4 sm2 md2>
          <v-autocomplete :items="allGradeName" item-text="name" item-value="_id" v-model="searchGradeId" label="请选择等级" no-data-text="暂无数据">
          </v-autocomplete>
        </v-flex>
        <v-btn color="info" class="button ml-5 mt-1 " @click="handleSearch">
          <v-icon left>search</v-icon>搜索
        </v-btn>
        <v-btn color="info" class="button ml-5 mt-1" @click="handleAdd">
          <v-icon left>add</v-icon>增加
        </v-btn>
        <!-- 点击增加出现的弹框 -->
        <v-dialog v-model="dialog" persistent max-width="600px">
          <v-card v-show="addShow">
            <v-card-title>
              <span class="headline">{{formTitle}}</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout align-center justify-center wrap v-if="addDisplay">
                  <v-flex xs12 sm6 md3>
                    <span class="title font-weight-regular">类别名称</span>
                  </v-flex>
                  <v-flex xs12 sm6 d-flex>
                    <v-select :items="addcategorysItem" item-text="name" item-value="_id" v-model="addCategoryId"
                      label="请选择分类" @change="getAddGrade" :error-messages="categoryErrors" no-data-text="暂无数据">
                    </v-select>
                  </v-flex>
                </v-layout>
                <v-layout align-center justify-center wrap v-if="addDisplay">
                  <v-flex xs12 sm6 md3>
                    <span class="title font-weight-regular">类别等级</span>
                  </v-flex>
                  <v-flex xs12 sm6 d-flex>
                    <v-select :items="addAllGrade" item-text="name" item-value="_id" v-model="editedGradeId"
                      label="请选择等级" :error-messages="gradeErrors" no-data-text="暂无数据"></v-select>
                  </v-flex>
                </v-layout>
                <v-layout align-center justify-center wrap>
                  <v-flex xs12 sm6 md3>
                    <div class="title font-weight-regular text-justified amount">金额</div>
                  </v-flex>
                  <v-flex xs12 sm6 d-flex>
                    <v-text-field v-model.trim="editedItem.amount" :error-messages="amountErrors"
                      @change="$v.editedItem.amount.$touch()" label="请输入金额"></v-text-field>
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
        <v-data-table :headers="headers" :items="allSupply" class="elevation-1" no-data-text="暂无数据">
          <template v-slot:no-data>
            <div class="text-xs-center">暂无数据</div>
          </template>
          <template v-slot:items="props">
            <td class="text-xs-left">{{ props.item.category_id.name }}</td>
            <td class="text-xs-left">{{ props.item.grade_id.name }}</td>
            <td class="text-xs-left">{{ props.item.amount }}</td>
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
import pageTitle from '@/views/components/pageTitle.vue';

import { required, numeric } from "vuelidate/lib/validators";
export default {
  name: "supply",
  components: { snackbar, confirmDialog, pageTitle },
  validations: {
    addCategoryId: { required },
    editedGradeId: { required },
    editedItem: {
      amount: { required, numeric }
    }
  },
  data() {
    return {
      title: "每月加给",
      subtitle: "每月加给列表",
      dialog: false,
      editedIndex: -1,
      isAble: false,
      addShow: false,
      addDisplay: true,
      searchCategoryId: "",
      searchGradeId: "",
      addCategoryId: "",
      editedGradeId: "",
      //编辑弹框绑定数据
      editedItem: {
        categorysItem_name: "",
        grade_name: "",
        amount: "",
        category_id: "",
        grade_id: ""
      },
      defaultItem: {
        categorysItem_name: "",
        grade_name: ""
      },
      headers: [
        { text: "类别名称", sortable: false, value: "name" },
        { text: "等级", sortable: false, value: "name" },
        { text: "金额", sortable: false, value: "name" },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ],
      allSupply: [],
      allCat: [{name: '全部', _id: ''}],
      addcategorysItem: [],
      deleteItem: {
        _id: ""
      },
      addAllGrade: [],
      allGradeName: [],
      categorySearchValue: '',
      gradeSearchValue: ''
    };
  },
  computed: {
    //增加、编辑弹框标题
    formTitle() {
      return this.editedIndex === -1 ? "增加薪资" : "编辑内容";
    },
    handleGrade() {
      return this.editedItem.grade;
    },
    categoryErrors() {
      const errors = [];
      if (!this.$v.addCategoryId.$dirty) return errors;
      !this.$v.addCategoryId.required && errors.push("不能为空");
      return errors;
    },
    gradeErrors() {
      const errors = [];
      if (!this.$v.editedGradeId.$dirty) return errors;
      !this.$v.editedGradeId.required && errors.push("不能为空");
      return errors;
    },
    amountErrors() {
      const errors = [];
      if (!this.$v.editedItem.amount.$dirty) return errors;
      !this.$v.editedItem.amount.required && errors.push("不能为空");
      !this.$v.editedItem.amount.numeric && errors.push("请输入数字");
      return errors;
    }
  },
  mounted() {
    this.getAllSalary();
    this.getSelectData();
  },
  methods: {
    //渲染前端页面
    async getAllSalary(isSearch = false) {
      let res = await this.$request.fetch(
        "api/salaryManagement/addedSalary",
        { thrType: "catType", thrId: 1002 }
      );
      if (res.data.status === 200) {
        this.allSupply = res.data.result;
        isSearch && this.$refs.snackbar.showStatus("search");
      } else {
        isSearch ? this.$refs.snackbar.showStatus("search", false) : this.$refs.snackbar.showError();
      }
    },
    async getSelectData() {
      //顶部两个select 的渲染
      let allCat = await this.$request.fetch(
        "/api/salaryManagement/getSalaryAccount",
        { thrType: "catType", thrId: 1002 }
      );
      if (allCat.data.status === 200) {
        for (const iterator of allCat.data.result) {
          this.allCat.push(iterator);
          this.addcategorysItem.push(iterator);
        }
      } else {
        this.$refs.snackbar.showError();
      }

      let allGradeName = await this.$request.fetch(
        "/api/salaryManagement/getGradeAccount",
        { thrType: "catType", thrId: 1002 }
      );
      if (allGradeName.data.status === 200) {
        let gradeArr = allGradeName.data.result;
        this.allGradeName = gradeArr.filter(item => {
          return item.category_id !== null;
        });
        this.allGradeName.unshift({name: '全部', _id: ''});
        this.addAllGrade = gradeArr.filter(item1 => {
          return item1.category_id !== null;
        });
      } else {
        this.$refs.snackbar.showError();
      }
    },
    async getGrade() {
      if (!this.searchCategoryId) {
        this.getSelectData();
      } else {
        let res = await this.$request.fetch(
          "/api/salaryManagement/ListenGradeByCategory",
          {
            thrType: "catType",
            thrId: 1002,
            category_id: this.searchCategoryId
          }
        );
        if (res.data.status === 200) {
          this.allGradeName = [{ name: '全部', _id: '' }];
          for (const iterator of res.data.result) {
            this.allGradeName.push(iterator);
          }
        } else {
          this.$refs.snackbar.showError();
        }
      }
      this.searchGradeId = '';
    },

    async getAddGrade() {
      let res = await this.$request.fetch(
        "/api/salaryManagement/ListenGradeByCategory",
        {
          thrType: "catType",
          thrId: 1002,
          category_id: this.addCategoryId
        }
      );
      if (res.data.status === 200) {
        this.addAllGrade = res.data.result;
      } else {
        this.$refs.snackbar.showError();
      }
    },

    handleAdd() {
      this.dialog = true;
      this.isAble = false;
      this.addShow = true;
      this.addDisplay = true;
    },
    
    handleSearch(){
      this.categorySearchValue = this.searchCategoryId;
      this.gradeSearchValue = this.searchGradeId;
      this.search();
    },

    async search(isSearch = true) {
      if (!this.categorySearchValue) {
        if (!this.gradeSearchValue) {
          this.getAllSalary(isSearch);
        } else {
          let allGradeName = await this.$request.fetch(
            "/api/salaryManagement/addedSalary",
            { thrType: "catType", thrId: 1002, gradeId: this.gradeSearchValue }
          );
          if (allGradeName.data.status === 200) {
            this.allSupply = allGradeName.data.result;
            isSearch && this.$refs.snackbar.showStatus('search');
          } else {
            isSearch && this.$refs.snackbar.showStatus('search', false);
          }
        }
      } else {
        if (!this.gradeSearchValue) {
          let res = await this.$request.fetch(
            "/api/salaryManagement/getGradeByCategory",
            { category_id: this.categorySearchValue }
          );
          if (res.data.status === 200) {
            this.allSupply = res.data.result.filter(item => {
              return item.category_id !== null;
            });
            isSearch && this.$refs.snackbar.showStatus("search");
          } else {
            isSearch && this.$refs.snackbar.showStatus('search', false);
          }
        } else {
          let params = {
            category_id: this.categorySearchValue,
            grade_id: this.gradeSearchValue
          };
          let res = await this.$request.fetch(
            "/api/salaryManagement/perMonthSalary_list",
            params
          );
          if (res.data.status === 200) {
            let salArr = res.data.result;
            this.allSupply = salArr.filter(item => {
              return item.category_id !== null && item.grade_id !== null;
            });
            isSearch && this.$refs.snackbar.showStatus("search");
          } else {
            isSearch && this.$refs.snackbar.showStatus("search", false);
          }
        }
      }
    },
    handleEdit(item) {
      this.dialog = true;
      this.isAble = true;
      this.addShow = true;
      this.addDisplay = false;
      this.editedIndex = this.allSupply.indexOf(item);
      //点击编辑的时候绑定该行的数据(v-model="editedItem.name")
      this.editedItem = Object.assign({}, item);
      this.editedItem = {
        category_id: item.category_id._id,
        grade_id: item.grade_id._id,
        amount: item.amount
      };
    },
    confirmDialog(value) {
      this.deleteItem._id = value._id;
      this.$refs.confirmDialog.show();
    },
    async enableDelete(value) {
      let index = this.allSupply.indexOf(value);
      this.allSupply.splice(index, 1);
      let res = await this.$request.fetch(
        "/api/salaryManagement/deleteSalary",
        { _id: this.deleteItem._id },
        "delete"
      );

      if (res.data.status === 200) {
        this.$refs.snackbar.showStatus("delete");
      } else {
        this.$refs.snackbar.showStatus("delete", false);
      }
      this.$refs.confirmDialog.close();
    },
    //增、改
    save: async function(item) {
      this.$v.$touch();
      if (this.editedIndex > -1) {
        if (this.$v.editedItem.amount.$invalid) return;
        Object.assign(this.allSupply[this.editedIndex], this.editedItem);

        let params = {
          category_id: this.editedItem.category_id,
          grade_id: this.editedItem.grade_id,
          amount: Number(this.editedItem.amount)
        };

        let res = await this.$request.fetch(
          "/api/salaryManagement/editBaseSalary",
          params,
          "post"
        );

        if (res.data.status === 200) {
          this.$refs.snackbar.showStatus("edit");
          this.search(false);
        } else {
          this.$refs.snackbar.showStatus("edit", false);
        }
      } else {
        if (this.$v.editedItem.amount.$invalid || this.$v.addCategoryId.$invalid || this.$v.editedGradeId.$invalid) return;
        let params = {
          category_id: this.addCategoryId,
          grade_id: this.editedGradeId,
          amount: Number(this.editedItem.amount)
        };
        let res1 = await this.$request.fetch(
          "/api/salaryManagement/addSalary",
          params,
          "post"
        );
        if (res1.data.status === 200) {
          this.$refs.snackbar.showStatus("add");
          this.search(false);
        } else if (res1.data.status === 500) {
          this.$refs.snackbar.show(res1.data.msg, "error");
        } else {
          this.$refs.snackbar.showStatus("add", false);
        }
      }
      this.close();
    },
    close() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
      this.addCategoryId = "";
      this.editedGradeId = "";
      this.editedItem.amount = "";
      this.$v.$reset();
    }
  }
};
</script>
<style scoped>
@import "../../../assets/css/common.css";

.amount {
  width: 4em;
}
</style>