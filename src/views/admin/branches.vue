<template>
  <div>
    <!-- 顶部 -->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex xs3 class="search-select">
          <v-autocomplete label="请选择/输入分支机构" item-text="name" :items="searchItems"
            v-model="searchSelect" no-data-text="暂无数据"></v-autocomplete>
        </v-flex>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleSearch()">
          <v-icon left>search</v-icon>搜索
        </v-btn>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="addDialog()">
          <v-icon left>add</v-icon>增加
        </v-btn>
        <!-- 增加、编辑弹框 -->
        <v-dialog v-model="dialog" persistent max-width="600px">
          <v-card v-show="dialogType!=='delete'">
            <v-card-title>
              <span class="headline">{{formTitle}}</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout>
                  <span class="base-title">公司名称</span>
                  <v-flex xs12 sm6 md6>
                    <v-autocomplete label="请选择/输入公司" :items="companyList" item-text="name"
                      item-value="_id" :error-messages="companyErrors"
                      @blur="$v.editedItem.company_id.$touch()" v-model.trim="editedItem.company_id"
                      required no-data-text="暂无数据"></v-autocomplete>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <span class="base-title">分支机构</span>
                  <v-flex xs12 sm6 md6>
                    <v-text-field label="输入分支机构名称" :error-messages="branchErrors"
                      @blur="$v.editedItem.name.$touch()" v-model.trim="editedItem.name" required>
                    </v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="closeDialog()">取消</v-btn>
              <v-btn color="blue darken-1" flat @click="saveBranch()">确定</v-btn>
            </v-card-actions>
          </v-card>
          <v-card v-show="dialogType==='delete'">
            <v-container grid-list-md class="del-container">你确定要删除吗?</v-container>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="closeDialog()">取消</v-btn>
              <v-btn color="blue darken-1" flat @click="delSave()">确定</v-btn>
            </v-card-actions>
            <span class="del-span" @click="closeDialog()">X</span>
          </v-card>
        </v-dialog>
      </v-layout>
    </v-container>
    <!-- 表格 -->
    <div class="classify-bg">
      <v-flex xs12 class="classify-bg-flex">
        <p>分支机构管理</p>
        <p>分支机构</p>
      </v-flex>
      <v-data-table :headers="headers" :items="branchList" class="elevation-1" no-data-text="暂无数据">
        <template v-slot:items="props">
          <td class="text-xs-left" width="500">{{ props.item.name }}</td>
          <td class="text-xs-left" width="500">{{ props.item.company_id.name }}</td>
          <td class="justify-center layout px-0">
            <v-btn color="info" @click="editDialog(props.item)">编辑</v-btn>
            <v-btn color="info" @click="deleteDialog(props.item)">删除</v-btn>
          </td>
        </template>
      </v-data-table>
    </div>
  </div>
</template>
<script>
import Common from "../../utils/common";
import { required } from "vuelidate/lib/validators";

export default {
  name: "",
  validations: {
    editedItem: {
      company_id: { required },
      name: { required }
    }
  },
  data() {
    return {
      searchItems: [],
      searchSelect: "全部",
      searchConfirmSelect: "全部",
      branchId: "",
      dialog: false,
      editedIndex: -1,
      dialogType: "",
      companyList: [],
      editBeforeCompany: "",
      editBeforeBranch: "",
      editedItem: {
        company_id: "",
        name: ""
      },
      headers: [
        { text: "分支机构名称", sortable: false, value: "name" },
        { text: "所属公司", sortable: false, value: "company" },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ],
      branchList: [],
      count: 0
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "增加分支" : "编辑内容";
    },
    companyErrors() {
      const errors = [];
      if (!this.$v.editedItem.company_id.$dirty) return errors;
      !this.$v.editedItem.company_id.required &&
        errors.push("公司名称为必选字段。");
      return errors;
    },
    branchErrors() {
      const errors = [];
      if (!this.$v.editedItem.name.$dirty) return errors;
      !this.$v.editedItem.name.required && errors.push("分支机构为必填字段。");
      return errors;
    }
  },
  mounted() {
    this.getCompanyList();
    this.getBranchList();
  },
  methods: {
    async getBranchList(name) {
      let param = name && name !== "全部" ? { name } : {};
      let { data } = await this.$request.fetch("/api/admin/branchInfo", param);
      if (data.status === 200) {
        this.branchList = data.result;

        if (!name) {
          this.getSearchItem(this.branchList);
        }
      } else if (data.status === 504) {
        this.$snackbar().showError(data.msg);
      } else {
        this.$snackbar().showError("获取数据失败，请刷新重试");
      }
    },
    async getSearchBranchList(name) {
      let param = name && name !== "全部" ? { name } : {};
      let { data } = await this.$request.fetch("/api/admin/branchInfo", param);
      if (data.status === 200) {
        this.searchItems = ["全部"];
        for (const iterator of data.result) {
          this.searchItems.push(iterator.name);
        }
      } else if (data.status === 504) {
        this.$snackbar().showError(data.msg);
      } else {
        this.$snackbar().showError("获取数据失败，请刷新重试");
      }
    },
    async getCompanyList() {
      let { data } = await this.$request.fetch("/api/admin/companies");
      if (data.status === 200) {
        this.companyList = data.result;
      } else if (data.status === 504) {
        this.$snackbar().showError(data.msg);
      } else {
        this.$snackbar().showError("获取数据失败，请刷新重试");
      }
    },
    getSearchItem(list) {
      this.searchItems = ["全部"];
      list.forEach(item => {
        this.searchItems.push(item.name);
      });
    },
    handleSearch() {
      this.searchConfirmSelect = this.searchSelect;

      if (this.searchConfirmSelect.length > 0) {
        this.getBranchList(this.searchSelect);
        this.$snackbar().showStatus("search");
      }
    },
    addDialog() {
      this.AddReset();
      this.dialog = true;
      this.dialogType = "add";
    },
    AddReset() {
      // 清空内容，防止连续增加时显示的还是上次增加的内容
      this.editedItem = {};
    },
    editDialog(item) {
      this.dialog = true;
      this.dialogType = "edit";
      this.editedIndex = this.branchList.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.editedItem.company_id = item.company_id;
      this.editBeforeCompany = this.editedItem.company_id;
      this.editBeforeBranch = this.editedItem.name;
    },

    deleteDialog(item) {
      this.dialog = true;
      this.dialogType = "delete";
      this.branchId = item._id;
    },

    async saveBranch() {
      if (this.$v.editedItem.$invalid) {
        return;
      }

      // if编辑 else增加
      if (this.editedIndex > -1) {
        if (
          this.editedItem.name === this.editBeforeBranch &&
          this.editedItem.company_id === this.editBeforeCompany
        ) {
          this.$snackbar().showStatus("edit");
        } else {
          let dataParam = { data: this.editedItem };
          let { data } = await this.$request.fetch(
            "/api/admin/branchUpdate",
            dataParam,
            "post"
          );
          if (data.status === 200) {
            if (this.searchConfirmSelect !== "全部") {
              if (this.branchList.length >= 2) {
                this.searchConfirmSelect = this.editBeforeBranch;
                this.getBranchList(this.searchConfirmSelect);
                this.getSearchBranchList();
              } else {
                for (let [index, value] of this.searchItems.entries()) {
                  if (value === this.searchSelect) {
                    this.searchItems.splice(index, 1, data.result.name);

                    if (this.searchSelect === this.editBeforeBranch) {
                      this.searchSelect = data.result.name;
                      this.searchConfirmSelect = this.searchSelect;
                    } else {
                      this.searchConfirmSelect = data.result.name;
                    }
                    this.getBranchList(this.searchConfirmSelect);
                    this.getSearchBranchList();
                    break;
                  }
                }
              }
            } else {
              if (this.searchSelect === this.editBeforeBranch) {
                this.searchSelect = data.result.name;
                this.getBranchList(this.searchConfirmSelect);
                this.searchItems = ["全部"];
                this.getSearchBranchList();
              } else {
                this.getBranchList(this.searchConfirmSelect);
                this.searchItems = ["全部"];
                this.getSearchBranchList();
              }
            }
            this.$snackbar().showStatus("edit");
          } else if (data.status === 504) {
            this.$snackbar().showStatus("edit", false);
          } else {
            this.$snackbar().showError("编辑失败，注意是否该机构已存在");
          }
        }
      } else {
        let dataParam = { data: this.editedItem };
        let { data } = await this.$request.fetch(
          "/api/admin/branchAdd",
          dataParam,
          "post"
        );
        if (data.status === 200) {
          this.$snackbar().showStatus("add");
          this.getBranchList(this.searchConfirmSelect);
          this.getSearchBranchList();
        } else if (data.status === 504) {
          this.$snackbar().showStatus("add", false);
        } else {
          this.$snackbar().showError("新增失败，注意是否该机构已存在");
        }
      }
      this.closeDialog();
    },
    async delSave() {
      let dataParam = { _id: this.branchId };
      let { data } = await this.$request.fetch(
        "/api/admin/branches",
        dataParam,
        "delete"
      );
      if (data.status === 200) {
        this.$snackbar().showStatus("delete");
        this.getBranchList(this.searchConfirmSelect);
        if (
          this.searchSelect !== "全部" &&
          this.searchConfirmSelect === "全部"
        ) {
          this.branchList.filter(val => {
            if (val.name === this.searchSelect) {
              this.count++;
            }
          });
          if (this.count === 1) {
            this.searchItems = ["全部"];
            this.searchSelect = "全部";
            this.getBranchList();
          }
          this.count = 0;
        } else {
          if (this.branchList.length >= 2) {
            this.searchItems = ["全部"];
            this.getSearchBranchList();
          } else {
            this.searchConfirmSelect = "全部";
            this.getBranchList();
            this.searchItems = ["全部"];
            this.searchSelect = "全部";
            this.getSearchBranchList();
          }
        }
      } else if (data.status === 504) {
        this.$snackbar().showStatus("delete", false);
      } else {
        this.$snackbar().showError("删除失败，请刷新重试");
      }
      this.closeDialog();
    },
    closeDialog() {
      this.dialog = false;
      setTimeout(() => {
        this.editedIndex = -1;
      }, 200);
      this.$v.$reset();
    }
  }
};
</script>
<style scoped>
@import "../../assets/css/classify.css";
.search-select
  /deep/
  .v-text-field.v-text-field--solo:not(.v-text-field--solo-flat)
  > .v-input__control
  > .v-input__slot {
  box-shadow: none;
  border-bottom: 1px solid #ccc;
  background: #f9f9f9;
}
.search-select /deep/ .theme--light.v-chip {
  background: none;
  font-size: 16px;
}
.base-title {
  margin-right: 35px;
  margin-left: 65px;
  display: inline-block;
  font-size: 18px;
}
.layout {
  align-items: center !important;
}
.del-container {
  padding: 30px;
  font-size: 20px;
  position: relative;
}
.del-span {
  position: absolute;
  top: 15px;
  right: 25px;
  cursor: pointer;
}
.elevation-1
  /deep/
  .v-input--selection-controls:not(.v-input--hide-details)
  .v-input__slot {
  margin-top: 12px !important;
  margin-bottom: 0px !important;
}
.elevation-1 /deep/ .accent--text {
  color: rgb(37, 72, 226) !important;
}
.classify-bg /deep/ .text-xs-left {
  word-break: break-all;
}
</style>