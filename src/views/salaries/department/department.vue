<template>
  <div>
    <!-- 顶部 -->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex xs4 sm2 md2 d-flex>
          <v-autocomplete :items="searchItems" label="请选择/输入部门" v-model="searchSelect" no-data-text="暂无数据"></v-autocomplete>
        </v-flex>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="search">
          <v-icon left>search</v-icon>搜索
        </v-btn>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="addDialog">
          <v-icon left>add</v-icon>新增部门
        </v-btn>
      </v-layout>
    </v-container>

    <!-- 表格 -->
    <div class="classify-bg">
      <v-flex xs12 class="classify-bg-flex">
        <p class="department">部门管理</p>
      </v-flex>
      <v-data-table :headers="headers" :items="departmentList" class="elevation-1" no-data-text="暂无数据">
        <template v-slot:items="props">
          <td class="text-xs-center">{{ props.item.name }}</td>
          <td class="text-xs-center">{{ props.item.manager_id?props.item.manager_id.name:'暂无主管'}}</td>
          <td class="text-xs-center">
            <v-btn small color="info" @click="editDialog(props.item)">编辑</v-btn>
            <v-btn small color="info" @click="deleteDialog(props.item)">删除</v-btn>
          </td>
        </template>
      </v-data-table>
    </div>

    <!-- 弹框 -->
    <v-dialog v-model="dialog" persistent max-width="600px">
      <!-- 增加 和 编辑 -->
      <v-card v-show="dialogType!=='delete'">
        <v-card-title>
          <v-flex class="headline">{{dialogType==='add'?'新增部门':'编辑'}}</v-flex>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap v-if="dialogType==='add'">
              <v-flex xs12 sm6 md3 offset-md1>
                <v-subheader class="base-title">部门名称</v-subheader>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-text-field label="请输入部门名称" :error-messages="addItemDataErrors" v-model.trim="addItemData.name" @blur="$v.addItemData.name.$touch()"></v-text-field>
              </v-flex>
            </v-layout>

            <v-layout>
              <v-flex xs12 sm6 md3 offset-md1>
                <v-subheader class="base-title">主管名称</v-subheader>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-autocomplete v-if="dialogType==='add'" :items="allEmployee" item-text="name" item-value="_id" label="请选择" v-model="addItemData.charge_id" no-data-text="暂无数据"></v-autocomplete>

                <v-autocomplete v-else :items="allEmployee" label="请选择" v-model="editMgId" item-text="name" item-value="_id" :error-messages="editMgIdErrors" no-data-text="暂无数据"></v-autocomplete>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="closeDialog">取消</v-btn>

          <v-btn v-if="dialogType==='add'" color="blue darken-1" flat @click="addItem">确定</v-btn>
          <v-btn v-else color="blue darken-1" flat @click="editItem">确定</v-btn>
        </v-card-actions>
      </v-card>

      <!-- 删除 -->
      <v-card v-show="dialogType==='delete'">
        <v-container grid-list-md class="delcontainer">你确定要删除吗?</v-container>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="closeDialog">取消</v-btn>
          <v-btn color="blue darken-1" flat @click="deleteItem">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 提示信息 -->
    <Snackbar ref="snackbar" />
  </div>
</template>
<script>
import { required } from "vuelidate/lib/validators";
import Common from "../../../utils/common";
import Snackbar from "@/views/components/snackbar.vue";

export default {
  components: { Snackbar },
  name: "department",
  validations: {
    addItemData: {
      name: { required }
    },
    editMgId: { required }
  },
  data() {
    return {
      allEmployee: [],
      departmentList: [],
      searchItems: [],
      currentStatus: "全部",
      searchSelect: "全部",
      dialog: false,
      dialogType: "",
      handleItem: null,
      editMgId: "暂无主管",
      addItemData: {
        name: "",
        charge_id: ""
      },
      headers: [
        { text: "部门名称", align: "center", sortable: false, value: "name" },
        { text: "部门主管", align: "center", sortable: false, value: "name" },
        { text: "操作", align: "center", sortable: false, value: "操作" }
      ]
    };
  },
  computed: {
    addItemDataErrors() {
      const errors = [];
      if (!this.$v.addItemData.name.$dirty) return errors;
      !this.$v.addItemData.name.required && errors.push("部门名称必填");
      return errors;
    },
    editMgIdErrors() {
      const errors = [];
      if (!this.$v.editMgId.$dirty) return errors;
      !this.$v.editMgId.required && errors.push("请选择主管");
      return errors;
    }
  },
  mounted() {
    this.getAllEmployee();
    this.getdepartment();
  },
  methods: {
    async getAllEmployee() {
      let res = await this.$request.fetch(
        "/api/departmentManagement/allEmployeeInfo"
      );
      res = res.data;
      if (res.status === 200) {
        this.allEmployee = res.result;
        this.allEmployee.unshift("暂无主管");
      } else {
        this.$refs.snackbar.showError();
      }
    },

    async getdepartment(name, type) {
      let param = name && name !== "全部" ? { name } : {};

      let res = await this.$request.fetch(
        "/api/departmentManagement/departmentInfo",
        param
      );
      res = res.data;
      if (res.status === 200) {
        this.departmentList = res.result;

        if (!name) {
          this.getSearchItem(this.departmentList);
        }

        if (type === "search") {
          this.$refs.snackbar.showStatus("search");
        }
      } else {
        this.$refs.snackbar.showError();
      }
    },

    getSearchItem(list) {
      this.searchItems = ["全部"];
      list.forEach(item => {
        this.searchItems.push(item.name);
      });
    },
    async search() {
      if (!this.searchSelect) {
        return this.$refs.snackbar.showError("请选择部门");
      }
      this.currentStatus = this.searchSelect;
      this.getdepartment(this.searchSelect, "search");
    },
    addDialog() {
      this.dialog = true;
      this.dialogType = "add";
      this.addDialogReset();
    },

    addDialogReset() {
      this.addItemData.name = "";
      this.addItemData.charge_id = "";
    },

    addItem: Common.throttle(async function() {
      this.$v.addItemData.name.$touch();
      if (this.$v.addItemData.name.$invalid) return false;

      if (this.addItemData.charge_id === "暂无主管") {
        this.addItemData.charge_id = "";
      }

      let res = await this.$request.fetch(
        "/api/departmentManagement/departmentAdd",
        this.addItemData,
        "put"
      );

      if (res.data.status === 200) {
        this.$refs.snackbar.showStatus("add");
        this.getdepartment(this.currentStatus);
        this.searchItems.push(this.addItemData.name);
        this.closeDialog();
      } else if (res.data.status === 504) {
        this.$refs.snackbar.showError(res.data.msg);
      } else {
        this.$refs.snackbar.showStatus("add", false);
      }
    }),

    editDialog(item) {
      this.dialog = true;
      this.dialogType = "edit";

      this.handleItem = item;

      if (this.handleItem.manager_id) {
        this.editMgId = this.handleItem.manager_id._id;
      }
    },

    async editItem() {
      this.$v.editMgId.$touch();
      if (this.$v.editMgId.$invalid) return false;

      let param = {
        employee_id: this.editMgId,
        department_id: this.handleItem._id
      };

      if (this.editMgId === "暂无主管") {
        param.employee_id = "";
      }

      let res = await this.$request.fetch(
        "/api/departmentManagement/departmentUpdate",
        param,
        "put"
      );
      res = res.data;

      if (res.status === 200) {
        this.$refs.snackbar.showStatus("edit");

        this.closeDialog();
        this.getdepartment(this.currentStatus);
      } else {
        this.$refs.snackbar.showStatus("edit", false);
      }
    },

    closeDialog() {
      this.$v.$reset();
      this.dialog = false;
    },

    deleteDialog(item) {
      this.dialog = true;
      this.dialogType = "delete";

      this.handleItem = item;
    },

    async deleteItem() {
      let param = {
        _id: this.handleItem._id
      };
      let res = await this.$request.fetch(
        "/api/departmentManagement/departmentDelete",
        param,
        "delete"
      );
      res = res.data;

      if (res.status === 200) {
        this.$refs.snackbar.showStatus("delete");
        if(this.searchSelect === this.handleItem.name) {
          this.searchSelect = "全部";
          this.currentStatus = this.searchSelect;
        }
        this.getdepartment();
      } else if (res.status === 504) {
        this.$refs.snackbar.showError(res.msg);
      } else {
        this.$refs.snackbar.showStatus("delete", false);
      }
      this.closeDialog();
    }
  }
};
</script>
<style scoped>
@import "../../../assets/css/classify.css";
.department {
  padding-bottom: 15px;
}
.base-title {
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
</style>
