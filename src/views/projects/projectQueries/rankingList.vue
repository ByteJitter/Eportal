<template>
  <div>
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center style="margin-bottom:20px;">
        <v-flex md4 d-flex>
          <v-select :items="medalTypeList" v-model="medalType" label="请选择勋章类别" @change="toggleType"></v-select>
        </v-flex>
        <v-flex md3 d-flex>
          <v-autocomplete label="请输入员工姓名" :items="memberList" item-text="name" item-value="_id" v-model="employeeName" no-data-text="暂无数据"></v-autocomplete>
        </v-flex>
        <v-flex md1>
          <v-btn small round color="primary" @click="search()">
            <v-icon>search</v-icon>搜索
          </v-btn>
        </v-flex>
      </v-layout>
      <div>
        <v-layout wrap align-center>
          <v-flex md d-flex>
            <div class="classify-bg">
              <v-flex class="classify-bg-flex">
                <p>勋章</p>
                <p>勋章排行榜</p>
              </v-flex>
              <div class="table">
                <v-data-table :headers="headers" :items="rankList" class="elevation-1" no-data-text="暂无数据">
                  <template v-slot:items="props">
                    <td>{{ props.item.ranking }}</td>
                    <td>{{ props.item.employeeName }}</td>
                    <td>{{ props.item.point_sum }}</td>
                    <td>{{ props.item.level }}</td>
                  </template>
                </v-data-table>
              </div>
            </div>
          </v-flex>
        </v-layout>
      </div>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "rankingList",
  data() {
    return {
      medalTypeList: ["Collaboration", "Management"],
      medalType: "Collaboration",
      employeeName: "全部",
      memberList: ["全部"],
      isPm: false,
      headers: [
        { text: "排名", sortable: false },
        { text: "用户", sortable: false },
        { text: "点数", sortable: false },
        { text: "等级", sortable: false }
      ],
      rankList: []
    };
  },
  mounted() {
    this.getRankList();
    this.getMembers();
  },
  methods: {
    toggleType() {
      this.employeeName = "全部";
    },
    async getRankList(type) {
      let param = {
        empId: this.employeeName,
        type: this.medalType === 'Collaboration' ? 'cc' : 'pm'
      };
      if (this.employeeName === "全部") {
        param.empId = "";
      }
      let res = await this.$request.fetch(
        "/api/project/projectQueries/rankingList",
        param
      );
      if (res.data.status === 200) {
        this.rankList = res.data.result;
        if (type === "search") {
          this.$snackbar().showStatus("search");
        }
      } else {
        return this.$snackbar().showStatus("search", false);
      }
    },
    async search() {
      if (!this.employeeName) {
        return this.$snackbar().showError("请选择员工姓名");
      }
      this.getRankList("search");
    },
    async getMembers() {
      let res = await this.$request.fetch(
        "/api/projectManagement/checkout_members"
      );
      let members = res.data.result;
      if (res.data.status === 200) {
        for (const iterator of members) {
          this.memberList.push(iterator);
        }
      } else {
        return this.$snackbar().showError();
      }
    }
  }
};
</script>

<style scoped>
@import "../../../assets/css/classify.css";
.container {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  width: 100%;
  padding-bottom: 160px;
}
.table {
  background: #ffffff;
}
.td-btn {
  padding: 0px !important;
}
</style>
