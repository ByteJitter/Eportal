<template>
  <v-container fluid grid-list-xl>
    <!-- 搜索 -->
    <div class="search">
      <v-layout>
          <v-form>
            <v-autocomplete v-model="selectEmployeeId" :disabled="isUpdating"  :items="employeeData"  filled chips label="请选择/输入员工姓名"  item-text="name"  item-value="_id" multiple  no-data-text="暂无数据">
              <!-- <template v-slot:selection="data">
                <v-chip
                  :input-value="data.selected"
                  close
                  @click:close="remove(data.item)"
                >
                  {{ data.item.name }}
                </v-chip>
              </template> -->
            </v-autocomplete>
          </v-form>
        <v-flex xs12 sm6 md1>
          <v-btn color="info" @click="search()">
            <v-icon>search</v-icon>搜索
          </v-btn>
        </v-flex>
      </v-layout>
      <v-layout>
        <v-flex xs12 sm6 md2>
          <v-autocomplete :items="bonusType" label="请选择奖金类型" v-model="bonusTypeSelected"  item-text="1"  item-value="0" required :error-messages="typeError" @blur="$v.bonusTypeSelected.$touch()" @change="$v.bonusTypeSelected.$touch()" no-data-text="暂无数据">
          </v-autocomplete>
        </v-flex>
        <v-flex xs12 sm2 md3 v-if="isShowDate">
          <v-autocomplete  :items="selectBonusDate" label="请选择/输入奖金池日期" v-model="bonusDate" item-text="name" item-value="_id" no-data-text="暂无数据"></v-autocomplete>
        </v-flex>
        <v-flex xs12 sm2 md2>
          <v-menu v-model="isExpectDate" :close-on-content-click="false" :nudge-right="40" lazy transition="scale-transition" offset-y full-width min-width="100px">
            <template v-slot:activator="{ on }">
              <v-text-field v-model="expectDate" label="请选择预计发放日期" prepend-icon="event" readonly v-on="on"></v-text-field>
            </template>
            <v-date-picker v-model="expectDate" locale="zh-cn" @input="closeExpectDate()" type="month"></v-date-picker>
          </v-menu>
        </v-flex>
      </v-layout>
    </div>
    <div class="bg">
      <v-flex class="headerlist" md12>
        <p>员工薪资结构</p>
        <p>奖金计算</p>
      </v-flex>
      <v-flex md12>
        <v-data-table v-model="selected" :headers="headers" :items="bonusData" :pagination.sync="pagination" select-all item-key="_id" class="elevation-1" no-data-text="暂无数据">
          <template v-slot:headers="props">
            <tr>
              <th>
                <v-checkbox :input-value="props.all" :indeterminate="props.indeterminate" primary hide-details @click.stop="toggleAll"></v-checkbox>
              </th>
              <th v-for="header in props.headers" :key="header.text">{{ header.text }}</th>
            </tr>
          </template>
          <template v-slot:items="props">
            <tr :active="props.selected" @click="props.selected = !props.selected">
              <td class="text-xs-center">
                <v-checkbox :input-value="props.selected" primary hide-details></v-checkbox>
              </td>
              <td class="text-xs-center">{{ props.item.name }}</td>
              <td class="text-xs-center">{{ props.item.department_id.name}}</td>
            </tr>
          </template>
        </v-data-table>
      </v-flex>
      <v-layout>
        <v-flex class="btnCalculate">
          <v-btn color="info" @click="calculate()">计算奖金</v-btn>
        </v-flex>
      </v-layout>
    </div>
    <!-- 弹框 -->
    <snackbar ref="snackbar" />
  </v-container>
</template>
<script>
import { required } from "vuelidate/lib/validators";
import Common from "../../../utils/common";
import snackbar from "../../components/snackbar";
export default {
  components: { snackbar},
  validations: {
    bonusTypeSelected: { required }
  },
  data() {
    return {
      startPeriod: new Date().toISOString().substr(0, 10),
      isStartDate: false,
      endPeriod: new Date().toISOString().substr(0, 10),
      isEndDate: false,
      expectDate: new Date().toISOString().substr(0, 7),
      isExpectDate: false,
      selectEmployeeId:["全部"],
      bonusTypeSelected: "",
      employeeData: [],
      bonusType: [],
      pagination: {
        sortBy: "name"
      },
      selected: [],
      headers: [
        { text: "员工姓名", align: "center", value: "name" },
        { text: "所在部门", align: "center" }
      ],
      bonusData: [],
      autoUpdate: true,
      isUpdating: false,  
      selectBonusDate:[],
      bonusDate:"" ,
      isShowDate:true
    };
  },
  computed: {
    typeError() {
      let  err = [];
      if (!this.$v.bonusTypeSelected.$dirty) {
        return err;
      }
      !this.$v.bonusTypeSelected.required && err.push("请输入奖金类型");
      return err;
    }
  },
  mounted() {
    this.getBonusCalculate(this.selectEmployeeId);
    this.getBonusType()
  },
  methods: {
    async getBonusType(){
      let {data} = await this.$request.fetch("/api/thr/getThr",{thrType:'bonusType' });
      if(data.status === 200){
        data.result.forEach(item => {
          this.bonusType.push(item)
        })
      }
    },
    async getBonusCalculate(selectEmployeeId,type) {
      let param = selectEmployeeId && selectEmployeeId.indexOf("全部") !== -1 ? {} : { employeeId: selectEmployeeId };
      let res = await this.$request.fetch( "/api/salaryStructure/valueIndexSearch", param);
      if (res.data.status === 200) {
        this.bonusData = res.data.result;
        this.employeeData.unshift("全部");
        for (let i = 0; i < res.data.result.length; i++) {
          this.employeeData.push(res.data.result[i]);
        }
        if(type === "search"){
          this.$refs.snackbar.showStatus("search")
        }
      } else {
        if(type === "search"){
          this.$refs.snackbar.showStatus("search",false)
        }else{
          this.$refs.snackbar.showError();
        }
      }
    },
    search: Common.throttle(async function() {
      if(this.selectEmployeeId.length == 0){
        this.$refs.snackbar.show("搜索内容不能为空", "error");
        return false
      }
      this.getBonusCalculate(this.selectEmployeeId,"search")
    }),

    async calculate() {
      this.$v.$touch();
      if (this.bonusTypeSelected == "") {
        this.$refs.snackbar.show("请选择奖金类型","error")   
        return false;
      }
      if (this.selected == "") {
        this.$refs.snackbar.show("请至少选择一个员工", "error");
        return false;
      }
      let employeeIds = [];
      for (const iterator of this.selected) {
        employeeIds.push(iterator._id);
      }
      let param = {
        employeeIdArr: employeeIds,
        date: this.expectDate,
        period:this.bonusDate,
        thrId: this.bonusTypeSelected,
        thrType:"bonusType",
      };
      let res = await this.$request.fetch(  "/api/salaryStructure/bonuswait", param, "post");
      if (res.data.status === 200) {
        this.$refs.snackbar.show("奖金计算成功", "info");
        this.selected = []
      } else if (res.data.status === 400) {
        this.$refs.snackbar.show("请选择正确的奖金池日期", "error");
      } else {
        this.$refs.snackbar.show("奖金计算失败", "error");
      }
      
      // this.$v.$reset();
    },
    toggleAll() {
      if (this.selected.length) {
        this.selected = [];
      } else {
        this.selected = this.bonusData;
      }
    },
    //TODO:是否可以排序？？？？
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    },
    closeStartDate() {
      this.isStartDate = false
    },
    closeEndDate() {
      this.isEndDate = false
    },
    closeExpectDate() {
      this.isExpectDate = false
    },
    //TODO:点击chips的×
    remove (item) {
      const index = this.selectEmployeeId.indexOf(item.name)
      if (index >= 0) this.selectEmployeeId.splice(index, 1)
    },
    async effectiveDate(){
      this.selectBonusDate = []
      if(this.bonusTypeSelected === 1004){
        this.isShowDate = false
      }else{
        this.isShowDate = true
      }
      let {data} = await this.$request.fetch("/api/salaryStructure/periodByBonusType",{bonusTypeId:this.bonusTypeSelected,type:"bonusType"})
      if(data.status === 200){
        data.result.forEach(item => {
          let period = item.period_start + '~' + item.period_end
          this.selectBonusDate.push(period)
        })
        this.selectBonusDate.sort().reverse();
        return
      }
      
    }
  },
  watch:{
    bonusTypeSelected(val){
      this.effectiveDate()
    }
  }
};
</script>
<style scoped>
.btn_color {
  background: rgb(148, 147, 147) !important;
  color: black !important;
}
.btnCalculate {
  text-align: right;
}
.btnCalculate button {
  margin: 20px 80px 0 0;
}
.search {
  margin-top: -40px;
  padding-left: 60px;
}
.search button {
  border-radius: 10px;
  margin-top: 15px;
}
.headerlist {
  background-color: #e0e1e2;
  border-radius: 10px;
  padding: 10px 20px;
  margin: -75px 0 30px;
}
.headerlist p:nth-of-type(2) {
  color: #333333;
  font-size: 13px;
  margin-top: -15px;
  margin-bottom: 0px;
}
.bg {
  box-shadow: 0 0 5px #979797;
  padding: 50px;
  margin-top: 50px;
}
</style>