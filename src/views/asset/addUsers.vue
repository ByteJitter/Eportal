
<template>
  <div>
    <v-data-table :headers="headers" :items="checkData" class="elevation-1">
      <template v-slot:no-data>
        <a class="text-md-center" @click="addEmployee">添加员工</a>
      </template>

      <template v-slot:items="props">
        <td class="text-xs-center">
          <a @click="addEmployee('link')">{{ props.item.name}}</a>
        </td>
        <td class="text-xs-center">{{ props.item.tel}}</td>
      </template>
    </v-data-table>
    <!-- 弹框 -->
    <v-dialog v-model="dialog" persistent max-width="700px" max-height="100px">
      <v-card>
        <v-card-title>选择员工</v-card-title>
        <v-card-text>
          <ul class="add-list">
             <li class="add-list-type">
                <p class="bottom_line">类型: &nbsp; 员工</p>
              </li>
            <li class="header-text">
              <span>姓名</span>
              <span>手机号</span>
            </li>
            <li v-for="(item,index) in usersList" :key="index" class="header-list">
              <span class="sub-span">
                <v-checkbox  class="sub-span-chebox" v-model="checkData" :value="item" @change="toggle(item)"></v-checkbox>
              </span>
              <span>{{item.name}}</span>
              <span>{{item.tel}}</span>
            </li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="cancel">取消</v-btn>
          <v-btn color="blue darken-1" flat @click="confirm">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 弹框 结束-->
    <snackbar ref="snackbar" />
  </div>
</template>

<script>
import snackbar from '@/views/components/snackbar.vue'
import {assetMixins} from './assetMixins';
export default {
  data() {
    return {
      dialog: false,
      total: false,
      checkData: [],
      headers: [
        { text: "姓名", align: "center", sortable: false, value: "name" },
        { text: "手机号", align: "center", sortable: false, value: "name" }
      ],
      usersList: [],
      link:''
    };
  },
  components: { snackbar },
  mixins:[assetMixins],
  methods: {
    toggle(item) {
      let index = this.checkData.indexOf(item);
      if (this.checkData.length === this.usersList.length) {
        return this.total = true;
      } 
      this.total = false;
      
    },
    cancel(){
      if(this.link === ''){
        this.checkData = [];
        this.total = [];
      }
      this.dialog = false;
    },
    confirm() {
      if(this.checkData.length <= 0){
        this.$refs.snackbar.show("请选择至少一名员工", "error");
        return
      }
      this.dialog = false;
      this.$emit("send", this.checkData);
    },
    addEmployee(type) {
      if(type === 'link'){
        this.link = 'link'
      }
      this.dialog = true;
      this.usersList = [];
      this.getEmployees();
    },
    async getEmployees(params) {
      let res = await this.$request.fetch("/api/employee/allEmployeeInfo");
      res = res.data;
      if (res.status === 200) {
        if(res.result.length > 0){
          this.usersList = await this.fliterEmployee(res.result)
        }
      } else {
        this.$refs.snackbar.show("刷新重试", "error");
      }
    },
    async fliterEmployee (employee) {
      let temp = [];
      let res = await this.$request.fetch('/api/asset/getAssetUsers')
      res = res.data
      if (res.status === 200) {
        let assetUsers
        if(res.result.length > 0){
          assetUsers = res.result.map(item=>{return item.employee_id._id})
          temp = employee.filter(item=>{
            return assetUsers.indexOf(item._id) === -1
          })
        }else{
          return employee
        }
      }
      return temp
    }
  }
};
</script>

<style  scoped>
.add-list,
.sub-add-list {
  padding: 0px 100px 0px 130px ;
  list-style: none;
  /* text-align: center; */
}
.add-list li {
  margin: 10px 20px;
}
.add-list li span,
.sub-add-list li span {
  display: inline-block;
  width: 150px;
  height: 20px;
  line-height: 20px;
}
.add-list-type{
   margin-top: 10px;
   height: 30px;
   line-height: 30px;
  font-size: 16px;
  font-weight: 700;
}
.bottom_line{
  width: 88%;
border-bottom: solid 1px black;
margin-bottom: 0;
}
.header-text {
  padding-left: 50px;
  font-size: 16px;
  font-weight: 700;
}
.sub-span{
  position: relative;
  width: 50px!important;
}
.sub-span-chebox {
position: absolute;
top:-16px;
}
</style>