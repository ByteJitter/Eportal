<template>
  <div class="addEmployee">
    <snackbar ref="snackbar"/>
    <h1>编辑员工信息</h1>
    <v-layout>
      姓 名<span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field v-model="desserts.name" @change="$v.desserts.name.$touch()" :error-messages="dessertsNameErrors" class="pleaseInput1"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      入职日期<span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-menu v-model="menu" :close-on-content-click="false"
                :nudge-right="40" lazy transition="scale-transition"
                offset-y full-width min-width="290px">
          <template v-slot:activator="{ on }">
            <v-text-field label="请选择日期" v-on="on" v-model="date" class="pleaseInput1"></v-text-field>
          </template>
          <v-date-picker v-model="date" locale="zh-cn" @input="menu = false"></v-date-picker>
        </v-menu>
      </v-flex>
    </v-layout>
    <v-layout>
      所在部门<span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select label="请选择部门" :items="departmentList" no-data-text="暂无数据" item-text="name" v-model="department" item-value="_id" @change="handledepartment">
        </v-select>
      </v-flex>
    </v-layout>
    <v-layout>
      上级主管<span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field class="pleaseInput1" readonly v-model="departmentCharge"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      是否为主管<span class="star">*</span>
      <v-switch v-model="isManager" @change="changeIsManager" class="pleaseInput"></v-switch>
    </v-layout>
    <v-layout v-if="isManager">
      调整权限<span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field @change="$v.adjustPermissions.$touch()" :error-messages="adjustPermissionsErrors" v-model="adjustPermissions"></v-text-field>
      </v-flex>%
    </v-layout>

    <v-layout>
      基本薪资
      <span @click="addBasicSalary()" class="addBasicSalary star">+</span>
    </v-layout>
    <v-layout class="selectP" :key="index" v-for="(item, index) in baseSalaryDesserts">
      <v-flex xs2 class="pleaseInput">
        <v-select label="请选择分类" no-data-text="暂无数据" :items="item.CategorySalary" item-text="name" v-model="item.category.name" @change="changeCategorySalary(item,index)"></v-select>
      </v-flex>
      <v-flex xs2 class="pleaseInput">
        <v-select label="请选择等级" :items="item.gradeSalary" no-data-text="暂无数据" item-text="name" v-model="item.grade.name" @change="changeGradeSalary(item,index)" :disabled="item.disable"></v-select></v-flex>
      <v-flex xs2 class="pleaseInput">
        <v-select label="请选择级别" no-data-text="暂无数据" :items="item.LevelSalary" item-text="name" v-model="item.level.name" @change="changeLevelSalary(item,index)" :disabled="item.disable"></v-select>
      </v-flex>
      <v-flex xs2 class="pleaseInput">
        <v-text-field label="金额" :rules="salariesRules" v-model="item.amount" :disabled="item.disable"></v-text-field>
      </v-flex>
      <span @click="delBasicSalary(item,index)" class="delBasicSalary"></span>
    </v-layout>

    <v-layout>
      每月加给
      <span class="star" @click="addSupply">+</span>
    </v-layout>
    <v-layout class="selectP" :key="'selectP-'+index" v-for="(item, index) in monthDesserts">
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select label="请选择分类" no-data-text="暂无数据" :items="item.CategoryMonth" item-text="name" v-model="item.category.name" @change="changeCategoryMonth(item,index)"></v-select>
      </v-flex>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select label="请选择等级" no-data-text="暂无数据" :items="item.gradeMonth" item-text="name" v-model="item.grade.name" @change="changeGradeMonth(item,index)" :disabled="item.disable"></v-select></v-flex>
      <v-flex xs2 class="pleaseInput">
        <v-text-field label="金额" :rules="salariesRules" v-model="item.amount" :disabled="item.disable"></v-text-field>
      </v-flex>
      <span @click="delSupply(item,index)" class="delBasicSalary"></span>
    </v-layout>
    <v-layout>
      股票数
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field class="pleaseInput1" v-model="desserts.remain_stock" readonly></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      任务点数
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field class="pleaseInput1" @change="$v.desserts.task_count.$touch()" :error-messages="dessertstask_countErrors" v-model="desserts.task_count"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      value Index
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field class="pleaseInput1" readonly v-model="desserts.value_index"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      上次value Index计算时间
      <span class="star">*</span>
      <v-flex xs2 class="pleaseInput">
        <v-text-field class="pleaseInput2" readonly v-model="desserts.last_value_index_time"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      办公地点
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field label="请输办公地点" @change="$v.desserts.workplace.$touch()" :error-messages="dessertsWorkplaceErrors" v-model="desserts.workplace" class="pleaseInput1"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      手机号码
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field label="请输入手机号码" @change="$v.desserts.tel.$touch()" :error-messages="dessertsTelErrors" v-model="desserts.tel" class="pleaseInput1"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      邮 箱
      <span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field label="请输入邮箱" @change="$v.desserts.email.$touch()" :error-messages="dessertsEmailErrors" v-model="desserts.email" class="pleaseInput1">
        </v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      绑定用户
      <span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select label="请选择用户" no-data-text="暂无数据" :items="users" item-text="name" item-value="_id" v-model="userName"></v-select>
      </v-flex>
    </v-layout>
    <v-layout class="layoutBtn">
      <v-flex xs4>
        <v-btn color="primary" @click="handleCheck">查看股票数</v-btn>
      </v-flex>
      <v-flex xs4>
        <v-btn color="primary" @click="saveEmployeeDetail">保存</v-btn>
        <v-btn color="primary" right @click="closeEmployeeDetail">取消</v-btn>
      </v-flex>
    </v-layout>
    <!-- 弹框 -->
    <!-- 查看股票弹框 -->
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-icon class="closeClear" @click="handleClear">clear</v-icon>
        <v-data-table :headers="headers" no-data-text="暂无数据" :items="dessertsStock" class="elevation-1" hide-actions>
          <template slot="headerCell" slot-scope="props">
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <span v-on="on">{{ props.header.text }}</span>
              </template>
            </v-tooltip>
          </template>
          <template v-slot:items="props">
            <td class="text-xs-center">{{ props.item.transaction_type }}</td>
            <td class="text-xs-center">{{ props.item.transaction_time }}</td>
            <td class="text-xs-center">{{ props.item.qty }}</td>
            <td class="text-xs-center">{{ props.item.remain_qty }}</td>
          </template>
        </v-data-table>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import snackbar from '../../components/snackbar.vue';
import { EventBus } from '@/utils/eventBus.js';
import { required, email, helpers, numeric } from "vuelidate/lib/validators";
const telNumber = helpers.regex('telNumber', /(^1[345789]\d{9}$)|(^9\d{8}$)/);
export default {
  components: {snackbar},
  name: "detailEmployee",
  validations: {
    desserts: {
      email:{required,email},
      tel:{required,telNumber},
      workplace:{required},
      name:{required},
      task_count:{required,numeric},
    },
    adjustPermissions: {required, numeric}
    // menu: { required },
  },
  data() {
    return {
      salariesRules: [
        v => !!(v + '') || "必填项",
        v => /^[0-9]*[0-9]*$/.test(v) || "金额不能为空，且必须是正整数"
      ],
      dialog: false,
      titleTip: "",
      desserts: {
        email:"",
        tel:"",
        workplace:"",
        name:""
      },
      isManager: false,
      // 日期
      date: new Date().toISOString().substr(0, 10),
      menu: false,
      department: null,
      departmentList:[],
      selectDepartment: "",
      baseSalaryDesserts: [],
      monthDesserts: [],
      CategorySalary: [],
      gradeSalary: [],
      LevelSalary: [],
      CategoryMonth: [],
      categortFilter: [],
      gradeMonth: [],
      CateforyGradeMonth: [],
      departmentCharge: "无", // 上级主管
      adjustPermissions: "",
      headers: [
        {text: "股票", align: "center", sortable: false, value: "name"},
        {text: "时间", align: "center", sortable: false, value: "calories"},
        {text: "股票数", align: "center", sortable: false, value: "fat"},
        {text: "剩余总股数", align: "center", sortable: false, value: "carbs"}
      ],
      dessertsStock: [],
      test: [],
      deldataId: [],
      userName: "",
      users: [],
      userId: ""
    };
  },
  mounted() {

    let temp = localStorage.getItem("editUser");
    try{
      this.desserts = JSON.parse(temp);
    }catch(e){
      this.$refs.snackbar.showError("员工信息获取失败");
      return false;
    }

    this.isManager = this.desserts.is_manager;
    this.adjustPermissions = this.desserts.adjust_permissions;
    this.selectDepartment = this.desserts.department_id;
    this.date = this.desserts.entry_time;
    this.getDepartments(); //获取所有部门数据

    try {
      Promise.all([this.changeCategory(), this.changeGrade(), this.changeLevel()])
    } catch (error) {
      this.$refs.snackbar.showError();
    }
    this.getSalary(); //获取员工的基本薪资与每月加给
    this.getAllUser();
    this.getDepCharge(); //获取默认部门主管
  },
  watch: {
    userName: function (val) {
      this.userId = val;
    }
  },
  methods: {
    changeIsManager (val) { // 监听是否为主管的v-model值==调整权限中v-if中的值
      this.isManager = val;
    },
    // 获取默认部门主管
    async getDepCharge() {
      let res = await this.$request.fetch("/api/employee/getDepartmentManger",{depId: this.desserts.itemDep[0]._id});
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showError();
        return false;
      }
      if (res.data.result[0].manager_id && res.data.result[0].manager_id.name) {
        this.departmentCharge = res.data.result[0].manager_id.name;
      }
    },
    //获取用户
    async getAllUser() {

      let res = await this.$request.fetch("/api/employee/getAllUser",{id: this.desserts._id});
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showError();
        return false;
      }
      this.users = res.data.result;
      this.users.forEach(item => {
        if (item.employee_id === this.desserts._id) {
          this.userName = item._id;
        }
      });
    },
    // 添加基本薪资
    addBasicSalary() {
      const baseSalaryDesserts = {
        category: {name: ""},
        CategorySalary: [...this.CategorySalary],
        gradeSalary: [...this.gradeSalary],
        LevelSalary: [...this.LevelSalary],
        amount: "",
        grade: {name: ""},
        _id: "",
        level: {name: ""},
        disable: false
      };
      this.baseSalaryDesserts.push(baseSalaryDesserts);
    },
    //添加每月加给
    addSupply() {
      const monthDesserts = {
        category: {name: ""},
        CategoryMonth: [...this.CategoryMonth],
        gradeMonth: [...this.gradeMonth],
        amount: "",
        grade: {name: ""},
        _id: "",
        disable: false
      };
      this.monthDesserts.push(monthDesserts);
    },
    // 删除基本薪资
    delBasicSalary(item, index) {
      this.baseSalaryDesserts.splice(index, 1);
      this.deldataId.push(item._id);
    },
    //删除每月加给
    delSupply(item, index) {
      this.monthDesserts.splice(index, 1);
      this.deldataId.push(item._id);
    },
    // 保存
    async saveEmployeeDetail() {
      const number = /^[0-9][0-9]*$/;
      let isErrorFlag = false;
      // if(this.baseSalaryDesserts.length < 1){
      //   this.$refs.snackbar.showError("基本薪资不能为空");
      //   return  false;
      // }
      // 判断基本薪资
      for (let i = 0; i < this.baseSalaryDesserts.length; i++) {
        let item = this.baseSalaryDesserts[i];
        // if(!item.category.name || !item.grade.name || !item.level.name){
        //   isErrorFlag = true;
        //   this.$refs.snackbar.showError("基本薪资不能为空");
        //   break;
        // }
        if(!number.test(item.amount)){
          isErrorFlag = true;
          this.$refs.snackbar.showError("金额错误");
          break;
        }
      }
      if(isErrorFlag){
        return false;
      }
      // 每月加给校验
      for (let i = 0; i < this.monthDesserts.length; i++) {
        let item = this.monthDesserts[i];
        // if(!item.category.name || !item.grade.name){
        //   isErrorFlag = true;
        //   this.$refs.snackbar.showError("每月加给不能为空");
        //   break;
        // }
        if(!number.test(item.amount)){
          isErrorFlag = true;
          this.$refs.snackbar.showError("金额错误");
          break;
        }
      }
      if(isErrorFlag){
        return false;
      }

      // 先做表单校验
      this.$v.$reset();
      this.$v.$touch();
      if (this.$v.$invalid){
        this.$refs.snackbar.showError("请检查表单信息");
        return false;
      }

      let params = {
        updateSalary: this.baseSalaryDesserts,
        updateMonth: this.monthDesserts,
        deleteSalaryId: this.deldataId,
        updateList: {
          name: this.desserts.name,
          entry_time: this.date,
          selectDepartment: this.selectDepartment,
          is_manager: this.isManager,
          remain_stock: this.remain_stock,
          task_count: this.desserts.task_count,
          adjust_permissions: this.adjustPermissions,
          workplace: this.desserts.workplace,
          tel: this.desserts.tel,
          email: this.desserts.email,
          _id: this.desserts._id,
          department_id: "",
          employee_salary_structure_ids: []
        },
        selectDepartment: this.selectDepartment,
        _id: this.desserts._id,
        userId: this.userId
      };

      let res = await this.$request.fetch("/api/employee/updateEmployee", params, "post");
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showStatus("edit",false);
        return false;
      }
      EventBus.$emit('showSnackbar', {
        msg: "编辑成功"
      });
      this.$router.push({path: "/salaries/EmployeeManagement/Employee"});
    },
    closeEmployeeDetail() {
      this.$router.push({
        path: "/salaries/EmployeeManagement/Employee"
      });
    },
    // 股票弹框事件
    async handleCheck() {
      let res = await this.$request.fetch("/api/employee/getEmployeeStock",{employee_id: this.desserts._id});
      if (res.data.status === 200) {
        this.dessertsStock = res.data.result;
        this.dialog = true;
      } else {
        this.$refs.snackbar.showError();
      }
    },
    handleClear() {
      this.dialog = false;
    },
    // 部门中绑定所有的部门
    async getDepartments() {
      let res = await this.$request.fetch("/api/employee/allDepartmentName");
      if (res.data.status === 200 && res.data.result && res.data.result.length) {
        this.departmentList = res.data.result;
        for(let i = 0; i < res.data.result.length; i++){
          if(this.selectDepartment === res.data.result[i]._id){
            this.department = res.data.result[i];
          }
        }
      } else {
        this.$refs.snackbar.showError();
      }
    },
    // 根据员工姓名找到其对应的基本薪资与每月加给情况
    async getSalary() {
      let params = {_id: this.desserts._id};
      let res = await this.$request.fetch("/api/employee/getEmployeeSalaryEdit", params);
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showError();
        return false;
      }

      for (const iterator of res.data.result) {
        if (iterator && iterator.category && iterator.category.category_type === "基本薪资") {
          this.baseSalaryDesserts.push(iterator);
        }
        if (iterator && iterator.category && iterator.category.category_type === "每月加给") {
          this.monthDesserts.push(iterator);
        }
      }

      for (const iterator of this.baseSalaryDesserts) {
        iterator.CategorySalary = [...this.CategorySalary];
        iterator.gradeSalary = [...this.gradeSalary];
        iterator.LevelSalary = [...this.LevelSalary];
        iterator.disable = false;
      }
      for (const iterator of this.monthDesserts) {
        iterator.CategoryMonth = [...this.CategoryMonth];
        iterator.gradeMonth = [...this.gradeMonth];
        iterator.disable = false;
      }
    },
    // 编辑中基本薪资、每月加给分类获取所有数据
    async changeCategory() {
      let res = await this.$request.fetch("/api/classify/getCategoryAccount");
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showError();
        return false;
      }
      if(!res.data.result || res.data.result.length <= 0 ){
        this.$refs.snackbar.showError("基础数据不完整，请先完善级别/分类/等级数据");
        return false;
      }
      for (const iterator of res.data.result) {
        if (iterator && iterator.category_type === "基本薪资") {
          this.CategorySalary.push(iterator);
        }
        if (iterator && iterator.category_type === "每月加给") {
          this.CategoryMonth.push(iterator);
        }
      }
    },
    // 编辑中基本薪资、每月加给等级获取所有数据
    async changeGrade() {

      let res = await this.$request.fetch("/api/employee/getGradeCountSalary");
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showError();
        return false;
      }
      for (const iterator of res.data.result) {
        if (iterator.category_type === "基本薪资" && iterator.grade.length) {
          for (const iterator of iterator.grade) {
            this.gradeSalary.push(iterator);
          }
        }
        if (iterator.category_type === "每月加给" && iterator.grade.length) {
          for (const iterator of iterator.grade) {
            this.gradeMonth.push(iterator);
          }
        }
      }
    },
    // 编辑中基本薪资级别获取所有数据
    async changeLevel() {
      let res = await this.$request.fetch("/api/classify/getLevelAccount");
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showError();
        return false;
      }
      for (const iterator of res.data.result) {
        if (iterator.level) {
          this.LevelSalary.push(iterator.level);
        }
      }
    },
    // 基本薪资分类联动
    changeCategorySalary(item, index) {
      // 需要重置数据
      // item.
      if (this.baseSalaryDesserts.length <= 1) {
        this.changeCategorySalaryAxios(item, index);
        return false;
      }
      item.disable = false;
      for (let i = 0; i < this.baseSalaryDesserts.length; i++) {
        if (i !== index) {
          if (this.baseSalaryDesserts[i].category.name === item.category.name) {
            item.disable = true;
            this.$refs.snackbar.showError("添加错误,该分类已存在");
            break;
          }
        }
      }
      if (!item.disable) {
        this.changeCategorySalaryAxios(item, index);
      }
    },
    // category -> grade  的联动
    async changeCategorySalaryAxios(item, index) {
      let params = {name: item.category.name};
      // 选择了category之后，后面的选择框应该全部归零
      this.baseSalaryDesserts[index]['gradeSalary'] = [];
      this.baseSalaryDesserts[index]['LevelSalary'] = [];
      this.baseSalaryDesserts[index]['amount'] = 0;

      let res = await this.$request.fetch("/api/employee/getCategoryGrade", params);
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showError();
        return false;
      }
      let currData = [...this.baseSalaryDesserts];
      currData[index].gradeSalary = [...res.data.result[0].grades];
      this.baseSalaryDesserts = [...currData];
    },
    // 基本薪资等级联动
    async changeGradeSalary(item, index) {
      this.baseSalaryDesserts[index].LevelSalary = [];
      let params = {
        grade_name: item.grade.name,
        category_name: item.category.name
      };
      let res = await this.$request.fetch("/api/employee/getGradeLevel", params);
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showError();
        return false;
      }
      if (res.data.result && res.data.result.length) {
        if (res.data.result[0].level.length > 0) {

          let currData = [...this.baseSalaryDesserts];
          currData[index].LevelSalary = [...res.data.result[0].level];
          this.baseSalaryDesserts = [...currData];
        } else if (res.data.result[0].level.length === 0) {

          let currData = [...this.baseSalaryDesserts];
          currData[index].LevelSalary = [];
          this.baseSalaryDesserts = [...currData];
          item.amount = 0;
        } else {
          item.amount = 0;
        }
      }
    },
    // 基本薪资级别联动
    async changeLevelSalary(item, index) {

      let params = {
        category_name: item.category.name,
        grade_name: item.grade.name,
        level_name: item.level.name
      };
      let res = await this.$request.fetch("/api/employee/getGradeLevelSalary", params);
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showError();
        return false;
      }

      if (res.data.result.length === 0) {
        this.baseSalaryDesserts[index].amount = 0;
      } else if (res.data.result.length > 0) {
        this.baseSalaryDesserts[index].amount = res.data.result[0].amount;
      }
    },
    // 每月加给分类联动
    changeCategoryMonth(item, index) {
      if (this.monthDesserts.length <= 1) {
        this.changeCategoryMonthAxios(item, index);
      } else {
        item.disable = false;
        for (let i = 0; i < this.monthDesserts.length; i++) {
          if (i !== index) {
            if (this.monthDesserts[i].category.name === item.category.name) {
              item.disable = true;
              this.$refs.snackbar.showError("添加错误,该分类已存在");
              break;
            }
          }
        }
        if (!item.disable) {
          this.changeCategoryMonthAxios(item, index);
        }
      }
    },
    // 每月加给分类联动时发送的请求
    async changeCategoryMonthAxios(item, index) {

      let params = {
        name: item.category.name
      };
      this.monthDesserts[index]['gradeMonth'] = [];
      this.monthDesserts[index]['amount'] = 0;

      let res = await this.$request.fetch("/api/employee/getGradeMonth", params);
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showError();
        return false;
      }
      let currData = [...this.monthDesserts];
      currData[index].gradeMonth = [...res.data.result[0].cat];
      this.monthDesserts = [...currData];
    },
    // 每月加给等级联动（根据等级找金额）
    async changeGradeMonth(item, index) {

      let params = {
        category_name: item.category.name,
        grade_name: item.grade.name
      };
      let res = await this.$request.fetch("/api/employee/getGradeMonthMoney", params);
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showError();
        return false;
      }

      if (!res.data.result.length) {
        return this.monthDesserts[index].amount = 0;
      }
      this.monthDesserts[index].amount = res.data.result[0].amount;
    },
    // 改变部门对应的主管
    async handledepartment(val) {

      this.selectDepartment = val;
      let res = await this.$request.fetch("/api/employee/getDepartmentManger", {depId: this.selectDepartment});
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showError();
        return false;
      }

      if (res.data.result[0].manager_id) {
        this.departmentCharge = res.data.result[0].manager_id.name;
      }
    }
  },
  computed: {
    dessertsNameErrors() {
      const errors = [];
      if (!this.$v.desserts.name.$dirty) return errors;
      !this.$v.desserts.name.required && errors.push("姓名不能为空");
      return errors;
    },
    dateErrors() {
      const errors = [];
      if (!this.$v.date.$dirty) return errors;
      !this.$v.date.required && errors.push("日期不能为空");
      !this.$v.date.required && errors.push("请选择日期");
      return errors;
    },
    dessertsWorkplaceErrors() {
      const errors = [];
      if (!this.$v.desserts.workplace.$dirty) return errors;
      !this.$v.desserts.workplace.required && errors.push("办公地点不能为空");
      return errors;
    },
    dessertsEmailErrors() {
      const errors = [];
      if (!this.$v.desserts.email.$dirty) return errors;
      !this.$v.desserts.email.required && errors.push("请输入邮箱");
      !this.$v.desserts.email.email && errors.push("邮箱地址不合法");
      return errors;
    },
    dessertsTelErrors() {
      const errors = [];
      if (!this.$v.desserts.tel.$dirty) return errors;
      !this.$v.desserts.tel.required && errors.push("手机号码不能为空");
      !this.$v.desserts.tel.telNumber  && errors.push("手机号码格式不合法");
      return errors;
    },
    adjustPermissionsErrors() {
      const errors = [];
      if (!this.$v.adjustPermissions.$dirty) return errors;
      !this.$v.adjustPermissions.required && errors.push("必须为正整数");
      if (isNaN(this.adjustPermissions) || this.adjustPermissions < 0 || this.adjustPermissions > 20 ) {
        errors.push("权限必须为0～20之间的数字");
      }
      return errors;
    },
    dessertstask_countErrors() {
      const errors = [];
      if (!this.$v.desserts.task_count.$dirty) return errors;
      !this.$v.desserts.task_count.required && errors.push("任务点数不能为空");
      if(isNaN(this.desserts.task_count) || this.desserts.task_count < 0){
        errors.push("任务点数必须为数字且大于0");
      }
      return errors;
    }
  }
}
</script>

<style scoped>
  .addEmployee {
    box-shadow: 0 1px 2px 2px #ccc;
    padding: 40px 60px 160px;
    color: #333;
  }
  .addEmployee h1 {
    text-align: center;
    opacity: 0.8;
  }
  .addEmployee h2 {
    margin-bottom: 20px;
  }
  .star {
    color: red;
    display: inline-block;
    margin-left: 20px;
  }
  .pleaseInput {
    display: inline-block !important;
    margin-left: 50px;
  }
  .pleaseInput1 {
    width: 800px !important;
  }
  .pleaseInput2 {
    width: 670px !important;
  }
  .addEmployee .selectP {
    position: relative;
  }
  .addEmployee .selectP span {
    display: inline-block;
    margin-left: 20px;
    width: 15px;
    border-bottom: 3px solid red;
    position: absolute;
    right: 9%;
    top: 32px;
    cursor: pointer;
  }
  .addEmployee /deep/ .theme--light.v-icon {
    color: #2886c8;
    font-size: 40px;
  }
  .layoutBtn {
    margin-top: 30px;
  }
  .layoutBtn button:nth-of-type(1) {
    margin-right: 40px;
  }
  /* 添加基本薪资按钮 */
  .addBasicSalary {
    cursor: pointer;
  }
  /* 删除基本薪资当前行按钮 */
  .delBasicSalary {
    cursor: pointer;
  }
  .layout {
    font-size: 18px !important;
    display: flex !important;
    align-items: center !important;
  }
  /* 查看股票弹框 */
  .theme--light.v-sheet {
    position: relative !important;
  }
  .closeClear {
    position: absolute;
    top: 10px;
    right: 10px;
  }
  .elevation-1 /deep/ .v-table__overflow {
    padding: 35px 35px 75px;
  }
  .elevation-1 /deep/ table.v-table tbody tr {
    border-bottom: 1px solid #ccc;
  }
</style>