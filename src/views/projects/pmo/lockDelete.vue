<!-- pmo 三年扣点和点数结算锁定界面 -->
<template>
<div>
<v-layout>
  <v-flex xs2>
    <v-autocomplete v-model="doneSelectYear" :items="yearList" label="请选择/输入结算年度" no-data-text="暂无数据" item-value="date" item-text="date">
    </v-autocomplete>
  </v-flex>
  <v-flex xs2>
    <v-btn round color="info" dark @click="settle()">
      <v-icon dark>done</v-icon>点数结算
    </v-btn>
  </v-flex>
  <v-flex xs2>
    <v-autocomplete v-model="selectCategory" :items="categoryList" label="请选择/输入点数类型" no-data-text="暂无数据" item-value="id" item-text="name">
    </v-autocomplete>
  </v-flex>
  <v-flex xs2>
    <v-btn round color="info" dark @click="deletePoint()">
      <v-icon dark>trending_down</v-icon>三年扣点
    </v-btn>
  </v-flex>
     <confirm-dialog ref="confirmDialog" @enableDelete="enableSettleOrDelete(lockOrdelete)" />
</v-layout>
<v-layout>
  <v-flex md12>
  <v-data-table class="elevation-1" :headers="headers" :items="deletePoints" no-data-text="暂无数据">
<template v-slot:items="props">
  <td class="text-xs-center">{{ props.item.employee_id.name }}</td>
  <td class="text-xs-center">{{ props.item.year}}</td>
  <td class="text-xs-center">{{ props.item.type| type}}</td>
  <td class="text-xs-center">{{ Math.floor(props.item.before_reduce) }}</td>
  <td class="text-xs-center">{{ props.item.before_reduce|point }}</td>
  <td class="text-xs-center">{{ props.item.amount }}</td>
  <td class="text-xs-center">{{ props.item.date|time }}</td>
  </template>
  </v-data-table>
  </v-flex>
</v-layout>
</div>
</template>

<script>
import confirmDialog from "../../components/confirmDialog";
export default {
  data () {
    return {
      selectCategory:'',
      categoryList:[{id:"cc",name:"Collaboration"},{id:"pm",name:"Management"}],
      doneSelectYear:'',
      yearList:[],
      downloadSelectYear:'',
      lockOrdelete:'lock',
      deletePoints:[],
      headers: [
        { text: "员工姓名",  sortable: false,align: 'center' },
        { text: "扣除年度",  sortable: false,align: 'center' },
        { text: "扣除类型", sortable: false,align: 'center' },
        { text: "扣除前该年度点数", sortable: false,align: 'center' },
        { text: "扣除后该年度剩余点数", sortable: false,align: 'center' },
        { text: "扣除点数", sortable: false,align: 'center' },
        { text: "扣除时间", sortable: false,align: 'center' }
      ],

    };
  },
  filters: {
    time: function(value) {
      return value.substr(0,10);
    },
    type:function(value){
      return value === 'cc' ? 'Collaboration' : 'Management'
    },
    point:function(value){
      let reducePoint = Math.floor(value * 0.1) < 1 ? 1 : Math.floor(value * 0.1);
      return Math.floor(value - reducePoint);
    }
  },
  components:{
    confirmDialog
  },
  mounted(){
    this.getYears()
    this.getDeletePoints()
  },
  methods: {
    settle(){
      if(this.doneSelectYear === ''){
        this.$snackbar().showError(`请先选择结算年度`);
        return
      }
      this.lockOrdelete = 'lock'
      this.$refs.confirmDialog.show('执行点数结算操作将锁定该年度所有点数不可调整，是否执行？');
    },
    deletePoint(){
      if(this.selectCategory === ''){
        this.$snackbar().showError(`请先选择扣除类型`);
        return
      }
      this.lockOrdelete = 'delete'
      this.$refs.confirmDialog.show('执行三年扣点操作将锁定相关年度所有点数并对失效点数进行扣减，该操作将影响勋章等级排名，不可回退，是否执行？');
    },
    async enableSettleOrDelete(type){
      if(this.lockOrdelete === 'lock'){
        // 结算成功
        // 已经结算过
        let res = await this.$request.fetch("/api/project/lockAndDelete/lockPoints",{year:this.doneSelectYear});
        if(res.data.status === 200){
          this.$snackbar().showOk(`结算成功`);
        }else{
          this.$snackbar().showError(res.data.msg);
        }
      }else{
        //扣除成功，返回受影响的列表
        let res = await this.$request.fetch("/api/project/lockAndDelete/deletePoints",{type:this.selectCategory});
        if(res.data.status === 200){
          this.getDeletePoints()
          this.$snackbar().showOk(`${this.selectCategory}类型点数扣除成功`);
        }else{
          this.$snackbar().showError(res.data.msg);
        }
      }
    },
    async getYears(){
      let res = await this.$request.fetch("/api/project/lockAndDelete/getYears");
      if(res.data.status === 200){
        this.yearList = res.data.result
      }
    },
    async getDeletePoints(){
      let res = await this.$request.fetch("/api/project/lockAndDelete/getDeletePoints");
      if(res.data.status === 200){
        this.deletePoints = res.data.result
      }
    }
  }
}

</script>
<style scoped>
</style>