<template>
  <v-container fluid grid-list-xl>
    <div class="bg">
      <v-layout class="toptitle">
        <v-flex md12>
          <span>{{tableName}}待发奖金内容</span>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex md4>
          <span>{{bonusType}}</span>
        </v-flex>
      </v-layout>
      <v-flex md12>
        <v-data-table :headers="headers" :items="bonusData" class="elevation-1" no-data-text="暂无数据">
          <template v-slot:items="props">
            <td class="text-xs-center" v-if="bonusType=='股权分红'||bonusType=='一般分红'">{{ props.item.bonus_type}}</td>
            <td class="text-xs-center" v-if="bonusType != '双薪'">{{ props.item.bonus_pool_id.period_start +'~'+ props.item.bonus_pool_id.period_end}}</td>
            <td class="text-xs-center" v-else>{{ props.item.estimate_pay_date}}</td>
            <td class="text-xs-center">{{ bonusType=="双薪"? props.item.origin_amount:props.item.amount}}</td>
            <td class="text-xs-center" v-if="(bonusType =='绩效奖金'||bonusType =='一般分红' || bonusType =='项目奖金')&& isShow == 'departmentBonusWait'">
              <v-btn small color="info" @click="editItem(props.item)" :disabled="status=='确认'||status=='核准'">编辑</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
      <v-dialog v-model="isDialog" max-width="500px" persistent>
        <v-card justify-center>
          <v-card-title>
            <v-flex class="headline" md4 offset-md1>编辑内容</v-flex>
          </v-card-title>
          <v-card-text>
            <v-layout align-center ml-4>
              <v-flex xs12 sm6 md4>
                <v-subheader>{{bonusType}}金额</v-subheader>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-text-field placeholder="请输入数字" v-model="editedItem.amount"  @change="afterAmount(editedItem.amount)"   @blur="afterAmount(editedItem.amount)"></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout align-center ml-4>
              <v-flex xs12 sm6 md4>
                <v-subheader>{{bonusType}}金额</v-subheader>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-text-field disabled label="修改前" v-model="originAmount"></v-text-field>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" flat @click="close()">取消</v-btn>
            <v-btn color="info" flat @click="saveEdit()" :disabled="isChangeAmount">确定</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-layout class="returnback">
        <v-flex md12  v-show="isShow=='departmentBonusWait'">
          <v-btn small color="info" @click="confirmItem()" :disabled="status=='确认'||status=='核准'">确认</v-btn>
        </v-flex>
        <v-flex md12 v-show="isShow=='employeeBonusWait'">
          <v-btn small color="info" @click="audit()" :disabled="status=='核准'" >审核</v-btn>
        </v-flex>
        <v-flex md2  v-show="isShow=='employeeBonusWait'">
          <v-btn small color="info" @click="toBack()">退回</v-btn>
        </v-flex>
        <v-flex md2>
          <v-btn small color="info" @click="cancel()">返回</v-btn>
        </v-flex>
      </v-layout>
    </div>
    <snackbar ref="snackbar" />
  </v-container>
</template>
<script>
import snackbar from "../../components/snackbar";
export default {
  name: "departmentPerfor",
  components: { snackbar },
  data: () => ({
    tableName: "",
    originAmount: "",
    isDialog: false,
    ok: null,
    topAmount: 0,
    bottomAmount: 0,
    isChangeAmount: false,
    editedItem: {
      _id: null,
      amount: null
    },
    defaultItem: {},
    headers: [
      { text: "类型", align: "center", value: "type", sortable: false },
      { text: "所属周期", align: "center", value: "startDate", sortable: false},
      { text: "金额", align: "center", value: "amount", sortable: false },
      { text: "功能", align: "center", sortable: false }
    ],
    bonusData: [],
    bonusType: "",
    departmentId: "",
    // adjust_permissions: 0, //主管的调整权限
    isShow: "",
    status: ""
  }),
  mounted() {
    this.getBonusDepartPerfor(false);
  },
  methods: {
    async getBonusDepartPerfor(isEdit) {
      this.tableName = this.$route.query.nameCode;
      this.bonusType = this.$route.query.bonusType;
      let period = this.$route.query.period;
      this.managerId = this.$route.query.managerId;
      this.isShow = this.$route.query.auditAndConfirm;
      this.bonusId = this.$route.query.bonusId
      if(!isEdit){
        if (this.bonusType == "股权分红" || this.bonusType == "双薪"  || this.isShow !== "departmentBonusWait" ) {
          this.headers.pop();
        }
        if (this.bonusType == "绩效奖金" || this.bonusType == "双薪" || this.bonusType == "项目奖金") { 
          this.headers.shift();  //去掉类型
          
        }
        if (this.bonusType == "双薪") {
          this.headers.splice(0,1)
          this.headers.unshift({ text: "预计发放日期", align: "center", value: "estimate_pay_date", sortable: false },)
        }
        let manageinfo = await this.$request.fetch("/api/employee/getEmployee_department", { id:  this.managerId  });
        if (manageinfo.data.status === 200) {
          this.adjustPermissions = manageinfo.data.result[0].adjust_permissions * 0.01 ;
        }
      }
      let res = await this.$request.fetch("/api/salaryStructure/bonusDetail", {
        _id: this.bonusId
      });

      if (res.data.status === 200) {
        this.bonusData = [res.data.result];
        this.status = res.data.result.status;
        this.editedItem.amount = res.data.result.amount; //绑定的值
        this.currAmount = res.data.result.amount; //amount值
        this.originAmount = res.data.result.origin_amount;  //originamount
        this.editedItem._id = res.data.result._id; 
        this.departmentId = res.data.result.department_id;
        this.topAmount = this.originAmount + this.originAmount * this.adjustPermissions;
        this.bottomAmount = this.originAmount - this.originAmount * this.adjustPermissions;
        this.bonusType = res.data.result.bonus_type
        this.employee_id = res.data.result.employee_id;
        if(res.data.result.bonus_pool_id){
          this.period = res.data.result.bonus_pool_id.period_start + "~" + res.data.result.bonus_pool_id.period_end
        }
      }  
    },
    // 思路：拿到部门的origin总 和 amolut之和，判断修改后的在不在调整范围内，在的话用amount和-拿到员工的amount金额  = 部门剩余的奖金  剩余的 + 修改后的值 和  部门origin和做比较，是否超出
    async afterAmount(amount){
      if(amount > this.topAmount || amount <  this.bottomAmount){
        this.$refs.snackbar.show("超出可调整范围","error")
        this.isChangeAmount = true;
      }else{
        let {data} = await this.$request.fetch(  "/api/salaryStructure/departmentPerformanceSum",  { period: this.period, departmentId: this.departmentId ,bonusType: this.bonusType } );
        if(data.status === 200){
          let depertmentOriginSum = Number(data.result.originAmountSum ) //部门origin和
          let depertmentOtherSum = Number(data.result.amountSum ) - this.currAmount //除去该员工后部门的和
          let currDepertmentAmountSum = depertmentOtherSum + Number(this.editedItem.amount) //其他+修改后的
          if(currDepertmentAmountSum > depertmentOriginSum){
            this.$refs.snackbar.show("超出部门总金额","error")
            this.isChangeAmount = true;
          }else{
            this.isChangeAmount = false;
          }
        }
      }
    },
    close() {
      this.isDialog = false;
    },
    editItem(item) {
      this.editedItem.amount = this.currAmount
      this.isDialog = true;
    },
    async saveEdit() {
      // 判断显示发放绩效
      this.isDialog = false;
      let  result = await this.$request.fetch("/api/salaryStructure/updateAmount", { _id: this.editedItem._id, amount: Number(this.editedItem.amount) }, "put")
      if(result.data.status === 200){
        this.getBonusDepartPerfor(true);
        this.$refs.snackbar.show("编辑成功", "info");
      }else{
        this.$refs.snackbar.show("编辑失败", "info");
      }
    },
    cancel() {
      if (this.isShow == "employeeBonusWait") {
        this.$router.push({
          path: "deMoment"
        });
      } else if (this.isShow == "departmentBonusWait") {
        this.$router.push({
          path: "departmentMoment"
        });
      } else if (this.isShow == "hrEmployeeBonusWait") {
        this.$router.push({
          path: "hrDepartmoment"
        });
      }
    },
    // 退回按钮
    async toBack() {
      let bonusWaitData = [ this.editedItem._id]
      let param = {bonusWaitIds:bonusWaitData, thrType: "bonusStatus",thrId: 1001};
      let res = await this.$request.fetch( "/api/salaryStructure/updateStatus",param, "put");
      if (res.data.status === 200) {
        this.$refs.snackbar.show("退回成功", "info");
        setTimeout(()=>{
          this.$router.push({
            path: "deMoment"
          });
        }, 1000)
       
      }else{
        this.$refs.snackbar.show("退回失败", "error");
      }
    },
    // 审核按钮
    async audit() {
      let bonusWaitData = [ this.editedItem._id]
      let param = {bonusWaitIds:bonusWaitData, thrType: "bonusStatus",thrId: 1002};
      let res = await this.$request.fetch("/api/salaryStructure/updateStatus", param, "put" );
      if (res.data.status === 200) {
        this.$refs.snackbar.show("审核成功", "info");
        setTimeout(() => {
          this.$router.push({
            path: "deMoment"
          });
        },1000)
        
      }else{
        this.$refs.snackbar.show("审核失败", "error");
      }
    },
    //确认按钮
    async confirmItem() {
      let bonusWaitData = [this.editedItem._id]
      let param = { bonusWaitIds: bonusWaitData, thrType: "bonusStatus", thrId: 1003 };
      let res = await this.$request.fetch("/api/salaryStructure/updateStatus", param, "put" );
      if (res.data.status === 200) {
        this.$refs.snackbar.show("确认成功", "info");
        setTimeout(() => {
          this.$router.push({
            path: "departmentMoment"
          });
        }, 1000)
        
      }else {
        this.$refs.snackbar.show("确认失败", "error");
      }
    }
  },
  watch: {
    isChangeAmount: function(newvsl, old) {
      return newvsl;
    }
  }
};
</script>
<style scoped>
.toptitle {
  text-align: center;
  font-size: 25px;
}
.bg {
  box-shadow: 0 0 5px #979797;
  padding: 50px;
}
.returnback {
  text-align: right;
  padding-right: 40px;
  padding-top: 40px;
}
.returnback span {
  cursor: pointer;
}
</style>
