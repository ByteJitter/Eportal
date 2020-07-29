<!--
 * @Descripttion: pmo管理->新增项目 / 编辑草稿
 * @Author: Doris
 * @Date: 2020-01-08 15:36:03
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-04-14 11:07:14
 -->
<template>
  <v-container class="container">
    <p class="title" v-text="addProTitle"></p>
    <v-form class="box">
      <div v-show="this.$route.query.id">
        <v-layout row>
        <v-flex xs4 md4 lg2 class="row-lab-sty">
          <v-subheader>
            项目编号
            <span>*</span>
          </v-subheader>
        </v-flex>
        <v-flex md6 lg6 class="show-sty">
          <v-subheader v-model="addProjectData.number">{{addProjectData.number}}</v-subheader>
        </v-flex>
      </v-layout>
      </div>
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row-lab-sty">
          <v-subheader>
            项目名称
            <span>*</span>
          </v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model.trim="addProjectData.name" :error-messages="nameErrors" required @input="$v.addProjectData.name.$touch()" @blur="$v.addProjectData.name.$touch()"></v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row-lab-sty">
          <v-subheader>
            项目地址
            <span>*</span>
          </v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-text-field v-model.trim="addProjectData.proj_href" :error-messages="hrefErrors" required @input="$v.addProjectData.proj_href.$touch()" @blur="$v.addProjectData.proj_href.$touch()">
          </v-text-field>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row-lab-sty">
          <v-subheader>
            项目说明
            <span>*</span>
          </v-subheader>
        </v-flex>
        <v-flex md6 lg6>
          <v-textarea solo v-model.trim="addProjectData.desc" :error-messages="descErrors" required @input="$v.addProjectData.desc.$touch()" @blur="$v.addProjectData.desc.$touch()"></v-textarea>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row-lab-sty">
          <v-subheader>
            预计结案时间
            <span>*</span>
          </v-subheader>
        </v-flex>
        <v-flex md4 lg2>
          <v-menu ref="endTime" v-model="endTime" :close-on-content-click="false" :nudge-right="40" :return-value.sync="addProjectData.expect_close_date" lazy transition="scale-transition" offset-y
            full-width min-width="290px">
            <template v-slot:activator="{ on }">
              <v-text-field v-model.trim="addProjectData.expect_close_date" readonly v-on="on" label="请选择日期" :error-messages="dateErrors" required
                @change="$v.addProjectData.expect_close_date.$touch()" @blur="$v.addProjectData.expect_close_date.$touch()"></v-text-field>
            </template>
            <v-date-picker v-model="addProjectData.expect_close_date" locale="zh-cn" no-title scrollable :allowed-dates="allowedDates">
              <v-spacer></v-spacer>
              <v-btn flat color="primary" @click="endTime = false">返回</v-btn>
              <v-btn flat color="primary" @click="$refs.endTime.save(addProjectData.expect_close_date)">确定</v-btn>
            </v-date-picker>
          </v-menu>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row-lab-sty">
          <v-subheader>
            项目单位
            <span>*</span>
          </v-subheader>
        </v-flex>
        <v-flex md6 lg6 class="show-sty">
          <v-subheader v-model="addProjectData.company">{{addProjectData.company}}</v-subheader>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row-lab-sty">
          <v-subheader>
            项目经理
            <span>*</span>
          </v-subheader>
        </v-flex>
        <v-flex md6 lg6 class="show-sty">
          <v-subheader v-model="addProjectData.manager">{{manager}}</v-subheader>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex xs4 md4 lg2 class="row-lab-sty">
          <v-subheader>
            项目等级
            <span>*</span>
          </v-subheader>
        </v-flex>
        <v-flex md4 lg2>
          <v-select :items="items" item-text="level_name" item-value="level" no-data-text="暂无数据" v-model="addProjectData.level" :error-messages="levelErrors" required
            @change="$v.addProjectData.level.$touch()" @blur="$v.addProjectData.level.$touch()">{{addProjectData.level_name}}</v-select>
        </v-flex>
      </v-layout>
      <v-layout row class="btn-sty">
        <v-flex md4 lg2 btn>
          <v-btn color="info" @click="backToCancel()" v-if="btnCancel">返回</v-btn>
        </v-flex>
        <v-flex md4 lg2 btn>
          <v-btn color="info" @click="backToSave()" v-if="btnSave">{{this.$route.query.index=="addProj"?"创建":"保存"}}</v-btn>
        </v-flex>
      </v-layout>
    </v-form>
  </v-container>
</template>
<script>
import { required } from "vuelidate/lib/validators";
import Common from "@/utils/common";
import { getStatus, getCurrentUserInfos} from "@/utils/getStatus";
export default {
  validations: {
    addProjectData: {
      name: { required },
      desc: { required },
      expect_close_date: { required },
      manager: { required },
      level: { required },
      proj_href: { required }
    }
  },
  data() {
    return {
      addProTitle: "新增项目",
      addProjectData: {
        number: "",
        name: "",
        desc: "",
        company: "百星",
        manager: "",
        status: "draft",
        level: "",
        expect_close_date: "",
        proj_href: ""
      },
      items: [],
      btnSave: true,
      btnCancel: true,
      endTime: false,
      // employees: []
      manager: ""
    };
  },
  computed: {
    hrefErrors() {
      const errors = [];
      if (!this.$v.addProjectData.proj_href.$dirty) return errors;
      !this.$v.addProjectData.proj_href.required && errors.push("不能为空");
      return errors;
    },
    nameErrors() {
      const errors = [];
      if (!this.$v.addProjectData.name.$dirty) return errors;
      !this.$v.addProjectData.name.required && errors.push("不能为空");
      return errors;
    },
    descErrors() {
      const errors = [];
      if (!this.$v.addProjectData.desc.$dirty) return errors;
      !this.$v.addProjectData.desc.required && errors.push("不能为空");
      return errors;
    },
    dateErrors() {
      const errors = [];
      if (!this.$v.addProjectData.expect_close_date.$dirty) return errors;
      !this.$v.addProjectData.expect_close_date.required &&
        errors.push("不能为空");
      return errors;
    },
    levelErrors() {
      const errors = [];
      if (!this.$v.addProjectData.level.$dirty) return errors;
      !this.$v.addProjectData.level.required && errors.push("不能为空");
      return errors;
    }
  },
  mounted() {
    // 编辑时获取的参数
    if (this.$route.query.addProjectData) {
      this.addProjectData = this.$route.query.addProjectData;
    }
    if (this.$route.query.btnSave) {
      this.btnSave = !this.$route.query.btnSave;
    }
    // 获取新增内容展示在新增页面
    this.getProjectDetail();
    // 获取项目经理
    this.getManager();
    // 获取等级列表
    this.getLevelList();
    // this.getProjNum();
  },
  methods: {
    // 设置项目编号
    async getProjNum(){
      if(this.$route.query.index === "addProj"){
        // let year = new Date().getFullYear();
        // let countProj = await this.$request.fetch("/api/project/pmo/countProj");
        // let num = countProj.data.result.length;
        // num++;
        // this.addProjectData.number = num > 0 && num < 10 ? year + "P00" + num : num >= 10 && num <= 99 ? year + "P0" + num : year + "P" + num;
      }
    },
    // 获取等级列表
    async getLevelList() {
      let data = await getStatus();
      data.forEach(element => {
        let elementLevel = {};
        elementLevel.level = element;
        elementLevel.level_name = "D" + element;
        this.items.push(elementLevel);
      });
    },
    //设置时间选择不能迟于当下时间
    allowedDates: val => Date.parse(val) > Date.now() - 8.64e7,

    backToSave: Common.throttle(async function() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.$snackbar().showError("信息填写不完整");
        return;
      }
      let regHref = /^(https|http)\:\/\/git/;
      if (!regHref.test(this.addProjectData.proj_href)) {
        this.$snackbar().showError("请输入正确的项目地址");
        return;
      }
      //  编辑(草稿状态)
      let _id = this.$route.query.id;
      if (_id) {
        let { data } = await this.$request.fetch(
          "/api/project/pmo/projectList",
          { data: this.addProjectData, _id: _id },
          "post"
        );
        if (data.status === 200) {
          this.$snackbar().showStatus("edit");
          setTimeout(() => {
            this.$router.go(-1);
          }, 500);
        } else if (data.status === 504) {
          this.$snackbar().showError(data.msg);
        } else {
          this.$snackbar().showStatus("edit", false);
        }
      } else {
        this.addProjectData.close_date = this.addProjectData.expect_close_date;
        let year = new Date().getFullYear();
        let countProj = await this.$request.fetch("/api/project/pmo/countProj");
        let num = countProj.data.result.length;
        num++;
        this.addProjectData.number = num > 0 && num < 10 ? year + "P00" + num : num >= 10 && num <= 99 ? year + "P0" + num : year + "P" + num;
        // 新增
        let res = await this.$request.fetch(
          "/api/project/pmo/projectList",
          {
            data: this.addProjectData
          },
          "post"
        );
        if (res.data.status === 200) {
          this.$snackbar().showStatus("add");
          setTimeout(() => {
            this.$router.go(-1);
          }, 500);
        } else if (res.data.status === 504) {
          this.$snackbar().showError(res.data.msg);
        } else {
          this.$snackbar().showStatus("add", false);
        }
      }
    }, 3000),
    backToCancel() {
      this.$router.go(-1);
    },
    // 获取当前登录用户信息生成项目经理
    async getManager() {
      let managerData = await getCurrentUserInfos();
      if(managerData){
        this.manager = managerData[0].name;
        this.addProjectData.manager = managerData[0]._id;
      }else {
        this.$snackbar().showError("获取当前用户信息失败");
      }
    },
    // 获取新增内容展示在新增页面
    async getProjectDetail() {
      if (this.$route.query.id) {
        this.addProTitle = "编辑新增";
        let res = await this.$request.fetch(
          "/api/project/pmo/projectListDetail",
          {
            _id: this.$route.query.id
          }
        );
        if (res.data.status === 200) {
          this.addProjectData = res.data.result;
          // 修改预计结案时间格式
          this.addProjectData.expect_close_date = this.addProjectData.expect_close_date.substring(
            0,
            10
          );
          this.manager = res.data.result.manager.name;
          this.addProjectData.manager = res.data.result.manager._id;
        } else {
          this.$snackbar().showError();
        }
      }
    }
  }
};
</script>
<style scoped>
.container {
  width: 100%;
  height: 100%;
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
}
.title {
  width: 80%;
  position: absolute;
  top: 40px;
  text-align: center;
  font-size: 30px;
  color: #4d4d4d;
}
.box {
  margin: 81px 31px 68px 31px;
}
.row-lab-sty {
  padding: 14px 0 16px 50px;
}
.row-lab-sty span {
  color: red;
  margin-left: 4px;
}

.btn-sty {
  margin: 50px 0 228px 600px;
}
.show-sty {
  padding: 14px 0 16px;
}
.btn {
  margin-right: 50px;
}
</style>