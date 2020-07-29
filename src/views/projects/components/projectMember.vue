<!--
 * @Descripttion: 组件 - 项目管理->项目成员
 * @Author: Doris
 * @Date: 2020-02-19 08:52:04
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-04-15 09:06:32
 -->
<template>
  <div>
    <v-flex md12 d-flex>
      <div class="table-title">
        <div>项目成员</div>
        <div class="btn-addMember" v-if="showAddMember">
          <v-btn normal color="info" @click="addMember()">添加成员</v-btn>
        </div>
      </div>
    </v-flex>
    <v-layout wrap align-center>
      <div class="table">
        <v-data-table :headers="memberHeader" :items="projectMember" class="elevation-1" no-data-text="暂无数据">
          <template v-slot:items="props">
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.email }}</td>
            <td class="text-xs-center" v-if="showRemoveMember">
              <v-btn small color="info" @click="removeMember(props.item)">移除成员</v-btn>
            </td>
          </template>
        </v-data-table>
      </div>
    </v-layout>

    <v-layout>
      <!-- myproject->manage->addMember -->
      <v-dialog v-model="showAddDialog" persistent max-width="700px">
        <v-card>
          <v-card-title style="padding:40px 0 15px 60px;">
            <span class="headline">添加项目成员</span>
          </v-card-title>
          <v-layout wrap align-center>
            <v-flex md2></v-flex>
            <v-flex md2>
              <label>项目成员</label>
            </v-flex>
            <v-flex md6>
              <v-autocomplete label="请选择" no-data-text="暂无数据" :items="memberContent" item-text="name" item-value="_id" v-model.trim="editedItem._id" @change="getEmail()" :error-messages="memberErrors" required @input="$v.editedItem._id.$touch()" @blur="$v.editedItem._id.$touch()"></v-autocomplete>
            </v-flex>
            <v-flex md2></v-flex>
            <v-flex md2></v-flex>
            <v-flex md2>
              <label>电子邮箱</label>
            </v-flex>
            <v-flex md6>
              <v-text-field label="请输入" v-model.trim="editedItem.email" :error-messages="emailErrors" required @input="$v.editedItem.email.$touch()" @blur="$v.editedItem.email.$touch()"></v-text-field>
            </v-flex>
            <v-flex md2></v-flex>
          </v-layout>
          <v-card-actions style="padding:20px 85px 60px 0;">
            <v-spacer></v-spacer>
            <v-btn color="info" flat @click="cancelMembers()">取消</v-btn>
            <v-btn color="info" flat @click="saveMembers()">添加</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- myproject->manage->removeMember -->
      <v-dialog v-model="showRemoveDialog" persistent max-width="700">
        <v-card>
          <v-card-title class="headline" style="padding:75px 0 0 100px;">您确定要移除该成员吗？</v-card-title>
          <v-card-actions style="padding:30px 50px;">
            <v-spacer></v-spacer>
            <v-btn color="info" flat @click="cancelRemove()">取消</v-btn>
            <v-btn color="info" flat @click="saveRemove()">确定</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </div>
</template>
<script>
import { required } from "vuelidate/lib/validators";
export default {
  props: ["projectMember", "module", "id","manager"],
  validations: {
    editedItem: {
      _id: { required },
      email: { required }
    }
  },
  data() {
    return {
      memberHeader: [
        { text: "用户名", align: "left", sortable: false, type: "1" },
        { text: "电子邮件信箱", align: "left", sortable: false, type: "1" },
        { text: "功能", align: "center", sortable: false, type: "2" }
      ],
      memberData: [],
      showRemoveMember: true,
      showAddMember: true,
      projectId: "",
      showAddDialog: false,
      showRemoveDialog: false,
      memberContent: [],
      editedItem: { name: "", email: "", _id: "" },
      removeItemId: "",
      alreadyUpdate: "alreadyUpdate"
    };
  },
  created() {
    if (this.module === "projectList" || this.module === "pmoList") {
      this.showRemoveMember = false;
      this.showAddMember = false;
      this.memberHeader.pop();
    }
    if (this.$route.query) {
      let { flag } = this.$route.query;
    }
  },
  computed: {
    memberErrors() {
      const errors = [];
      if (!this.$v.editedItem._id.$dirty) return errors;
      !this.$v.editedItem._id.required && errors.push("不能为空");
      return errors;
    },
    emailErrors() {
      const errors = [];
      if (!this.$v.editedItem.email.$dirty) return errors;
      !this.$v.editedItem.email.required && errors.push("不能为空");
      return errors;
    }
  },
  methods: {
    async addMember() {
      this.showAddDialog = true;
      let resAllMember = await this.$request.fetch(
        "/api/projectManagement/checkout_members"
      );
      if (resAllMember.data.status === 200) {
        let arr = resAllMember.data.result;
        for (let i = 0; i < arr.length; i++) {
          // 获取当前项目经理的ID，在成员数组中删除
          if (arr[i]._id === this.manager.manager._id) {
            arr.splice(i, 1);
          }
        }
        this.memberContent = arr;
      } else {
        this.$snackbar().showError("获取员工数据失败");
      }
    },
    getEmail() {
      this.memberContent.forEach(item => {
        if (item._id === this.editedItem._id) {
          this.editedItem.email = item.email;
        }
      });
    },
    async saveMembers() {
      this.$v.editedItem.$touch();
      if (this.editedItem._id == "" || this.editedItem.email == "") {
        return false;
      }
      let resAddMember = await this.$request.fetch(
        "/api/projectManagement/memberAdd",
        {
          index: this.id,
          id: this.editedItem._id
        },
        "post"
      );
      if (resAddMember.data.status === 200) {
        this.$v.$reset();
        this.showAddDialog = false;
        this.$snackbar().showStatus("add");
        this.editedItem._id = "";
        this.editedItem.email = "";
      } else if (resAddMember.data.status === 304) {
        this.$snackbar().showError("该成员已存在");
      } else {
        this.$snackbar().showStatus("add", false);
      }
      this.$emit("saveMemberUpdate", this.alreadyUpdate);
    },
    cancelMembers() {
      this.$v.$reset();
      this.showAddDialog = false;
      this.editedItem._id = "";
      this.editedItem.email = "";
    },
    removeMember(item) {
      this.showRemoveDialog = true;
      this.removeItemId = item._id;
    },
    async saveRemove() {
      let resRemoveMember = await this.$request.fetch(
        "/api/projectManagement/memberRemove",
        {
          index: this.id,
          id: this.removeItemId
        },
        "post"
      );

      if (resRemoveMember.data.status === 200) {
        this.showRemoveDialog = false;
        this.$snackbar().showStatus("delete");
      } else {
        this.$snackbar().showStatus("delete", false);
      }
      this.$emit("saveMemberUpdate", this.alreadyUpdate);
    },
    cancelRemove() {
      this.$v.$reset();
      this.showRemoveDialog = false;
      this.editedItem._id = "";
      this.editedItem.email = "";
    }
  }
};
</script>
<style scoped>
.table-title {
  background: #e0e1e2;
  font-family: PingFangSC-Regular;
  font-size: 20px;
  line-height: 50px;
  text-align: center;
  color: #333300;
  height: 50px;
  margin-top: 42px;
}
.table {
  width: 100%;
  background: #ffffff;
  box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.5);
}
.btn-addMember {
  float: right;
  position: relative;
  top: -50px;
}
.btn-addMember > button {
  line-height: 28px !important;
}
</style>