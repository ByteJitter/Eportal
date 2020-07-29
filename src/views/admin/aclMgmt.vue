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
              <span class="headline">{{dialogType==='add'?'新增内容':'编辑内容'}}</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout>
                  <span class="base-title">路由名称</span>
                  <v-flex xs12 sm6 md4>
                    <v-text-field label="输入路由名称" v-model.trim="editedItem.name" :error-messages="roleNameErrors" @blur="$v.editedItem.name.$touch()"></v-text-field>
                  </v-flex>
                </v-layout>
                <v-layout class="regStyle">
                  <span class="base-title">Path</span>
                  <v-flex xs12 sm6 md4>
                    <v-text-field label="输入路径" v-model.trim="editedItem.path" @input="rulesPath()" :error-messages="rolePathErrors" @blur="$v.editedItem.path.$touch()"></v-text-field>
                  </v-flex>
                  <span class="regTip" v-show="isRegShow">请核对路由路径，不能包含中文或空格！</span>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="closeDialog">取消</v-btn>
              <v-btn v-if="dialogType==='add'" color="blue darken-1" flat @click="addSave">确定</v-btn>
              <v-btn v-else color="blue darken-1" flat @click="editSave">确定</v-btn>
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
        <p>路由列表管理</p>
        <p>路由</p>
      </v-flex>
      <v-data-table :headers="headers" :items="aclList" class="elevation-1" no-data-text="暂无数据">
        <template v-slot:items="props">
          <td class="text-xs-left">{{ props.item.name }}</td>
          <td width="400" class="text-xs-left">{{ props.item.path }}</td>

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
import snackbar from "@/views/components/snackbar";
import Common from "@/utils/common";
import { required } from "vuelidate/lib/validators";
export default {
  components: { snackbar },
  validations: {
    editedItem: {
      name: { required },
      path: { required }
    }
  },
  data() {
    return {
      aclList: [],
      dialog: false,
      isRegShow: false, //正则提示信息
      dialogType: "",
      categoryId: "",
      searchItems: ["全部"],
      searchSelect: "全部",
      searchCurrent: "全部",
      varilTransform: "",
      count: 0,
      //编辑弹框绑定数据
      editedItem: {},
      defaultItem: {
        name: ""
      },
      headers: [
        { text: "路由名称", sortable: false, value: "name" },
        { text: "路径", sortable: false, value: "path" },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ]
    };
  },
  computed: {
    roleNameErrors() {
      const errors = [];
      if (!this.$v.editedItem.name.$dirty) return errors;
      !this.$v.editedItem.name.required && errors.push("路由名称为必填字段。");
      return errors;
    },
    rolePathErrors() {
      const errors = [];
      if (!this.$v.editedItem.path.$dirty) return errors;
      !this.$v.editedItem.path.required && errors.push("路径为必填字段。");
      return errors;
    }
  },
  mounted() {
    this.getList();
  },
  methods: {
    // path正则验证
    rulesPath() {
      let reg = new RegExp("[ \\u4E00-\\u9FFF]+", "g");
      if (reg.test(this.editedItem.path)) {
        this.isRegShow = true;
      } else {
        this.isRegShow = false;
      }
    },
    // 获取数据
    async getList(name, type) {
      let param = name && name !== "全部" ? { name } : {}; //name有值则是搜索选择的值
      let res = await this.$request.fetch("/api/admin/acls", param);
      if (res.data.status === 200) {
        this.aclList = res.data.result;
        if (!name) {
          this.searchRole(this.aclList);
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
      let res = await this.$request.fetch("/api/admin/acls", param);
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
    handleAdd() {
      this.dialog = true;
      this.dialogType = "add";
    },
    handleEdit(item) {
      this.dialog = true;
      this.dialogType = "edit";
      this.editedItem = Object.assign({}, item);
      this.varilTransform = item.name;
    },
    handleDelete(item) {
      this.dialog = true;
      this.dialogType = "delete";
      this.categoryId = item._id;
    },
    async handleDelSave() {
      let param = { _id: this.categoryId };
      let { data } = await this.$request.fetch(
        "/api/admin/acls",
        param,
        "delete"
      );
      if (data.status === 200) {
        this.$refs.snackbar.showStatus("delete");
        this.getList(this.searchCurrent);
        if (this.searchSelect !== "全部" && this.searchCurrent === "全部") {
          this.aclList.filter(val => {
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
          if (this.aclList.length > 1) {
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
      this.searchCurrent = "";
      this.closeDialog();
    },
    //增
    addSave: Common.throttle(async function() {
      this.$v.editedItem.$touch();
      if (!this.editedItem.name || !this.editedItem.path) {
        return false;
      }
      if (!this.isRegShow) {
        let param = { data: this.editedItem };
        let { data } = await this.$request.fetch(
          "/api/admin/acls",
          param,
          "post"
        );
        if (data.status === 200) {
          this.$refs.snackbar.showStatus("add");
          this.getList(this.searchCurrent);
          this.getSearchList();
        } else {
          this.$refs.snackbar.showError("增加失败");
        }
        this.closeDialog();
      }
    }),
    async editSave() {
      this.$v.editedItem.$touch();
      if (!this.editedItem.name || !this.editedItem.path) {
        return false;
      }
      if (!this.isRegShow) {
        let param = { data: this.editedItem };
        let { data } = await this.$request.fetch(
          "/api/admin/updateAcl",
          param,
          "post"
        );
        if (data.status === 200) {
          this.$refs.snackbar.showStatus("edit");
          if (this.searchCurrent !== "全部") {
            if (this.aclList.length > 1) {
              this.searchCurrent = this.varilTransform;
              this.getList(this.searchCurrent);
              this.getSearchList();
            } else {
              for (let [index, value] of this.searchItems.entries()) {
                if (value === this.searchSelect) {
                  this.searchItems.splice(index, 1, data.result.name);

                  if (this.searchSelect === this.varilTransform) {
                    this.searchSelect = data.result.name;
                    this.searchCurrent = this.searchSelect;
                  } else {
                    this.searchCurrent = data.result.name;
                  }
                  this.getList(this.searchCurrent);
                  this.getSearchList();
                  break;
                }
              }
            }
          } else {
            if (this.searchSelect === this.varilTransform) {
              this.searchSelect = data.result.name;
              this.searchItems = ["全部"];
            } else {
              this.searchItems = ["全部"];
            }
            this.getList(this.searchCurrent);
            this.getSearchList();
          }
        } else {
          this.$refs.snackbar.showError("编辑失败");
        }
        this.closeDialog();
      }
    },

    closeDialog() {
      this.dialog = false;
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
      }, 300);
      this.$v.$reset();
      this.isRegShow = false;
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
.regStyle {
  position: relative;
}
.regTip {
  position: absolute;
  top: 70px;
  left: 138px;
  color: red;
  font-size: 12px;
}
.classify-bg /deep/ .text-xs-left {
  word-break: break-all;
}
</style>
