<!--
 * @Descripttion: pmo管理->PMO结案申请单详情页
 * @Author: Doris
 * @Date: 2019-12-27 16:51:54
 * @LastEditors: Doris
 * @LastEditTime: 2020-03-11 09:28:10
 -->
<template>
  <div>
    <div class="header">
      <span>结案申请单</span>
    </div>
    <div class="cont">
      <v-layout row>
        <v-flex md4 lg2>
          <v-subheader class="row-title-sty">项目编号</v-subheader>
        </v-flex>
        <v-flex md8 lg4>
          <v-subheader class="row-detail-sty">{{this.applyDetailData.number}}</v-subheader>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex md4 lg2>
          <v-subheader class="row-title-sty">项目名称</v-subheader>
        </v-flex>
        <v-flex md8 lg4>
          <v-subheader class="row-detail-sty">{{this.applyDetailData.name}}</v-subheader>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex md4 lg2>
          <v-subheader class="row-title-sty">项目说明</v-subheader>
        </v-flex>
        <v-flex md8 lg4>
          <v-subheader class="row-detail-sty">{{this.applyDetailData.desc}}</v-subheader>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex md4 lg2>
          <v-subheader class="row-title-sty">预计结案时间</v-subheader>
        </v-flex>
        <v-flex md8 lg4>
          <v-subheader class="row-detail-sty">{{this.applyDetailData.expect_close_date}}</v-subheader>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex md4 lg2>
          <v-subheader class="row-title-sty">项目经理</v-subheader>
        </v-flex>
        <v-flex md8 lg4>
          <v-subheader
            class="row-detail-sty"
          >{{this.applyDetailData.manager && this.applyDetailData.manager.name}}</v-subheader>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex md4 lg2>
          <v-subheader class="row-title-sty">项目等级</v-subheader>
        </v-flex>
        <v-flex md8 lg4>
          <v-subheader class="row-detail-sty">D{{this.applyDetailData.level}}</v-subheader>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex md4 lg2>
          <v-subheader class="row-title-sty">
            结案分数
            <span style="color:red">&nbsp;*</span>
          </v-subheader>
        </v-flex>
        <v-flex md6 lg3 class="v-flex">
          <v-text-field
            class="row-detail-sty"
            v-model.trim="score"
            :error-messages="scoreErrors"
            required
            @input="$v.score.$touch()"
            @blur="$v.score.$touch()"
          ></v-text-field>
          <span class="v-flex-span" v-show="flagspan">分数不能大于3.75</span>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex md4 lg2>
          <v-subheader class="row-title-sty">
            结案结果
            <span style="color:red">&nbsp;*</span>
          </v-subheader>
        </v-flex>
        <v-flex md6 lg3>
          <v-select
            :items="items"
            item-text="cSuccess"
            item-value="eSuccess"
            no-data-text="暂无数据"
            class="row-detail-sty"
            v-model.trim="status"
            :error-messages="statusErrors"
            required
            @input="$v.status.$touch()"
            @blur="$v.status.$touch()"
            @change="changes"
          ></v-select>
        </v-flex>
      </v-layout>
      <v-layout row>
        <v-flex md4 lg2>
          <v-subheader class="row-title-sty">
            奖励项目
            <span style="color:red">&nbsp;*</span>
          </v-subheader>
        </v-flex>
        <v-flex md6 lg3>
          <v-select
            :items="itemaward"
            no-data-text="暂无数据"
            class="row-detail-sty"
            v-model.trim="reward"
            :error-messages="isAward"
            required
            @input="$v.reward.$touch()"
            @blur="$v.reward.$touch()"
          ></v-select>
        </v-flex>
      </v-layout>
      <v-layout class="btn-sty">
        <v-flex xs8 md6 lg4 btn>
          <v-btn color="info" dark @click="agree()">同意</v-btn>
          <v-btn color="info" dark @click="disagree()">驳回</v-btn>
          <v-btn color="info" dark @click="goback()">返回</v-btn>
        </v-flex>
      </v-layout>
    </div>
  </div>
</template>
<script>
import validate from "@/utils/validate";
import { EventBus } from "@/utils/eventBus.js";
import { required } from "vuelidate/lib/validators";
export default {
  validations: {
    score: { required },
    status: { required },
    reward: { required }
  },
  data() {
    return {
      applyDetailData: [],
      score: "",
      status: "",
      reward: "",
      isstatus: "",
      isreward: false,
      flagspan: false,
      items: [
        { cSuccess: "已结案（成功）", eSuccess: "end-success" },
        { cSuccess: "已结案（失败）", eSuccess: "end-fail" }
      ],
      itemaward: ["是", "否"]
    };
  },
  computed: {
    scoreErrors() {
      const errors = [];
      if (!this.$v.score.$dirty) return errors;
      !this.$v.score.required && errors.push("不能为空");
      return errors;
    },
    statusErrors() {
      const errors = [];
      if (!this.$v.status.$dirty) return errors;
      !this.$v.status.required && errors.push("不能为空");
      return errors;
    },
    isAward() {
      const errors = [];
      if (!this.$v.reward.$dirty) return errors;
      !this.$v.reward.required && errors.push("不能为空");
      return errors;
    }
  },
  watch: {
    score: function(oldValue, newValue) {
      if (oldValue >= 4.8) {
        this.reward = "是";
        this.itemaward = ["是", "否"];
      } else {
        this.reward = "否";
        this.itemaward = ["否"];
        if (this.score <= 3.75) this.flagspan = false;
      }
    }
  },
  mounted() {
    if (this.$route.query.id) {
      this.getApplyDetail();
    }
  },
  activeted() {
    this.disagree();
  },
  methods: {
    changes() {
      // eslint-disable-next-line
      if (this.status == "end-fail") {
        this.score = 3.75;
        this.itemaward = ["否"];
      } else {
        this.flagspan = false;
      }
    },
    async getApplyDetail() {
      let res = await this.$request.fetch("/api/project/pmo/applyComplete", {
        id: this.$route.query.id
      });
      if (res.data.status === 200) {
        this.applyDetailData = res.data.result[0];
        this.applyDetailData.expect_close_date = this.applyDetailData.expect_close_date.substring(
          0,
          10
        );
      } else {
        this.$snackbar.showError("刷新重试");
      }
    },
    async agree() {
      this.$v.$touch();
      if (this.score === "" || this.status === "") {
        return false;
      }
      if (
        this.score >= 4.8 &&
        this.reward == "是" &&
        this.status == "end-success"
      ) {
        this.isreward = true;
      } else {
        this.isreward = false;
      }
      if (this.status == "end-fail" && this.score > 3.75) {
        this.flagspan = true;
        return false;
      }
      // this.flagspan = false;
      let res = await this.$request.fetch(
        "/api/project/pmo/applyComplete",
        {
          data: {
            _id: this.$route.query.id,
            score: this.score,
            status: this.status,
            is_reward: this.isreward
          }
        },
        "put"
      );
      if (res.data.status === 200) {
        this.$snackbar("extend").showOk("结案成功");
        this.$router.push({ path: "applyform" });
      } else if (res.data.status === 503) {
        return this.$snackbar().showError(res.data.msg);
      }
    },
    async disagree() {
      let res = await this.$request.fetch(
        "/api/project/pmo/applyComplete",
        {
          data: {
            _id: this.$route.query.id,
            status: "pending"
          }
        },
        "put"
      );
      this.$router.push({ path: "applyform" });
    },
    goback() {
      this.$router.go(-1);
    }
  }
};
</script>
<style scoped>
.header {
  margin: 43.9px 25.8px 0 36.2px;
  background: #e0e1e2;
  height: 64.6px;
  text-align: center;
  padding-top: 13.5px;
}
.header span {
  font-family: PingFangSC-Regular;
  font-size: 27px;
  color: #333300;
}
.cont {
  background: #ffffff;
  margin: 0 25.8px 0 36.2px;
}
.row {
  margin-left: 38px;
  margin-right: 79px;
}
.row-title-sty {
  font-family: PingFangSC-Semibold;
  font-size: 17px;
  color: #4d4d4d;
  letter-spacing: 0;
  line-height: 24px;
}
.row-detail-sty {
  font-family: PingFangSC-Regular;
  font-size: 17px;
  color: #333333;
  /* position: relative;s */
}
.btn-sty {
  margin: 162px 0px 46px 500px;
  padding-bottom: 200px;
  font-family: PingFangSC-Regular;
  font-size: 18px;
  color: #f1e9e9;
  position: relative;
}
.btn {
  position: absolute;
  right: 300px;
  display: flex;
}
.v-flex {
  position: relative;
}
.v-flex-span {
  color: red;
  font-size: 10px;
  position: absolute;
  top: 56px;
}
</style>