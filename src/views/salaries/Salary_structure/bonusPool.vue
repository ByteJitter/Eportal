<template>
  <v-container fluid grid-list-xl>

     <v-layout class="search">
      <v-flex xs12 sm2 md3>
        <v-autocomplete :items="typeList" label="请选择/输入奖金池类型"  item-text="1"  item-value="0" v-model="bonusPoolType"  no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
       <v-flex xs12 sm2 md3>
        <v-autocomplete :items="periodList" label="请选择/输入奖金池周期" v-model="period"  no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
       <v-flex xs12 sm6 md1 ml-4 mt-1>
        <v-btn color="info" class="button" @click="handleSearch(true)">
          <v-icon>search</v-icon>搜索
        </v-btn>
      </v-flex>
      <v-flex xs12 sm6 md2 ml-4 mt-1>
        <v-btn color="info" class="button" @click="handleAdd()">
          <v-icon>add</v-icon>添加奖金池
        </v-btn>
      </v-flex>
    </v-layout>
    <v-dialog v-model="showAddDialog" persistent max-width="800px">
      <v-card>
        <v-card-title>
          <v-flex md3 class="headline pt-3 pl-3">{{ operate }}奖金池</v-flex>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap align-center>
              <v-flex xs12 sm6 md2>
                <div class="subtitle-2">奖金池起始日期</div>
              </v-flex>
              <v-flex xs12 sm6 md2>
                <v-menu :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y
                  min-width="290px">
                  <template v-slot:activator="{ on }">
                    <v-text-field v-model="startDate" label="选择起始日期" prepend-icon="event" readonly v-on="on">
                    </v-text-field>
                  </template>
                  <v-date-picker v-model="startDate" locale="zh-cn"></v-date-picker>
                </v-menu>
              </v-flex>
              <v-flex xs12 sm6 md2  class="ml-5">
                <div class="subtitle-2">奖金池结束日期</div>
              </v-flex>
              <v-flex xs12 sm6 md2>
                <v-menu :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y
                  min-width="200px">
                  <template v-slot:activator="{ on }">
                    <v-text-field v-model="endDate" label="选择结束日期" prepend-icon="event" readonly v-on="on">
                    </v-text-field>
                  </template>
                  <v-date-picker v-model="endDate" locale="zh-cn"></v-date-picker>
                </v-menu>
              </v-flex>
            </v-layout>
            <v-layout wrap align-center :key="index" v-for="(item, index) in $v.addBonusPoolList.$each.$iter">
              <v-flex xs12 sm6 md2>
                <div class="subtitle-2">类型</div>
              </v-flex>
              <v-flex xs12 sm6 md3>
                <v-select :items="addTypeList" label="选择奖金池类型"  v-model="item.bonusPoolName.$model" :error-messages="bonusPoolNameErrors"></v-select>
              </v-flex>
              <v-flex xs12 sm6 md2 class="ml-5">
                <div class="subtitle-2">金额（人民币）</div>
              </v-flex>
              <v-flex xs12 sm6 md2>
                <v-text-field v-model.trim="item.bonusMoney.$model"  :error-messages="addBonusMoneyErrors" type="text" label="请输入金额"></v-text-field>
              </v-flex>
              <v-flex md1>
                <v-btn icon @click="addBonusPoolItem">
                  <v-icon size="16">mdi-plus</v-icon>
                </v-btn>
              </v-flex>
              <v-flex md1>
                <v-btn icon @click="deleteBonusPoolItem(index)" v-show="addBonusPoolList.length > 1 ? true : false">
                  <v-icon size="16">mdi-minus</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="info" @click="closeDialog" class="mb-4 mr-3">取消</v-btn>
          <v-btn color="info" @click="save" class="mb-4 mr-5">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 新增弹框end -->
    <!-- 编辑奖金池弹框start -->
    <v-dialog v-model="showEditDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <v-flex md3 class="headline pt-3 pl-3">{{ operate }}奖金池</v-flex>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap align-center>
              <v-flex xs12 sm6 md3>
                <div class="subtitle-2">类型</div>
              </v-flex>
              <v-flex xs12 sm6 md4 class="font-weight-regular">
                {{editBonusData.name}}
              </v-flex>
            </v-layout>
            <v-layout wrap align-center>
              <v-flex xs12 sm6 md3>
                <div class="subtitle-2">起始日期</div>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-menu :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y
                  min-width="290px">
                  <template v-slot:activator="{ on }">
                    <v-text-field v-model="editBonusData.period_start" label="选择起始日期" prepend-icon="event" readonly v-on="on">
                    </v-text-field>
                  </template>
                  <v-date-picker v-model="editBonusData.period_start" locale="zh-cn"></v-date-picker>
                </v-menu>
              </v-flex>
            </v-layout>
            <v-layout wrap align-center>
              <v-flex xs12 sm6 md3>
                <div class="subtitle-2">结束日期</div>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-menu :close-on-content-click="false" :nudge-right="40" transition="scale-transition" offset-y
                  min-width="200px">
                  <template v-slot:activator="{ on }">
                    <v-text-field v-model="editBonusData.period_end" label="选择结束日期" prepend-icon="event" readonly v-on="on">
                    </v-text-field>
                  </template>
                  <v-date-picker v-model="editBonusData.period_end" locale="zh-cn"></v-date-picker>
                </v-menu>
              </v-flex>
            </v-layout>
            <v-layout wrap align-center>
              <v-flex xs12 sm6 md3>
                <div class="subtitle-2">状态</div>
              </v-flex>
              <v-flex xs12 sm6 md1>
                <v-switch v-model="editBonusData.status"></v-switch>
              </v-flex>
            </v-layout>
            <v-layout wrap align-center mb-5>
              <v-flex xs12 sm6 md3>
                <div class="subtitle-2">金额（人民币）</div>
              </v-flex>
              <v-flex xs12 sm6 md8>
                <v-text-field v-model.trim="$v.editBonusData.amount.$model" :error-messages="bonusMoneyErrors" type="text" label="请输入奖金池金额"></v-text-field>
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="info" @click="closeDialog" class="mb-4 mr-3">取消</v-btn>
          <v-btn color="info" @click="save" class="mb-4 mr-5">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 编辑弹框end -->
    <v-card class="mt-5 pa-5">
      <page-title :title="title" :subtitle="subtitle" />
      <v-flex md12>
        <v-data-table :headers="headers" :items="bonusPoolData" class="elevation-1" item-key="_id" no-data-text="暂无数据">
          <template v-slot:items="props">
            <td>{{ props.item.name }}</td>
            <td>{{ props.item.period_start }}~{{ props.item.period_end }}</td>
            <td>{{ props.item.amount }}</td>
            <td>
              <v-icon :color="props.item.status?'success':'error'">
                fiber_manual_record</v-icon>
            </td>
            <td class="text-xs-center">
              <v-btn small color="info" @click="handleEdit(props.item)">编辑</v-btn>
              <v-btn small color="info" @click="confirmDialog(props.item)">删除</v-btn>
            </td>
          </template>
        </v-data-table>
      </v-flex>
    </v-card>
    <!-- 确认删除弹框 -->
    <confirm-dialog ref="confirmDialog" @enableDelete="enableDelete" />
    <!-- snackBar -->
    <snackbar ref="snackbar" />
  </v-container>
</template>
<script>
import snackbar from "@/views/components/snackbar.vue";
import pageTitle from '@/views/components/pageTitle.vue';
import Common from "@/utils/common.js";
import confirmDialog from "@/views/components/confirmDialog";
import { required, minLength } from "vuelidate/lib/validators";
import { regex } from "vuelidate/lib/validators/common";

const money = regex('plusOrMinusFloatNum', /^([1-9]\d*)+(\.\d+)?$/);

export default {
  components: { snackbar, confirmDialog, pageTitle },
  validations: {
    editBonusData: {
      amount: { required, money }
    },
    addBonusPoolList:  {
      required,
      minLength: minLength(1),
      $each: {
        bonusPoolName: { required },
        bonusMoney: { required, money }
      }
    }
  },
  name: "bonusPool",
  data: () => ({
    title: "员工薪资结构",
    subtitle: "奖金池管理",
    startDate: new Date().toISOString().substr(0, 10),
    endDate: new Date().toISOString().substr(0, 10),
    bonusPoolType: "全部", // 奖金池类型
    currBonusPoolType:"全部",
    typeList: [], // 奖金池类型列表
    addTypeList: [], // 新增时的类型列表
    period: "全部", // 奖金池周期
    currPeriod:"全部",
    periodList: [], // 奖金池周期列表
    headers: [
      { text: "类型", value: "name", sortable: false },
      { text: "周期", value: "period", sortable: false },
      { text: "金额(人民币)", value: "amount", sortable: false },
      { text: "状态", value: "status", sortable: false },
      { text: "操作", align: "operate", sortable: false }
    ],
    bonusPoolData: [], // 奖金池数据
    showAddDialog: false, // 控制新增弹框
    showEditDialog: false, // 控制编辑弹框
    operate: "", // 弹框进行的操作（edit or add）
    delItem: null, // 要删除的奖金池
    addBonusPoolList: [{bonusPoolName: "", bonusMoney: ""}], // 添加奖金池时的奖金池表单
    editBonusData: {
      name: "",
      _id: "",
      period_start: "",
      period_end: "",
      status: true,
      amount: 0
    }
  }),
  computed: {
    bonusMoneyErrors() {
      const errors = [];
      if (!this.$v.editBonusData.amount.$dirty) return errors;
      !this.$v.editBonusData.amount.required && errors.push("不能为空");
      !this.$v.editBonusData.amount.money && errors.push("请输入大于0的数字");
      return errors;
    },
    bonusPoolNameErrors() {
      const errors = [];
      for (let i = 0; i < this.addBonusPoolList.length; i++) {
        if (!this.$v.addBonusPoolList.$each[i].bonusPoolName.$dirty) return errors;
        !this.$v.addBonusPoolList.$each[i].bonusPoolName.required && errors.push("不能为空");
      }
      return errors;
    },
    addBonusMoneyErrors() {
      const errors = [];
      for (let i = 0; i < this.addBonusPoolList.length; i++) {
        if (!this.$v.addBonusPoolList.$each[i].bonusMoney.$dirty) return errors;
        !this.$v.addBonusPoolList.$each[i].bonusMoney.required && errors.push("不能为空");
        !this.$v.addBonusPoolList.$each[i].bonusMoney.money && errors.push("请输入大于0的数字");
      }
      return errors;
    }
  },
  watch: {
    startDate(date){
      let endDate = new Date(date);
      endDate.setFullYear(endDate.getFullYear() + 1);
      endDate.setDate(endDate.getDate() - 1);
      this.endDate = endDate.toISOString().substr(0, 10);
    },
    bonusPoolType(){
      this.effectiveDate();
    }
    
  },
  mounted() {
    this.getBonusPoolType();
    this.getBonusPoolData(false,this.bonusPoolType,this.period );
  },
  methods: {
    async getBonusPoolType() {
      const { data } = await this.$request.fetch('/api/thr/getThr', { thrType: 'bonusPoolType' });
      if (data.status === 200) {
        data.result.forEach(item => {
          this.typeList.push(item);
          this.addTypeList.push(item[1]);
        })
        this.typeList.unshift('全部');
      }else {
        this.$refs.snackbar.showError();
      }
    },
    handleSearch(showSnackbar = true) {
      this.getBonusPoolData(showSnackbar,this.bonusPoolType,this.period);
      this.currBonusPoolType = this.bonusPoolType
      this.currPeriod = this.period
    },
    // 获取页面数据&搜索
    async getBonusPoolData(isSearch = false,currBonusPoolType,currPeriod) {
      const param = {thrType:"bonusPoolType"}
      if(currPeriod && currPeriod != "全部"){
        currPeriod && (param.period_start = currPeriod.split("~")[0]);
        currPeriod && (param.period_end = currPeriod.split("~")[1]);
      }else{
        param.period_start = ""
        param.period_end = ""
      }
      param.thrId = currBonusPoolType && currBonusPoolType !== '全部' ? currBonusPoolType : ""
      const { data } = await this.$request.fetch("/api/salaryStructure/bonusPool", param);
      if (data.status === 200) {
        this.bonusPoolData = data.result;
        if(!isSearch){
          this.periodList = []
          data.result.map(item => {
            this.periodList.push(`${item.period_start}~${item.period_end}`); 
          })
          this.periodList.sort().reverse();
          this.periodList.unshift("全部")
        }
        isSearch && this.$refs.snackbar.showStatus("search");
      } else {
        isSearch ? this.$refs.snackbar.showStatus("search", false) : this.$refs.snackbar.showError();
      }
    },
    //切换类型更改有效日期
    async effectiveDate(){
      this.period = "全部"
      const param = {thrType:"bonusPoolType",period_start:"", period_end:""}
      param.thrId = this.bonusPoolType && this.bonusPoolType !== '全部' ? this.bonusPoolType : ""
      const { data } = await this.$request.fetch("/api/salaryStructure/bonusPool", param);
      if(data.status === 200){
        this.periodList = []
        data.result.forEach(item => {
          let period = item.period_start + '~' + item.period_end
          this.periodList.push(period)
        })
        this.periodList.sort().reverse();
        this.periodList.unshift("全部")
      }  
    },
    // 控制弹框显示与隐藏
    handleAdd() {
      this.operate = "新增";
      this.showAddDialog = true;
      this.startDate = new Date().toISOString().substr(0, 10);
      let endDate = new Date(this.startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      endDate.setDate(endDate.getDate() - 1);
      this.endDate = endDate.toISOString().substr(0, 10);
    },

    // 添加奖金池时添加多条奖金池
    addBonusPoolItem() {
      this.$v.$reset();
      this.addBonusPoolList.push({ bonusPoolName: '', bonusMoney: '' });
    },
    deleteBonusPoolItem(index) {
      this.$v.$reset();
      this.addBonusPoolList.splice(index, 1);
    },

    // 编辑奖金池
    handleEdit(item) {
      this.operate = "编辑";
      this.showEditDialog = true;
      this.editBonusData = Object.assign({}, item);
    },

    closeDialog() {
      this.$v.$reset();
      this.showAddDialog = false;
      this.showEditDialog = false;
      this.addBonusPoolList = [{ bonusPoolName: '', bonusMoney: '' }];
    },

    // 点击保存进行的新增/编辑操作
    save: Common.throttle(async function() {
      if (this.operate === "新增") {
        this.$v.addBonusPoolList.$touch();
        if (this.$v.addBonusPoolList.$invalid) return;

        const param = this.addBonusPoolList;
        param.forEach(item => {
          item.status = true;
          item.period_start = this.startDate;
          item.period_end = this.endDate;
          item.name = item.bonusPoolName;
          delete item.bonusPoolName;
          item.amount = Number(item.bonusMoney);
          delete item.bonusMoney;
        })
        const { data } = await this.$request.fetch("/api/salaryStructure/bonusPool", {'bonusPoolList': param}, "post");
        if (data.status === 200) {
          this.$refs.snackbar.showStatus("add");
          this.showAddDialog = false;
          this.getBonusPoolData(false,this.currBonusPoolType,this.currPeriod );
          this.periodList.push(`${this.addBonusPoolList[0].period_start}~${this.addBonusPoolList[0].period_end}`);
          this.periodList.sort().reverse();
        } else if(data.status === 504){
          this.$refs.snackbar.showError(data.msg);
        } else {
          this.$refs.snackbar.showStatus("add", false);
        }
        this.addBonusPoolList = [{bonusPoolName: "", bonusMoney: ""}];
      } else { // 编辑
        this.$v.editBonusData.amount.$touch();
        if (this.$v.editBonusData.amount.$invalid) {
          return;
        }
        this.editBonusData.amount = Number(this.editBonusData.amount);

        const { data } = await this.$request.fetch("/api/salaryStructure/bonusPool", this.editBonusData, "put");
        if (data.status === 200) {
          this.$refs.snackbar.showStatus("edit");
          this.getBonusPoolData(false,this.currBonusPoolType,this.currPeriod );
        } else if(data.status === 504){
          this.$refs.snackbar.showError("该奖金池不可修改");
        } else {
          this.$refs.snackbar.showStatus("edit", false);
        }
        this.showEditDialog = false;
      }
      this.$v.$reset();
    }),
    // 确认删除弹框
    confirmDialog(item) {
      this.delItem = item;
      this.$refs.confirmDialog.show();
    },
    // 删除奖金池
    async enableDelete() {
      const param = { _id: this.delItem._id };
      const { data } = await this.$request.fetch("/api/salaryStructure/bonusPool", param, "delete");
      if (data.status === 200) {
        this.$refs.snackbar.showStatus("delete");
        this.getBonusPoolData(false,this.currBonusPoolType,this.currPeriod);
      } else if(data.status === 504){
        this.$refs.snackbar.showError("该奖金池不可删除");
      } else {
        this.$refs.snackbar.showStatus("delete", false);
      }
    }
  }
};
</script>
<style scoped>
@import "../../../assets/css/common.css";
.search {
  padding-left: 60px;
}
</style>
