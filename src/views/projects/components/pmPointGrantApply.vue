<!--
 * @Descripttion: 组件 - 项目管理->我的项目->点数发放申请列表
 * @Author: Doris
 * @Date: 2020-02-19 08:52:04
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-04-13 13:16:48
 -->
<template>
  <div>
    <v-flex md12 d-flex>
      <div class="table-title">点数发放申请列表</div>
    </v-flex>
    <v-layout wrap align-center>
      <div class="table">
        <v-data-table :headers="pointListHeader" :items="pointApply" class="elevation-1" no-data-text="暂无数据">
          <template v-slot:items="props">
            <td>{{ pointApply.indexOf(props.item) + 1 }}</td>
            <td>{{ props.item.status_name   }}</td>
            <td>{{ props.item.issue_stage_name }}</td>
            <td>{{ props.item.amountSum}}</td>
            <td class="text-xs-center">
              <v-btn small color="info" @click="checkoutPoint(props.item)">查看</v-btn>
            </td>
          </template>
        </v-data-table>
      </div>
    </v-layout>

    <v-layout justify-center>
      <v-dialog v-model="showPointCheckout" persistent max-width="792px">
        <v-card max-width="792px">
          <v-layout wrap align-center>
            <div style="width:100%">
              <v-data-table :headers="pointCheckoutHeader" :items="pointCheckoutData" class="elevation-1" hide-actions no-data-text="暂无数据">
                <template v-slot:items="props">
                  <td>{{ props.item.employeeName}}</td>
                  <td>{{ props.item.employeeEmail }}</td>
                  <td>{{ props.item.type_name }}</td>
                  <td>{{ props.item.issue_stage_name }}</td>
                  <td>{{ props.item.company }}</td>
                  <td>{{ props.item.amount }}</td>
                </template>
                <template v-slot:footer>
                  <td :colspan="pointCheckoutHeader.length">
                    <v-btn color="info" flat @click="showPointCheckout = false">关闭</v-btn>
                  </td>
                </template>
              </v-data-table>
            </div>
          </v-layout>
        </v-card>
      </v-dialog>
    </v-layout>
  </div>
</template>
<script>
import getStatus from "@/utils/getStatus";
export default {
  props:['pointApply'],
  data() {
    return {
      pointListHeader: [
        { text: "序号", align: "left", sortable: false },
        { text: "发放状态", align: "left", sortable: false },
        {
          text: "发放点数时点",
          align: "left",
          sortable: false
        },
        { text: "发放额度合计", align: "left", sortable: false },
        { text: "功能", align: "center", sortable: false }
      ],
      pointCheckoutHeader: [
        { text: "用户名", align: "left", sortable: false },
        {
          text: "电子邮件信箱",
          align: "left",
          sortable: false
        },
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
        { text: "发放总额度", align: "left", sortable: false }
      ],
      pointCheckoutData: [],
      showPointCheckout: false,
      applyFormStatus: {}
    };
  },
  
  methods: {
    checkoutPoint(item) {
      this.showPointCheckout = true;
      this.getCheckoutPoint(item._id);
    },
    async getCheckoutPoint(_id) {
      let resCheckout = await this.$request.fetch(
        "/api/projectManagement/grantApplyListDetail",
        {
          apply_form_id: _id
        }
      );
      if (resCheckout.data.status === 200) {
        this.pointCheckoutData = resCheckout.data.result;
      } else {
        this.$snackbar().showError("获取点数发放记录详情数据失败");
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
.table {
  width: 100%;
  background: #ffffff;
  box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.5);
}
</style>