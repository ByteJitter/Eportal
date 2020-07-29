<!--
 * @Descripttion: 组件 - 项目管理->勋章点数状态
 * @Author: Doris
 * @Date: 2020-02-19 08:52:04
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-04-15 09:04:53
 -->
<template>
  <div>
    <v-flex md12 d-flex>
      <div class="table-title">勋章点数状态</div>
    </v-flex>
    <v-layout wrap align-center>
      <div class="table">
        <v-data-table :headers="medalHeader" :items="medalPoint" class="elevation-1" hide-actions no-data-text="暂无数据">
          <template v-slot:items="props">
            <tr>
              <td>Collaboration</td>
              <!-- 可发放执行中 -->
              <td class="text-xs-center">{{ props.item.progress_cc_point || 0}}</td>
              <td class="text-xs-center">{{ props.item.al_pending_cc || 0}}</td>
              <!-- 可发放结案 -->
              <td class="text-xs-center">{{ props.item.complete_cc_point || 0}}</td>
              
              <td class="text-xs-center">{{ props.item.al_endSuccess_cc || 0}}</td>
              <!-- 可发放奖励 -->
              <td class="text-xs-center">{{ props.item.reward_point || 0}}</td>
              <!-- 已发放奖励CC -->
              <td class="text-xs-center">{{ props.item.al_reward_cc || 0}}</td>
              <td>项目经理</td>
            </tr>
            <tr>
              <td>Management</td>
              <td class="text-xs-center">{{ props.item.progress_pm_point || 0}}</td>
              <td class="text-xs-center">{{ props.item.al_pending_pm || 0}}</td>
              <td class="text-xs-center">{{ props.item.complete_pm_point + props.item.special_score || 0}}</td>
              <td class="text-xs-center">{{ props.item.al_endSuccess_pm || 0}}</td>
              <td class="text-xs-center">{{ 0 }}</td>
              <td class="text-xs-center">{{ 0 }}</td>
              <td>勋章管理委员会</td>
            </tr>
          </template>
        </v-data-table>
      </div>
    </v-layout>
  </div>
</template>
<script>
export default {
  props: ["medalPoint"],
  data() {
    return {
      medalHeader: [
        {
          text: "勋章类别",
          align: "left",
          sortable: false
        },
        {
          text: "可发放总额-执行中",
          align: "left",
          sortable: false
        },
        {
          text: "已发放总额-执行中",
          align: "left",
          sortable: false
        },
        { text: "可发放总额-结案", align: "left", sortable: false },
        { text: "已发放总额-结案", align: "left", sortable: false },
        { text: "可发放总额-奖励", align: "left", sortable: false },
        { text: "已发放总额-奖励", align: "left", sortable: false },
        { text: "发放角色", align: "left", sortable: false }
      ],
    };
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
.table1 {
  width: 100%;
  border-collapse: collapse;
}
.table1 tr {
  text-indent: 25px;
  line-height: 30px;
  border-bottom: 1px solid #e0e1e2;
}
.th1 {
  font-weight: bold;
}
</style>