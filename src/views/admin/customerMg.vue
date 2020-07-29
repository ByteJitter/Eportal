<template>
  <div>
    <!-- 顶部 -->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex xs3 class="search-select">
          <v-autocomplete label="请选择/输入客户" :items="searchItems" v-model="searchSelect" no-data-text="暂无数据"></v-autocomplete>
        </v-flex>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="searchCustomer">
          <v-icon left>search</v-icon>搜索
        </v-btn>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="AddCustomer">
          <v-icon left>add</v-icon>增加
        </v-btn>
        <!-- 增加、编辑弹框 -->
        <v-dialog v-model="dialog" persistent max-width="600px">
          <v-card v-show="dialogType!=='delete'">
            <v-card-title>
              <span class="headline">{{dialogType==='add'?'新增内容':'编辑'}}</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout>
                  <span class="base-title">客户名称</span>
                  <v-flex xs12 sm6 md4>
                    <v-text-field label="输入客户名称" v-model.trim="addItemData.name" :error-messages="customerErrors" @blur="$v.addItemData.name.$touch()"></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="closeDialog()">取消</v-btn>
              <v-btn v-if="dialogType==='add'" color="blue darken-1" flat @click="addSave">确定</v-btn>
              <v-btn v-else color="blue darken-1" flat @click="editSave">确定</v-btn>
            </v-card-actions>
          </v-card>
          <v-card v-show="dialogType==='delete'">
            <v-container grid-list-md class="delcontainer">你确定要删除吗?</v-container>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="closeDialog">取消</v-btn>
              <v-btn color="blue darken-1" flat @click="DeleteDialog">确定</v-btn>
            </v-card-actions>
            <span class="del-span" @click="closeDialog">X</span>
          </v-card>
        </v-dialog>
      </v-layout>
    </v-container>
    <!-- 表格 -->
    <div class="classify-bg">
      <v-flex xs12 class="classify-bg-flex">
        <p>战情看板客户管理</p>
        <p>客户</p>
      </v-flex>
      <v-data-table :headers="headers" :items="customerList" class="elevation-1" no-data-text="暂无数据">
        <template v-slot:items="props">
          <td class="text-xs-left" width="600">{{ props.item.name }}</td>
          <td class="justify-center layout px-0">
            <v-btn color="info" @click="EditCustomer(props.item)">编辑</v-btn>
            <v-btn color="info" @click="DeleteCustomer(props.item)">删除</v-btn>
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
import { required } from "vuelidate/lib/validators";

export default {
  components: { snackbar },
  validations: {
    addItemData: {
      name: { required }
    }
  },
  data() {
    return {
      dialog: false,
      dialogType: "",
      editBeforeCustomer: "",
      addItemData: {
        name: ""
      },
      headers: [
        { text: "客户名称", sortable: false, value: "name" },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ],
      customerList: [],
      searchItems: ["全部"],
      searchSelect: "全部",
      searchCurrent: "",
      editItemIndex: -1, //搜索框下拉菜单数据的下标
      searchCurrentIndex: -1, //当前搜索值的下标
      searchSelectIndex: -1
    };
  },
  computed: {
    customerErrors() {
      const errors = [];
      if (!this.$v.addItemData.name.$dirty) return errors;
      !this.$v.addItemData.name.required && errors.push("客户名称为必选字段。");
      return errors;
    }
  },
  mounted() {
    this.getCustomerList();
  },
  methods: {
    async getCustomerList(name, type) {
      let param = name && name !== "全部" ? { name } : {};
      let { data } = await this.$request.fetch("/api/admin/customers", param);

      if (data.status === 200) {
        this.customerList = data.result;
        if (!name) {
          this.getSearchItem(this.customerList);
        }
        if (type === "search") {
          this.$refs.snackbar.showStatus("search");
        }
      } else if (data.status === 504) {
        this.$refs.snackbar.showError(data.msg);
      } else {
        this.$refs.snackbar.showError("刷新重试");
      }
    },
    getSearchItem(list) {
      this.searchItems = ["全部"]; //清空数组，因为在编辑成功后调用了getCustomerList（）方法，该数据会重复push
      list.forEach(item => {
        this.searchItems.push(item.name);
      });
    },
    searchCustomer() {
      this.searchCurrent = this.searchSelect;
      if (this.searchSelect.length > 0) {
        this.getCustomerList(this.searchSelect, "search");
      }
    },
    AddCustomer() {
      this.dialog = true;
      this.dialogType = "add";
      this.AddReset();
    },
    AddReset() {
      // 清空内容，防止连续增加时显示的还是上次增加的内容
      this.addItemData.name = "";
    },
    addSave: Common.throttle(async function() {
      this.$v.addItemData.$touch();
      if (!this.addItemData.name) {
        return false;
      }
      let { data } = await this.$request.fetch(
        "/api/admin/customerAdd",
        this.addItemData,
        "post"
      );
      if (data.status === 200) {
        this.$refs.snackbar.showStatus("add");
        this.getCustomerList(this.searchCurrent);
        this.searchItems.push(this.addItemData.name);
      } else if (data.status === 504) {
        this.$refs.snackbar.showError(data.msg);
      } else {
        this.$refs.snackbar.showError("增加失败,该数据已存在");
      }
      this.closeDialog();
    }),
    EditCustomer(item) {
      this.dialog = true;
      this.dialogType = "edit";
      // 分开赋值是处理编辑的内容未发送请求界面上显示编辑后的内容问题
      this.addItemData.name = item.name;
      this.addItemData._id = item._id;
      this.editItemIndex = this.searchItems.indexOf(item.name);
      this.editBeforeCustomer = this.addItemData.name;
    },
    async editSave() {
      this.$v.addItemData.$touch();
      if (!this.addItemData.name) {
        return false;
      }
      if (this.addItemData.name === this.editBeforeCustomer) {
        this.$refs.snackbar.showStatus("edit");
      } else {
        let param = {
          customer_id: this.addItemData._id,
          name: this.addItemData.name
        };

        let { data } = await this.$request.fetch(
          "/api/admin/customerUpdate",
          param,
          "put"
        );
        if (data.status === 200) {
          this.$refs.snackbar.showStatus("edit");
          this.searchSelectIndex = this.searchItems.indexOf(this.searchSelect);
          this.searchCurrentIndex = this.searchItems.indexOf(
            this.searchCurrent
          );
          this.searchItems.splice(this.editItemIndex, 1, data.result.name);
          if (this.editItemIndex === this.searchSelectIndex) {
            this.searchSelect = data.result.name;
            this.searchCurrent = data.result.name;
          }
          this.getCustomerList(this.searchItems[this.searchCurrentIndex]);
        } else if (data.status === 504) {
          this.$refs.snackbar.showError(data.msg);
        } else {
          this.$refs.snackbar.showError(data.msg);
        }
      }
      this.closeDialog();
    },
    DeleteCustomer(item) {
      this.dialog = true;
      this.dialogType = "delete";
      this.addItemData = item;
      this.editItemIndex = this.searchItems.indexOf(item.name);
    },
    async DeleteDialog() {
      let param = { customer_id: this.addItemData._id };
      let { data } = await this.$request.fetch(
        "/api/admin/customerDelete",
        param,
        "put"
      );

      if (data.status === 200) {
        if (this.customerList.length < 2) {
          this.customerList = [];
        } else {
          this.$refs.snackbar.showStatus("delete");
          this.searchItems.unshift("全部");
          this.searchCurrent = "";
          this.getCustomerList();
          this.searchSelectIndex = this.searchItems.indexOf(this.searchSelect);
        }
        if (this.editItemIndex === this.searchSelectIndex - 1) {
          this.searchSelect = "全部";
        }
        this.searchItems = []; //注意此处的顺序
      } else if (data.status === 504) {
        this.$refs.snackbar.showError(data.msg, "error");
      } else {
        this.$refs.snackbar.showError("删除失败");
      }

      this.closeDialog();
    },
    closeDialog() {
      this.dialog = false;
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
