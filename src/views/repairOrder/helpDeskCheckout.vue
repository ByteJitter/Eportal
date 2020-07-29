<template>
  <div class="editOrder">
    <v-layout>
      <p class="detailTit">标题 <span class="star">*</span></p>:
      <v-flex xs12 sm2 md6 style="margin-left:30px;">
        <v-text-field class="pleaseInput1" v-model="editItem.title" disabled></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      <p class="detailTit detailTitAble">工单类型 <span class="star">*</span></p>:
      <v-flex xs4 sm2 md3 d-flex style="margin-left:30px;">
        <v-autocomplete label="输入工单类型" no-data-text="暂无数据" :items="orderCategory" item-value="_id" item-text="name" v-model="editItem.category" :disabled="iseditHelpdesk==false" @change="changeCategory(editItem.category)"></v-autocomplete>
      </v-flex>
    </v-layout>
    <v-layout>
      <p class="detailTit detailTitAble">工单分类 <span class="star">*</span></p>:
      <v-flex xs4 sm2 md3 d-flex style="margin-left:30px;">
        <v-autocomplete label="输入工单分类" no-data-text="暂无数据" :items="orderClass" item-value="_id" item-text="name" v-model="editItem.class" :disabled="iseditHelpdesk==false"></v-autocomplete>
      </v-flex>
    </v-layout>
    <v-layout>
      <p class="detailTit detailTitAble">优先级 <span class="star">*</span></p>:
      <v-flex md3 style="display:flex;">
        <v-radio-group v-model="editItem.priority" row style="margin-left:30px;" :error-messages="priorityErrors" @blur="$v.editItem.priority.$touch()" :disabled="this.status_id !== 1002 && iseditHelpdesk==false">
          <v-radio v-for="(n,index) in allPriority" :key="index" :label="n.name" :value="n._id" no-data-text="暂无数据"></v-radio>
        </v-radio-group>
      </v-flex>
    </v-layout>
    <v-layout>
      <p class="detailTit">内容 <span class="star">*</span></p>:
      <v-flex xs6 style="margin-left:30px;">
        <v-textarea auto-grow  solo name="input-7-4" label="Solo textarea" v-model="editItem.content" value="" disabled></v-textarea>
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
    <!-- 查看页面时 -->
    <v-layout class="returnback" v-show="!iseditHelpdesk">
      <v-flex md1 v-if="this.status_id === 1003 || this.status_id === 1005" class="back">
        <v-btn small color="info" @click="goBack">返回</v-btn>
      </v-flex>
      <v-flex md1 v-if="this.status_id === 1002 || this.status_id === 1004 ">
        <v-btn small color="info" @click="goBack">返回</v-btn>
      </v-flex>
      <v-flex md1>
        <v-btn small color="info" v-if="this.status_id===1002 ||this.status_id===1004" @click="editHelpdesk">编辑</v-btn>
      </v-flex>
      <v-flex md1>
        <v-btn small color="info" v-if="this.status_id===1002 ||this.status_id===1004" @click="closeOrder">关闭工单</v-btn>
      </v-flex>
      <v-flex md1>
        <v-btn small color="info" v-if="this.status_id===1002" @click="start()">启动流程</v-btn>
        <v-btn small color="info" v-if="this.status_id===1004" @click="restart()">重新启动流程</v-btn>
      </v-flex>
    </v-layout>
    <!-- 编辑时 -->
    <v-layout class="returnback" v-show="iseditHelpdesk">
      <v-flex md1>
        <v-btn small color="info" @click="goBackCheckout()">取消</v-btn>
      </v-flex>
      <v-flex md1>
        <v-btn small color="info" v-if="this.status_id===1002" @click="editandstart()">启动流程</v-btn>
        <v-btn small color="info" v-if="this.status_id===1004" @click="restart()">重新启动流程</v-btn>
      </v-flex>
    </v-layout>
    <!-- 弹框 添加回复内容 -->
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-flex xs10 class="textPosition">
          <v-textarea solo name="input-7-4" label="请输入内容" v-model="addContent" :error-messages="addContentErrors" required @input="$v.addContent.$touch()" @blur="$v.addContent.$touch()"></v-textarea>
        </v-flex>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
          <v-btn color="blue darken-1" flat @click="saveReview">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 评价 -->
    <div class="text-xs-left" v-if="iscomment&&status_id===1005">
      <span class="timeliTit">评价</span>
      <v-flex class="flex-comm">时效：<v-rating :readonly="isread" v-model="comment.time_liness"></v-rating>
      </v-flex>
      <v-flex class="flex-comm">态度：<v-rating :readonly="isread" v-model="comment.attitude"></v-rating>
      </v-flex>
      <v-flex class="flex-comm">专业：<v-rating :readonly="isread" v-model="comment.professional"></v-rating>
      </v-flex>
    </div>
    <!-- 审核流程 -->
    <span class="timeliTit" v-show="!iseditHelpdesk" style="margin-left:28%;">审核流程</span>
    <div class="timeline" v-show="!iseditHelpdesk">
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
                <p >{{items.status._id===1002?"申请人：":items.operation_type==='ADD_REMARK'?"评论人：":"审批人："}}{{items.name}}</p>
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
import Common from "../../utils/common";
import snackbar from "../components/snackbar";
import formatDateTime from "../../utils/formatDateTime.js";
import { required } from "vuelidate/lib/validators";
import { imgHost } from "../../utils/conf.js";
export default {
  name: "detailOrder",
  components: { snackbar },
  validations: {
    addContent: { required },
    editItem: {
      priority: { required }
    }
  },
  data() {
    return {
      dialog: false,
      //是否是编辑时
      iseditHelpdesk: false,
      // estimate_time: new Date().toISOString().substr(0, 10),
      // expect_time: new Date().toISOString().substr(0, 10),
      close_date: new Date().toISOString(),
      menu_start: false,
      menuStart: false,
      //工单分类
      orderClass: [],
      //工单类型
      orderCategory: [],
      allPriority: [],
      timer: "",
      //编辑时
      editItem: {
        title: "",
        category: "",
        class: "",
        content: "",
        priority: "",
        estimate_time: new Date().toISOString().substr(0, 10),
        expect_time:'',
        images: []
      },
      // priority: "",
      addContent: "", //点击关闭工单弹框输入的内容，
      usertel: "",
      status_id: 0,
      // 工单发起人
      applyPeople: "",
      instanceinfo: [],
      comment: {
        time_liness: 0,
        attitude: 0,
        professional: 0
      },
      iscomment: false,
      isread: true,
      limitDate: new Date().toISOString().substr(0, 10),
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
    },
    priorityErrors() {
      const errors = [];
      if (!this.$v.editItem.priority.$dirty) return errors;
      !this.$v.editItem.priority.required && errors.push("请选择优先级");
      return errors;
    }
  },

  async mounted() {
    await this.init();
    await this.getInstanceInfo();
  },
  methods: {
    async init() {
      let res = await this.$request.fetch("/api/thr/getThr", {
        thrType: "repairOrder"
      });
      if (res.data.status === 200) {
        this.orderCategory = res.data.result;
        // 默认工单分类显示账号分类
        this.orderClass = res.data.result[0].class;
      } else {
        this.$refs.snackbar.showError("刷新重试");
      }

      let res1 = await this.$request.fetch("/api/thr/getThr", {
        thrType: "repairPrioritys"
      });
      if (res1.data.status === 200) {
        this.allPriority = res1.data.result;
      } else {
        this.$refs.snackbar.showError("刷新重试");
      }
      await this.getFormData();
    },

    async getFormData() {
      let host = imgHost();
      let res4 = await this.$request.fetch("/api/repairorder/orderDetail", {
        _id: this.$route.query._id
      });

      if (res4.data.status === 200) {
        this.editItem = res4.data.result[0];
        if (this.editItem.estimate_time.substr(0, 10) === this.editItem.expect_time.substr(0, 10)) {
          this.showExpectTime = false;
        }
        this.editItem.estimate_time = this.editItem.estimate_time.substr(0, 10);
        this.editItem.expect_time = this.editItem.expect_time.substr(0, 10);
        this.status_id = this.editItem.status._id;
        this.applyPeople = this.editItem.user_id._id;
        this.orderCategory.forEach(item => {
          if (this.editItem.category === item._id) {
            this.orderClass = item.class;
          }
        });
        if(this.editItem.images){
          this.img = [];
          let image = this.editItem.images;
          image.forEach(e => {
            if(e.indexOf("dingtalk") !== -1){
              this.img.push(e);
            }else{
              this.img.push(host + e);
            }
          })
        }
      } else {
        this.$refs.snackbar.showError("刷新重试");
      }
      if (this.status_id === 1005) {
        this.ishover = false;
      } else {
        this.ishover = true;
      }

      if (this.editItem.comment.length > 0) {
        this.iscomment = true;
        this.comment.time_liness = this.editItem.comment[0].time_liness;
        this.comment.attitude = this.editItem.comment[0].attitude;
        this.comment.professional = this.editItem.comment[0].professional;
      } else {
        this.iscomment = false;
      }
    },

    async getInstanceInfo() {
      let instanceinfo = await this.$request.fetch(
        "/api/repairorder/getInstanceInfo",
        { form_id: this.editItem._id }
      );
      if (instanceinfo.data.status === 200) {
        this.instanceinfo = instanceinfo.data.result;
      } else {
        this.$refs.snackbar.showError("审批流程获取失败，请刷新重试");

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
    save() {
      this.dialog = false;
    },
    editHelpdesk() {
      this.$v.$reset();
      this.iseditHelpdesk = !this.iseditHelpdesk;
    },
    goBackCheckout() {
      this.$v.$reset();
      this.iseditHelpdesk = !this.iseditHelpdesk;
      this.init();
    },
    //返回列表页
    goBack() {
      this.$router.go(-1);
    },
    async getusertel() {
      let restel = await this.$request.fetch("/api/repairorder/getUserTel", {
        userid: this.editItem.user_id._id
      });
      if (restel.data.status === 200) {
        this.usertel = restel.data.result;
      }
    },
    //点击启动流程
    async start() {
      this.$v.$touch();
      if (!this.editItem.priority) {
        return false;
      }

      let res = await this.$request.fetch(
        "/api/repairorder/repairStart",
        {
          status_id: 1003,
          form_id: this.editItem._id,
          priority: this.editItem.priority,
          applyPeople: this.applyPeople
        },
        "post"
      );
      if (res.data.status === 200) {
        this.$refs.snackbar.show("启动流程成功", "info");
        // this.init();
        this.getFormData();
        this.getInstanceInfo();
      } else {
        this.$refs.snackbar.show("启动流程失败", "error");
      }
      this.$v.$reset();
    },
    //编辑后点击启动流程
    async editandstart() {
      this.$v.$touch();
      if (!this.editItem.priority) {
        return false;
      }
      let res = await this.$request.fetch(
        "/api/repairorder/updateandStart",
        {
          status_id: 1003,
          form_id: this.editItem._id,
          category: this.editItem.category,
          class: this.editItem.class,
          priority: this.editItem.priority,
          applyPeople: this.applyPeople,
          estimate_time: this.editItem.estimate_time,
          // images: this.editedItem.images
        },
        "post"
      );
      if (res.data.status === 200) {
        this.$refs.snackbar.show("启动流程成功", "info");
        this.getFormData();
        this.getInstanceInfo();
      } else {
        this.$refs.snackbar.show("启动流程失败", "error");
      }
    },
    //重新启动按钮
    async restart() {
      let res = await this.$request.fetch(
        "/api/repairorder/updateFormandstart",
        {
          status_id: 1003,
          form_id: this.editItem._id,
          category: this.editItem.category,
          class: this.editItem.class,
          priority: this.editItem.priority,
          applyPeople: this.applyPeople,
          instance_id: this.editItem.instance_ids[
            this.editItem.instance_ids.length - 1
          ],
          estimate_time: this.editItem.estimate_time,
          // images: this.editedItem.images
        },
        "post"
      );
      if (res.data.status === 200) {
        this.$refs.snackbar.show("重新启动流程成功", "info");
        this.getFormData();
        this.getInstanceInfo();
      } else {
        this.$refs.snackbar.show("重新启动流程失败", "error");
      }
    },
    //关闭工单
    closeOrder() {
      this.dialog = true;
    },
    //点击关闭工单时的确定按钮
    async saveReview() {
      this.$v.addContent.$touch();
      if (this.addContent === "") {
        return false;
      }
      let res = await this.$request.fetch(
        "/api/repairorder/closeOrder",
        {
          content: this.addContent,
          exe_time: this.close_date,
          form_id: this.editItem._id,
          status: 1005
        },
        "post"
      );
      if (res.data.status === 200) {
        this.$refs.snackbar.show("成功关闭工单", "info");
        this.dialog = false;
        this.init()
        this.getInstanceInfo()
      } else {
        this.$refs.snackbar.show("关闭工单失败", "error");
      }
      this.$v.$reset();
    },
    async changeCategory(category_id) {
      for (const item of this.orderCategory) {
        if (category_id === item._id) {
          this.orderClass = item.class;
        }
      }
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
  margin-bottom: 0;
  line-height: 68px;
  color: gray;
}
.detailTitAble {
  color: #000;
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
  width: 600px;
  justify-content: center;
  margin: 20px 0 0 5%;
}
.returnback div {
  margin-right: 60px;
}

.timeliTit {
  font-size: 28px;
}
.flex-comm {
  display: flex;
  align-items: center;
}
.text-xs-left {
  font-size: 20px;
  margin: 20px 0;
}
.textPosition {
  margin: 0 auto;
  padding-top: 40px;
}
/* 审核流程 */
.timeline {
  margin-left: 17%;
}
.timeliTit {
  font-size: 28px;
  margin: 30px 0;
  display: block;
}
.v-card__text p {
  margin-bottom: 0;
  font-size: 16px;
}
.card {
  margin-left: 30px;
}
.back {
  margin-left: 40%;
}
.v-input--selection-controls /deep/ .v-input__control {
  width: 100% !important;
}
.v-radio /deep/ {
  flex: 1;
}
.v-textarea.v-text-field--enclosed /deep/ .v-text-field__slot textarea {
    padding-right: 12px ;
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

