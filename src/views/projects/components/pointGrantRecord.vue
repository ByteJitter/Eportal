<!--
 * @Descripttion: 组件 - pmo管理->点数发放记录
 * @Author: Doris
 * @Date: 2020-02-19 08:52:04
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-04-28 11:06:13
 -->
<template>
  <div>
    <!-- pm点数发放记录/除PMO发放点数之外的点数发放记录 -->
    <div>
      <v-flex md12 d-flex>
        <div class="table-title">
          <div>点数发放记录</div>
          <div class="btn-application">
            <v-btn normal color="info" v-if="showGrantRewardPointApply" @click="application('reward')">发放奖励点数</v-btn>
            <v-btn normal color="info" v-if="showGrantPointApply" @click="application()">发放点数申请</v-btn>
          </div>
        </div>
      </v-flex>
      <v-layout>
        <div class="table">
          <v-data-table :headers="recordHeader" :items="pointGrant" class="elevation-1" no-data-text="暂无数据">
            <template v-slot:items="props">
              <td>{{ props.item.date }}</td>
              <td>{{ props.item.employeeName }}</td>
              <td>{{ props.item.type_name }}</td>
              <td>{{ props.item.issue_stage_name }}</td>
              <td>{{ props.item.company }}</td>
              <td>{{ props.item.amount }}</td>
            </template>
          </v-data-table>
        </div>
      </v-layout>
      <!-- PM点数发放记录的申请单弹框 -->
      <v-layout justify-center>
        <v-dialog v-model="dialogApplication" persistent max-width="1100px">
          <v-card>
            <v-flex md12 d-flex>
              <div class="table-title2">
                <div>点数发放申请单</div>
              </div>
            </v-flex>
            <v-layout class="tableContainer">
              <v-flex class="tableHeader">
                <span v-for="i in pointFormHeader" :key="i.id">{{i.text}}</span>
              </v-flex>

              <v-flex class="tableContent form-group" v-for="(item, index) in $v.pointFormData.$each.$iter" :key="index">
                <div :class="{ 'form-group--error': item.employee_id.$error }">
                  <span>
                    <v-autocomplete @change="getEmail(item)" v-model.trim="item.employee_id.$model" label="成员列表" no-data-text="暂无数据" :items="memberList" item-text="name" item-value="_id"></v-autocomplete>
                  </span>
                  <div class="error-display v-messages theme--light error--text v-messages__message" v-if="!item.employee_id.required">不能为空</div>
                </div>
                <div :class="{ 'form-group--error': item.email.$error }">
                  <span>
                    <v-text-field label="请输入" v-model.trim="item.email.$model"></v-text-field>
                  </span>
                  <div class="error-display v-messages theme--light error--text v-messages__message" v-if="!item.email.required">不能为空</div>
                </div>
                <div :class="{ 'form-group--error': item.type.$error }">
                  <span>
                    <v-select :items="pointType" item-text="name" item-value="_id" label="勋章类别" no-data-text="暂无数据" v-model.trim="item.type.$model"></v-select>
                  </span>
                  <div class="error-display v-messages theme--light error--text v-messages__message" v-if="!item.type.required">不能为空</div>
                </div>
                <div>
                  <span style="position: relative; left: 10%;">
                    <td>{{projectInfo.status_name}}</td>
                  </span>
                </div>
                <div>
                  <span style="position: relative; left: 20%;">百星</span>
                </div>
                <div :class="{ 'form-group--error': item.amount.$error }">
                  <span>
                    <v-text-field label="请输入" v-model.trim="item.amount.$model"></v-text-field>
                  </span>
                  <div class="error-display v-messages theme--light error--text v-messages__message" v-if="!item.amount.required">不能为空</div>
                </div>
                <div>
                  <span>
                    <v-icon color="#e12015" @click="deleteAppForm(item)">remove</v-icon>
                  </span>
                </div>
              </v-flex>

              <v-flex class="tableFooter">
                <div>
                  <strong>本次申请发放点数合计：{{ point_sum }}</strong>
                </div>
                <div class="text-md-center">
                  <v-btn small color="info" @click="submitApplication()">提交申请</v-btn>
                </div>
              </v-flex>

              <v-card-actions class="actionBTN">
                <v-btn color="info" flat @click="cancel()">取消</v-btn>
                <v-btn color="info" flat @click="addAppForm()">添加人员</v-btn>
              </v-card-actions>
            </v-layout>
          </v-card>
        </v-dialog>
      </v-layout>
    </div>
  </div>
</template>
<script>
import getStatus from "@/utils/getStatus";
import { required } from "vuelidate/lib/validators";
export default {
  props: ["showBTN", "pointGrant", "id", "projectInfo"],
  validations: {
    pointFormData: {
      required,
      $each: {
        employee_id: { required },
        email: { required },
        type: { required },
        amount: { required }
      }
    }
  },
  data() {
    return {
      recordHeader: [
        { text: "发放日期", value: "issueDate", sortable: false },
        { text: "用户名", value: "username", sortable: false },
        { text: "勋章类别", value: "category", sortable: false },
        { text: "发放点数时点", value: "issueTimePoint", sortable: false },
        { text: "项目单位", value: "issueMan", sortable: false },
        { text: "发放点数额度", value: "issueLimit", sortable: false }
      ],
      pointFormHeader: [
        {
          text: "项目成员",
          align: "left",
          sortable: false
        },
        { text: "电子邮箱", align: "left", sortable: false },
        {
          text: "勋章类别",
          align: "left",
          sortable: false
        },
        {
          text: "发放点数时点",
          align: "left",
          sortable: false
        },
        {
          text: "项目单位",
          align: "left",
          sortable: false
        },
        { text: "发放点数额度", align: "left", sortable: false },
        { text: "功能", align: "center", sortable: false }
      ],
      pointFormData: [],
      statusItem: {},
      dialogApplication: false,
      alreadyUpdate: "alreadyUpdate",
      isReward: false,
      memberList: [],
      pointType: []
    };
  },
  computed: {
    showGrantPointApply() {
      if (
        this.showBTN !== "unShow" &&
        this.projectInfo &&
        (this.projectInfo.status === "pending" ||
          this.projectInfo.status === "end-success")
      ) {
        return true;
      }
      return false;
    },
    showGrantRewardPointApply() {
      if (
        this.showBTN !== "unShow" &&
        this.projectInfo &&
        this.projectInfo.is_reward
      ) {
        return true;
      }
      return false;
    },

    point_sum() {
      let result = 0;
      this.pointFormData.forEach(item => {
        result += Number(item.amount);
      });
      return result;
    }
  },
  methods: {
    async memberInfo() {
      let res = await this.$request.fetch(
        "/api/projectManagement/checkout_member",
        {
          // 项目id
          index: this.id
        }
      );
      let names = [];
      if (res.data.status === 200) {
        this.memberList = [];
        // 获取该项目对应的所有成员数据
        this.members = res.data.result;
        this.members.unshift(this.projectInfo.manager);
        for (const iterator of this.members) {
          this.memberList.push({ name: iterator.name, _id: iterator._id });
        }
      } else {
        this.$snackbar().showError("获取项目成员数据失败");
      }
    },
    application(reward) {
      this.memberInfo();
      this.dialogApplication = true;
      if (reward === "reward") {
        this.isReward = true;
      } else {
        this.isReward = false;
      }
    },
    deleteAppForm(item) {
      this.$v.$reset();
      const index1 = this.pointFormData.indexOf(item);
      this.pointFormData.splice(index1, 1);
      this.$snackbar().showStatus("delete");
    },
    cancel() {
      this.$v.$reset();
      this.dialogApplication = false;
      this.pointFormData = [];
    },
    addAppForm() {
      this.$v.$reset();
      let editedItem = {
        email: "",
        type: "",
        amount: null,
        employee_id: "",
        issue_stage: this.projectInfo.status
      };

      if (this.isReward === true) {
        this.pointType = [{ name: "Collaboration", _id: "cc" }];
      } else {
        this.pointType = [
          { name: "Management", _id: "pm" },
          { name: "Collaboration", _id: "cc" }
        ];
      }
      this.pointFormData.push(editedItem);
    },
    getEmail(item) {
      this.members.forEach(iterator => {
        if (item.$model.employee_id === iterator._id) {
          item.$model.email = iterator.email;
        }
      });

      if (this.isReward === true) {
        this.pointType = [{ name: "Collaboration", _id: "cc" }];
      } else {
        if (item.employee_id.$model === this.projectInfo.manager._id) {
          this.pointType = [{ name: "Management", _id: "pm" }];
        } else {
          this.pointType = [
            { name: "Management", _id: "pm" },
            { name: "Collaboration", _id: "cc" }
          ];
        }
      }
    },
    async submitApplication() {
      if (this.pointFormData.length === 0) {
        return this.$snackbar().showError("请添加成员");
      }

      this.$v.pointFormData.$touch();
      if (this.$v.pointFormData.$invalid) return;

      let data = [];
      this.pointFormData.forEach(iterator => {
        let { email, ...item } = iterator;
        data.push(item);
      });

      let res = await this.$request.fetch(
        "/api/projectManagement/grantPointToApply",
        {
          project_id: this.id,
          data: data,
          isReward: this.isReward,
          manager: this.projectInfo.manager._id
        },
        "post"
      );
      if (res.data.status === 200) {
        this.$snackbar().showOk(`发放点数申请成功`);
        this.dialogApplication = false;
        this.$v.$reset();
        this.pointFormData = [];
        this.$emit("grantPointUpdate", this.alreadyUpdate);
      } else {
        this.$snackbar().showError(res.data.msg);
      }
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
.table-title2 {
  background: #e0e1e2;
  font-family: PingFangSC-Regular;
  font-size: 20px;
  line-height: 50px;
  text-align: center;
  color: #333300;
  height: 50px;
}
.btn-application {
  float: right;
  position: relative;
  top: -50px;
}
.btn-application > button {
  line-height: 28px !important;
}
.table {
  width: 100%;
  background: #ffffff;
  box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.5);
}
.header {
  margin: 38.7px 46px 0 26px;
  background: rgba(224, 225, 226, 0.28);
  height: 52px;
  text-align: center;
  padding-top: 12px;
  position: relative;
}
.header span {
  font-family: PingFangSC-Regular;
  font-size: 20px;
  color: #333300;
}
.addbtn-sty {
  position: absolute;
  top: 5px;
  right: 0px;
}

.tableContainer {
  display: flex;
  flex-direction: column;
}

.tableContainer div {
  margin: 4px;
}

.tableHeader {
  padding-top: 20px;
  display: flex;
  justify-content: space-evenly;
  font-size: 18px;
}
.tableHeader span {
  width: 110px;
}
.tableContent {
  display: flex;
  justify-content: space-evenly;
  margin: 10px;
  font-size: 16px;
  align-items: center;
}
.tableContent div {
  width: 124px;
}

.tableFooter {
  display: flex;
  justify-content: space-between;
  padding: 0 40px;
  align-items: center;
}

.actionBTN {
  display: flex;
  justify-content: flex-end;
  padding-right: 40px;
}
.form-group .error-display {
  display: none;
}
.form-group--error {
  position: relative;
}
.form-group--error .error-display {
  display: block;
  position: absolute;
}

.com {
  background: pink;
}

</style>
