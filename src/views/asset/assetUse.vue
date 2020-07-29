<template>
  <div>
    <!-- 顶部搜索栏开始-->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex xs2 sm2 md2 d-flex>
          <v-autocomplete
            :items="searchUserItems"
            label="请选择/输入员工"
            v-model="searchSelect.searchUserSelect"
            no-data-text="无可选员工"
            item-text="name"
            item-value="_id"
          ></v-autocomplete>
        </v-flex>
      </v-layout>
      <v-layout wrap align-center>
        <v-flex xs2 sm2 md2 d-flex>
          <v-autocomplete
            :items="searchCategoryItems"
            label="请选择/输入类型"
            v-model="searchSelect.searchCategorySelect"
            no-data-text="无可选类型"
            item-text="name"
            item-value="_id"
            @change="getAttrubites"
          ></v-autocomplete>
        </v-flex>
        <v-flex xs2 sm2 md2 d-flex>
          <v-autocomplete
            :items="searchAttrubiteItems"
            label="请选择/输入属性"
            v-model="searchSelect.searchAttrubiteSelect"
            no-data-text="无可选属性"
            item-text="name"
            item-value="_id"
            @change="getSubSets"
          ></v-autocomplete>
        </v-flex>
        <v-flex xs2 sm2 md2 d-flex>
          <v-autocomplete
            :items="searchSubsetItems"
            label="请选择/输入子集"
            v-model="searchSelect.searchSubsetSelect"
            no-data-text="无可选子集"
            item-text="name"
            item-value="_id"
          ></v-autocomplete>
        </v-flex>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="search">
          <v-icon left>search</v-icon>搜索
        </v-btn>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="add">
          <v-icon left>add</v-icon>新增
        </v-btn>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="confirmDialog">
          <v-icon left>delete</v-icon>删除
        </v-btn>
      </v-layout>
    </v-container>
    <!-- 顶部搜索栏结束 -->

    <!-- 表格开始 -->
    <div class="classifyBg">
      <v-flex xs12 class="classifyBgFlex">
        <p class="departmentP">资产使用管理</p>
      </v-flex>
      <v-data-table
        :headers="headers"
        :items="assetUseListByEmployee"
        class="elevation-1"
        v-model="selected"
        select-all
        item-key="_id"
      >
        <template v-slot:no-data>
          <div class="text-xs-center">暂无数据</div>
        </template>
        <template v-slot:items="props">
          <td>
            <v-checkbox v-model="props.selected" primary hide-details></v-checkbox>
          </td>
          <td class="text-xs-center">{{props.item.name}}</td>
          <td class="text-xs-center">{{props.item.tel}}</td>
          <td class="text-xs-center">
            <v-btn small color="info" @click="edit(props.item)">编辑</v-btn>
          </td>
        </template>
      </v-data-table>
    </div>
    <!-- 表格结束 -->
    <!-- 提示信息 -->
    <snackbar ref="snackbar" />
    <!-- 弹框 -->
    <v-dialog v-model="dialog" persistent max-width="700px" max-height="100px">
      <v-card>
        <v-card-title>编辑资产使用情况</v-card-title>
        <v-card-text>
          <ul class="add-list">
            <li v-for="(item,index) in subSetsList" :key="index" class="header-list">
              <div class="add-list-type">
                <p class="bottom_line">类型：{{item.category}}</p>
              </div>
              <div class="sub-add-name">
                <span>名称</span>
                <span>属性</span>
              </div>
              <ul class="sub-add-list">
                <li v-for="(subitem,index) in item.subList" :key="index" class="sub-header-list">
                  <div class="sub-add-div">
                    <v-checkbox
                      class="sub-add-checkbox"
                      type="checkbox"
                      v-model="checkData"
                      :value="subitem"
                      @change="toggle(item)"
                    ></v-checkbox>
                    <span>{{subitem.name}}</span>
                    <span>{{subitem.asset_attribute_id.name}}</span>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="cancel">取消</v-btn>
          <v-btn color="blue darken-1" flat @click="update">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 弹框 结束-->
    <!-- 确认删除弹框 -->
    <confirm-dialog ref="confirmDialog" @enableDelete="enableDelete" />
  </div>
</template>
<script>
import Common from "@/utils/common";
import snackbar from "@/views/components/snackbar.vue";
import { assetMixins } from "./assetMixins";
import confirmDialog from "../components/confirmDialog";
export default {
  name: "assetUse",
  data() {
    return {
      searchSelect: {
        searchAttrubiteSelect: "",
        searchCategorySelect: "",
        searchUserSelect: "",
        searchSubsetSelect: ""
      },
      sendSearchSelect: {
        searchAttrubiteSelect: "",
        searchCategorySelect: "",
        searchUserSelect: "",
        searchSubsetSelect: ""
      },
      searchAttrubiteItems: [],
      searchCategoryItems: [],
      searchUserItems: [],
      searchSubsetItems: [],
      selected: [],
      currentStatus: "",
      assetUseList: [],
      assetUseListForEdit: [],
      assetUseListByEmployee: [],
      dialog: false,
      subSetsList: [],
      subSetsListOrigin: [],
      total: [],
      checkData: [],
      employee_id: "",
      assetData: [],
      headers: [
        { text: "使用者", align: "center", sortable: false, value: "user" },
        { text: "手机号", align: "center", sortable: false, value: "tel" },
        { text: "操作", align: "center", sortable: false, value: "操作" }
      ]
    };
  },
  mixins: [assetMixins],
  mounted() {
    this.getAssetUsers();
    this.getUsers();
    this.getCategory();
    this.getAttrubites();
    this.getSubSets();
  },
  components: { snackbar, confirmDialog },
  methods: {
    add() {
      this.$router.push("addAssetUse");
    },
    confirmDialog() {
      if (this.selected.length <= 0) {
        this.$refs.snackbar.show("请先选择需要删除的记录", "error");
        return;
      }
      this.$refs.confirmDialog.show();
    },
    async edit(data) {
      let res = await this.$request.fetch("/api/asset/getSubsets");
      res = res.data;
      if (res.status === 200) {
        this.subSetsListOrigin = res.result;
      } else {
        this.$refs.snackbar.show("刷新重试", "error");
        return;
      }
      let assetUsersRes = await this.$request.fetch("/api/asset/getAssetUsers");
      assetUsersRes = assetUsersRes.data;
      if (assetUsersRes.status === 200) {
        this.assetUseListForEdit = assetUsersRes.result;
      } else {
        return;
      }
      this.subSetsList = this.handleSubsets(this.subSetsListOrigin);
      let temp = [];
      let temp2 = [];
      let temp3 = [];
      this.dialog = true;
      this.employee_id = data._id;
      //从所有的资产使用记录中找出属于当前员工的记录list存入temp
      this.assetUseListForEdit.forEach(item => {
        if (item.employee_id._id === data._id) {
          temp.push(item);
        }
      });
      //从当前员工的记录中筛选出子集list
      temp.forEach(item => {
        this.subSetsListOrigin.forEach(item2 => {
          if (item2._id === item.asset_subset_id._id) {
            temp2.push(item2);
          }
        });
      });
      //将子集list的数据结构做处理并把已经在使用中的资产放入checkdata中,选中状态
      temp3 = this.handleSubsets(temp2);
      temp3.forEach(item => {
        item.subList.forEach(item2 => {
          this.checkData.push(item2);
        });
      });
      this.subSetsList.forEach(item => {
        this.toggle(item);
      });
    },
    update: Common.throttle(async function() {
      await this.sortData(this.employee_id);
      if (this.assetData.length <= 0) {
        this.$refs.snackbar.show("请至少选择一项资产记录", "error");
        return;
      }
      // 更新：先删除再重新添加
      await this.deleteAssetUsers({ deleteData: [this.employee_id] });
      let res = await this.$request.fetch(
        "/api/asset/addAssetUsers",
        { assetData: this.assetData },
        "post"
      );
      if (res.data.status === 200) {
        this.getAssetUsers(this.sendSearchSelect);
        this.$refs.snackbar.show("编辑成功");
        this.dialog = false;
        this.checkData = [];
        this.total = [];
      } else {
        this.$refs.snackbar.show("刷新重试", "error");
      }
    }),
    cancel() {
      this.checkData = [];
      this.total = [];
      this.dialog = false;
    },
    enableDelete() {
      let deleteData = this.selected.map(item => {
        return item._id;
      });
      this.deleteAssetUsers({ deleteData: deleteData }, "remove");
    },
    search() {
      this.sendSearchSelect = JSON.parse(JSON.stringify(this.searchSelect));
      this.getAssetUsers(this.sendSearchSelect, "search");
    },
    async getAssetUsers(searchData, type) {
      let res = await this.$request.fetch(
        "/api/asset/getAssetUsers",
        searchData
      );
      res = res.data;
      if (res.status === 200) {
        this.assetUseList = res.result;
        console.log(this.assetUseList);
        this.assetUseListByEmployee = this.assetUseList
          .map(value => {
            return value.employee_id;
          })
          .reduce((pre, next) => {
            if (
              !pre.some(value => {
                return value._id === next._id;
              })
            ) {
              pre.push(next);
              return pre;
            }
            return pre;
          }, []);
        if (type && type === "search") {
          this.$refs.snackbar.show("搜索成功");
        }
      } else {
        this.$refs.snackbar.show("刷新重试", "error");
      }
    },
    async deleteAssetUsers(param, type) {
      let res = await this.$request.fetch(
        "/api/asset/deleteAssetUsers",
        param,
        "post"
      );
      res = res.data;
      if (res.status === 200) {
        if (type && type === "remove") {
          this.$refs.snackbar.show("删除成功");
          if (this.sendSearchSelect.searchUserSelect != "") {
            this.sendSearchSelect = {
              searchAttrubiteSelect: "",
              searchCategorySelect: "",
              searchUserSelect: "",
              searchSubsetSelect: ""
            };
            this.searchSelect = {
              searchAttrubiteSelect: "",
              searchCategorySelect: "",
              searchUserSelect: "",
              searchSubsetSelect: ""
            };
          }
          this.selected.forEach(item => {
            if (item._id == this.searchSelect.searchUserSelect) {
              this.searchSelect.searchUserSelect = "";
            }
          });
          await this.getUsers();
          await this.getAssetUsers(this.sendSearchSelect);
        }
      } else {
        this.$refs.snackbar.show("操作失败", "error");
      }
    },
    async getUsers() {
      await this.getAssetUsers();
      this.searchUserItems = this.assetUseListByEmployee.map(item => {
        return { name: item.name, _id: item._id };
      });
      this.searchUserItems.unshift({ name: "全部", _id: "" });
    },
    async getCategory() {
      let res = await this.$request.fetch("/api/asset/getCategories");
      res = res.data;
      if (res.status === 200) {
        this.searchCategoryItems = res.result;
        this.searchCategoryItems.unshift({ name: "全部", _id: "" });
      } else {
        this.$refs.snackbar.show("刷新重试", "error");
      }
    },
    async getAttrubites() {
      let param = {};
      if (
        this.searchSelect.searchCategorySelect !== "全部" &&
        this.searchSelect.searchCategorySelect !== ""
      ) {
        param = { asset_category_id: this.searchSelect.searchCategorySelect };
      }
      let res = await this.$request.fetch("/api/asset/getAttributes", param);
      res = res.data;
      if (res.status === 200) {
        if (res.result.length > 0) {
          this.searchAttrubiteItems = res.result;
          this.searchAttrubiteItems.unshift({ name: "全部", _id: "" });
          this.searchSelect.searchAttrubiteSelect = "";
          this.getSubSets();
        } else {
          this.searchAttrubiteItems = [{ name: "全部", _id: "" }];
          this.searchSelect.searchAttrubiteSelect = "";
          this.getSubSets();
        }
      } else {
        this.$refs.snackbar.show("刷新重试", "error");
      }
    },
    async getSubSets() {
      let param = {};
      if (
        this.searchSelect.searchCategorySelect !== "全部" &&
        this.searchSelect.searchCategorySelect !== ""
      ) {
        param.categoryId = this.searchSelect.searchCategorySelect;
      }
      if (
        this.searchSelect.searchAttrubiteSelect !== "全部" &&
        this.searchSelect.searchAttrubiteSelect !== ""
      ) {
        param.attrId = this.searchSelect.searchAttrubiteSelect;
      }
      let res = await this.$request.fetch("/api/asset/getSubsets", param);
      res = res.data;
      if (res.status === 200) {
        if (res.result.length > 0) {
          this.searchSubsetItems = res.result;
          this.searchSubsetItems.unshift({ name: "全部", _id: "" });
          this.searchSelect.searchSubsetSelect = "";
        } else {
          this.searchSubsetItems = [{ name: "全部", _id: "" }];
          this.searchSelect.searchSubsetSelect = "";
        }
      } else {
        this.$refs.snackbar.show("刷新重试", "error");
      }
    },
    sortData(id) {
      this.assetData = [];
      this.checkData.map((item, index) => {
        this.assetData.push(
          Object.assign(
            {},
            {
              asset_category_id: item.asset_attribute_id.asset_category_id._id,
              asset_attribute_id: item.asset_attribute_id._id,
              asset_subset_id: item._id,
              employee_id: id,
              create_time: new Date().toISOString().substr(0, 10)
            }
          )
        );
      });
    }
  }
};
</script>
<style scoped>
.classifyBg {
  padding: 40px 20px 30px;
  box-shadow: 0px 0px 6px 1px #ccc;
  position: relative;
}
.classifyBgFlex {
  background: #e0e1e2;
  border-radius: 10px;
  padding: 10px 20px;
  margin: -65px 0 35px;
}
.classifyBgFlex p {
  margin-bottom: 0px;
}
.classifyBgFlex p:nth-of-type(1) {
  color: #333300;
  font-size: 20px;
  margin-bottom: 5px;
}
.classifyBgFlex p:nth-of-type(1) {
  color: #333333;
  font-size: 15px;
}
.departmentP {
  padding-bottom: 15px;
}
.baseTitle {
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
.add-list {
  margin-left: 100px;
}
.add-list-type {
  margin-top: 10px;
  height: 30px;
  line-height: 30px;
}
.bottom_line {
  width: 80%;
  border-bottom: solid 1px black;
  margin-bottom: 0;
}
.sub-header-list {
  height: 40px;
}
.add-list,
.sub-add-list {
  padding-left: 20px;
  list-style: none;
  font-size: 14px;
  font-weight: normal;
}
.header-list {
  font-size: 16px;
  font-weight: 700;
}
.sub-add-name {
  height: 40px;
  line-height: 40px;
}
.sub-add-name span {
  display: inline-block;
  padding-left: 37px;
  margin: 5px 10px 10px 10px;
  width: 150px;
}
.sub-add-div {
  position: relative;
  height: 30px;
  line-height: 30px;
}
.sub-add-div span {
  display: inline-block;
  padding-left: 17px;
  margin: 0px 10px 10px 10px;
  width: 150px;
}
.sub-add-checkbox {
  position: absolute;
  top: -16px;
  left: -20px;
  width: 20px !important;
}
</style>
