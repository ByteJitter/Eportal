<!--
 * @Descripttion: 组件 - pmo管理->项目信息
 * @Author: Doris
 * @Date: 2020-02-19 08:52:04
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-04-10 13:23:35
 -->
<template>
  <div>
    <v-flex md12 d-flex>
      <div class="table-title">项目信息</div>
    </v-flex>
    <v-layout>
      <div class="table">
        <v-data-table :headers="projectHeader" :items="projectInfo" class="elevation-1" hide-actions no-data-text="暂无数据">
          <template v-slot:items="props">
            <td>{{ props.item.number }}</td>
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.status_name }}</td>
            <td>{{ props.item.manager && props.item.manager.name }}</td>
            <td>{{ props.item.level_name }}</td>
            <!-- 结案分数 -->
            <td v-if="showEdit">{{ props.item.score }}</td>
            <!-- 奖励点数 为cc+pm-->
            <td v-if="showReward">{{ props.item.reward_point }}</td>
            <!-- 点数上限 -->
            <td v-if="showMaxpoint">{{ props.item.max_point }}</td>
            <!-- 功能编辑按钮 -->
            <td class="text-xs-center" v-if="showBtnEdit">
              <v-btn color="info" dark @click="proInfoEdit(props.item)">编辑</v-btn>
            </td>
          </template>
        </v-data-table>
      </div>
    </v-layout>
    <edit-dialog :editInfo="editInfo" v-on:update="update"></edit-dialog>
  </div>
</template>
<script>
import editDialog from "@/views/projects/components/editDialog.vue";
export default {
  props: ["projectInfo", "proType", "btnEdit"],
  components: { editDialog },
  data() {
    return {
      projectHeader: [
        { text: "项目编号", value: "number", sortable: false, type: "1" },
        { text: "项目名称", value: "name", sortable: false, type: "1" },
        { text: "项目状态", value: "status", sortable: false, type: "1" },
        { text: "项目经理", value: "manager", sortable: false, type: "1" },
        { text: "项目等级", value: "level", sortable: false, type: "1" },
        { text: "结案分数", value: "score", sortable: false, type: "2" },
        { text: "奖励点数", value: "reward", sortable: false, type: "3" },
        { text: "点数上限", value: "max_point", sortable: false, type: "4" },
        {
          text: "功能",
          value: "function",
          sortable: false,
          type: "5",
          align: "center"
        }
      ],
      // 编辑按钮
      showBtnEdit: true,
      // 结案分数
      showEdit: false,
      // 奖励点数
      showReward: false,
      // 点数上限
      showMaxpoint: false,
      editInfo: {}
    };
  },
  created() {
    if (this.btnEdit === "check") {
      this.showBtnEdit = false;
      let a = this.projectHeader.filter(x => {
        return x.type != "5";
      });
      this.projectHeader = a;
    }
    if (this.proType === "end-success" || this.proType === "end-fail") {
      // 如果是已结案状态时, 结案分数 显示
      this.showEdit = true;
      let a = this.projectHeader.filter(x => {
        return x.type == "1" || x.type == "2" || x.type == "5";
      });
      this.projectHeader = a;
    } else {
      // PMO设定完成
      let a = this.projectHeader.filter(x => {
        return x.type == "1" || x.type == "5";
      });
      this.projectHeader = a;
    }
  },
  methods: {
    async proInfoEdit(item) {
      this.editInfo = item;
    },
    update(update) {
      this.$emit("update", update);
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
