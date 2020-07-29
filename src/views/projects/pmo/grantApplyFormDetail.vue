<!--
 * @Descripttion: pmo管理->PMO点数发放申请单详情页
 * @Author: Doris
 * @Date: 2020-02-19 08:52:04
 * @LastEditors: Doris
 * @LastEditTime: 2020-03-11 09:33:43
 -->
<template>
  <div>
    <div class="header">
      <span>点数发放申请单</span>
    </div>
    <v-layout>
      <v-data-table :headers="applyDetailHeader" :items="applyDetailData" class="cont-tab"
        hide-actions no-data-text="暂无数据">
        <template v-slot:items="props">
          <td>{{ props.item.employee_id.name }}</td>
          <td>{{ props.item.employee_id.email }}</td>
          <td>{{ props.item.type }}</td>
          <td>{{ props.item.issue_stage_name }}</td>
          <td>{{ props.item.apply_id.project_id.company }}</td>
          <td>{{ props.item.amount }}</td>
        </template>
      </v-data-table>
    </v-layout>
    <v-layout wrap class="footer">
      <v-flex xs8 md6 lg4>
        <p>
          本次申请发放点数合计：
          <span>{{totalPoint}}</span>
        </p>
      </v-flex>
      <v-flex xs8 md6 lg6 btn>
        <v-btn color="info" @click="agree()" v-if="status==='pending'">同意</v-btn>
        <v-btn color="info" @click="disagree()" v-if="status==='pending'">驳回</v-btn>
        <v-btn color="info" @click="invalid()" v-if="status==='resolve'">设置无效</v-btn>
        <v-btn color="info" @click="goback()">返回</v-btn>
      </v-flex>
    </v-layout>
  </div>
</template>
<script>
import { constants } from "crypto";
export default {
  data() {
    return {
      applyDetailHeader: [
        { text: "项目成员", value: "member", sortable: false },
        { text: "电子邮箱", value: "email", sortable: false },
        { text: "勋章类别", value: "category", sortable: false },
        { text: "发放点数时点", value: "issueTimePoint", sortable: false },
        { text: "项目单位", value: "company", sortable: false },
        { text: "发放点数额度", value: "issueLimit", sortable: false }
      ],
      applyDetailData: [],
      totalPoint: 0,
      status: "",
      alreadyCount: false
    };
  },
  mounted() {
    this.status = this.$route.query.status;

    if (this.$route.query.id) {
      this.getPointDetail();
    }
  },
  methods: {
    async getPointDetail() {
      let res = await this.$request.fetch(
        "/api/project/pmo/grantApply_pointUserLogs",
        {
          _id: this.$route.query.id,
          apply_id: this.$route.query.point_log_id
        }
      );

      if (res.data.status === 200) {
        this.applyDetailData = res.data.result;
        let typeTransform = [];
        // 勋章类别显示转换： pending_cc/end_cc/reward_cc都显示为Collaboration；_pm同理显示为Management
        this.applyDetailData.forEach(i => {
          this.totalPoint += i.amount;
          typeTransform = i.type.split("_");
          if (typeTransform[1] === "pm") {
            i.type = "Management";
          } else {
            i.type = "Collaboration";
          }
        });
      } else {
        this.$snackbar().showError("刷新重试");
      }
    },
    // 同意/驳回/无效后和PM端的交互
    // 需要先判断 already_count 是否为 true，如果 true，不能进行任何操作（同意/驳回/设置无效）
    async agree() {
      let res = await this.$request.fetch(
        "/api/project/pmo/grantApplyAlreadyCount",
        {
          _id: this.$route.query.point_log_id
        }
      );
      if (res.data.status === 200) {
        this.alreadyCount = res.data.result[0].already_count;
      } else {
        this.$snackbar().showError("刷新重试");
      }

      if (this.alreadyCount === false) {
        let data_agree = {
          apply_id: this.$route.query.point_log_id,
          status_agree: "resolve"
        };
        await this.$request.fetch(
          "/api/project/pmo/grantApply_changeStatus",
          {
            data_agree
          },
          "put"
        );

        this.$router.push({
          path: "grantappform"
        });
      } else {
        this.$snackbar().showError("该年度点数已经结算，不可进行点数发放操作");
      }
    },
    async disagree() {
      let res = await this.$request.fetch(
        "/api/project/pmo/grantApplyAlreadyCount",
        {
          _id: this.$route.query.point_log_id
        }
      );
      if (res.data.status === 200) {
        this.alreadyCount = res.data.result[0].already_count;
      } else {
        this.$snackbar().showError("刷新重试");
      }

      if (this.alreadyCount === false) {
        let data_agree = {
          apply_id: this.$route.query.point_log_id,
          status_agree: "reject"
        };
        await this.$request.fetch(
          "/api/project/pmo/grantApply_changeStatus",
          {
            data_agree
          },
          "put"
        );

        this.$router.push({
          path: "grantappform"
        });
      } else {
        this.$snackbar().showError(
          "该年度点数已经结算，不可进行点数发放驳回操作"
        );
      }
    },
    async invalid() {
      let res = await this.$request.fetch(
        "/api/project/pmo/grantApplyAlreadyCount",
        {
          _id: this.$route.query.point_log_id
        }
      );
      if (res.data.status === 200) {
        this.alreadyCount = res.data.result[0].already_count;
      } else {
        this.$snackbar().showError("刷新重试");
      }

      if (this.alreadyCount === false) {
        let data_agree = {
          apply_id: this.$route.query.point_log_id,
          status_agree: "invalid"
        };
        await this.$request.fetch(
          "/api/project/pmo/grantApply_changeStatus",
          {
            data_agree
          },
          "put"
        );

        this.$router.push({
          path: "grantappform"
        });
      } else {
        this.$snackbar().showError("该年度点数已经结算，不可进行设置无效操作");
      }
    },

    goback() {
      this.$router.go(-1);
    }
  }
};
</script>
<style scoped>
.header {
  margin: 38.7px 46px 0 26px;
  background: rgba(224, 225, 226, 0.28);
  height: 52px;
  text-align: center;
  padding-top: 12px;
}
.header span {
  font-family: PingFangSC-Regular;
  font-size: 20px;
  color: #333300;
}
.cont-tab {
  width: 100%;
  margin: 0 46px 0 26px;
  background: rgba(0, 0, 0, 0);
  box-shadow: 0px 0px 3px 1px #ccc;
}
.footer {
  margin: 0px 46px 0 26px;
  background: #ffffff;
  border: 1px solid #979797;
  box-shadow: 0px 1px 3px 1px #ccc;
  position: relative;
}
.footer p {
  font-family: PingFangSC-Regular;
  font-size: 16px;
  color: #000000;
  padding-top: 15px;
  padding-left: 12px;
}
.btn {
  position: absolute;
  top: 5px;
  right: 10px;
}
</style>