<template>
  <div>
    <!-- 顶部 -->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex xs4 sm2 md2 d-flex>
          <v-autocomplete label="请选择" :items="searchItems" v-model="searchSelect" no-data-text="暂无数据"></v-autocomplete>
        </v-flex>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleSearch">
          <v-icon left>search</v-icon>搜索
        </v-btn>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleAdd">
          <v-icon left>add</v-icon>增加
        </v-btn>
        <!-- 点击增加出现的弹框 -->
        <v-dialog v-model="dialog" persistent max-width="600px">
          <v-card v-show="dialogType!=='delete'">
            <v-card-title>
              <span class="headline">{{formTitle}}</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout>
                  <span class="base-title">角色</span>
                  <v-flex xs12 sm6 md4>
                    <v-text-field label="输入角色名称" v-model.trim="editedItem.name" :error-messages="nameErrors" @blur="$v.editedItem.name.$touch()"></v-text-field>
                  </v-flex>
                </v-layout>
                <v-layout wrap>
                  <span class="base-title">公司</span>
                  <v-flex xs12 sm6 md4>
                    <v-select no-data-text="暂无数据" :items="companyList" item-text="name" item-value="_id" attach v-model.trim="editedItem.company_ids" :error-messages="companyErrors"
                      @blur="$v.editedItem.company_ids.$touch()" label="请选择" required multiple></v-select>
                  </v-flex>
                </v-layout>
                <v-layout wrap>
                  <span class="base-title">可访问路由</span>
                  <v-flex xs12 sm6 md4>
                    <v-select no-data-text="暂无数据" item-text="name" :items="roleList" item-value="_id" v-model.trim="editedItem.acls_id" :error-messages="aclErrors"
                      @blur="$v.editedItem.acls_id.$touch()" label="请选择" required multiple></v-select>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <span class="base-title">是否为子管理员可分配</span>
                  <v-flex xs12 sm6 md4>
                    <v-select label="请选择" :items="isassign" v-model.trim="editedItem.assignable" :error-messages="assignErrors" @blur="$v.editedItem.assignable.$touch()"></v-select>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="closeRloe">取消</v-btn>
              <v-btn color="blue darken-1" flat @click="saveRole">确定</v-btn>
            </v-card-actions>
          </v-card>
          <v-card v-show="dialogType=='delete'">
            <v-container grid-list-md class="delcontainer">你确定要删除吗?</v-container>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="closeRloe">取消</v-btn>
              <v-btn color="blue darken-1" flat @click="handleDelSave">确定</v-btn>
            </v-card-actions>
            <span class="del-span" @click="closeRloe">X</span>
          </v-card>
        </v-dialog>
      </v-layout>
    </v-container>
    <!-- 表格 -->
    <div class="classify-bg">
      <v-flex xs12 class="classify-bg-flex">
        <p>角色管理</p>
        <p>角色</p>
      </v-flex>
      <v-data-table :headers="headers" :items="userroleList" class="elevation-1" no-data-text="暂无数据">
        <template v-slot:items="props">
          <td width="100" class="text-xs-center">{{ props.item.name }}</td>
          <td class="text-xs-left">
            <template v-for="roles in props.item.acls_id">{{roles.name}} &nbsp;&nbsp;</template>
          </td>
          <td width="260" class="text-xs-center">
            <template v-for="company in props.item.company_ids">{{company.name}} &nbsp;&nbsp;</template>
          </td>
          <td class="text-xs-center">{{ props.item.assignable==true ? "是":"否"}}</td>
          <td width="260">
            <v-btn color="info" @click="handleEdit(props.item)">编辑</v-btn>
            <v-btn color="info" @click="handleDelete(props.item)">删除</v-btn>
          </td>
        </template>
      </v-data-table>
    </div>
    <!-- 弹框 -->
    <snackbar ref="snackbar"></snackbar>
  </div>
</template>
<script>
import snackbar from "../components/snackbar";
import Common from "../../utils/common";
import { required } from "vuelidate/lib/validators";
export default {
  components: { snackbar },
  validations: {
    editedItem: {
      name: { required },
      company_ids: { required },
      acls_id: { required },
      assignable: { required }
    }
  },
  data() {
    return {
      roleList: [],
      companyList: [],
      isassign: ["是", "否"],
      dialog: false,
      editedIndex: -1,
      dialogType: "",
      categoryId: "",
      searchItems: ["全部"],
      searchSelect: "全部",
      searchCurrent: "全部",
      varilTransform: "",
      count: 0,
      //编辑弹框绑定数据
      editedItem: {
        name: "",
        assignable: "",
        company_ids: [],
        acls_id: []
      },
      defaultItem: {
        name: ""
      },
      headers: [
        { text: "角色", sortable: false, align: "center", value: "name" },
        { text: "可访问路由", sortable: false, value: "roles.name" },
        {
          text: "公司",
          sortable: false,
          align: "center",
          value: "company_ids"
        },
        {
          text: "是否为子管理员可分配",
          align: "center",
          sortable: false,
          value: "assignable"
        },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ],
      userroleList: []
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "增加角色权限" : "编辑内容";
    },
    // 表单验证
    nameErrors() {
      const errors = [];
      if (!this.$v.editedItem.name.$dirty) return errors;
      !this.$v.editedItem.name.required && errors.push("角色为必填字段。");
      return errors;
    },
    companyErrors() {
      const errors = [];
      if (!this.$v.editedItem.company_ids.$dirty) return errors;
      !this.$v.editedItem.company_ids.required &&
        errors.push("公司为必选字段。");
      return errors;
    },
    aclErrors() {
      const errors = [];
      if (!this.$v.editedItem.acls_id.$dirty) return errors;
      !this.$v.editedItem.acls_id.required &&
        errors.push("可访问路由为必选字段。");
      return errors;
    },
    assignErrors() {
      const errors = [];
      if (!this.$v.editedItem.assignable.$dirty) return errors;
      !this.$v.editedItem.assignable.required &&
        errors.push("是否为子管理员可分配为必选字段。");
      return errors;
    }
  },
  mounted() {
    this.getList();
  },
  methods: {
    // 获取角色数据
    async getList(name, type) {
      let param = name && name !== "全部" ? { name } : {}; //name有值则是搜索选择的值
      let res = await this.$request.fetch("/api/admin/roles", param);
      if (res.data.status === 200) {
        this.userroleList = res.data.result;
        if (!name) {
          this.searchRole(this.userroleList);
        }
        if (type === "search") {
          this.$refs.snackbar.showStatus("search");
        }
      } else {
        this.$refs.snackbar.showError("刷新重试");
      }
    },
    async getSearchList(name) {
      let param = name && name !== "全部" ? { name } : {}; //name有值则是搜索选择的值
      let res = await this.$request.fetch("/api/admin/roles", param);
      if (res.data.status === 200) {
        this.searchItems = ["全部"];
        for (const iterator of res.data.result) {
          this.searchItems.push(iterator.name);
        }
      } else {
        this.$refs.snackbar.showError("刷新重试");
      }
    },
    searchRole(list) {
      this.searchItems = ["全部"];
      list.forEach(element => {
        this.searchItems.push(element.name);
      });
    },
    handleSearch() {
      this.searchCurrent = this.searchSelect;
      if (this.searchSelect.length > 0) {
        this.getList(this.searchSelect, "search");
      }
    },

    // 获取acl列表
    async getRoles() {
      let res = await this.$request.fetch("/api/admin/acls");
      if (res.data.status === 200) {
        this.roleList = res.data.result;
      }
    },
    // 获取公司列表
    async getCompany() {
      let res = await this.$request.fetch("/api/admin/companies");
      if (res.data.status === 200) {
        this.companyList = res.data.result;
      } else {
        this.$refs.snackbar.showError("获取数据失败");
      }
    },
    handleAdd() {
      this.dialog = true;
      this.dialogType = "add";
      this.getRoles();
      this.getCompany();
    },
    handleEdit(item) {
      this.dialog = true;
      this.dialogType = "edit";
      this.getRoles();
      this.getCompany();
      this.editedIndex = this.userroleList.indexOf(item);
      this.editedItem = Object.assign({}, item);
      // 下面的操作是为了在v-model上绑定值，若不赋值则为空
      this.editedItem.company_ids = item.company_ids;
      this.editedItem.acls_id = item.acls_id;
      this.editedItem.assignable = item.assignable === true ? "是" : "否";
      this.varilTransform = item.name;
    },
    handleDelete(item) {
      this.dialog = true;
      this.dialogType = "delete";
      this.categoryId = item._id;
    },
    async handleDelSave() {
      let data = { _id: this.categoryId };
      let res = await this.$request.fetch("/api/admin/roles", data, "delete");
      if (res.data.status === 200) {
        this.$refs.snackbar.showStatus("delete");
        this.getList(this.searchCurrent);
        if (this.searchSelect !== "全部" && this.searchCurrent === "全部") {
          this.userroleList.filter(val => {
            if (val.name === this.searchSelect) {
              this.count++;
            }
          });
          if (this.count === 1) {
            this.searchItems = ["全部"];
            this.searchSelect = "全部";
            this.getList();
          }
          this.count = 0;
        } else {
          if (this.userroleList.length > 1) {
            this.searchItems = ["全部"];
            this.getSearchList();
          } else {
            this.searchCurrent = "全部";
            this.getList();
            this.searchItems = ["全部"];
            this.searchSelect = "全部";
            this.getSearchList();
          }
        }
      } else {
        this.$refs.snackbar.showError("删除失败");
      }
      this.closeRloe();
    },
    //增、改,
    async saveRole() {
      this.$v.editedItem.$touch();
      if (
        !this.editedItem.name ||
        !this.editedItem.company_ids.length > 0 ||
        !this.editedItem.acls_id.length > 0 ||
        !this.editedItem.assignable
      ) {
        return this.$refs.snackbar.showError("所有字段不能为空");
      }
      // if编辑else增加
      if (this.editedIndex > -1) {
        this.editedItem.assignable =
          this.editedItem.assignable === "是" ? true : false;
        let param = { roleList: this.editedItem };
        let res = await this.$request.fetch(
          "/api/admin/updateRole",
          param,
          "post"
        );
        if (res.data.status === 200) {
          this.$refs.snackbar.showStatus("edit");
          if (this.searchCurrent !== "全部") {
            if (this.userroleList.length > 1) {
              this.searchCurrent = this.varilTransform;
              this.getList(this.searchCurrent);
              this.getSearchList();
            } else {
              for (let [index, value] of this.searchItems.entries()) {
                if (value === this.searchSelect) {
                  this.searchItems.splice(index, 1, res.data.result.name);

                  if (this.searchSelect === this.varilTransform) {
                    this.searchSelect = res.data.result.name;
                    this.searchCurrent = this.searchSelect;
                  } else {
                    this.searchCurrent = res.data.result.name;
                  }
                  this.getList(this.searchCurrent);
                  this.getSearchList();
                  break;
                }
              }
            }
          } else {
            if (this.searchSelect === this.varilTransform) {
              this.searchSelect = res.data.result.name;
              this.getList(this.searchCurrent);
              this.searchItems = ["全部"];
              this.getSearchList();
            } else {
              this.getList(this.searchCurrent);
              this.searchItems = ["全部"];
              this.getSearchList();
            }
          }
        } else {
          this.$refs.snackbar.showError("编辑失败");
        }
      } else {
        this.editedItem.assignable =
          this.editedItem.assignable === "是" ? true : false;
        let param = { roleList: this.editedItem };
        let res = await this.$request.fetch("/api/admin/roles", param, "post");
        if (res.data.status == 200) {
          this.userroleList.push(this.editedItem);
          this.$refs.snackbar.showStatus("add");
          this.getList(this.searchCurrent);
          this.getSearchList();
        } else {
          this.$refs.snackbar.showError("增加失败");
        }
      }
      this.closeRloe();
    },
    closeRloe() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
      this.$v.$reset();
    }
  }
};
</script>
<style scoped>
@import "../../assets/css/classify.css";
.base-title {
  margin-right: 35px;
  margin-left: 65px;
  display: inline-block;
  text-align: right;
  font-size: 18px;
}
.layout {
  align-items: center !important;
}
.delcontainer {
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
.classify-bg /deep/ .text-xs-center {
  word-break: break-all;
}
</style>
