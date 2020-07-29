<template>
  <div class="addEmployee">
    <h1>增加员工</h1>
    <v-layout>
      姓 名<span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field label="请输入姓名" v-model="EmployeeInfoName" @change="$v.EmployeeInfoName.$touch()" :error-messages="EmployeeInfoNameErrors" class="pleaseInput1"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      出生年月<span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="datePosition">
        <v-menu v-model="birth" :close-on-content-click="false" :nudge-right="40" lazy transition="scale-transition" offset-y full-width min-width="290px">
          <template v-slot:activator="{  on  }">
            <v-text-field v-model="date_birth" label="请选择日期" @change="$v.date_birth.$touch()" :error-messages="dateBirthErrors" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="date_birth" locale="zh-cn"  @input="birth  =  false"></v-date-picker>
        </v-menu>
      </v-flex>
      <v-spacer></v-spacer>
    </v-layout>
    <v-layout>
      学历<span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field label="请输入员工学历" v-model="EmployeeInfoEducation" @change="$v.EmployeeInfoEducation.$touch()" :error-messages="EmployeeInfoEducationErrors" class="pleaseInput1"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      户籍<span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field label="请输入员工户籍" v-model="EmployeeInfoHome" @change="$v.EmployeeInfoHome.$touch()" :error-messages="EmployeeInfoHomeErrors" class="pleaseInput1"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout class="salaryClass">
      证书情况
      <span @click="addBook()" class="addBasicSalary star">+</span>
    </v-layout>
    <v-layout class="selectP" v-for="(items,indx)  in  bookList" :key="indx">
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field label="请输入证书名称" v-model="items.name"></v-text-field>
      </v-flex>
      <span @click="delBook(indx)"></span><br/>
    </v-layout>
    <v-layout>
      入职日期<span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="datePosition">
        <v-menu v-model="menu" :close-on-content-click="false" :nudge-right="40" lazy transition="scale-transition" offset-y full-width min-width="290px">
          <template v-slot:activator="{  on  }">
            <v-text-field v-model="date" label="请选择日期" @change="$v.date.$touch()" :error-messages="dateErrors" readonly v-on="on"></v-text-field>
          </template>
          <v-date-picker v-model="date" locale="zh-cn"  @input="menu  =  false"></v-date-picker>
        </v-menu>
      </v-flex>
      <v-spacer></v-spacer>
    </v-layout>
    <v-layout>
      所在部门
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select label="请选择部门" no-data-text="暂无数据" :items="department" item-text="name" item-value="_id" v-model="DepartmentName"></v-select>
      </v-flex>
    </v-layout>
    <v-layout>
      上级主管
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput" label="请选择部门">{{EmployeeInfo.manager}}</v-flex>
    </v-layout>

    <v-layout>
      是否为主管<span class="star">*</span>
      <v-switch v-model="EmployeeInfoIsExecutiveDirector" class="pleaseInput"></v-switch>
    </v-layout>
    <v-layout v-if="EmployeeInfoIsExecutiveDirector">
      调整权限<span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput authority">
        <v-text-field label="权限" @change="$v.EmployeeInfoAuthority.$touch()" :error-messages="EmployeeInfoAuthorityErrors"  class v-model="EmployeeInfoAuthority"></v-text-field>
        <span class="auth">%</span>
      </v-flex>
    </v-layout>
    <v-layout>
      员工号<span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field label="请输入员工号" v-model="EmployeeInfoNumber" @change="$v.EmployeeInfoNumber.$touch()" :error-messages="EmployeeInfoNumberErrors" class="pleaseInput1"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      员工类型<span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select label="请选择员工类型" no-data-text="暂无数据" :items="employeeTypeList" item-text="name" item-value="_id" v-model="EmployeeType"></v-select>
      </v-flex>
    </v-layout>
    <v-layout>
      养老保险<span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field label="请输入金额" v-model="EmployeeInfoEndowment" @change="$v.EmployeeInfoEndowment.$touch()" :error-messages="EmployeeInfoEndowmentErrors" class="pleaseInput1"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      医疗保险<span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field label="请输入金额" v-model="EmployeeInfoMedical" @change="$v.EmployeeInfoMedical.$touch()" :error-messages="EmployeeInfoMedicalErrors" class="pleaseInput1"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      失业保险<span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field label="请输入金额" v-model="EmployeeInfoUnemployment" @change="$v.EmployeeInfoUnemployment.$touch()" :error-messages="EmployeeInfoUnemploymentErrors" class="pleaseInput1"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      住房公积金<span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field label="请输入金额" v-model="EmployeeInfoHousing" @change="$v.EmployeeInfoHousing.$touch()" :error-messages="EmployeeInfoHousingErrors" class="pleaseInput1"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout class="salaryClass">
      基本薪资
      <span @click="addBasicSalary()" class="addBasicSalary star">+</span>
    </v-layout>
    <v-layout class="selectP" v-for="(items,indx)  in  dessertBasicData" :key="'info-'+  indx">
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select label="请选择分类" no-data-text="暂无数据" :items="items?(items.BasicCategoryData?items.BasicCategoryData : []) : []" item-text="name" item-value="_id" v-model="items.category" @change="getByBasicCatogry(items,indx)"></v-select>

      </v-flex>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select label="请选择等级" no-data-text="暂无数据" :items="items.BasicGradeData" item-text="name" item-value="_id" v-model="items.grade" @change="getLevelByGraCat(items,indx)" :disabled="items.disable"></v-select>
      </v-flex>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select label="请选择级别" no-data-text="暂无数据" :items="items.BasicLevelData" item-text="name" item-value="_id" v-model="items.level" @change="getBasicSalary(items,indx)" :disabled="items.disable"></v-select>
      </v-flex>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field label="金额" :rules="salariesRules" v-model="items.amount" :disabled="items.disable"></v-text-field>
      </v-flex>
      <span @click="delBasicSalary(indx)" class="delBasicSalary"></span><br/>
    </v-layout>
    <v-layout>
      每月加给
      <span class="star addBasicSalary" @click="addSupply()">+</span>
    </v-layout>
    <v-layout class="selectP" v-for="(item, indexx) in dessertSupplyData" :key="'info1-'+ indexx">
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select label="请选择分类" no-data-text="暂无数据" :items="item?(item.CategoryData?item.CategoryData:[]):[]" item-text="name" item-value="_id" v-model="item.category" @change="getByCatogry(item,indexx)"></v-select>
      </v-flex>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select label="请选择等级" no-data-text="暂无数据" :items="item.gradeData" item-text="name" item-value="_id" v-model="item.grade" @change="getSalary(item,indexx)" :disabled="item.disable"></v-select>
      </v-flex>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-text-field label="金额" :rules="salariesRules" v-model="item.amount" :disabled="item.disable"></v-text-field>
      </v-flex>
      <span @click="delSupply(indexx)" class="delBasicSalary delSupply"></span>
    </v-layout>
    <v-layout>
      办公地点<span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field label="请输办公地点" v-model="EmployeeInfoPlace" @change="$v.EmployeeInfoPlace.$touch()" :error-messages="EmployeeInfoPlaceErrors" class="pleaseInput1"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      邮 箱<span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field label="请输入邮箱" v-model="EmployeeInfoEmail" @change="$v.EmployeeInfoEmail.$touch()" :error-messages="EmployeeInfoEmailErrors" class="pleaseInput1"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      手机号码<span class="star">*</span>
      <v-flex xs12 sm2 md2 class="pleaseInput">
        <v-text-field label="请输入手机号码" v-model="EmployeeInfoTel" @change="$v.EmployeeInfoTel.$touch()" :error-messages="EmployeeInfoTelErrors" class="pleaseInput1"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      绑定用户
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <v-select label="请选择用户" :items="users" no-data-text="暂无数据" item-text="name" item-value="_id" v-model="userName"></v-select>
      </v-flex>
    </v-layout>
    <v-layout class="layoutBtn" right>
      <v-btn color="primary" @click="handleCloseAdd">取消</v-btn>
      <v-btn color="primary" @click="saveInfo">保存</v-btn>
    </v-layout>
    <!-- 增加后的预览弹框 -->
    <v-dialog v-model="dialog" persistent max-width="1000px">
      <v-card>
        <v-layout wrap>
          <v-flex xs6>姓名：</v-flex>
          <v-flex xs6>{{ EmployeeInfo.name }}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>出生年月：</v-flex>
          <v-flex xs6>{{ EmployeeInfo.date_birth }}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>学历：</v-flex>
          <v-flex xs6>{{ EmployeeInfo.education }}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>户籍：</v-flex>
          <v-flex xs6>{{ EmployeeInfo.native_place }}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>证书情况：</v-flex>
        </v-layout>
        <div class="supplyLay">
          <v-layout v-for="(items, index) in this.bookList" :key="index">
            <v-flex xs6>{{ items.name}}</v-flex>
          </v-layout>
        </div>
        <v-layout wrap>
          <v-flex xs6>入职日期：</v-flex>
          <v-flex xs6>{{ EmployeeInfo.date }}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>所在部门：</v-flex>
          <v-flex xs6>{{ EmployeeInfo.DepartmentName | getdepartment}}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>上级主管</v-flex>
          <v-flex xs6>{{ EmployeeInfo.manager}}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>是否为主管：</v-flex>
          <v-flex xs6>{{EmployeeInfoIsExecutiveDirector ? '是' : '否' }}</v-flex>
        </v-layout>
        <v-layout wrap v-if="EmployeeInfoIsExecutiveDirector==true">
          <v-flex xs6>调整权限：</v-flex>
          <v-flex xs6>{{EmployeeInfoAuthority}}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>员工号：</v-flex>
          <v-flex xs6>{{ EmployeeInfo.number }}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>员工类型：</v-flex>
          <v-flex xs6>{{ EmployeeInfo.type }}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>养老保险：</v-flex>
          <v-flex xs6>{{ EmployeeInfo.endowment }}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>医疗保险：</v-flex>
          <v-flex xs6>{{ EmployeeInfo.medical }}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>失业保险：</v-flex>
          <v-flex xs6>{{ EmployeeInfo.unemployment }}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>住房公积金：</v-flex>
          <v-flex xs6>{{ EmployeeInfo.house }}</v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>基本薪资：</v-flex>
        </v-layout>
        <div class="supplyLay">
          <v-layout v-for="(items, index) in this.dessertBasicData" :key="'info3-'+ index">
            <v-flex xs6>{{ items.category | getCategryname}}</v-flex>
            <v-flex xs6>{{ items.grade | getGradename }}</v-flex>
            <v-flex xs6>{{ items.level | getlevelname}}</v-flex>
            <v-flex xs6>{{ items.amount }}</v-flex>
          </v-layout>
        </div>
        <v-layout wrap>
          <v-flex xs6>每月加给：</v-flex>
        </v-layout>
        <div class="supplyLay">
          <v-layout v-for="(items, index) in this.dessertSupplyData" :key="'info4-'+ index">
            <v-flex xs6>{{ items.category | getSupplyCname }}</v-flex>
            <v-flex xs6>{{items.grade | getSupplyGname}}</v-flex>
            <v-flex xs6>{{ items.amount }}</v-flex>
          </v-layout>
        </div>

        <v-layout wrap>
          <v-flex xs6>办公地点：</v-flex>
          <v-flex xs6>
            <v-input>{{ EmployeeInfo.place }}</v-input>
          </v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>邮箱：</v-flex>
          <v-flex xs6>
            <v-input>{{ EmployeeInfo.email }}</v-input>
          </v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>手机号码：</v-flex>
          <v-flex xs6>
            <v-input>{{ EmployeeInfo.tel }}</v-input>
          </v-flex>
        </v-layout>
        <v-layout wrap>
          <v-flex xs6>绑定用户：</v-flex>
          <v-flex xs6>{{userName | getUserName}}</v-flex>
        </v-layout>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="info" @click="handleAddClose">取消</v-btn>
          <v-btn color="info" @click="handleAdd">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <snackbar ref="snackbar"/>
  </div>
</template>

<script>
import snackbar from '../../components/snackbar.vue';
import { EventBus } from '@/utils/eventBus.js';
import { required, email, helpers, numeric } from "vuelidate/lib/validators";
const telNumber = helpers.regex('telNumber', /(^1[345789]\d{9}$)|(^9\d{8}$)/);
export default {
  name: "addEmployee",
  components: {snackbar},
  validations: {
    EmployeeInfoName: { required },
    EmployeeInfoEducation: { required },
    EmployeeInfoHome: { required },
    date_birth: { required },
    EmployeeInfoNumber: { required },
    EmployeeInfoEndowment: { required },
    EmployeeInfoMedical: { required },
    EmployeeInfoUnemployment: {required },
    EmployeeInfoHousing: { required },
    menu: { required },
    date: { required },
    birth: { required },
    EmployeeInfoPlace: { required },
    EmployeeInfoEmail: { required, email },
    EmployeeInfoTel: { required, telNumber},
    EmployeeInfoAuthority: {numeric/*,between: between(0, 20)*/},
  },
  props: ["desserts"],
  data() {
    return {
      salariesRules: [
        v => !!(v + '') || "必填项",
        v => /^[0-9]*[0-9]*$/.test(v) || "金额不能为空，且必须是正整数"
      ],
      item: {
        name: ""
      },
      dialog: false,
      // 日期
      date: "",
      // 出生年月
      date_birth: "",
      menu: false,
      birth:false,
      // 员工信息
      deserts: [],
      // 弹框信息
      top: true,
      right: false,
      //每月加给数组数据
      dessertSupplyData: [],
      gradeData: [],
      CategoryData: [],
      //基本薪资数组数据
      dessertBasicData: [],
      BasicCategoryData: [],
      BasicGradeData: [],
      BasicLevelData: [],
      //判断分类是否已存在
      supply: "",
      categoryName: "",
      LevelsData: [],
      EmployeeInfoName: "",
      EmployeeInfoEducation: "",
      EmployeeInfoHome: "",
      EmployeeInfoNumber: "",
      EmployeeType: "",
      EmployeeInfoEndowment: "",
      EmployeeInfoMedical: "",
      EmployeeInfoUnemployment: "",
      EmployeeInfoHousing: "",
      EmployeeInfoPlace: "",
      EmployeeInfoEmail: "",
      EmployeeInfoTel: "",
      EmployeeInfoIsExecutiveDirector: false,
      EmployeeInfoAuthority: 0,
      DepartmentId: "",
      DepartmentName: "",
      Department: [],
      users: [],
      userName: "",
      userId: "",
      categoryId: "",
      categoryId2: "",
      amount: "",
      levelsId: "",
      Salary: [],
      Salary2: "",
      EmployeeInfo: {
        date_birth: "",
        education: "",
        native_place: "",
        type: "",
        number: "",
        endowment: "",
        medical: "",
        unemployment: "",
        house: "",
        name: "",
        date: "",
        manager: "",
        isExecutiveDirector: false,
        basicSalary: [],
        place: "",
        email: "",
        tel: ""
      },
      supplySalary: [],
      department: [],
      bookList:[],
      employeeTypeList:["开发人员","管理人员","实习人员","劳务人员","其他人员"]
    };
  },
  async created() {
    this.deserts = this.$route.params.desserts;
    await this.getAlldepartments();
  },
  mounted() {
    this.getDataByBasic();
    this.getGradeData();
    this.getAllLevels();
    this.getAllUser();
  },
  methods: {
    // 权限校验
    // changeAdjustPermissions (val) {
    //   if (val > 20) {
    //     this.$refs.snackbar.showError("不能大于20%");
    //   } else {
    //     this.adjustPermissions = val;
    //   }
    // },
    //获取全部分类
    async getDataByBasic() {
      let res = await this.$request.fetch("/api/employee/getByCatogry");
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showError();
        return false;
      }
      
      res.data.result.forEach(item => {
        if (item && item.category_type === "每月加给") {
          this.CategoryData.push(item);
          localStorage.setItem("CategoryData", JSON.stringify(this.CategoryData));
          let data = {
            category: "",
            grade: "",
            amount: 0,
            disable: false,
            category_type: "每月加给"
          };
          this.dessertSupplyData.push(data);
          for (const item of this.dessertSupplyData) {
            if(item) item['CategoryData'] = [...this.CategoryData];
          }
        }
        if (item && item.category_type === "基本薪资") {
          this.BasicCategoryData.push(item);
          localStorage.setItem("BasicCategoryDatas", JSON.stringify(this.BasicCategoryData));
          let data = {
            category: "",
            grade: "",
            level: "",
            amount: 0,
            disable: false,
            category_type: "基本薪资"
          };
          this.dessertBasicData.push(data);
          for (const inter of this.dessertBasicData) {
            if(inter ) inter['BasicCategoryData'] = [...this.BasicCategoryData || []];
          }
        }
      });

      if(this.dessertSupplyData.length <= 0 || this.dessertBasicData.length <= 0 ){
        this.$refs.snackbar.showError("基础数据不完整，请先完善级别/分类/等级数据");
        return false;
      }

      // 避免页面渲染太多的空白输入框，所以只取数组的第一项，默认只渲染一个输入框
      this.dessertBasicData = [this.dessertBasicData[0]];
      this.dessertSupplyData = [this.dessertSupplyData[0]];
      // });
    },
    //获取全部等级
    async getGradeData() {
      let res = await this.$request.fetch("/api/employee/getGradeByMonth");
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showError();
        return false;
      }
      let data = res.data.result;
      for (const iter of data) {
        if (iter.category_id) {
          if (iter.category_id.category_type === "每月加给") {
            this.gradeData.push(iter);
            localStorage.setItem("gradeData", JSON.stringify(this.gradeData));
            for (const item of this.dessertSupplyData) {
              item.gradeData = [...this.gradeData];
            }
          }
          if (iter.category_id.category_type === "基本薪资") {
            this.BasicGradeData.push(iter);
            localStorage.setItem("BasicGradeData", JSON.stringify(this.BasicGradeData));
            for (const inter of this.dessertBasicData) {
              inter.BasicGradeData = [...this.BasicGradeData];
            }
          }
        }
      }
    },
    //根据基本薪资分类获取等级
    async getByBasicCatogry(value, index) {
      //切换分类重新获取分类，金额
      let currData = [...this.dessertBasicData];
      currData[index].BasicLevelData = ["暂无数据"];
      currData[index].amount = 0;
      currData[index].grade = "";
      currData[index].level = "";
      this.dessertBasicData = [...currData];
      // 等级联动
      value.disable = false;
      for (let i = 0; i < this.dessertBasicData.length; i++) {
        if (i !== index) {
          if (this.dessertBasicData[i].category === value.category) {
            value.disable = true;
            this.$refs.snackbar.showError("此分类已存在");
            break;
          }
        }
      }
      if (!value.disable) {
        let res = await this.$request.fetch("/api/employee/getGradeByCn",{categoryId: value.category});
        if (res.data.result.length) {
          let currData = [...this.dessertBasicData];
          currData[index].BasicGradeData = [...res.data.result];
          this.dessertBasicData = [...currData];
          return;
        }
        let currData = [...this.dessertBasicData];
        currData[index].BasicGradeData = ["暂无数据"];
        this.dessertBasicData = [...currData];
      }
    },
    //根据分类，等级获取级别
    async getLevelByGraCat(items, index) {
      let currData = [...this.dessertBasicData];
      currData[index].amount = 0;
      currData[index].level = "";
      currData[index].BasicLevelData = [];
      this.dessertBasicData = [...currData];
      if (items.grade !== "无") {
        let res = await this.$request.fetch("/api/employee/getLevelByGraCat",{categoryId: items.category,gradeId: items.grade});
        let basicLevel = [];
        for (const iterator of res.data.result) {
          basicLevel.push(iterator.levels);
          let currData = [...this.dessertBasicData];
          currData[index].BasicLevelData = [...basicLevel];
          this.dessertBasicData = [...currData];
        }
        return false;
      }
    },
    //获取基本薪资金额
    async getBasicSalary(value, index) {
      if (value.level === "") {
        let currData = [...this.dessertBasicData];
        currData[index].amount = 0;
        this.dessertBasicData = [...currData];
        return false;
      }
      let res = await this.$request.fetch("/api/employee/getBasicSalary",{categoryId: value.category, gradeId: value.grade, levelId: value.level});

      if (res.data.status !== 200 || res.data.result.length <= 0) {
        let currData = [...this.dessertBasicData];
        currData[index].amount = 0;
        this.dessertBasicData = [...currData];
      } else {
        for (const iterator of res.data.result) {
          let currData = [...this.dessertBasicData];
          currData[index].amount = iterator.amount || 0;
          this.dessertBasicData = [...currData];
        }
      }
    },
    //得到所有级别
    async getAllLevels() {

      let res = await this.$request.fetch("/api/employee/getAllLevels");
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showError();
        return false;
      }

      for (const item of res.data.result) {
        this.BasicLevelData.push(item);
        //所有级别保存在本地
        localStorage.setItem("BasicLevelData", JSON.stringify(this.BasicLevelData));
      }
      let basicLevelData = this.BasicLevelData || [];
      for (const item of this.dessertBasicData) {
        if(item)item['BasicLevelData'] = [...basicLevelData ];
      }
    },
    //获取所有部门
    async getAlldepartments() {

      let res = await this.$request.fetch("/api/employee/getAlldepartments");
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showError();
        return false;
      }
      this.department = res.data.result;
      localStorage.setItem("department", JSON.stringify(this.department));
    },
    //根据选择部门显示该部门主管
    async getManagerByName() {

      let res = await this.$request.fetch("/api/employee/getManagerByName",{department_name: this.EmployeeInfo.DepartmentName});
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showError();
        return false;
      }

      if (res.data.result[0].manager_id != null) {
        this.EmployeeInfo.manager = res.data.result[0].manager_id.name;
      } else {
        alert("该部门暂无主管");
        this.EmployeeInfo.manager = "无";
      }
    },
    //获取每月加给下的等级
    async getByCatogry(value, index) {

      let currData = [...this.dessertSupplyData];
      currData[index].amount = 0;
      currData[index].level = "";
      currData[index].grade = "";
      this.dessertSupplyData = [...currData];
      value.disable = false;
      for (let i = 0; i < this.dessertSupplyData.length; i++) {
        if (i !== index) {
          if (this.dessertSupplyData[i].category === value.category) {
            this.$refs.snackbar.showError("此分类已存在");
            value.disable = true;
            break;
          }
        }
      }

      if (!value.disable) {

        let res = await this.$request.fetch("/api/employee/getGradeByCn",{categoryId: value.category});
        if (res.data.status !== 200 || !res.data.result) {
          this.$refs.snackbar.showError();
          return false;
        }
        if (res.data.result.length <= 0) {
          let currData = [...this.dessertSupplyData];
          currData[index].gradeData = ["无"];
          currData[index].amount = 0;
          this.dessertSupplyData = [...currData];
        } else {
          let currData = [...this.dessertSupplyData];
          currData[index].gradeData = [...res.data.result];
          this.dessertSupplyData = [...currData];
        }
      }
    },
    //获取每月加给金额
    async getSalary(item, index) {

      let res = await this.$request.fetch("/api/employee/getSalary",{categoryId: item.category, gradeId: item.grade});
      if (res.data.status !== 200 || !res.data.result) {
        this.dessertSupplyData[0]['amount'] = 0;
        return;
      }
      if (res.data.result.length > 0) {
        for (const iterator of res.data.result) {
          let currData = [...this.dessertSupplyData];
          currData[index].amount = iterator.amount || 0;
          this.dessertSupplyData = [...currData];
        }
      } else {
        let currData = [...this.dessertSupplyData];
        currData[index].amount = 0;
        this.dessertSupplyData = [...currData];
      }
    },
    // 添加证书
    addBook() {
      const book = {
        name:""
      }
      this.bookList.push(book);
    },
    // 删除证书
    delBook(index) {
      this.bookList.splice(index,1)
    },
    // 添加基本薪资
    addBasicSalary() {
      const basicSalary = {
        category: "",
        grade: "",
        level: "",
        BasicCategoryData: [...this.BasicCategoryData],
        BasicGradeData: [...this.BasicGradeData],
        BasicLevelData: [...this.BasicLevelData],
        amount: 0,
        category_type: "基本薪资"
      };
      this.dessertBasicData.push(basicSalary);
    },
    // 删除基本薪资
    delBasicSalary(index) {
      this.dessertBasicData.splice(index, 1);
    },
    //添加每月加给
    addSupply() {
      const supplySalary = {
        category: "",
        grade: "",
        CategoryData: [...this.CategoryData],
        gradeData: [...this.BasicGradeData],
        amount: 0,
        category_type: "每月加给"
      };
      this.dessertSupplyData.push(supplySalary);
    },
    //删除每月加给
    delSupply(index) {
      this.dessertSupplyData.splice(index, 1);
    },
    // 保存
    saveInfo() {
      const id = /^[a-fA-F0-9]{24}$/;
      const number = /^[0-9][0-9]*$/;
      let isErrorFlag = false;
      // 判断基本薪资
      for (let i = 0; i < this.dessertBasicData.length; i++) {
        let item = this.dessertBasicData[i];
        //   if(!id.test(item.category) || !id.test(item.grade) || !id.test(item.level)){
        //     isErrorFlag = true;
        //     this.$refs.snackbar.showError("基本薪资不能为空");
        //     break;
        //   }
        if(!number.test(item.amount)){
          item.amount = item.amount + '';
          isErrorFlag = true;
          break;
        }
      }
      // 每月加给校验
      for (let i = 0; i < this.dessertSupplyData.length; i++) {
        let item = this.dessertSupplyData[i];
        //   if(!id.test(item.category) || !id.test(item.grade)){
        //     isErrorFlag = true;
        //     this.$refs.snackbar.showError("每月加给不能为空");
        //     break;
        //   }
        if(!number.test(item.amount)){
          item.amount = item.amount + '';
          isErrorFlag = true;
          break;
        }
      }
      this.$v.$reset();
      this.$v.$touch();
      if (this.$v.$invalid){
        this.$refs.snackbar.showError("请检查表单信息");
        isErrorFlag = true;
      }
      if(isErrorFlag){
        // console.log("");
      }else{      // 显示弹框
        this.dialog = true;
      }
    },

    handleAddClose() {
      this.dialog = false;
    },
    handleCloseAdd() {
      this.$router.push({path: "/salaries/EmployeeManagement/Employee"});
    },
    handleAdd() {
      // 弹框提示
      // this.$refs.snackbar.showStatus("add", false);
      this.handleAddClose();
      this.createEmployee();
    },
    //获取用户
    async getAllUser() {

      let res = await this.$request.fetch("/api/employee/getAllUser");
      if (res.data.status !== 200 || !res.data.result) {
        this.$refs.snackbar.showError();
        return false;
      }
      this.users = res.data.result;
      localStorage.setItem("users", JSON.stringify(this.users));
    },
    //增加员工
    async createEmployee() {
      let params = {
        name: this.EmployeeInfo.name,
        entry_time: this.EmployeeInfo.date,
        is_manager: this.EmployeeInfoIsExecutiveDirector,
        workplace: this.EmployeeInfo.place,
        tel: this.EmployeeInfo.tel,
        email: this.EmployeeInfo.email,
        departmentName: this.EmployeeInfo.DepartmentName,
        adjust_permissions: this.EmployeeInfoAuthority,
        basicdata: this.dessertBasicData,
        supplydata: this.dessertSupplyData,
        userId: this.userId,
        employee_no: this.EmployeeInfo.number,
        employee_type: this.EmployeeInfo.type,
        education: this.EmployeeInfo.education,
        date_of_birth: this.EmployeeInfo.date_birth,
        native_place: this.EmployeeInfo.native_place,
        relevant_certificate: this.bookList,
        endowment_insurance: this.EmployeeInfo.endowment,
        medical_insurance: this.EmployeeInfo.medical,
        unemployment_insurance: this.EmployeeInfo.unemployment,
        housing_provident_fund: this.EmployeeInfo.house
      };

      let res = await this.$request.fetch("/api/employee/newEmployee", params, "post");

      if (res.data.status === 202) {
        this.$refs.snackbar.showError("此员工已存在");
        return false;
      } else if (res.data.status === 200) {
        EventBus.$emit('showSnackbar', {
          msg: "新增成功"
        });
        await this.$router.push({
          path: "/salaries/EmployeeManagement/Employee",
        });
      } else {
        this.$refs.snackbar.showStatus("add", false);
      }
    }
  },
  filters: {
    //预览框内基本薪资分类
    getCategryname: function(value) {
      for (const iterator of JSON.parse(localStorage.getItem("BasicCategoryDatas"))) {
        if (iterator && iterator._id === value) {
          return iterator.name;
        }
      }
    },
    //预览框内基本薪资等级
    getGradename(val) {
      for (const item of JSON.parse(localStorage.getItem("BasicGradeData"))) {
        if (item && item._id === val) {
          return item.name;
        }
      }
    },
    //预览框内基本薪资级别
    getlevelname(value) {
      for (const item of JSON.parse(localStorage.getItem("BasicLevelData"))) {
        if (item._id === value) {
          return item.name;
        }
      }
    },
    //  //预览框内每月加给分类（id）
    getSupplyCname(value) {
      for (const item of JSON.parse(localStorage.getItem("CategoryData"))) {
        if (item._id === value) {
          return item.name;
        }
      }
    },
    //预览框内每月加给等级（id）
    getSupplyGname(value) {
      for (const item of JSON.parse(localStorage.getItem("gradeData"))) {
        if (item._id === value) {
          return item.name;
        }
      }
    },
    //预览框内绑定用户
    getUserName(value) {
      for (const item of JSON.parse(localStorage.getItem("users"))) {
        if (item._id === value) {
          return item.name;
        }
      }
    },
    getdepartment(value) {
      for (const item of JSON.parse(localStorage.getItem("department"))) {
        if (item._id === value) {
          return item.name;
        }
      }
    }
  },
  watch: {
    //增加员工姓名
    EmployeeInfoName(val) {
      this.EmployeeInfo.name = val;
    },
    // 增加员工出生年月
    date_birth(val) {
      this.EmployeeInfo.date_birth = val;
    },
    // 增加员工学历
    EmployeeInfoEducation(val) {
      this.EmployeeInfo.education = val;
    },
    //增加员工户籍
    EmployeeInfoHome(val) {
      this.EmployeeInfo.native_place = val;
    },
    EmployeeInfoNumber(val) {
      this.EmployeeInfo.number = val;
    },
    EmployeeType(val) {
      this.EmployeeInfo.type = val;
    },
    EmployeeInfoEndowment(val) {
      this.EmployeeInfo.endowment = val;
    },
    EmployeeInfoMedical(val) {
      this.EmployeeInfo.medical = val;
    },
    EmployeeInfoUnemployment(val) {
      this.EmployeeInfo.unemployment = val;
    },
    EmployeeInfoHousing(val) {
      this.EmployeeInfo.house = val;
    },
    //增加员工入职日期
    date(val) {
      this.EmployeeInfo.date = val;
    },
    //办公地点
    EmployeeInfoPlace(val) {
      this.EmployeeInfo.place = val;
    },
    //获取邮箱的值
    EmployeeInfoEmail(val) {
      this.EmployeeInfo.email = val;
    },
    //监听获取手机号码的值
    EmployeeInfoTel(val) {
      this.EmployeeInfo.tel = val;
    },
    //监听是否为主管值
    EmployeeInfoIsExecutiveDirector(val) {
      this.EmployeeInfo.isExecutiveDirector = val;
      if (val === false) {
        this.EmployeeInfoAuthority = 0;
      }
    },
    //根据部门名称获取主管值
    DepartmentName(val) {
      this.EmployeeInfo.DepartmentName = val;
      this.getManagerByName();
    },
    //获取绑定用户值
    userName(val) {
      this.userId = val;
    }
  },
  computed: {
    EmployeeInfoEducationErrors() {
      const errors = [];
      if (!this.$v.EmployeeInfoEducation.$dirty) return errors;
      !this.$v.EmployeeInfoEducation.required && errors.push("学历不能为空");
      !this.$v.EmployeeInfoEducation.required && errors.push("请输入学历");
      return errors;
    },
    EmployeeInfoHomeErrors() {
      const errors = [];
      if (!this.$v.EmployeeInfoHome.$dirty) return errors;
      !this.$v.EmployeeInfoHome.required && errors.push("户籍不能为空");
      !this.$v.EmployeeInfoHome.required && errors.push("请输入户籍");
      return errors;
    },
    dateBirthErrors() {
      const errors = [];
      if (!this.$v.date_birth.$dirty) return errors;
      !this.$v.date_birth.required && errors.push("日期不能为空");
      !this.$v.date_birth.required && errors.push("请选择日期");
      return errors;
    },
    EmployeeInfoNumberErrors() {
      const errors = [];
      if (!this.$v.EmployeeInfoNumber.$dirty) return errors;
      !this.$v.EmployeeInfoNumber.required && errors.push("工号不能为空");
      !this.$v.EmployeeInfoNumber.required && errors.push("请输入工号");
      return errors;
    },
    EmployeeInfoEndowmentErrors() {
      const errors = [];
      if (!this.$v.EmployeeInfoEndowment.$dirty) return errors;
      !this.$v.EmployeeInfoEndowment.required && errors.push("金额不能为空");
      !this.$v.EmployeeInfoEndowment.required && errors.push("请输入金额");
      return errors;
    },
    EmployeeInfoMedicalErrors() {
      const errors = [];
      if (!this.$v.EmployeeInfoMedical.$dirty) return errors;
      !this.$v.EmployeeInfoMedical.required && errors.push("金额不能为空");
      !this.$v.EmployeeInfoMedical.required && errors.push("请输入金额");
      return errors;
    },
    EmployeeInfoUnemploymentErrors() {
      const errors = [];
      if (!this.$v.EmployeeInfoUnemployment.$dirty) return errors;
      !this.$v.EmployeeInfoUnemployment.required && errors.push("金额不能为空");
      !this.$v.EmployeeInfoUnemployment.required && errors.push("请输入金额");
      return errors;
    },
    EmployeeInfoHousingErrors() {
      const errors = [];
      if (!this.$v.EmployeeInfoHousing.$dirty) return errors;
      !this.$v.EmployeeInfoHousing.required && errors.push("金额不能为空");
      !this.$v.EmployeeInfoHousing.required && errors.push("请输入金额");
      return errors;
    },
    EmployeeInfoNameErrors() {
      const errors = [];
      if (!this.$v.EmployeeInfoName.$dirty) return errors;
      !this.$v.EmployeeInfoName.required && errors.push("姓名不能为空");
      !this.$v.EmployeeInfoName.required && errors.push("请输入姓名");
      return errors;
    },
    dateErrors() {
      const errors = [];
      if (!this.$v.date.$dirty) return errors;
      !this.$v.date.required && errors.push("日期不能为空");
      !this.$v.date.required && errors.push("请选择日期");
      return errors;
    },
    EmployeeInfoPlaceErrors() {
      const errors = [];
      if (!this.$v.EmployeeInfoPlace.$dirty) return errors;
      !this.$v.EmployeeInfoPlace.required && errors.push("办公地点不能为空");
      !this.$v.EmployeeInfoPlace.required && errors.push("请输入办公地点");
      return errors;
    },
    EmployeeInfoEmailErrors() {
      const errors = [];
      if (!this.$v.EmployeeInfoEmail.$dirty) return errors;
      !this.$v.EmployeeInfoEmail.email && errors.push("邮箱地址不合法");
      !this.$v.EmployeeInfoEmail.required && errors.push("请输入邮箱");
      return errors;
    },
    EmployeeInfoTelErrors() {
      const errors = [];
      if (!this.$v.EmployeeInfoTel.$dirty) return errors;
      !this.$v.EmployeeInfoTel.required && errors.push("手机号码不能为空");
      !this.$v.EmployeeInfoTel.telNumber  && errors.push("手机号码格式不合法");
      return errors;
    },
    EmployeeInfoAuthorityErrors() {
      const errors = [];
      if (!this.$v.EmployeeInfoAuthority.$dirty) return errors;
      !this.$v.EmployeeInfoAuthority.numeric && errors.push("必须为正整数");
      if (this.EmployeeInfoAuthority < 0 || this.EmployeeInfoAuthority > 20 ) {
        errors.push("权限必须为0～20之间");
      }
      return errors;
    }
  }
};
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
  .addEmployee h2 span {
    color: red;
  }
  .star {
    color: red;
    display: inline-block;
    padding: 20px;
  }
  .pleaseInput {
    display: inline-block !important;
    margin-left: 50px;
  }
  .authority {
    display: flex !important;
  }
  .pleaseInput1 {
    width: 800px !important;
  }
  .auth {
    margin: auto 0;
  }

  .addEmployee .selectP {
    position: relative;
  }
  .addEmployee .selectP span {
    display: inline-block;
    line-height: 10px;
    margin-left: 20px;
    width: 15px;
    border-bottom: 2px solid red;
    position: absolute;
    right: 10%;
    top: 40px;
    cursor: pointer;
  }
  .delSupply {
    right: 30% !important;
  }
  .addEmployee /deep/ .theme--light.v-icon {
    color: #2886c8;
    font-size: 40px;
  }
  .layoutBtn {
    margin-right: 150px;
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
  .theme--light.v-sheet {
    padding: 55px;
  }
  .layout {
    font-size: 18px !important;
    display: flex !important;
    align-items: center !important;
    margin-bottom: 20px !important;
  }
  .salaryClass {
    margin-bottom: 20px;
  }
  .theme--light.v-btn {
    margin-right: 60px !important;
  }
  .supplyLay {
    padding-left: 55px !important;
    color: rgb(88, 87, 87) !important;
  }
  .supplyLay .flex.xs6 {
    font-size: 16px !important;
  }
  .datePosition {
    position: relative;
    margin-left: 48px;
  }
  .v-menu__content {
    /* position: absolute !important;
    top: 298px !important;
    left: 538px !important; */
  }
</style>
