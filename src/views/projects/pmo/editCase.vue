<!--
 * @Descripttion: pmo管理->PMO项目列表详情页
 * @Author: Doris
 * @Date: 2019-11-28 11:31:00
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-04-14 16:09:47
 -->
<template>
  <div>
    <project-info :projectInfo="[projectInfo]" :proType="this.$route.query.proType" :btnEdit="this.$route.query.btnEdit" v-on:update="update"></project-info>
    <medal-point :medalPoint="[medalPoint]"></medal-point>
    <project-member :projectMember="projectMember" :module="this.$route.query.module"></project-member>
    <point-grant :id="this.$route.query.id" :pointGrant="pointGrant"></point-grant>
    <div class="back">
      <v-btn color="info" dark class="back-btn" @click="backToList()">返回</v-btn>
    </div>
  </div>
</template>
<script>
import ProjectInfo from "@/views/projects/components/projectInfo.vue";
import MedalPoint from "@/views/projects/components/medalPointStatus.vue";
import ProjectMember from "@/views/projects/components/projectMember.vue";
import PointGrant from "@/views/projects/components/pointGrantRecord.vue";
export default {
  components: { ProjectInfo, MedalPoint, ProjectMember, PointGrant },
  data() {
    return {
      projectInfo: {},
      medalPoint: {},
      projectMember: [],
      pointGrant: []
    };
  },
  mounted() {
    if (this.$route.query.id) {
      this.getInfo();
    }
  },
  methods: {
    async getInfo() {
      // 项目信息
      let resProject = await this.$request.fetch(
        "/api/project/pmo/projectListDetail",
        {
          _id: this.$route.query.id
        }
      );
      if (resProject.data.status === 200) {
        this.projectInfo = resProject.data.result;
      } else {
        this.$snackbar().showError("刷新重试", false);
      }
      // 勋章点数状态
      let resPoint = await this.$request.fetch(
        "/api/projectManagement/medalPoint",
        {
          projId: this.$route.query.id
        }
      );
      if (resPoint.data.status === 200) {
        this.medalPoint = resPoint.data.result;
      } else {
        this.$snackbar().showError("获取勋章点数数据失败");
      }
      // 项目成员
      let resMember = await this.$request.fetch(
        "/api/project/pmo/project_employee",
        {
          _id: this.$route.query.id
        }
      );
      if (resMember.data.status === 200) {
        this.projectMember = resMember.data.result;
      } else {
        this.$snackbar().showError("刷新重试");
      }
      // 点数发放记录
      let resRecord = await this.$request.fetch(
        "/api/projectManagement/pmPointGrantRecord",
        {
          project_id: this.$route.query.id
        }
      );
      if (resRecord.data.status === 200) {
        this.pointGrant = resRecord.data.result
      } else {
        this.$snackbar().showError("刷新重试");
      }
    },
    update(update) {
      if (update === "alreadyUpdate") {
        this.getInfo();
      }
    },
    backToList() {
      this.$router.go(-1);
    }
  }
};
</script>
<style scoped>
.back {
  background: pink;
  position: relative;
}
.back-btn {
  position: absolute;
  top: 10px;
  right: 46px;
}
</style>
