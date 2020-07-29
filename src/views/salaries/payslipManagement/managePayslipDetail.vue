<template>
  <v-container fluid grid-list-xl>
    <div class="bg">
      <v-flex class="headerList" md12>
        <p>员工薪资单</p>
        <p>查看薪资单</p>
      </v-flex>
      <v-layout>
        <v-flex class="headerTitle" md12>
          <p>薪资单</p>
        </v-flex>
      </v-layout>

      <v-layout>
        <v-flex md4>员工姓名：{{empName}}</v-flex>
        <v-flex md4>所在部门：{{department}}</v-flex>
        <v-flex md4>日期：{{date}}</v-flex>
        <v-flex md4>状态：{{status}}</v-flex>
      </v-layout>

      <!-- 添加特别调整的弹框 -->
      <v-dialog v-model="dialog" max-width="500px">
        <v-card justify-center>
          <v-card-title>
            <v-flex class="headline" md3 offset-md5>创建内容</v-flex>
          </v-card-title>
          <v-card-text>
            <v-layout align-center ml-5>
              <v-flex xs12 sm6 md4>
                <v-subheader>内容</v-subheader>
              </v-flex>
              <!-- 嘉奖 输入 -->
              <v-flex xs12 sm6 md5 v-if="adjustType === 'reward'">
                <v-text-field v-model="specialAdjustObj.memo" placeholder="输入内容" @change="$v.specialAdjustObj.memo.$touch()" required :error-messages="memoErrors"></v-text-field>
              </v-flex>
              <!-- 调整 选择 -->
              <v-flex xs12 sm6 md5 v-else>
                <v-select v-model="specialAdjustObj.memo" :items="selectItem" item-text="name" label="选择内容" no-data-text="暂无数据" @change="adjustSelect(specialAdjustObj.memo)" required :error-messages="memoErrors"></v-select>
              </v-flex>
            </v-layout>
            <!-- 如果选择加班/值班 -->
            <v-layout align-center ml-5 v-if="showWorkTime">
              <v-flex xs12 sm6 md4>
                <v-subheader>时数</v-subheader>
              </v-flex>
              <v-flex xs12 sm6 md5>
                <v-text-field v-model="workTime" placeholder="输入加班时数" :error-messages="timeErrors" required @change="$v.workTime.$touch()"></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout align-center ml-5>
              <v-flex xs12 sm6 md4>
                <v-subheader>金额</v-subheader>
              </v-flex>
              <v-flex xs12 sm6 md5>
                <v-text-field placeholder="输入金额" v-model="specialAdjustObj.amount" @change="$v.specialAdjustObj.amount.$touch()" required :error-messages="amountErrors"></v-text-field>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
            <v-btn color="blue darken-1" flat @click="saveReward">创建</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- 表格start -->
      <v-flex md12>
        <v-layout>
          <v-flex class="smallTitle" md12>
            <p>基本薪资</p>
          </v-flex>
        </v-layout>
        <v-data-table :headers="basicSalaryTable" :items="basicSalaryList" class="elevation-1" hide-actions no-data-text="暂无基本薪资项">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.category_id && props.item.category_id.name }}</td>
            <td class="text-xs-center">{{ props.item.grade_id && props.item.grade_id.name }}</td>
            <td class="text-xs-center">{{ props.item.level_id && props.item.level_id.name }}</td>
            <td class="text-xs-center">{{ props.item.amount }}</td>
          </template>
        </v-data-table>
        <v-layout>
          <v-flex class="smallTitle" md12>
            <p>每月加给</p>
          </v-flex>
        </v-layout>
        <v-data-table :headers="addedSalaryTable" :items="addedSalaryList" class="elevation-1" hide-actions no-data-text="暂无每月加给项">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.category_id.name }}</td>
            <td class="text-xs-center">{{ props.item.grade_id.name }}</td>
            <td class="text-xs-center">{{ props.item.amount }}</td>
          </template>
        </v-data-table>
        <v-layout>
          <v-flex class="smallTitle" md12>
            <p>绩效奖金</p>
          </v-flex>
        </v-layout>
        <v-data-table :headers="performanceTable" :items="performanceList" class="elevation-1" hide-actions no-data-text="暂无绩效奖金项">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.period }}</td>
            <td class="text-xs-center">{{ props.item.amount }}</td>
            <td class="text-xs-center">{{ props.item.estimate_pay_date }}</td>
          </template>
        </v-data-table>
        <v-layout>
          <v-flex class="smallTitle" md12>
            <p>双薪</p>
          </v-flex>
        </v-layout>
        <v-data-table :headers="doublePayTable" :items="doublePayList" class="elevation-1" hide-actions no-data-text="暂无双薪项">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.period }}</td>
            <td class="text-xs-center">{{ props.item.amount }}</td>
          </template>
        </v-data-table>
        <v-layout>
          <v-flex class="smallTitle" md12>
            <p>分红</p>
          </v-flex>
        </v-layout>
        <v-data-table :headers="bonusTable" :items="bonusList" class="elevation-1" hide-actions no-data-text="暂无分红项">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.bonus_type }}</td>
            <td class="text-xs-center">{{ props.item.period }}</td>
            <td class="text-xs-center">{{ props.item.amount }}</td>
          </template>
        </v-data-table>

        <v-layout>
          <v-flex class="smallTitle" md12>
            <p>特别调整</p>
          </v-flex>
        </v-layout>
        <v-layout>
          <v-flex class="smallTitle" md1>
            <p>嘉奖</p>
          </v-flex>
          <v-flex md1 v-if="status === '草稿'?true:false">
            <v-btn color="primary" @click="addSpecailAdjust('reward')">增加</v-btn>
          </v-flex>
        </v-layout>
        <v-data-table :headers="rewordTable" :items="rewardList" class="elevation-1" hide-actions no-data-text="暂无嘉奖项">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.memo }}</td>
            <td class="text-xs-center">{{ props.item.amount }}</td>
            <td class="text-xs-center" v-if="showOperate && status === '草稿'">
              <v-btn small color="primary" @click="confirmDialog(props.item)">删除</v-btn>
            </td>
          </template>
        </v-data-table>
        <v-layout>
          <v-flex class="smallTitle" md1>
            <p>调整</p>
          </v-flex>
          <v-flex md1 v-if="status === '草稿'?true:false">
            <v-btn color="primary" @click="addSpecailAdjust('adjust')">增加</v-btn>
          </v-flex>
        </v-layout>
        <v-data-table :headers="adjustTable" :items="adjustList" class="elevation-1" hide-actions no-data-text="暂无调整项">
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.memo }}</td>
            <td class="text-xs-center">{{ props.item.amount }}</td>
            <td class="text-xs-center" v-if="showOperate && status === '草稿'">
              <v-btn small color="primary" @click="confirmDialog(props.item)">删除</v-btn>
            </td>
          </template>
        </v-data-table>
        <!-- 表格end -->

        <!-- 底栏操作 -->
        <v-layout class="total">
          <v-flex>
            <span>本月薪资总额:{{totalSalary}}</span>
          </v-flex>
        </v-layout>
        <v-layout pa-4>
          <v-spacer></v-spacer>
          <v-btn small color="primary" v-if="status==='草稿'?true:false" @click="savePayslip()">保存</v-btn>
          <v-btn small color="primary" @click="cancel()">{{status==="草稿"?"取消":"返回"}}</v-btn>
          <v-btn small color="primary" v-if="status==='草稿'?true:false" @click="publishPayslip()">发布</v-btn>
        </v-layout>

        <!-- 确认删除弹框 -->
        <confirm-dialog ref="confirmDialog" @enableDelete="enableDelete" />
      </v-flex>
    </div>
    <!-- snackBar -->
    <snackbar ref="snackbar" />>
  </v-container>
</template>
<script>
import Common from "@/utils/common";
import snackbar from "@/views/components/snackbar.vue";
import confirmDialog from "@/views/components/confirmDialog";
import { required, numeric } from "vuelidate/lib/validators";
import { regex } from "vuelidate/lib/validators/common";
import { EventBus } from "@/utils/eventBus.js";

const money = regex("plusOrMinusFloatNum", /^(\-|\+)?\d+(\.\d+)?$/);

//   showshow = regex(/^([1-9]\d?|[1-9]\d+)$/);

export default {
  name: "managePayslipDetail",
  components: { snackbar, confirmDialog },
  validations: {
    specialAdjustObj: {
      memo: { required },
      amount: { required, money }
    },
    workTime: { required, numeric }
  },
  data: () => ({
    totalSalary: 0, // 月薪资单总额
    empName: "", // 顶部员工姓名
    department: "", // 顶部员工部门
    employeeId: "",
    date: "", // 日期
    status: "", // 顶部薪资单状态
    empSalStrucIdArr: [], // 员工薪资结构id数组
    adjustType: "", // 特别调整类型
    dialog: false, // 控制增加特别调整项弹框
    specialAdjustObj: { memo: "", amount: "" }, // 添加/删除的嘉奖项
    bAndASum: 0, // 基本薪资和每月加给总额
    allBonusSum: 0, // 绩效、分红、双薪总额
    showOperate: false, // 是否显示操作栏
    basicSalaryTable: [
      // 基本薪资表头
      {
        text: "薪资组成",
        sortable: false,
        value: "composition",
        align: "center"
      },
      { text: "等级", value: "class", sortable: false, align: "center" },
      { text: "级别", value: "level", sortable: false, align: "center" },
      { text: "金额", value: "cash", sortable: false, align: "center" }
    ],
    basicSalaryList: [],
    addedSalaryTable: [
      // 每月加给表头
      {
        text: "薪资组成",
        value: "composition",
        sortable: false,
        align: "center"
      },
      { text: "等级", value: "class", sortable: false, align: "center" },
      { text: "金额", value: "cash", sortable: false, align: "center" }
    ],
    addedSalaryList: [],
    performanceTable: [
      // 绩效奖金表头
      {
        text: "绩效迄止日期",
        sortable: false,
        value: "startEnd",
        align: "center"
      },
      { text: "绩效金额", value: "cash", sortable: false, align: "center" },
      {
        text: "绩效计算日期",
        value: "calculate",
        sortable: false,
        align: "center"
      }
    ],
    performanceList: [],
    doublePayTable: [
      // 双薪表头
      { text: "所属周期", value: "year", sortable: false, align: "center" },
      { text: "金额", value: "cash", sortable: false, align: "center" }
    ],
    doublePayList: [],
    bonusTable: [
      // 分红表头
      { text: "分红类型", sortable: false, value: "class", align: "center" },
      { text: "所属周期", value: "year", sortable: false, align: "center" },
      { text: "金额", value: "cash", sortable: false, align: "center" }
    ],
    bonusList: [],
    rewordTable: [
      { text: "内容", align: "center", sortable: false, value: "contain" },
      { text: "金额", align: "center", sortable: false, value: "outTime" },
      { text: "操作", align: "center", sortable: false }
    ],
    rewardList: [],
    adjustTable: [
      { text: "内容", align: "center", sortable: false, value: "contain" },
      { text: "金额", align: "center", sortable: false, value: "outTime" },
      { text: "操作", align: "center", sortable: false }
    ],
    adjustList: [],
    selectItem: [], //调整的选择下拉框数据
    showWorkTime: false,
    workTime: "",
    basicSalarySum: 0,
    addedSalarySum: 0
  }),
  computed: {
    memoErrors() {
      const errors = [];
      if (!this.$v.specialAdjustObj.memo.$dirty) return errors;
      !this.$v.specialAdjustObj.memo.required && errors.push("不能为空");
      return errors;
    },
    amountErrors() {
      const errors = [];
      if (!this.$v.specialAdjustObj.amount.$dirty) return errors;
      !this.$v.specialAdjustObj.amount.required && errors.push("不能为空");
      !this.$v.specialAdjustObj.amount.money && errors.push("请输入数字");
      return errors;
    },
    timeErrors() {
      const errors = [];
      if (!this.$v.workTime.$dirty) return errors;
      !this.$v.workTime.required && errors.push("不能为空");
      !this.$v.workTime.numeric && errors.push("请输入数字");
      return errors;
    }
  },
  watch: {
    workTime(newval) {
      if (!newval || isNaN(newval)) {
        return;
      }

      if (this.specialAdjustObj.memo === "加班") {
        this.specialAdjustObj.amount = (
          this.basicSalarySum / 21.75 / 8 *
          newval *
          3
        ).toFixed(2);
      } else if (this.specialAdjustObj.memo === "值班") {
        this.specialAdjustObj.amount = (
          this.basicSalarySum / 21.75 / 8 *
          newval
        ).toFixed(2);
      }
    }
  },
  mounted() {
    this.empName = this.$route.query.nameCode;
    this.employeeId = this.$route.query.employeeId;
    this.date = this.$route.query.monthCode;
    this.department = this.$route.query.departmentCode;
    this.status = this.$route.query.statusCode;
    this.empSalStrucIdArr = this.$route.query.employee_salary_structure_ids;
    this.showOperate = this.$route.query.showOperate;
    if (this.showOperate === false || this.status !== "草稿") {
      this.adjustTable.pop();
      this.rewordTable.pop();
    }
    this.getPayslipDetail();
  },
  methods: {
    async getPayslipDetail() {
      const param = { _id: this.employeeId, create_date: this.date };
      let res = await this.$request.fetch(
        "/api/salaryList/payslipDetailEdit",
        param
      );
      res = res.data;
      if (res.status === 200) {
        // 基本薪资和每月加给
        res.result.employee_salary_structure_ids.map(item => {
          if (item.category_type === "基本薪资") {
            this.basicSalarySum = Common.addition(
              this.basicSalarySum,
              item.amount
            );
            this.basicSalaryList.push(item);
          } else {
            this.addedSalarySum = Common.addition(
              this.addedSalarySum,
              item.amount
            );
            this.addedSalaryList.push(item);
          }
        });
        this.bAndASum = Common.addition(
          this.basicSalarySum,
          this.addedSalarySum
        );
        // 绩效、双薪、分红
        this.performanceList = res.result.bonus_wait_id.filter(
          item => item.bonus_type === "绩效"
        );
        this.doublePayList = res.result.bonus_wait_id.filter(
          item => item.bonus_type === "双薪"
        );
        this.bonusList = res.result.bonus_wait_id.filter(
          item =>
            item.bonus_type === "一般分红" || item.bonus_type === "股权分红"
        );
        res.result.bonus_wait_id.forEach(item => {
          this.allBonusSum = Common.addition(this.allBonusSum, item.amount);
        });
        // 特别调整
        this.rewardList = res.result.special_adjust.filter(
          reward => reward.adjust_type === "嘉奖"
        );
        this.adjustList = res.result.special_adjust.filter(
          adjust => adjust.adjust_type === "调整"
        );
      } else {
        this.$refs.snackbar.show("获取数据失败，请刷新重试");
      }
      this.calculateTotalSalary();
    },

    // 计算薪资总额
    calculateTotalSalary() {
      let rewardSum = 0;
      let adjustSum = 0;
      if (this.rewardList.length !== 0) {
        this.rewardList.map(item => {
          rewardSum = Common.addition(rewardSum, Number(item.amount));
        });
      }
      if (this.adjustList.length !== 0) {
        this.adjustList.map(item => {
          adjustSum = Common.addition(adjustSum, Number(item.amount));
        });
      }
      let specialAdjustSum = Common.addition(rewardSum, adjustSum);
      this.totalSalary = Common.addition(
        Common.addition(this.bAndASum, this.allBonusSum),
        specialAdjustSum
      );
      if (this.totalSalary < 0) {
        this.totalSalary = 0;
      }
    },

    // 点击增加嘉奖项
    addSpecailAdjust(adjustType) {
      this.dialog = true;
      this.adjustType = adjustType;
      this.specialAdjustObj = { memo: "", amount: "" };
      this.selectData();
    },

    // 关闭dialog
    close() {
      this.dialog = false;
      this.$v.$reset();
    },
    // 创建特别调整项
    saveReward() {
      this.$v.$touch();
      if (this.showWorkTime && (this.$v.specialAdjustObj.memo.$invalid ||
        this.$v.workTime.$invalid ||
        this.$v.specialAdjustObj.amount.$invalid)
      ) {
        return false;
      } else if (
        this.$v.specialAdjustObj.memo.$invalid ||
        this.$v.specialAdjustObj.amount.$invalid
      ) {
        return false;
      }

      if (this.adjustType === "reward") {
        this.specialAdjustObj.adjust_type = "嘉奖";
        this.specialAdjustObj.amount = Number(this.specialAdjustObj.amount);
        this.rewardList.push(this.specialAdjustObj);
      } else {
        this.specialAdjustObj.adjust_type = "调整";
        this.specialAdjustObj.amount = Number(this.specialAdjustObj.amount);
        this.adjustList.push(this.specialAdjustObj);
      }
      this.showWorkTime = false;
      this.dialog = false;
      this.$v.$reset();
      this.calculateTotalSalary();
    },
    // 删除确认
    confirmDialog(item) {
      this.specialAdjustObj = item;
      this.$refs.confirmDialog.show();
    },

    // 调整项选择下拉框数据的获取
    async selectData() {
      let res = await this.$request.fetch("/api/classify/adjustTypeSearchList");
      if (res.data.status === 200) {
        this.selectItem = res.data.result;
      } else {
        this.$snackbar().showError("调整列表数据获取失败");
      }
    },

    // 调整项为加班/值班
    adjustSelect(item) {
      if (item === "加班" || item === "值班") {
        this.showWorkTime = true;
        this.workTime = '';
      } else {
        this.showWorkTime = false;
      }
    },

    // 删除嘉奖/调整项
    enableDelete() {
      if (this.specialAdjustObj.adjust_type === "嘉奖") {
        const index = this.rewardList.indexOf(this.specialAdjustObj);
        this.rewardList.splice(index, 1);
      } else {
        const index = this.adjustList.indexOf(this.specialAdjustObj);
        this.adjustList.splice(index, 1);
      }
      this.calculateTotalSalary();
    },

    //保存
    savePayslip() {
      this.status = "草稿";
      this.editPayslip();
    },

    //发布
    publishPayslip() {
      this.status = "待支付";
      this.editPayslip();
    },

    // 编辑月薪资单
    editPayslip: Common.throttle(async function() {
      const specialAdjustArr = [...this.rewardList, ...this.adjustList];
      const param = {
        employee_id: this.employeeId,
        status: this.status,
        create_date: this.date,
        special_adjust: specialAdjustArr
      };
      let res = await this.$request.fetch(
        "/api/salaryList/editPayslip",
        param,
        "put"
      );
      res = res.data;

      if (res.status === 200) {
        if (this.status === "草稿") {
          EventBus.$emit("showSnackbar", {
            msg: "保存薪资单成功"
          });
        } else if (this.status === "待支付") {
          EventBus.$emit("showSnackbar", {
            msg: "发布薪资单成功"
          });
        } else {
          return;
        }
        this.$router.go(-1);
      } else {
        this.$refs.snackbar.showStatus("edit", false);
      }
    }),
    cancel() {
      this.$router.go(-1);
    }
  }
};
</script>
<style scoped>
.headerList {
  background-color: #e0e1e2;
  border-radius: 10px;
  padding: 10px 20px;
  margin: -75px 0 30px;
}
.headerList p:nth-of-type(2) {
  color: #333333;
  font-size: 13px;
  margin-top: -15px;
  margin-bottom: 0px;
}
.headerTitle {
  text-align: center;
}
.headerTitle p {
  font-size: 30px;
}
.smallTitle p {
  font-size: 20px;
  margin-top: 10px;
}
.bg {
  box-shadow: 0 0 5px #979797;
  padding: 50px;
  margin-top: 30px;
}
.total {
  margin-top: 30px;
  text-align: right;
  margin-right: 50px;
}
.total span {
  font-size: 20px;
}
</style>