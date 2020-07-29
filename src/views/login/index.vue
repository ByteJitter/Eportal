
<template>
  <v-container fluid>
    <v-layout>
      <v-flex mt-5 offset-xs xs4 mb-5>
        <div class="logo" style="margin-left:135%"></div>
      </v-flex>
    </v-layout>
    <v-layout>
      <v-flex offset-xs4 xs4 mt-1>
        <v-card min-width="560" min-height="440">
          <v-card-text v-if="ph">
            <h2 class="text-sm-center">ePortal系统登录</h2>
            <v-layout>
              <v-flex sm8 offset-sm2 mt-3>
                <v-text-field label="账号" placeholder="请输入手机号码" v-model.trim="phone" :error-messages="telErrors" @blur="checkPhone()" class="placeholder"></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout>
              <v-flex sm5 offset-sm2 mt-3>
                <v-text-field label="验证码" placeholder="请输入验证码" v-model="captcha" @change.native="checkCaptcha"></v-text-field>
              </v-flex>
              <v-flex sm3 mt-1>
                <img src="api/captcha" alt="captcha" @click="getCaptcha" ref="captcha" />
              </v-flex>
            </v-layout>
            <v-layout>
              <v-flex sm5 offset-sm2 mt-3>
                <v-text-field label="短信验证码" placeholder="请输入短信验证码" v-model="code"></v-text-field>
              </v-flex>
              <v-flex sm3 mt-1>
                <button class="btn-message" :class="{gray:waitTimer>0}" @click.prevent="getCode()">
                  <span class="span-message" v-show="showNum" :class="{gray_span:waitTimer>0}">{{ this.waitTimer + " "}}</span>
                  <span class="span-message" :class="{gray_span:waitTimer>0}">{{ getCodeText }}</span>
                </button>
              </v-flex>
            </v-layout>
            <v-layout style="display:flex;justify-content: center">
              <button class="btn-login waves" @click="login()">登录</button>
            </v-layout>
          </v-card-text>
          <v-card-text v-if="dd">
            <h2 class="text-sm-center">钉钉登录ePortal系统</h2>
            <p class="smallmsg">仅限百星公司内部员工</p>
            <v-layout class="aboutBox">
              <div class="about">
                <div id="ddlogin_container"></div>
              </div>
            </v-layout>
          </v-card-text>
          <v-card-text v-if="wx">
            <h2 class="text-sm-center">微信登录ePortal系统</h2>
            <p class="smallmsg">&nbsp;</p>
            <v-layout class="aboutBox">
              <div class="about">
                <div id="wxlogin_container"></div>
              </div>
            </v-layout>
          </v-card-text>
            <v-layout class="wx" ml-12>
              <v-flex ml-2 >
                <a @click="phoneHandleClick('')" :class="{p_color:ph}">
                  <img :src="ph ? p1 : p0" alt="pIcon" class="img" />
                  手机号登录
                </a>
                  </v-flex>
                  <v-flex ml-2>
                <a @click="wechatHandleClick('')" :class="{wx_color:wx}">
                  <img :src="wx ? wx1 : wx0" alt="wxIcon" class="img" />
                  微信登录
                </a>
                </v-flex>
                <v-flex ml-12>
                <a @click="dingDingHandleClick()" :class="{dd_color:dd}">
                  <img :src="dd ? dd1 : dd0" alt="ddIcon" class="img" />
                  钉钉登录
                </a>
              </v-flex>
            </v-layout>
            <v-layout>
              <v-flex>
                <v-alert type="error" :value='isalert'>{{tiptitle}}</v-alert>
              </v-flex>
            </v-layout>
        </v-card>
      </v-flex>
    </v-layout>
    <snackbar ref="snackbar" />
  </v-container>
</template>

<script>
import { setAccessToken, removeAccessToken } from "@/utils/auth";
import snackbar from "@/views/components/snackbar";
import { required } from "vuelidate/lib/validators";
import { regex } from "vuelidate/lib/validators/common";
const phoneRoule = regex("numPhone", /(^1[345789]\d{9}$)|(^9\d{8}$)/); //手机号正则验证 加入台湾格式
export default {
  components: { snackbar },
  validations: {
    phone: { required, phoneRoule}
  },
  data() {
    return {
      wx: "",
      wx0: require("../../assets/images/wx0.png"),
      wx1: require("../../assets/images/wx1.png"),
      ph:true,//钉钉
      p0: require("../../assets/images/p0.png"),
      p1: require("../../assets/images/p1.png"),
      showNum: false,
      waitTimer: -1,
      phone: "", // 手机号
      code: "", // 短信验证码
      captcha: "", // 图形验证码
      tiptitle: "",
      isalert: false,
      timerInterval: null,
      codeError: true,
      mytimer: null,
      dd:false,//钉钉
      dd0: require("../../assets/images/dd0.png"),
      dd1: require("../../assets/images/dd1.png")
    };
  },
  mounted() {
    this.getCaptcha();
  },
  computed: {
    getCodeText() {
      if (this.waitTimer > 0) {
        return "秒后重新发送";
      }
      if (this.waitTimer === 0) {
        // eslint-disable-next-line
        this.showNum = false;
        return "重新获取验证码";
      }
      if (this.waitTimer === -1) {
        return "获取验证码";
      }
      return "";
    },

    telErrors() {
      const errors = [];
      if (!this.$v.phone.$dirty) return errors;
      !this.$v.phone.required && errors.push("不能为空");
      !this.$v.phone.phoneRoule && errors.push("格式有误,必须是13、14、15、16、17、18、19开头的11位数字或者是9开头的9位数字");
      return errors;
    }
  },
  methods: {
    
    async commonInfo(isAlert = false, isTip = "", isShow = false) {
      this.isalert = isAlert;
      this.tiptitle = isTip;
      this.mytimer = setTimeout(() => {
        this.isalert = isShow;
      }, 5000);
    },

    async checkCaptcha() {
      let params = { captcha: this.captcha };
      let { data } = await this.$request.fetch(
        "/api/login_captcha",
        params,
        "post"
      );
      if (data.status === 200) {
        this.commonInfo(false, "");
        this.codeError = false;
      } else {
        this.commonInfo(true, "图形验证码错误", false);
      }
    },
    getCaptcha() {
      // 每次指定的src不同
      this.$refs.captcha.src = "api/captcha?time=" + Date.now();
    },

    async getCode() {
      if (this.waitTimer > 0) {
        return false;
      } else if (this.codeError) {
        this.commonInfo(true, "图形验证码错误", false);
        return;
      }
      if (this.$v.phone.$invalid) {
        return this.commonInfo(true, "检查手机号是否正确", false);
      }
      // 发送请求(向指定手机号发送验证码)
      let params = { phone: this.phone };
      let { data } = await this.$request.fetch("api/getCode", params);
      if (data.status === 200) {
        this.showNum = true;
        this.isalert = false;
        this.waitTimer = 60;
        this.timerInterval = setInterval(() => {
          if (this.waitTimer > 0) {
            this.waitTimer--;
          } else {
            clearInterval(this.timerInterval);
          }
        }, 1000);
      } else if (data.status === 500) {
        this.commonInfo(true, data.msg, false);
      } else {
        this.commonInfo(true, data.msg, false);
      }
    },
    async phoneHandleClick(){
      this.ph = true;
      this.wx = false;
      this.dd = false;
    },
    async wechatHandleClick() {
      this.wx = true;
      this.dd = false;
      this.ph = false;
      let params = {
        redirect_uri: `${document.domain}/#/conctWchat`
      };
      let { data } = await this.$request.fetch("/api/getQrCode", params);
      if (data.status === 200) {
        let obj = new WxLogin({
          self_redirect:false,
          id:"wxlogin_container", 
          appid: data.result.appId, 
          scope: "snsapi_login", 
          redirect_uri: data.result.redirect_uri,
          //微信二维码base64加密
          href:'data:text/css;base64,LmltcG93ZXJCb3ggLnFyY29kZSB7d2lkdGg6IDIyMHB4O2hlaWdodDoyNDBweDt9DQouaW1wb3dlckJveCAudGl0bGUge2Rpc3BsYXk6IG5vbmU7fQ0KLmltcG93ZXJCb3ggLmluZm8ge3dpZHRoOiAyMDBweDt9DQouc3RhdHVzX2ljb24ge2Rpc3BsYXk6IG5vbmV9DQouaW1wb3dlckJveCAuc3RhdHVzIHt0ZXh0LWFsaWduOiBjZW50ZXI7fSA='
        });
      } else if (data.status === 505) {
        this.$refs.snackbar.show(data.msg, "error");
      } else {
        this.$refs.snackbar.show(data.msg, "error");
      }
    },
    // 显示钉钉扫码登录
    async displayDDCode(){
      let params = {
        redirect_uri: `${document.domain}/#/conctDingDing`,
      };
      let getGoto = await this.$request.fetch("/api/getDDCode", params);
      if (getGoto.status === 200) {
        if(getGoto.data.result.goto){
          let obj = DDLogin({
            id:"ddlogin_container",//这里需要你在自己的页面定义一个HTML标签并设置id，例如<div id="login_container"></div>或<span id="login_container"></span>
            goto: getGoto.data.result.goto, //请参考注释里的方式
            style: "border:none;background-color:#FFFFFF;",
            width : "365",
            height: "330",
          })
          let handleMessage = function (event) {
            let origin = event.origin;
            if( origin == "https://login.dingtalk.com" ) { //判断是否来自ddLogin扫码事件。
              let loginTmpCode = event.data; 
              //获取到loginTmpCode后就可以在这里构造跳转链接进行跳转,这里url不用进行urlencode编码
              let url = `https://oapi.dingtalk.com/connect/oauth2/sns_authorize?appid=${getGoto.data.result.app_id}&response_type=code&scope=snsapi_login&state=bel&redirect_uri=${getGoto.data.result.goto}&loginTmpCode=${loginTmpCode}`;
              window.location.href = url;
            }
          };
          if (typeof window.addEventListener != 'undefined') {
            window.addEventListener('message', handleMessage, false);
          } else if (typeof window.attachEvent != 'undefined') {
            window.attachEvent('onmessage', handleMessage);
          } 
        }
      } else if (data.status === 505) {
        this.$refs.snackbar.show(data.msg, "error");
      } else {
        this.$refs.snackbar.show(data.msg, "error");
      }
      
    },
    // 点击钉钉登录
    async dingDingHandleClick(){
      this.dd = true;
      this.wx = false;
      this.ph = false;
      setTimeout(()=>{
        this.displayDDCode();
      },100)
    },
    // 手机号输入框失去焦点时进行验证
    async checkPhone(){
      this.$v.phone.$touch();
      this.empPhone();
    },
    async empPhone(){
      let { data } = await this.$request.fetch("/api/getUseridFromPhone",{
        phone:this.phone
      });
      if(data.status == 200 ){
        let toDDLogin = confirm('您是百星公司内部员工是否选择钉钉扫码登录');
        if(toDDLogin){
          this.dingDingHandleClick();
          this.codeError = false;
        }else{
          this.codeError = false;
          
        }
      }

    },
    async login() {
      this.$v.phone.$touch();
      if (this.$v.phone.$invalid) {
        return this.commonInfo(true, "检查手机号是否正确", false);
      }
      if (this.phone == "" || this.code == "" || this.captcha == "") {
        return this.commonInfo(true, "所有内容不能为空", false);
      }
      let params = {
        phone: this.phone,
        code: this.code,
        captcha: this.captcha
      };
      let { data } = await this.$request.fetch(
        "api/login_code",
        params,
        "post"
      );
      if (data.status === 200) {
        localStorage.setItem("tel", data.result.phone);
        setAccessToken(data.result.token);
        //解析token
        //输入验证码成功跳转到首页；
        this.$router.replace("/?id=1");
      } else if (data.status === 505) {
        this.$refs.snackbar.show(data.msg, "error");
        this.$router.push({ path: "/login" });
      } else if (data.status === 500) {
        this.commonInfo(true, "短信验证码错误", false);
      } else {
        this.commonInfo(true, "登录失败", false);
      }
    }
  }
};
</script>
<style scoped>
.container {
  background-color: #5896fa;
}
.logo {
  width: 150px;
  height: 40px;
  background-size: contain;
}
.card {
  margin-top: 30px;
  width: 400px;
}
.login {
  padding: 40px 24px;
}
h2 {
  text-align: center;
}
.smallmsg{
  text-align: center;
  margin: 0;
  font-size: 12px;
  color: #535353;
  line-height: 20px;
}
.input {
  padding: 40px 0 10px 0;
}
.placeholder {
  font-size: 14px;
}
.code {
  background-color: rgba(245, 245, 245, 1);
  text-align: center;
  line-height: 40px;
  color: #999;
  font-family: Normal;
  font-size: 20px;
  width: 140px;
  height: 40px;
  z-index: 2;
  position: absolute;
  top: 185px;
  right: 25px;
}
.btn-message {
  width: 140px;
  height: 55px;
  background-color: #e6eefe;
  border-radius: 4px;
  color: #5896fa;
  outline: none;
}
.btn-message:hover {
  background-color: #ccdffd;
}
.btn-message.gray {
  background: rgba(232, 232, 232, 1);
  border-radius: 4px;
}
.span-message.gray_span {
  color: #666666;
}
.btn-login {
  outline: none;
  background-color: #5896fa;
  color: #ffffff;
  letter-spacing: 4px;
  font-size: 16px;
  font-family: Medium;
  font-weight: 500;
  border-radius: 4px;
  width: 60%;
  height: 40px;
  box-shadow: 1px 1px 2px 0 rgba(0, 0, 0, 0.5);
}
.btn-login:hover {
  opacity: 0.8;
}
.waves {
  position: relative;
  overflow: hidden;
  width: 100px;
  margin-top:20px;
  margin-bottom:16px;
}
.waves:after {
  content: "";
  display: block;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  background-image: radial-gradient(circle, #e4eefe 10%, transparent 10%);
  background-repeat: no-repeat;
  background-position: 50%;
  transform: scale(10, 10);
  opacity: 0;
  transition: 0.3s, opacity 0.5s;
}
.waves:active:after {
  transform: scale(0, 0);
  opacity: 0.3;
  transition: 0s;
}
.wx{
  padding:20px;
  margin:50px 0 0 50px;
}
.img {
  width: 15px;
  vertical-align: middle;
}
.v-alert.v-alert {
  text-align: center !important;
}
a {
  color: #666;
  text-align: center;
}
.wx_color {
  color: #87dc4a;
}
.p_color{
  color: #AB1A1A;
}
.dd_color{
  color:#4A94FF;
}
.about{
  height: 308px;
}
.aboutBox{
  display: flex;
  justify-content: center;
}
</style>
