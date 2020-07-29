<template>
  <div class="editOrder">
    <v-layout>
      <p class="detailTit">标题 <span class="star">*</span></p>:
      <v-flex xs12 sm2 md6 style="margin-left:30px;">
        <v-text-field class="pleaseInput1" v-model.trim="editItem.title" disabled></v-text-field>
      </v-flex>

    </v-layout>
    <v-layout>
      <p class="detailTit">工单类型 <span class="star">*</span></p>:
      <v-flex xs4 sm2 md3 d-flex style="margin-left:30px;">
        <v-autocomplete label="输入工单类型" :items="orderCategory" item-value="_id" item-text="name" v-model.trim="editItem.category" disabled></v-autocomplete>
      </v-flex>
    </v-layout>
    <v-layout>
      <p class="detailTit">工单分类 <span class="star">*</span></p>:
      <v-flex xs4 sm2 md3 d-flex style="margin-left:30px;">
        <v-autocomplete label="输入工单分类" :items="orderClass" item-value="_id" item-text="name" v-model.trim="editItem.class" disabled></v-autocomplete>
      </v-flex>
    </v-layout>
    <v-layout v-if="editItem.priority">
      <p class="detailTit">优先级 <span class="star">*</span></p>:
      <v-flex md3 style="display:flex;">
        <v-radio-group v-model="editItem.priority" row style="margin-left:30px;">
          <v-radio v-for="(n,index) in allPriority" :key="index" :label="n.name" :value="n._id" disabled></v-radio>
        </v-radio-group>
      </v-flex>
    </v-layout>
    <v-layout>
      <p class="detailTit">内容 <span class="star">*</span></p>:
      <v-flex xs6 style="margin-left:30px;">
        <v-textarea auto-grow solo name="input-7-4" label="Solo textarea" v-model.trim="editItem.content" value="" disabled></v-textarea>
      </v-flex>
    </v-layout>

    <v-layout v-if="img.length>0">
      <p class="detailTit ">图片 <span class="star">*</span></p>:
      <v-flex xs12 sm2 md5 class="imgInfo">
        <div :key="index" v-for="(item,index) in img">
          <img :src="item" class="img" @click="jump(item)">
        </div>
      </v-flex>
    </v-layout>

    <v-layout>
      <p class="detailTit">期望完成时间 <span class="star">*</span></p>:
      <v-flex xs12 sm2 md3 style="margin-left:30px;">
        <v-menu v-model="menu_start" :close-on-content-click="false" :nudge-right="40" lazy transition="scale-transition" offset-y full-width min-width="100px">
          <template v-slot:activator="{ on }">
            <v-text-field v-model="editItem.estimate_time" label="请选择时间" prepend-icon="event" readonly v-on="on" disabled></v-text-field>
          </template>
          <v-date-picker v-model="editItem.estimate_time" locale="zh-cn" prepend-icon="event" @input="menu_start = false" disabled></v-date-picker>
        </v-menu>
      </v-flex>
    </v-layout>

    <v-layout v-if="showExpectTime">
      <p class="detailTit">预计完成时间 <span class="star">*</span></p>:
      <v-flex xs12 sm2 md3 style="margin-left:30px;">
        <v-menu v-model="menuStart" :close-on-content-click="false" :nudge-right="40" lazy transition="scale-transition" offset-y full-width min-width="100px">
          <template v-slot:activator="{ on }">
            <v-text-field v-model.trim="editItem.expect_time" label="请选择时间" prepend-icon="event" readonly v-on="on" disabled></v-text-field>
          </template>
          <v-date-picker v-model="editItem.expect_time" locale="zh-cn" prepend-icon="event" @input="menuStart = false" :min="limitDate" disabled></v-date-picker>
        </v-menu>
      </v-flex>
    </v-layout>
    <!-- 评价 -->
    <div class="common" v-show="ifstatusClose">
      <span class="timeliTit">评价</span>
      <div class="text-xs-left">
        <v-flex class="flex-comm" md5>时效：<v-rating :hover="ishover" :readonly="isread" v-model="rating1"></v-rating>
        </v-flex>
        <v-flex class="flex-comm">态度：<v-rating :hover="ishover" :readonly="isread" v-model="rating2"></v-rating>
        </v-flex>
        <v-flex class="flex-comm">专业：<v-rating :hover="ishover" :readonly="isread" v-model="rating3"></v-rating>
        </v-flex>
      </div>
    </div>
    <v-layout class="returnback">
      <v-flex md1>
        <v-btn small color="info" @click="goBackUserlist">返回</v-btn>
      </v-flex>
      <v-flex md1 v-show="!ifstatusClose">
        <v-btn small color="info" @click="addComm">添加评论</v-btn>
      </v-flex>
      <v-flex md1 v-show="ifstatusClose &&editItem.comment.length==0">
        <v-btn small color="info" @click="addFeedBack(rating1,rating2,rating3)">提交评价</v-btn>
      </v-flex>
    </v-layout>
    <!-- 弹框 -->
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-flex xs10 class="textPosition">
          <v-textarea solo name="input-7-4" label="请输入内容" v-model="addContent" :error-messages="addContentErrors" required @input="$v.addContent.$touch()" @blur="$v.addContent.$touch()"></v-textarea>
        </v-flex>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
          <v-btn color="blue darken-1" flat @click="saveContent">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 审核流程 -->
    <span class="timeliTit" v-if="status_id!==1001" style="margin-left:26%;">审核流程</span>
    <div class="timeline">
      <v-timeline dense clipped v-if="instanceinfo.length>0">
        <v-timeline-item class="mb-3" color="primary" fill-dot size="42" v-for="(items, i) in instanceinfo" :key="i">
          <v-layout justify-space-between>
            <v-card class="card">
              <!-- 待分派工单 -->
              <v-card-text v-if="items.tag==1">
                <p>时间：{{items.date}}</p>
                <p v-if="items.status&&items.status!=''">工单状态：{{items.status}}</p>
                <p v-if="items.remark&&items.remark!=''">内容 ： {{items.remark}}</p>
              </v-card-text>
              <!-- 启动工单 -->
              <v-card-text v-if="items.tag && items.tag=='start'">
                <p>申请人：{{items.name}}</p>
                <p>时间：{{items.date}}</p>
                <p v-if="items.status&&items.status!=''">工单状态：{{items.status.status}}</p>
              </v-card-text>
              <!-- 在工单增加的评论 -->
              <v-card-text v-if="items.tag==2">
                <p>申请人：{{items.name}}</p>
                <p>时间：{{items.date}}</p>
                <p v-if="items.status&&items.status!=''">工单状态：{{items.status}}</p>
                <p v-if="items.remark&&items.remark!=''">评论内容： {{items.remark}}</p>
              </v-card-text>
              <v-card-text v-if="items.tag !== 'start' && items.tag!==2&&items.tag!==1">
                <p>{{items.status._id===1002?"申请人：":items.operation_type==='ADD_REMARK'?"评论人：":"审批人："}}{{items.name}}</p>
                <p>时间：{{items.date}}</p>
                <p v-if="items.operation_result && items.operation_result !='NONE' && items.operation_type!='ADD_REMARK'">审核状态：{{items.operation_result==="AGREE"?"同意":"拒绝"}}</p>
                <p v-if="items.remark&&items.remark!='' ">{{items.operation_type === "ADD_REMARK"? "评论内容：":"审核意见：" }}{{ items.remark }}</p>
                <p v-if="items.status&&items.status!='' && items.operation_type!='ADD_REMARK'">工单状态：{{items.status.status}}</p>
                <p v-if="items.perationDesc&&items.perationDesc!=''">操作类型：{{items.perationDesc}}</p>
              </v-card-text>
            </v-card>
          </v-layout>
        </v-timeline-item>
      </v-timeline>
    </div>
    <snackbar ref="snackbar" />
  </div>
</template>
<script>
import snackbar from "../components/snackbar";
import formatDateTime from "../../utils/formatDateTime.js";
import { required } from "vuelidate/lib/validators";
import { imgHost } from "../../utils/conf.js";
export default {
  name: "detailOrder",
  components: { snackbar },
  validations: {
    addContent: { required }
  },
  data() {
    return {
      dialog: false, //评论弹框
      limitDate: new Date().toISOString().substr(0, 10),
      rating1: 0, //评分
      rating2: 0,
      rating3: 0,
      menu_start: false,
      menuStart: false,
      ifstatusClose: false, //工单状态是否关闭
      orderClass: [], //工单类型
      orderCategory: [], //工单分类
      allPriority: [], // 优先级
      editItem: {
        title: "",
        category: "",
        class: "",
        content: "",
        estimate_time: "",
        expect_time: ""
      },
      // priority: "",
      addContent: "", //评论内容
      timeLine: {},
      instanceinfo: [],
      status_id: 0,
      iscomment: false,
      ishover: true, //评分划过
      isread: false, //评分是否可以点击
      showExpectTime: true,
      img: []
    };
  },
  computed: {
    addContentErrors() {
      const errors = [];
      if (!this.$v.addContent.$dirty) return errors;
      !this.$v.addContent.required && errors.push("不能为空");
      return errors;
    }
  },
  async mounted() {
    await this.init();
    this.getInstanceInfo();
    if (this.status_id === 1005) {
      this.auto();
    }
  },
  methods: {
    //初始化
    async init() {
      let res = await this.$request.fetch("/api/thr/getThr", {
        thrType: "repairOrder"
      });
      if (res.data.status === 200) {
        this.orderCategory = res.data.result;
        // 默认工单分类显示账号分类
        this.orderClass = res.data.result[0].class;
      } else {
        this.$refs.snackbar.show("刷新重试", "error");
      }

      let res1 = await this.$request.fetch("/api/thr/getThr", {
        thrType: "repairPrioritys"
      });
      if (res1.data.status === 200) {
        this.allPriority = res1.data.result;
      } else {
        this.$refs.snackbar.show("刷新重试", "error");
      }
      await this.getFormData();
    },
    async getFormData() {
      let host = imgHost();
      //编辑时传递过来的参数
      let res4 = await this.$request.fetch("/api/repairorder/orderDetail", {
        _id: this.$route.query._id
      });
      if (res4.data.status === 200) {
        this.editItem = res4.data.result[0];
        if (
          this.editItem.estimate_time.substr(0, 10) ===
          this.editItem.expect_time.substr(0, 10)
        ) {
          this.showExpectTime = false;
        }
        this.editItem.expect_time = this.editItem.expect_time.substr(0, 10);
        this.editItem.estimate_time = this.editItem.estimate_time.substr(0, 10);
        this.orderCategory.forEach(item => {
          if (this.editItem.category === item._id) {
            this.orderClass = item.class;
          }
        });
        if (this.editItem.images) {
          this.img = [];
          let image = this.editItem.images;
          image.forEach(e => {
            if (e.indexOf("dingtalk") !== -1) {
              this.img.push(e);
            } else {
              this.img.push(host + e);
            }
          });
        }

        this.status_id = this.editItem.status._id;
        if (this.status_id === 1005) {
          this.ifstatusClose = true;
          if (this.editItem.comment.length > 0) {
            this.isread = true;
            this.ishover = false;
            this.rating1 = this.editItem.comment[0].time_liness;
            this.rating2 = this.editItem.comment[0].attitude;
            this.rating3 = this.editItem.comment[0].professional;
          } else {
            this.isread = false;
            this.ishover = true;
          }
        } else {
          this.ifstatusClose = false;
        }
      }
    },
    async getInstanceInfo() {
      let instanceinfo = await this.$request.fetch(
        "/api/repairorder/getInstanceInfo",
        { form_id: this.editItem._id }
      );
      if (instanceinfo.data.status === 200) {
        this.instanceinfo = instanceinfo.data.result;
        // 获取审批实例时候再次渲染工单（更新期望完成时间）
      } else {
        this.$snackbar().showError("获取数据失败，请刷新重试");
      }
    },
    addComm() {
      this.dialog = true;
    },
    close() {
      this.$v.$reset();
      this.dialog = false;
      this.addContent = "";
      setTimeout(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      }, 300);
    },
    //添加评论
    async saveContent() {
      this.$v.addContent.$touch();
      if (this.addContent === "") {
        return false;
      }
      this.dialog = false;
      let params = {
        _id: this.$route.query._id,
        executive: this.editItem.user_id._id,
        content: this.addContent
      };
      let res = await this.$request.fetch(
        "/api/repairorder/createComments",
        params,
        "post"
      );
      if (res.data.status === 200) {
        this.$refs.snackbar.show("评论添加成功");
        this.getInstanceInfo();
        this.addContent = "";
      } else {
        this.$refs.snackbar.show("评论添加失败", "error");
      }
      this.$v.$reset();
    },
    goBackUserlist() {
      this.$router.push({
        path: "/repairOrder/userList"
      });
    },
    async auto() {
      let time = new Date();
      let date = new Date(this.editItem.remark[0].exe_time);
      let start = date.getTime();
      let end = time.getTime();
      let gap = parseInt((end - start) / 1000);
      let runtime = gap % 86400 / 3600;
      if (this.editItem.comment.length === 0 && runtime >= 10) {
        this.addFeedBack(5, 5, 5);
      }
    },
    //星星评价分数
    async addFeedBack(rating1, rating2, rating3) {
      let params = {
        form_id: this.$route.query._id,
        time_liness: rating1,
        attitude: rating2,
        professional: rating3
      };
      let res = await this.$request.fetch(
        "/api/repairorder/addFeedBack",
        params,
        "post"
      );
      if (res.data.status === 200) {
        this.$refs.snackbar.show("评价成功", "info");
        this.iscomment = true;
        this.init();
      } else {
        this.$refs.snackbar.show("评价失败", "error");
        this.iscomment = false;
      }
    },
    goback() {
      this.$router.go(-1);
    },
    jump(url) {
      const newWin = window.open(url, "_blank");
      newWin.document.title = "图片预览";
    }
  }
};
</script>
<style scoped>
.detailTit {
  width: 130px;
  line-height: 68px;
  margin-bottom: 0;
  color: gray;
}
.editOrder {
  margin: 20px 50px;
}
.layout {
  font-size: 18px;
  align-items: center !important;
}
.star {
  color: #a29595;
  display: inline-block;
}
.returnback {
  margin: 20px 0 20px 21%;
}
.returnback div {
  margin-left: 40px;
}
.flex-comm {
  display: flex;
  align-items: center;
}
.text-xs-left {
  font-size: 20px;
  margin: 20px 0;
}
.text-xs-left .v-rating {
  margin-left: 30px;
}
.textPosition {
  margin: 0 auto;
  padding-top: 40px;
}
.timeline {
  margin-left: 17%;
}
.timeliTit {
  font-size: 28px;
  margin: 40px 0;
  display: block;
}
.v-card__text p {
  margin-bottom: 0;
  font-size: 16px;
}
.card {
  margin-left: 30px;
}
.v-input--selection-controls /deep/ .v-input__control {
  width: 100% !important;
}
.v-radio /deep/ {
  flex: 1;
}
.v-textarea.v-text-field--enclosed /deep/ .v-text-field__slot textarea {
  padding-right: 12px;
  font-size: 16px;
  line-height: 24px;
}

.productDetail {
  /*box-shadow: 0 1px 2px 2px #ccc;*/
  padding: 40px 60px 160px;
  color: #333;
  width: 85%;
}
.productDetail h2 {
  text-align: center;
  opacity: 0.8;
  margin-bottom: 20px;
}
.productDetail h2 span {
  color: red;
}
.productDetail .selectP {
  position: relative;
}
.productDetail .selectP .del {
  display: inline-block;
  width: 24px;
  padding: 10px;
  border-top: 2px solid red;
  margin-top: 4px;
  margin: 18px 15px 0 4px;
  cursor: pointer;
}
.productDetail /deep/ .theme--light.v-icon {
  color: #2886c8;
  font-size: 40px;
}
.layoutBtn button:nth-of-type(1) {
  margin-right: 40px;
}
.imgInfo {
  margin-left: 20px;
  display: flex;
  flex-flow: wrap;
}
.img {
  display: flex;
  width: 100px;
  height: 100px;
  margin: 10px 20px 10px 10px;
}
</style>

