<template>
  <div>
    <!-- 顶部 -->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex xs3>
          <v-autocomplete :items="selectDesserts" item-text="name" item-value="name" no-data-text="暂无数据" v-model="tempEmployeeId" label="请选择/输入员工姓名"></v-autocomplete>
        </v-flex>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="getEmployeeInfo">
          <v-icon left>search</v-icon>
          搜索
        </v-btn>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleAdd">
          <v-icon left>add</v-icon>
          增加
        </v-btn>
      </v-layout>
    </v-container>
    <!-- 表格 -->
    <div class="classify-bg">
      <v-flex xs12 class="classify-bg-flex">
        <p>员工信息管理</p>
        <p>员工信息</p>
      </v-flex>
      <v-data-table :headers="headers" no-data-text="暂无数据" :items="desserts" class="elevation-1">
        <template v-slot:items="props">
          <td class="text-xs-center">{{ props.item.name }}</td>
          <td class="text-xs-center">{{ props.item.entry_time }}</td>
          <td class="text-xs-center">{{ props.item.is_manager==true ? '是':'否'}}</td>
          <td class="text-xs-center">{{ props.item.itemDep[0].name}}</td>

          <td class="text-xs-center">{{ props.item.task_count}}</td>
          <td class="text-xs-center">{{ props.item.value_index}}</td>
          <td class="justify-center layout px-0">
            <v-btn color="info" @click="handleEdit(props.item)">查看详情</v-btn>
            <v-btn color="info" @click="handleDelete(props.item)">删除</v-btn>
          </td>
        </template>
      </v-data-table>
    </div>
        <v-dialog v-model="dialog" persistent max-width="600px">
          <v-card>
            <v-container grid-list-md class="delcontainer">你确定要删除吗?</v-container>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
              <v-btn color="blue darken-1" flat @click="handleSave">确定</v-btn>
            </v-card-actions>
            <span class="delSpan" @click="close">X</span>
          </v-card>
        </v-dialog>
    <!-- 弹框 -->
    <snackbar ref="snackbar"/>
  </div>
</template>
<script>
import snackbar from '../../components/snackbar.vue';

export default {
  components: {snackbar},
  name: "Employee",
  data() {
    return {
      dialog: false,
      titleTip: "",
      editedIndex: -1,
      selectDesserts: [],
      employeeId: "全部",
      tempEmployeeId: "全部",
      //编辑弹框绑定数据
      editedItem: {
        name: ""
      },
      defaultItem: {
        name: ""
      },
      headers: [
        {text: "姓名", align: "center", sortable: false, value: "name"},
        {text: "入职日期", align: "center", sortable: false, value: "name"},
        {text: "是否为主管", align: "center", sortable: false, value: "name"},
        {text: "所在部门", align: "center", sortable: false, value: "name"},
        {text: "任务点数", align: "center", sortable: false, value: "name"},
        {text: "Value Index", align: "center", sortable: false, value: "name"},
        {text: "操作", align: "center", value: "操作", sortable: false}
      ],
      desserts: [],
      value: null, // 标记要删除的用户
    };
  },
  mounted() {
    this.getAllEmp();
  },
  methods: {
    async getAllEmp() {
      let allEmp = await this.$request.fetch("/api/employee/getEmployee_department");
      if (allEmp.data.status === 200) {
        this.desserts = allEmp.data.result;
        this.selectDesserts = ['全部', ...allEmp.data.result];
      } else {
        this.$refs.snackbar.showError();
      }
    },
    //获取数据时员工信息表与部门表连接
    async getEmployeeInfo(flag) {
      if (flag !== true) this.employeeId = this.tempEmployeeId;
      let empId = this.employeeId;
      let allEmp = await this.$request.fetch("/api/employee/getEmployee_department", empId === '全部' ? null : {id: empId});

      if (allEmp.data.status !== 200) {
        this.$refs.snackbar.showStatus('search', false);
        return false;
      }
      this.desserts = allEmp.data.result;
      // 只有是搜索的时候，才展示搜索成功的提示
      if (empId && empId !== '全部') {
        this.$refs.snackbar.showStatus('search');
      }
    },
    handleAdd() {
      this.$router.push({
        name: "addEmployee",
        params: {
          desserts: this.desserts
        }
      });
    },
    handleEdit(item) {
      localStorage.setItem("editUser", JSON.stringify(item));
      this.$router.push({
        name: "detailEmployee",
      });
    },
    handleDelete(value) {
      this.dialog = true;
      this.value = value;
    },
    async handleSave() {

      let {data} = await this.$request.fetch("/api/employee/deleteEmp", {_id: this.value._id}, "delete");
      this.dialog = false;
      if(data.status !== 200){
        this.$refs.snackbar.showStatus('delete', false);
        return false;
      }
      if(!this.desserts || this.desserts.length <= 1){
        this.tempEmployeeId = "全部";
        await this.getAllEmp();
      } else {
        await this.getEmployeeInfo(true);
      }
      this.$refs.snackbar.showStatus('delete', true);
      // 需要同步更新下拉框中的数据。
      let tempSelectDesserts = ["全部"];
      let deleteEmpName = this.value.name;
      for(let i = 0 ; i < this.selectDesserts.length; i++){
        if(deleteEmpName !== this.selectDesserts[i].name){
          tempSelectDesserts.push(this.selectDesserts[i]);
        }
      }
      this.selectDesserts = tempSelectDesserts;
    },
    close() {
      this.dialog = false;
    },
  }
};
</script>
<style scoped>
  @import "../../../assets/css/classify.css";
  .delcontainer {
    padding: 30px;
    font-size: 20px;
    position: relative;
  }
  .delSpan {
    position: absolute;
    top: 15px;
    right: 25px;
    cursor: pointer;
  }
</style>
