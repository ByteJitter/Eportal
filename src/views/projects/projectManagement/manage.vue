<!--
 * @Descripttion: 项目管理->我的项目详情页
 * @Author: Doris
 * @Date: 2019-12-27 17:06:31
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-04-24 09:27:05
 -->
<template>
  <div>
    <project-content :projectInfo="[projectInfo]"></project-content>
    <medal-point :medalPoint="medalPoint" v-if="showMedalPoint"></medal-point>
    <point-apply :pointApply="pointApply" v-if="showPointApply"></point-apply>
    <project-member :manager="projectInfo" :projectMember="projectMember" :module="this.$route.query.module" :id="this.$route.query.id" v-on:saveMemberUpdate="saveMemberUpdate"></project-member>
    <point-grant :showBTN="showBTN" :pointGrant="pointGrant" :id="this.$route.query.id" :projectInfo="projectInfo" v-if="showPointGrant" v-on:grantPointUpdate="grantPointUpdate"></point-grant>
    <v-layout style="padding:50px 60px 40px 0;">
      <v-spacer></v-spacer>
      <v-btn v-if="showStart" small color="info" style="margin-right:30px" @click="start()">启动</v-btn>
      <v-btn small color="info" @click="backToList()">返回</v-btn>
    </v-layout>
  </div>
</template>
<script>
import ProjectContent from "@/views/projects/components/pmProjectContent.vue";
import MedalPoint from "@/views/projects/components/medalPointStatus.vue";
import PointApply from "@/views/projects/components/pmPointGrantApply.vue";
import ProjectMember from "@/views/projects/components/projectMember.vue";
import PointGrant from "@/views/projects/components/pointGrantRecord.vue";
export default {
  components: {
    ProjectContent,
    MedalPoint,
    PointApply,
    ProjectMember,
    PointGrant
  },
  data() {
    return {
      projectInfo: {},
      medalPoint: [],
      pointApply: [],
      projectMember: [],
      pointGrant: [],
      showMedalPoint: true,
      showPointApply: true,
      showPointGrant: true,
      showStart: false,
      showBTN: true
    };
  },
  created() {
    if (this.$route.query) {
      this.getInfo();
    }
  },
  methods: {
    async getInfo() {
      // 项目内容
      let resProject = await this.$request.fetch(
        "/api/project/pmo/projectListDetail",
        {
          _id: this.$route.query.id
        }
      );
      if (resProject.data.status === 200) {
        this.projectInfo = resProject.data.result;
        this.projectInfo.expect_close_date = this.projectInfo.expect_close_date.substring(0,10)
      } else {
        this.$snackbar().showError("获取项目数据失败");
      }

      // 判断项目状态是 PMO设定完成时 不显示 勋章点数状态
      if (this.$route.query.proType === "setting") {
        this.showMedalPoint = false;
        this.showPointApply = false;
        this.showPointGrant = false;
        // 展示“启动”按钮
        this.showStart = true;
      } else {
        // 勋章点数状态
        let resMedal = await this.$request.fetch(
          "/api/projectManagement/medalPoint",
          {
            projId: this.$route.query.id
          }
        );
        if (resMedal.data.status === 200) {
          this.medalPoint = [resMedal.data.result];
        } else {
          this.$snackbar().showError("获取勋章点数数据失败");
        }
        
        if (this.$route.query.flag === "look") {
          this.showPointApply = false;
          this.showBTN = 'unShow';
        } else {
          // 点数发放申请列表
          let resApply = await this.$request.fetch(
            "/api/projectManagement/grantApplyList",
            {
              projId: this.$route.query.id
            }
          );
          if (resApply.data.status === 200) {
            this.pointApply = resApply.data.result;
          } else {
            return this.$snackbar().showError("获取点数发放申请列表数据失败");
          }
        }

        // 点数发放记录
        let resRecord = await this.$request.fetch(
          "/api/projectManagement/pmPointGrantRecord",
          {
            project_id: this.$route.query.id
          }
        );
        if (resRecord.data.status === 200) {
          this.pointGrant = resRecord.data.result;
        } else {
          this.$snackbar().showError("获取点数发放记录数据失败");
        }
      }

      // 项目成员
      let resMember = await this.$request.fetch(
        "/api/projectManagement/checkout_member",
        {
          index: this.$route.query.id
        }
      );
      if (resMember.data.status === 200) {
        this.projectMember = resMember.data.result;
      } else {
        this.$snackbar().show("获取项目成员数据失败");
      }
    },
    saveMemberUpdate(saveMemberUpdate) {
      if (saveMemberUpdate === "alreadyUpdate") {
        this.getInfo();
      }
    },
    grantPointUpdate(grantPointUpdate) {
      if (grantPointUpdate === "alreadyUpdate") {
        this.getInfo();
      }
    },
    async start() {
      let res = await this.$request.fetch(
        "/api/projectManagement/start",
        {
          index: this.$route.query.id
        },
        "put"
      );
      if (res.data.status === 200) {
        this.$snackbar("extend").showStatus("启动成功");
        this.$router.push("/projects/projectManagement/myProject");
      } else {
        this.$snackbar().show("启动失败");
      }
    },
    backToList() {
      localStorage.removeItem("manager");
      this.$router.go(-1);
    }
  }
};
</script>
<style scoped>
</style>