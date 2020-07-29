<!--
 * @Descripttion: 组件 - 项目管理->项目内容
 * @Author: Doris
 * @Date: 2019-12-27 16:51:54
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-04-15 08:53:05
 -->
<template>
  <div>
    <v-flex md12 d-flex>
      <div class="table-title">项目内容</div>
    </v-flex>
    <v-layout wrap align-center>
      <div class="table">
        <table v-for="(items,i) in projectInfo" :key="i" class="table1">
          <tr class="th1">
            <td style="width:25%;">项目编号</td>
            <td>{{items.number}}</td>
          </tr>
          <tr>
            <td>项目名称</td>
            <td>{{items.name}}</td>
          </tr>
          <tr>
            <td>项目说明</td>
            <td>{{items.desc}}</td>
          </tr>
          <tr>
            <td>预计结案日期</td>
            <!-- TODO -->
            <td>{{items.expect_close_date}}</td>
          </tr>
          <tr>
            <td>项目单位</td>
            <td>{{items.company}}</td>
          </tr>
          <tr>
            <td>项目经理</td>
            <td>{{items.manager && items.manager.name }}</td>
          </tr>
          <tr>
            <td>项目等级</td>
            <td>{{items.level_name}}</td>
          </tr>
          <tr>
            <td>结案分数</td>
            <td>{{items.score}}</td>
          </tr>
          <tr>
            <td>点数上限</td>
            <td>{{items.level * 200}}</td>
          </tr>
          <tr>
            <td>项目状态</td>
            <td>{{items.status_name}}</td>
          </tr>
        </table>
      </div>
    </v-layout>
  </div>
</template>
<script>
export default {
  props: ["projectInfo"],
  data() {
    return {};
  },
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