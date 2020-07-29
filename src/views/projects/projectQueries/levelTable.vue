<template>
  <div>
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center style="margin-bottom:20px;">
        <v-flex md2 d-flex>
          <v-select :items="medalTypeList" v-model="medalType" label="请选择分类" @change="changeMedalType()"></v-select>
        </v-flex>
        <v-flex md2 d-flex>
          <v-select :items="levelList" v-model="selectedLevel" label="请选择等级"></v-select>
        </v-flex>
        <v-btn round color="info" style="margin-left: 20px; border-radius:10px;" @click="search()">
          <v-icon>search</v-icon>搜索
        </v-btn>
        <v-btn round color="info" style="margin-left: 20px; border-radius:10px;" @click="addLevel()">
          <v-icon>add</v-icon>新增等级
        </v-btn>
      </v-layout>

      <v-layout wrap align-center>
        <v-flex md d-flex>
          <div class="classify-bg">
            <v-flex class="classify-bg-flex">
              <p>项目查询</p>
              <p>勋章等级对照表</p>
            </v-flex>
            <div class="table">
              <v-data-table :headers="headers" :items="medalLevelList" class="elevation-1" no-data-text="暂无数据">
                <template v-slot:items="props">
                  <td>{{ props.item.start }}</td>
                  <td>{{ props.item.end }}</td>
                  <td>{{ props.item.level }}</td>
                  <td>{{ props.item.amount }}</td>
                  <td>{{ props.item.type }}</td>
                  <td class="text-xs-center">
                    <v-btn small color="info" @click="editLevelItem(props.item)">编辑</v-btn>
                    <v-btn small color="info" @click="deleteLevelItem(props.item)">删除</v-btn>
                  </td>
                </template>
              </v-data-table>
            </div>
          </div>
        </v-flex>
      </v-layout>

      <!-- 新增弹框 -->
      <v-layout justify-center>
        <v-dialog v-model="addDialog" persistent max-width="700px">
          <v-card>
            <v-card-title style="padding:40px 0 15px 60px;">
              <span class="headline">{{editFlag}}</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-layout wrap>
                  <span class="baseTitle">勋章类别</span>
                  <v-flex xs12 sm6 d-flex>
                    <v-select :items="medalTypeList" :error-messages="typeErrors" @blur="$v.addLevelItem.type.$touch()" v-model="addLevelItem.type" label="请选择分类" required></v-select>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <span class="baseTitle">项目点数起</span>
                  <v-flex xs12 sm6 md6>
                    <v-text-field v-model="addLevelItem.start" :error-messages="startErrors" required @blur="$v.addLevelItem.start.$touch()"></v-text-field>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <span class="baseTitle">项目点数讫</span>
                  <v-flex xs12 sm6 md6>
                    <v-text-field v-model="addLevelItem.end" :error-messages="endErrors" required @blur="$v.addLevelItem.end.$touch()"></v-text-field>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <span class="baseTitle">等级</span>
                  <v-flex xs12 sm6 md6>
                    <v-text-field v-model="addLevelItem.level" :error-messages="levelErrors" required @blur="$v.addLevelItem.level.$touch()"></v-text-field>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <span class="baseTitle">等级补贴</span>
                  <v-flex xs12 sm6 md6>
                    <v-text-field v-model="addLevelItem.amount" :error-messages="amountErrors" required @blur="$v.addLevelItem.amount.$touch()"></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions style="padding-bottom:60px;">
              <v-spacer></v-spacer>
              <v-btn color="primary" flat @click="closeAddDialog()">取消</v-btn>
              <v-btn color="primary" flat @click="saveAddItem()">确定</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-layout>
      <!-- ⬆⬆⬆ -->

      <!-- 确认删除弹框 -->
      <confirm-dialog ref="deleteDialog" @enableDelete="enableDelete" />

    </v-container>
  </div>
</template>

<script>
import { required, numeric, between } from "vuelidate/lib/validators";
import ConfirmDialog from "@/views/components/confirmDialog";

export default {
  components: { ConfirmDialog },
  name: "levelTable",
  validations: {
    addLevelItem: {
      start: { required, numeric, between: between(0, 99999999) },
      end: { required, numeric, between: between(0, 99999999) },
      level: { required },
      amount: { required, numeric },
      type: { required }
    },
    editItem: {
      amount: { required, numeric }
    }
  },
  data() {
    return {
      medalTypeList: ["Collaboration", "Management"],
      medalType: "Management",
      levelList: [],
      selectedLevel: "全部",
      currentLevel: "全部",
      medalLevelList: [],
      addDialog: false,
      editDialog: false,
      flag: 'Management',
      change:'Management',
      deleteItem: null,
      editFlag: "新增等级",
      editItem: {
        amount: 0
      },
      addLevelItem: {
        start: "",
        end: "",
        level: "",
        amount: "",
        type: ""
      },
      defaultItem: {
        start: "",
        end: "",
        level: "",
        amount: "",
        type: ""
      },
      headers: [
        { text: "勋章点数起", sortable: false },
        { text: "勋章点数讫", sortable: false },
        { text: "等级", sortable: false },
        { text: "等级补贴", sortable: false },
        { text: "勋章类别", sortable: false },
        { text: "功能", sortable: false, align: "center" }
      ]
    };
  },
  computed: {
    typeErrors() {
      const errors = [];
      if (!this.$v.addLevelItem.type.$dirty) return errors;
      !this.$v.addLevelItem.type.required &&
        errors.push("勋章类别为必选字段。");
      return errors;
    },
    startErrors() {
      const errors = [];
      if (!this.$v.addLevelItem.start.$dirty) return errors;
      !this.$v.addLevelItem.start.required &&
        errors.push("项目点数起为必填字段。");
      !this.$v.addLevelItem.start.numeric && errors.push("请输入数字");
      !this.$v.addLevelItem.start.between &&
        errors.push("只能输入0~99999999之间的数");
      return errors;
    },
    endErrors() {
      const errors = [];
      if (!this.$v.addLevelItem.end.$dirty) return errors;
      !this.$v.addLevelItem.end.required &&
        errors.push("项目点数讫为必填字段。");
      !this.$v.addLevelItem.end.numeric && errors.push("请输入数字")
      !this.$v.addLevelItem.end.between && errors.push("只能输入0~99999999之间的数");
      return errors;
    },
    levelErrors() {
      const errors = [];
      if (!this.$v.addLevelItem.level.$dirty) return errors;
      !this.$v.addLevelItem.level.required && errors.push("等级为必填字段。");
      return errors;
    },
    amountErrors() {
      const errors = [];
      if (!this.$v.addLevelItem.amount.$dirty) return errors;
      !this.$v.addLevelItem.amount.required &&
        errors.push("等级补贴为必填字段。");
      !this.$v.addLevelItem.amount.numeric && errors.push("请输入数字");
      return errors;
    },
    editAmountErrors() {
      let errors = [];
      !this.$v.editItem.amount.numeric && errors.push("请输入数字");
      return errors;
    }
  },
  created() {
    this.getLevels();
    this.getLevelTabel();
  },
  methods: {
    async changeMedalType() {
      this.levelList = ["全部"];
      let res = await this.$request.fetch("/api/projectQueries/levels", {
        type: this.medalType
      });
      if (res.data.status === 200) {
        for (const iterator of res.data.result) {
          this.levelList.push(iterator.level);
        }
      } else {
        this.$snackbar().showError();
      }
    },
    async getLevels() {
      this.levelList = ["全部"];
      let res = await this.$request.fetch("/api/projectQueries/levels", {
        type: this.change
      });
      if (res.data.status === 200) {
        for (const iterator of res.data.result) {
          this.levelList.push(iterator.level);
        }
      } else {
        this.$snackbar().showError();
      }
    },
    async getLevelTabel(type) {
      this.currentLevel = this.selectedLevel
      let res = await this.$request.fetch("/api/projectQueries/levelTable", {
        type: this.change,
        item: this.currentLevel
      });
      this.flag = this.change;
      if (res.data.status === 200) {
        this.medalLevelList = res.data.result;
        if (type === "search") {
          this.$snackbar().showOk("搜索成功");
        }
      } else {
        this.$snackbar().showError();
      }
    },
    search() {
      if (!this.selectedLevel) {
        return this.$snackbar().showError("请选择等级");
      }
      this.currentLevel = this.selectedLevel;
      this.change = this.medalType;
      this.getLevelTabel("search",this.selectedLevel );
      this.changeMedalType();
    },

    addLevel() {
      this.editFlag = "新增等级";
      this.addDialog = true;
    },
    closeAddDialog() {
      this.addDialog = false;
      setTimeout(() => {
        this.addLevelItem = Object.assign({}, this.defaultItem);
      }, 300);
      this.$v.$reset();
    },
    judge() {
      this.change = this.flag;
      this.getLevelTabel();
      this.changeMedalType();
    },
    async saveAddItem() {
      if (this.editFlag === "新增等级") {
        this.$v.addLevelItem.$touch();
        if (
          this.addLevelItem.level == "" ||
                  this.addLevelItem.type == "" ||
                  !/^[0-9]*$/.test(this.addLevelItem.start) ||
                  !/^[0-9]*$/.test(this.addLevelItem.end) ||
                  !/^[0-9]*$/.test(this.addLevelItem.amount)
        ) {
          return false;
        }
        let res = await this.$request.fetch(
          "/api/projectQueries/levelTableAdd",
          {
            start: this.addLevelItem.start,
            end: this.addLevelItem.end,
            level: this.addLevelItem.level,
            amount: this.addLevelItem.amount,
            type: this.addLevelItem.type
          },
          "post"
        );
        if (res.data.status === 200) {
          this.judge();
          this.$snackbar().showOk("添加成功");
        } else if (res.data.status === 304) {
          this.$snackbar().showError("该等级已存在");
        } else {
          this.$snackbar().showError("格式错误");
        }
      } else if (this.editFlag === "编辑内容") {
        if (
          this.addLevelItem.level == "" ||
                  this.addLevelItem.type == "" ||
                  !/^[0-9]*$/.test(this.addLevelItem.start) ||
                  !/^[0-9]*$/.test(this.addLevelItem.end) ||
                  !/^[0-9]*$/.test(this.addLevelItem.amount)
        ) {
          return false;
        }
        let res = await this.$request.fetch(
          "/api/projectQueries/levelTableUpdate",
          {
            index: this.addLevelItem._id,
            start: this.addLevelItem.start,
            end: this.addLevelItem.end,
            level: this.addLevelItem.level,
            amount: this.addLevelItem.amount,
            type: this.addLevelItem.type
          },
          "put"
        );
        if (res.data.status === 200) {
          if (this.selectedLevel === "全部") {
            this.currentLevel = this.selectedLevel;
          } else {
            this.selectedLevel = this.addLevelItem.level;
            this.currentLevel = this.selectedLevel;
          }
          this.change = this.flag;
          this.getLevelTabel();
          this.changeMedalType();
          this.$snackbar().showOk("编辑成功");
        } else if (res.data.status === 304) {
          this.$snackbar().showError("该等级已存在");
        } else {
          this.$snackbar().showOk("edit", false);
        }
      }
      this.closeAddDialog();
    },

    editLevelItem(item) {
      this.addDialog = true;
      this.editFlag = "编辑内容";
      this.addLevelItem = Object.assign({}, item);
    },
    closeEditDialog() {
      this.editDialog = false;
    },
    async confirmEdit() {
      let res = await this.$request.fetch(
        "/api/projectQueries/levelTableUpdate",
        {
          index: this.editItem._id,
          amount: this.editItem.amount
        },
        "put"
      );
      if (res.data.status === 200) {
        this.getLevelTabel();
        this.$snackbar().showOk("编辑成功");
      } else {
        this.$snackbar().showOk("edit", false);
      }
      this.editDialog = false;
    },

    deleteLevelItem(item) {
      this.deleteItem = item;
      this.$refs.deleteDialog.show();
    },
    async enableDelete() {
      let res = await this.$request.fetch(
        "/api/projectQueries/levelTableDelete",
        { id: this.deleteItem._id },
        "delete"
      );
      if (res.data.status === 200) {
        this.judge();
        this.$snackbar().showOk("删除成功");
        if (this.selectedLevel === this.deleteItem.level) {
          this.selectedLevel = "全部";
          this.currentLevel = this.selectedLevel;
        }
        this.getLevelTabel();
        this.changeMedalType();
      } else {
        this.$snackbar().showOk("delete", false);
      }
    }
  }
};
</script>

<style scoped>
  @import "../../../assets/css/classify.css";
  .baseTitle {
    margin-right: 35px;
    margin-left: 65px;
    display: inline-block;
    font-size: 18px;
    margin-top: 20px;
    width: 100px;
  }
  .table {
    background: #ffffff;
  }
  .td-btn {
    padding: 0px !important;
  }
  .icon-close {
    float: right;
  }
</style>
