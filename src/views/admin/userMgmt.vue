<template>
  <div>
    <!-- 顶部 -->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex xs6 sm4 md3 d-flex>
          <v-autocomplete label="请选择/输入用户" item-text="name" :items="searchItems" v-model="searchSelect" no-data-text="暂无数据"></v-autocomplete>
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
                  <span class="base-title">用户名</span>
                  <v-flex xs12 sm6 md4>
                    <v-text-field label="输入用户名称" :error-messages="nameErrors" @blur="$v.editedItem.name.$touch()" v-model.trim="editedItem.name" required></v-text-field>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <span class="base-title">手机号</span>
                  <v-flex xs12 sm6 md4>
                    <v-text-field label="输入手机号码" :error-messages="telErrors" @blur="$v.editedItem.tel.$touch()" v-model.trim="editedItem.tel" required></v-text-field>
                  </v-flex>
                </v-layout>
                <v-layout wrap>
                  <span class="base-title">所属公司</span>
                  <v-flex xs12 sm6 md4>
                    <v-autocomplete item-text="name" :items="companyList" item-value="_id" :error-messages="companyErrors" @blur="$v.editedItem.companies.$touch()" v-model.trim="editedItem.companies"
                      label="请选择" required @input="judgeCompany()" no-data-text="暂无数据"></v-autocomplete>
                  </v-flex>
                </v-layout>
                <v-layout wrap>
                  <span class="base-title">机构选择</span>
                  <v-flex xs12 sm6 md4>
                    <v-select item-text="name" :items="branchListFilter" item-value="_id" :error-messages="branchErrors" @blur="$v.editedItem.branch.$touch()" v-model.trim="editedItem.branch"
                      label="请选择" no-data-text="暂无数据" required multiple></v-select>
                  </v-flex>
                </v-layout>
                <v-layout wrap>
                  <span class="base-title">角色权限</span>
                  <v-flex xs12 sm6 md4>
                    <v-select item-text="name" :items="roleList" item-value="_id" v-model.trim="editedItem.roles_id" label="请选择" multiple no-data-text="暂无数据"></v-select>
                  </v-flex>
                </v-layout>
                <v-layout wrap v-show="printCenter">
                  <span class="base-title">打印中心权限</span>
                  <v-flex xs12 sm6 md4>
                    <v-autocomplete item-text="workName" :items="centerList" item-value="_id" v-model.trim="editedItem.workCenterId" label="请选择" multiple no-data-text="暂无数据"></v-autocomplete>
                  </v-flex>
                </v-layout>
                <v-layout wrap class="radios">
                  <v-flex xs12 sm6>
                    <v-checkbox v-model="radios" label="查看客户生产数据" value="canRead" color="info" @change="radioChange"></v-checkbox>
                  </v-flex>
                  <v-flex xs12 sm6>
                    <v-checkbox v-model="radios" label="维护客户生产数据" value="canWrite" color="info" @change="radioChange"></v-checkbox>
                  </v-flex>
                </v-layout>
                <v-layout wrap v-show="isAssociatClient">
                  <span class="base-title">关联客户</span>
                  <v-flex xs12 sm6 md4>
                    <v-autocomplete :items="customerList" item-text="name" item-value="_id" v-model="editedItem.customer_ids" label="请选择" multiple no-data-text="暂无数据"></v-autocomplete>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="closeDialog">取消</v-btn>
              <v-btn color="blue darken-1" flat @click="saveUsers">确定</v-btn>
            </v-card-actions>
          </v-card>
          <v-card v-show="dialogType==='delete'">
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
        <p>用户管理</p>
        <p>用户</p>
      </v-flex>
      <v-data-table :headers="headers" :items="userList" class="elevation-1" no-data-text="暂无数据">
        <template v-slot:items="props">
          <td class="text-xs-left" width="100">{{ props.item.name }}</td>
          <td class="text-xs-left">{{ props.item.tel}}</td>
          <td class="text-xs-left" width="100">{{ props.item.companies && props.item.companies.name }}</td>
          <td class="text-xs-left">
            <template v-for="(branches) in props.item.branch">{{props.item.branch && branches.name}} &nbsp;&nbsp;</template>
          </td>
          <td class="text-xs-left">
            <template v-for="(roles) in props.item.roles_id">{{props.item.roles_id && roles.name}} &nbsp;&nbsp;</template>
          </td>
          <td class="text-xs-left">
            <template v-for="(centers) in props.item.workCenterId">{{props.item.workCenterId && centers.workName}} &nbsp;&nbsp;</template>
          </td>

          <td width="260">
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
import Common from "../../utils/common";
import snackbar from "../components/snackbar";
import { required } from "vuelidate/lib/validators";
import { regex } from "vuelidate/lib/validators/common";
import { removeAccessToken } from "@/utils/auth";
const phoneRoule = regex("numPhone", /(^1[345789]\d{9}$)|(^9\d{8}$)/); //手机号正则验证加入台湾格式
export default {
  name: "userManagement",
  components: { snackbar },
  validations: {
    editedItem: {
      name: { required },
      tel: { required, phoneRoule },
      companies: { required },
      branch: { required }
    }
  },
  data() {
    return {
      searchItems: ["全部"],
      searchSelect: "全部",
      roleList: [],
      centerList: [], //打印中心列表
      dialog: false,
      companyList: [],
      branchListFilter: [],
      printCenter: false,
      searchCurrent: "",
      editedIndex: -1,
      editItemIndex: -1,
      searchCurrentIndex: -1,
      searchSelectIndex: -1,
      dialogType: "",
      userList: [],
      customerList: [], //客户列表信息
      first: 0,
      isChange: false,
      currentPhone: "",
      isAssociatClient: false,
      isSearch: false, //是否点击搜索
      editedItem: {
        name: "",
        tel: "",
        companies: "",
        branch: [],
        roles_id: [],
        customer_ids: []
      },
      radios: "", //单选框绑定的值
      headers: [
        { text: "用户", sortable: false, value: "name" },
        { text: "手机号码", sortable: false, value: "tel" },
        { text: "所属公司", sortable: false, value: "companies" },
        { text: "所属分支机构", sortable: false, value: "branch" },
        { text: "角色权限", sortable: false, value: "roles_id" },
        { text: "打印中心权限", sortable: false, value: "workCenterId" },
        { text: "操作", align: "center", value: "操作", sortable: false }
      ]
    };
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "增加用户" : "编辑内容";
    },
    nameErrors() {
      const errors = [];
      if (!this.$v.editedItem.name.$dirty) return errors;
      !this.$v.editedItem.name.required && errors.push("不能为空");
      return errors;
    },
    telErrors() {
      const errors = [];
      if (!this.$v.editedItem.tel.$dirty) return errors;
      !this.$v.editedItem.tel.required && errors.push("不能为空");
      !this.$v.editedItem.tel.phoneRoule &&
        errors.push("格式有误,必须是13、14、15、16、17、18、19开头的11位数字或者是9开头的9位数字");
      return errors;
    },
    companyErrors() {
      const errors = [];
      if (!this.$v.editedItem.companies.$dirty) return errors;
      !this.$v.editedItem.companies.required && errors.push("不能为空");
      return errors;
    },
    branchErrors() {
      const errors = [];
      if (!this.$v.editedItem.branch.$dirty) return errors;
      !this.$v.editedItem.branch.required && errors.push("不能为空");
      return errors;
    }
  },

  mounted() {
    this.getUserList(name);
  },
  methods: {
    async getUserList(name, type) {
      let param = name && name !== "全部" ? { name } : {};

      let { data } = await this.$request.fetch("/api/admin/userInfo", param);
      if (data.status === 200) {
        this.userList = data.result;
        if (!name) {
          this.getSearchItem(this.userList);
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

    async getCompanyList() {
      let { data } = await this.$request.fetch("/api/admin/companies");
      if (data.status === 200) {
        return Promise.resolve(this.companyList.push(...data.result));
      } else if (data.status === 504) {
        this.$refs.snackbar.showError(data.msg);
      } else {
        this.$refs.snackbar.showError("刷新重试");
      }
    },
    async getBranchList(param) {
      if (this.first > 0 && this.editedItem.branch)
        //在选择机构时会有第一次的值，所以先清空
        this.editedItem.branch.splice(0);
      let { data } = await this.$request.fetch("/api/admin/branchInfo", param);
      if (data.status === 200) {
        this.branchListFilter = data.result;
        this.first += 1;
      } else if (data.status === 504) {
        this.$refs.snackbar.showError(data.msg);
      } else {
        this.$refs.snackbar.showError("机构数据获取失败");
      }
    },
    judgeCompany() {
      // 根据选择的公司获取对应的机构列表
      let param = { coId: this.editedItem.companies };
      this.getBranchList(param);
      this.getRoles(param);

      // 判断是否为百星，是显示打印中心，否则不显示（注意与上面代码执行的顺序）
      this.printCenter = false;
      for (const element of this.companyList) {
        if (
          element._id === this.editedItem.companies &&
          element.hasOwnProperty("id") &&
          element.id === 100
        ) {
          this.printCenter = true;
        }
      }
    },

    async getRoles(coId) {
      let param = { coId: this.editedItem.companies };
      let { data } = await this.$request.fetch("/api/admin/userRoles", param);
      if (data.status === 200) {
        this.roleList = data.result;
      } else if (data.status === 504) {
        this.$refs.snackbar.showError(data.msg);
      } else {
        this.$refs.snackbar.showError("角色数据获取失败");
      }
    },
    async getCenters() {
      let { data } = await this.$request.fetch("/api/admin/workCenters");
      if (data.status === 200) {
        this.centerList = data.result;
      } else if (data.status === 504) {
        this.$refs.snackbar.showError(data.msg);
      } else {
        this.$refs.snackbar.showError("打印中心数据获取失败");
      }
    },
    async getCustomer() {
      let { data } = await this.$request.fetch("/api/admin/customers");
      if (data.status === 200) {
        this.customerList = data.result;
      } else {
        this.$refs.snackbar.showError("客户数据获取失败");
      }
    },
    // 根据单选框内容关联客户
    radioChange() {
      // 单选按钮改变时显示关联的客户
      if (this.radios) {
        this.isAssociatClient = true;
        this.getCustomer();
      } else {
        this.isAssociatClient = false;
      }
    },
    getSearchItem(list) {
      this.searchItems = ["全部"];
      list.forEach(item => {
        this.searchItems.push(item.name);
      });
    },
    handleSearch() {
      this.searchCurrent = this.searchSelect;
      if (this.searchSelect !== "全部") {
        this.isSearch = true;
      } else {
        this.isSearch = false;
      }
      this.getUserList(this.searchSelect, "search");
    },
    AddReset() {
      //清空内容，防止连续增加时显示的还是上次增加的内容
      this.editedItem = {};
    },
    handleAdd() {
      this.AddReset();
      this.dialog = true;
      this.dialogType = "add";
      this.getCompanyList();
      this.getCenters();
    },
    async handleEdit(item, index) {
      this.getCenters();
      await this.getCompanyList(); //在judgeCompany（）中要使用所有公司的数据(this.companyList)，所以用异步处理
      this.dialog = true;
      this.dialogType = "edit";
      this.editedIndex = this.userList.indexOf(item);
      this.editItemIndex = this.searchItems.indexOf(item.name);
      this.currentPhone = localStorage.getItem("tel");
      if (item.tel === this.currentPhone) {
        this.isChange = true;
      }
      this.editedItem = JSON.parse(JSON.stringify(item));
      // 解决v-model绑定的值
      this.editedItem.companies = item.companies && item.companies._id;
      this.judgeCompany(); //注意此方法执行的顺序
      // 客户查看数据与维护数据的v-model赋值
      if (
        this.editedItem.hasOwnProperty("canRead") &&
        this.editedItem.canRead
      ) {
        this.radios = "canRead";
        this.radioChange();
      }
      if (
        this.editedItem.hasOwnProperty("canWrite") &&
        this.editedItem.canWrite
      ) {
        this.radios = "canWrite";
        this.radioChange();
      }
    },
    // 单选按钮上绑定的值转换为true或false(单选按钮绑的值是canRead或者canWrite，但是后端需要true或false)
    radiosPublic() {
      if (this.radios === "canRead") {
        this.editedItem.canRead = true;
        this.editedItem.canWrite = false;
      } else if (this.radios === "canWrite") {
        this.editedItem.canRead = false;
        this.editedItem.canWrite = true;
      } else if (!this.radios) {
        this.editedItem.canRead = false;
        this.editedItem.canWrite = false;
      }
    },
    //增、改,
    async saveUsers() {
      this.$v.editedItem.$touch();
      if (
        this.$v.editedItem.name.$invalid ||
        this.$v.editedItem.tel.$invalid ||
        this.$v.editedItem.companies.$invalid ||
        this.editedItem.branch === undefined ||
        this.$v.editedItem.branch.$invalid
      )
        return;
      // if编辑else增加
      if (this.editedIndex > -1) {
        this.radiosPublic();
        let dataParam = {
          data: this.editedItem
        };
        let { data } = await this.$request.fetch(
          "/api/admin/updateUser",
          dataParam,
          "post"
        );
        if (data.status === 200) {
          this.$refs.snackbar.showStatus("edit");
          // 如修改的是当前登录的手机号，清空token跳转到登录界面
          if (this.isChange && this.currentPhone !== data.result.tel) {
            this.$refs.snackbar.showError("当前账号已被修改，请重新登录");
            setTimeout(() => {
              //先提示信息后跳转
              removeAccessToken(); //清空token
              this.$router.push({
                path: "/login"
              });
            }, 1000);
          } else {
            this.searchSelectIndex = this.searchItems.indexOf(
              this.searchSelect
            );
            this.searchCurrentIndex = this.searchItems.indexOf(
              this.searchCurrent
            );
            this.searchItems.splice(this.editItemIndex, 1, data.result.name);

            if (this.editItemIndex === this.searchSelectIndex) {
              this.searchSelect = data.result.name;
            }
            this.searchCurrent = data.result.name;
            if (this.isSearch) {
              this.getUserList(this.searchItems[this.searchCurrentIndex]);
            } else {
              this.getUserList();
            }
          }
          this.isChange = false; //判断当前账号是否被修改
        } else if (data.status === 504) {
          this.$refs.snackbar.showError(data.msg);
        } else {
          this.$refs.snackbar.showError("编辑失败");
        }
      } else {
        this.radiosPublic();
        let dataParam = { data: this.editedItem };
        let { data } = await this.$request.fetch(
          "/api/admin/addUsers",
          dataParam,
          "post"
        );
        if (data.status === 200) {
          this.userList.push(this.editedItem);
          this.$refs.snackbar.showStatus("add");
          this.getUserList(this.searchCurrent);
          this.searchItems.push(this.editedItem.name);
        } else if (data.status === 504) {
          this.$refs.snackbar.showError(data.msg);
        } else {
          this.$refs.snackbar.showError("增加失败");
        }
      }
      this.closeDialog();
    },
    handleDelete(item) {
      this.dialog = true;
      this.dialogType = "delete";
      this.userId = item._id;
      this.editItemIndex = this.searchItems.indexOf(item.name);
    },
    async handleDelSave() {
      let dataParam = { _id: this.userId };
      let { data } = await this.$request.fetch(
        "/api/admin/deleteUsers",
        dataParam,
        "delete"
      );
      if (data.status === 200) {
        this.getUserList(); //删除时获取所有数据的方法不能传值
        this.$refs.snackbar.showStatus("delete");
        this.searchItems.unshift("全部");
        this.searchCurrent = "";
        this.searchSelectIndex = this.searchItems.indexOf(this.searchSelect);
        if (this.editItemIndex === this.searchSelectIndex - 1) {
          this.searchSelect = "全部";
        }
        this.searchItems = []; //注意此处的顺序
      } else if (data.status === 504) {
        this.$refs.snackbar.showError(data.msg);
      } else {
        this.$refs.snackbar.showError("删除失败，刷新重试");
      }
      this.closeDialog();
    },

    closeDialog() {
      this.dialog = false;
      setTimeout(() => {
        this.editedIndex = -1;
        this.first = 0;
        this.radios = "";
        this.radioChange();
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
.radios {
  padding-left: 60px !important;
}
.classify-bg /deep/ .text-xs-left {
  word-break: break-all;
}
.layout {
  align-items: center !important;
}
</style>