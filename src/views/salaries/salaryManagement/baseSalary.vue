<template>
  <v-container fluid grid-list-xl>
    <v-layout wrap pl-5 align-center>
      <v-flex xs4 sm2 md2>
        <v-autocomplete :items="allCat" item-text="name" item-value="_id" v-model="searchCategoryId" label="请选择分类"
          @change="getGrade"  no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
      <v-flex xs4 sm2 md2>
        <v-autocomplete :items="allGradeName" item-text="name" item-value="_id" v-model="searchGradeId" label="请选择等级"
          @change="getLevel"  no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
      <v-flex xs4 sm2 md2>
        <v-autocomplete :items="allLevel" item-text="name"  no-data-text="暂无数据" item-value="_id" v-model="searchLevelId" label="请选择级别">
        </v-autocomplete>
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
            <div class="headline pt-3 pl-3">{{formTitle}}</div>
          </v-card-title>
          <v-card-text>
            <v-container grid-list-md>
              <v-layout align-center justify-center wrap v-if="addDisplay">
                <v-flex xs12 sm6 md3>
                  <span class="title font-weight-regular">类别名称</span>
                </v-flex>
                <v-flex xs12 sm6 d-flex>
                  <v-select :items="allCategory" item-text="name" item-value="_id" v-model="categoryId" label="请选择分类"
                  :error-messages="categoryErrors" @change="getAddGrade" no-data-text="暂无数据">
                  </v-select>
                </v-flex>
              </v-layout>
              <v-layout wrap align-center justify-center v-if="addDisplay">
                <v-flex xs12 sm6 md3>
                  <span class="title font-weight-regular">类别等级</span>
                </v-flex>
                <v-flex xs12 sm6 d-flex>
                  <v-select :items="addGradeName" item-text="name" item-value="_id" v-model="gradeId" label="请选择等级"
                  :error-messages="gradeErrors" @change="getAddLevel" no-data-text="暂无数据">
                  </v-select>
                </v-flex>
              </v-layout>
              <v-layout align-center justify-center wrap v-if="addDisplay">
                <v-flex xs12 sm6 md3>
                  <span class="title font-weight-regular">等级级别</span>
                </v-flex>
                <v-flex xs12 sm6 d-flex>
                  <v-select :items="addLevelName" item-text="name" item-value="_id" v-model="levelId" label="请选择级别"
                  :error-messages="levelErrors" no-data-text="暂无数据"></v-select>
                </v-flex>
              </v-layout>
              <v-layout align-center justify-center wrap>
                <v-flex xs12 sm6 md3>
                  <div class="title font-weight-regular text-justified amount">金额</div>
                </v-flex>
                <v-flex xs12 sm6 d-flex>
                  <v-text-field v-model.trim="editedItem.amount" label="请输入金额" :error-messages="amountErrors"
                    @change="$v.editedItem.amount.$touch()"></v-text-field>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
            <v-btn color="blue darken-1" flat @click="saveSalary">确定</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
    <!-- 表格 start -->
    <v-card class="mt-5 pa-5">
      <page-title :title="title" :subtitle="subtitle" />
      <v-data-table :headers="headers" :items="allBaseSalary" class="elevation-1" no-data-text="暂无数据">
        <template v-slot:no-data>
          <div class="text-xs-center">暂无数据</div>
        </template>
        <template v-slot:items="props">
          <td class="text-xs-left">{{ props.item.category_id.name }}</td>
          <td class="text-xs-left">{{ props.item.grade_id.name }}</td>
          <td class="text-xs-left">{{ props.item.level_id.name }}</td>
          <td class="text-xs-left">{{ props.item.amount }}</td>
          <td class="text-xs-center">
            <v-btn small color="info" @click="handleEdit(props.item)">编辑</v-btn>
            <v-btn small color="info" @click="confirmDialog(props.item,props.item._key)">删除</v-btn>
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
  name: "baseSalary",
  components: { snackbar, confirmDialog, pageTitle },
  validations: {
    categoryId: { required },
    gradeId: { required },
    levelId: { required },
    editedItem: {
      amount: { required, numeric }
    }
  },
  data() {
    return {
      title: "基本薪资",
      subtitle: "基本薪资列表",
      dialog: false,
      editedIndex: -1,
      isAble: false,
      addShow: false,
      addDisplay: true,
      //编辑弹框绑定数据
      editedItem: {
        categoryName: "",
        gradeName: "",
        levelName: "",
        amount: "",
        categoryId: "",
        gradeId: "",
        levelId: ""
      },
      headers: [
        { text: "分类", sortable: false, value: "name" },
        { text: "等级", sortable: false, value: "name" },
        { text: "级别", sortable: false, value: "name" },
        { text: "金额", sortable: false, value: "name" },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ],
      allBaseSalary: [],
      allCat: [{name: '全部', _id: ''}],
      allLevel: [{name: '全部', _id: ''}],
      allGradeName: [{name: '全部', _id: ''}],
      categoryId: "",
      gradeId: "",
      levelId: "",
      searchCategoryId: "",
      searchGradeId: "",
      searchLevelId: "",
      //增加时的数组
      allCategory: [],
      addGradeName: [],
      addLevelName: [],
      deleteItem: {
        _id: ""
      },
      valid: true,
      categorySearchValue: '',
      gradeSearchValue: '',
      levelSearchValue: ''
    };
  },
  computed: {
    //增加、编辑弹框标题
    formTitle() {
      return this.editedIndex === -1 ? "增加薪资" : "编辑薪资";
    },
    categoryErrors() {
      const errors = [];
      if (!this.$v.categoryId.$dirty) return errors;
      !this.$v.categoryId.required && errors.push("不能为空");
      return errors;
    },
    gradeErrors() {
      const errors = [];
      if (!this.$v.gradeId.$dirty) return errors;
      !this.$v.gradeId.required && errors.push("不能为空");
      return errors;
    },
    levelErrors() {
      const errors = [];
      if (!this.$v.levelId.$dirty) return errors;
      !this.$v.levelId.required && errors.push("不能为空");
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
    this.getSelectsData();
  },
  methods: {
    //渲染前端页面
    async getAllSalary(isSearch = false) {
      let allBaseSalary = await this.$request.fetch(
        "/api/salaryManagement/getSalary",
        { thrType: "catType", thrId: 1001 }
      );
      if (allBaseSalary.data.status === 200) {
        let allBaseSalarylist = allBaseSalary.data.result.filter(item => {
          return item.category_id && item.grade_id && item.level_id !== null;
        });
        this.allBaseSalary = allBaseSalarylist;
        isSearch && this.$refs.snackbar.showStatus("search");
      } else {
        isSearch ? this.$refs.snackbar.showStatus("search", false) : this.$refs.snackbar.showError("获取数据失败，请刷新重试");
      }
    },

    async getSelectsData(){
      let allCat = await this.$request.fetch(
        "/api/salaryManagement/getSalaryAccount",
        { thrType: "catType", thrId: 1001 }
      );
      for (const iterator of allCat.data.result) {
        this.allCat.push(iterator);
        this.allCategory.push(iterator);
      }


      let allGradeName = await this.$request.fetch(
        "/api/salaryManagement/getGradeAccount",
        { thrType: "catType", thrId: 1001 }
      );
      if (allGradeName.data.status === 200) {
        let gradeArr = allGradeName.data.result;
        this.allGradeName = gradeArr.filter(item => {
          return item.category_id !== null;
        });
        this.allGradeName.unshift({name: '全部', _id: ''});
      } else {
        this.$refs.snackbar.show("获取收据失败，请刷新重试", "error");
      }
      for (const iterator of this.allGradeName) {
        this.addGradeName.push(iterator);
      }
      this.addGradeName.shift();

      let allLevel = await this.$request.fetch(
        "/api/salaryManagement/allLevel"
      );
      for (const iterator of allLevel.data.result) {
        this.allLevel.push(iterator);
        this.allLevel.unshift({name: '全部', _id: ''});
        this.addLevelName.push(iterator);
      }
    },

    handleAdd() {
      this.categoryId = "";
      this.gradeId = "";
      this.levelId = "";
      this.editedItem.amount = "";
      this.dialog = true;
      //点击增加时select可用
      this.isAble = false;
      this.addShow = true;
      this.addDisplay = true;
    },

    handleSearch(){
      this.categorySearchValue = this.searchCategoryId;
      this.gradeSearchValue = this.searchGradeId;
      this.levelSearchValue = this.searchLevelId;
      this.searchSalary();
    },
    
    async searchSalary(showSnackbar = true) {
      let param = {
        thrType: "catType",
        thrId: 1001
      };
      this.categorySearchValue && (param.catId = this.categorySearchValue);
      this.gradeSearchValue && (param.gradeId = this.gradeSearchValue);
      this.levelSearchValue && (param.levelId = this.levelSearchValue);
      const { data } = await this.$request.fetch("/api/salaryManagement/getSalary", param);
      if (data.status === 200) {
        this.allBaseSalary = data.result.filter(item => {
          return item.category_id !== null && item.grade_id !== null && item.level_id !== null;
        })
        showSnackbar && this.$refs.snackbar.showStatus("search");
      } else {
        showSnackbar && this.$refs.snackbar.showStatus("search", false);
      }
    },

    handleEdit(item) {
      this.dialog = true;
      this.addShow = true;
      this.addDisplay = false;
      this.editedIndex = this.allBaseSalary.indexOf(item);
      //点击编辑的时候绑定该行的数据(v-model="editedItem.name")
      this.editedItem = Object.assign({}, item);
      //select禁用
      this.isAble = true;
      this.editedItem = {
        categoryId: item.category_id._id,
        gradeId: item.grade_id._id,
        levelId: item.level_id._id,
        amount: item.amount
      };
    },
    confirmDialog(value) {
      this.deleteItem._id = value._id;
      this.$refs.confirmDialog.show();
    },
    async enableDelete(value) {
      let index = this.allBaseSalary.indexOf(value);
      this.allBaseSalary.splice(index, 1);
      this.$refs.confirmDialog.close();
      let res = await this.$request.fetch(
        "/api/salaryManagement/deleteSalary",
        { _id: this.deleteItem._id },
        "delete"
      );
      if (res.data.status === 200) {
        this.$refs.snackbar.show("删除成功");
        this.searchSalary(false);
      } else {
        this.$refs.snackbar.showError("删除失败，请刷新重试");
      }
    },
    //增、改
    async saveSalary() {
      this.$v.$touch();
      if (this.editedIndex === -1 && (this.$v.editedItem.amount.$invalid || this.$v.categoryId.$invalid || this.$v.gradeId.$invalid || this.$v.levelId.$invalid)) return;
      if (this.editedIndex === 0 && this.$v.editedItem.amount.$invalid) return;
      if (this.editedIndex > -1) {
        Object.assign(this.allBaseSalary[this.editedIndex], this.editedItem);
        let res1 = await this.$request.fetch(
          "/api/salaryManagement/editBaseSalary",
          {
            category_id: this.editedItem.categoryId,
            grade_id: this.editedItem.gradeId,
            level_id: this.editedItem.levelId,
            amount: Number(this.editedItem.amount)
          },
          "post"
        );
        if (res1.data.status === 200) {
          this.close();
          this.$refs.snackbar.show("编辑成功");
          this.searchSalary(false);
        } else {
          this.$refs.snackbar.show("编辑失败，请刷新重试", "error");
        }
      } else {
        let res = await this.$request.fetch(
          "/api/salaryManagement/addSalary",
          {
            category_id: this.categoryId,
            grade_id: this.gradeId,
            level_id: this.levelId,
            amount: Number(this.editedItem.amount)
          },
          "post"
        );
        if (res.data.status === 500) {
          this.close();
          this.$refs.snackbar.show("增加失败，该数据已存在", "error");
        } else if (res.data.status === 200) {
          this.close();
          this.$refs.snackbar.showStatus("add");
          this.searchSalary(false);
        } else {
          this.$refs.snackbar.showStatus("add", false);
        }
      }
    },
    close() {
      this.dialog = false;
      this.$v.$reset();
    },

    async getGrade() {
      if (!this.searchCategoryId) {
        this.getSelectsData();
      } else {
        let res = await this.$request.fetch(
          "/api/salaryManagement/ListenGradeByCategory",
          {
            thrType: "catType",
            thrId: 1001,
            category_id: this.searchCategoryId //分类的id
          }
        );
        this.allGradeName = [{name: "全部", _id: ''}];
        for (const iterator of res.data.result) {
          this.allGradeName.push(iterator);
        }
      }
      this.searchGradeId = '';
      this.searchLevelId = '';
    },
    async getLevel() {
      let params = {
        thrType: "catType",
        thrId: 1001,
        category_id: this.searchCategoryId,
        grade_id: this.searchGradeId //等级的id
      };
      if (!this.searchCategoryId && !this.searchGradeId) {
        return;
      }
      if (!this.searchCategoryId) {
        if (!this.searchGradeId) {
          // 调用获取级别的接口
          let allLevel = await this.$request.fetch(
            "/api/salaryManagement/allLevel"
          );
          for (const iterator of allLevel.data.result) {
            this.allLevel.push(iterator);
            this.allLevel.unshift({name: "全部", _id: ''});
          }
        } else {
          // 通过grade的ID 去获取级别
          let res = await this.$request.fetch(
            "/api/salaryManagement/selectAllLevel",
            { grade_id: this.searchGradeId, thrType: "catType", thrId: 1001 }
          );
          this.allLevel = [{name: "全部", _id: ''}];
          for (const iterator of res.data.result) {
            this.allLevel.push(iterator.item_level);
          }
        }
      } else {
        if (!this.searchGradeId) {
          // 通过分类的id 获取所有的级别
          let res = await this.$request.fetch(
            "/api/salaryManagement/ListenGradeByCategory",
            params
          );
          this.allLevel = [{name: "全部", _id: ''}];
          for (const iterator of res.data.result) {
            if (iterator.item_level) {
              this.allLevel.push(iterator.item_level);
            } else {
              let item_level = {
                name: iterator.name,
                _id: iterator._id
              };
              this.allLevel.push(item_level);
            }
          }
        } else {
          let res = await this.$request.fetch(
            "/api/salaryManagement/ListenLevelByGrade",
            params
          );
          this.allLevel = [{name: "全部", _id: ''}];
          for (const iterator of res.data.result) {
            this.allLevel.push(iterator.item_level);
          }
        }
      }
      this.searchLevelId = '';
    },
    //增加时弹框select绑定的值
    async getAddGrade() {
      this.gradeId = "";
      this.levelId = "";
      this.editedItem.amount = "";
      let params = {
        thrType: "catType",
        thrId: 1001,
        category_id: this.categoryId //分类的id
      };
      let res = await this.$request.fetch(
        "/api/salaryManagement/ListenGradeByCategory",
        params
      );
      this.addGradeName = [];
      this.addLevelName = [];
      for (const iterator of res.data.result) {
        this.addGradeName.push(iterator);
      }
    },
    async getAddLevel() {
      this.levelId = "";
      this.editedItem.amount = "";
      let params = {
        thrType: "catType",
        thrId: 1001,
        category_id: this.categoryId,
        grade_id: this.gradeId //等级的id
      };
      let res = await this.$request.fetch(
        "/api/salaryManagement/ListenLevelByGrade",
        params
      );
      this.addLevelName = [];
      for (const iterator of res.data.result) {
        this.addLevelName.push(iterator.item_level);
      }
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