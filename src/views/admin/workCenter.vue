<template>
  <div>
    <!-- 打印中心管理 -->
    <!-- 顶部 -->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex xs4 sm2 md2 d-flex>
          <v-autocomplete :items="searchItems" v-model="searchSelect" no-data-text="暂无数据" label="请选择/输入打印中心"></v-autocomplete>
        </v-flex>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="searchWorkCenter">
          <v-icon left>search</v-icon>搜索
        </v-btn>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleAdd">
          <v-icon left>add</v-icon>增加
        </v-btn>
        <!-- 点击增加出现的弹框 -->
        <v-dialog v-model="dialog" persistent max-width="600px">
          <v-card v-show="dialogType!=='delete'">
            <v-card-title>
              <span class="headline">{{dialogType==='add'?'增加打印中心':'编辑打印中心'}}</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout>
                  <span class="base-title">中心名称</span>
                  <v-flex xs12 sm6 md4>
                    <v-text-field label="输入打印中心名称" v-model.trim="editedItem.workName" :error-messages="workErrors" @blur="$v.editedItem.workName.$touch()"></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="closeDialog">取消</v-btn>
              <v-btn v-if="dialogType==='add'" color="blue darken-1" flat @click="addWorkCenter">确定</v-btn>
              <v-btn v-else color="blue darken-1" flat @click="editWorkCenter">确定</v-btn>
            </v-card-actions>
          </v-card>
          <v-card v-show="dialogType=='delete'">
            <v-container grid-list-md class="delcontainer">你确定要删除吗?</v-container>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="closeDialog">取消</v-btn>
              <v-btn color="blue darken-1" flat @click="handleDelSave">确定</v-btn>
            </v-card-actions>
            <span class="del-span" @click="closeDialog">X</span>
          </v-card>
        </v-dialog>
      </v-layout>
    </v-container>
    <!-- 表格 -->
    <div class="classify-bg">
      <v-flex xs12 class="classify-bg-flex">
        <p>打印中心管理</p>
        <p>中心列表</p>
      </v-flex>
      <v-data-table :headers="headers" :items="workCenterList" class="elevation-1" no-data-text="暂无数据">
        <template v-slot:items="props">
          <td class="text-xs-left">{{ props.item._id }}</td>
          <td class="text-xs-left" width="400">{{ props.item.workName}}</td>

          <td  width="260">
            <v-btn color="info" @click="handleEdit(props.item)">编辑</v-btn>
            <v-btn color="info" @click="handleDelete(props.item)">删除</v-btn>
          </td>
        </template>
      </v-data-table>
    </div>
    <!-- 弹框 -->
    <snackbar ref="snackbar" />
  </div>
</template>
<script>
import Common from "@/utils/common";
import snackbar from "@/views/components/snackbar";
import { required, numeric } from "vuelidate/lib/validators";
export default {
  components: { snackbar },
  validations: {
    editedItem: {
      workName: { required }
    }
  },
  data() {
    return {
      searchItems: ["全部"],
      searchSelect: "全部",
      searchCurrent: "",
      editItemIndex: -1,
      searchCurrentIndex: -1,
      searchSelectIndex: -1,
      dialogType: "",
      dialog: false,
      isSearch: false,      //是否点击搜索
      categoryId: "",
      //编辑弹框绑定数据
      editedItem: {},
      defaultItem: {
        name: ""
      },
      headers: [
        { text: "uuId", sortable: false, value: "uuId" },
        { text: "打印中心名称", sortable: false, value: "workName" },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ],
      workCenterList: []
    };
  },
  computed: {
    workErrors() {
      const errors = [];
      if (!this.$v.editedItem.workName.$dirty) return errors;
      !this.$v.editedItem.workName.required &&
        errors.push("打印中心名称为必填字段。");
      return errors;
    }
  },
  mounted() {
    this.getList();
  },
  methods: {
    // 获取数据
    async getList(workName, type) {
      let param = workName && workName !== "全部" ? { workName } : {};
      let { data } = await this.$request.fetch("/api/admin/workCenters", param);
      if (data.status === 200) {
        this.workCenterList = data.result;
        if (!workName) {
          this.getSearchItem(this.workCenterList);
        }
        if (type === "search") {
          this.$refs.snackbar.showStatus("search");
        }
      } else if (data.status === 504) {
        this.$refs.snackbar.showError(data.msg);
      } else {
        this.$refs.snackbar.showError(data.msg);
      }
    },
    getSearchItem(list) {
      this.searchItems = ["全部"];
      list.forEach(item => {
        this.searchItems.push(item.workName);
      });
    },
    searchWorkCenter() {
      this.searchCurrent = this.searchSelect;
      if (this.searchSelect !== "全部") {
        this.isSearch = true;
      }else{
        this.isSearch = false;
      }
      if (this.searchSelect.length > 0) {
        this.getList(this.searchSelect, "search");
      }
    },
    handleAdd() {
      this.dialog = true;
      this.dialogType = "add";
    },
    handleEdit(item) {
      this.dialog = true;
      this.dialogType = "edit";
      this.editedItem = Object.assign({}, item);
      this.editItemIndex = this.searchItems.indexOf(item.workName); //搜索下拉框中找到当前编辑的下标
    },
    handleDelete(item) {
      this.dialog = true;
      this.dialogType = "delete";
      this.categoryId = item._id;
      this.editItemIndex = this.searchItems.indexOf(item.workName);
    },

    async handleDelSave() {
      let param = { _id: this.categoryId };
      let { data } = await this.$request.fetch(
        "/api/admin/workCenters",
        param,
        "delete"
      );
      if (data.status === 200) {
        this.$refs.snackbar.showStatus("delete");
        this.searchItems.unshift("全部");
        this.searchCurrent = "";
        this.getList();
        this.searchSelectIndex = this.searchItems.indexOf(this.searchSelect);
        if (this.editItemIndex === this.searchSelectIndex - 1) {
          this.searchSelect = "全部";
        }
        this.searchItems = []; //注意此处的顺序
      } else {
        this.$refs.snackbar.showError("删除失败");
      }
      this.closeDialog();
    },
    addWorkCenter: Common.throttle(async function() {
      this.$v.editedItem.$touch();
      if (!this.editedItem.workName) {
        return false;
      }
      let { data } = await this.$request.fetch(
        "/api/admin/workCenters",
        this.editedItem,
        "post"
      );
      if (data.status === 200) {
        this.$refs.snackbar.showStatus("add");
        this.getList(this.searchCurrent);
        this.searchItems.push(this.editedItem.workName);
      } else {
        this.$refs.snackbar.showError(data.msg);
      }
      this.closeDialog();
    }),
    async editWorkCenter() {
      this.$v.editedItem.$touch();
      if (!this.editedItem.workName) {
        return false;
      }
      let param = { data: this.editedItem };
      let { data } = await this.$request.fetch(
        "/api/admin/updateworkCenters",
        param,
        "post"
      );
      if (data.status === 200) {
        this.$refs.snackbar.showStatus("edit");
        this.searchSelectIndex = this.searchItems.indexOf(this.searchSelect);
        this.searchCurrentIndex = this.searchItems.indexOf(this.searchCurrent);
        this.searchItems.splice(this.editItemIndex, 1, data.result.workName);
        if (this.editItemIndex === this.searchSelectIndex) {
          this.searchSelect = data.result.workName;
        }
        this.searchCurrent = data.result.workName;
        if (this.isSearch) {
          this.getList(this.searchItems[this.searchCurrentIndex]);
        } else {
          this.getList();
        }
      } else {
        this.$refs.snackbar.showError(data.msg);
      }
      this.closeDialog();
    },
    closeDialog() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
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
.classify-bg /deep/ .text-xs-left {
  word-break: break-all;
}
</style>
