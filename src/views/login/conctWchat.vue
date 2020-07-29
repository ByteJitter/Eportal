<!--
 * @Author: your name
 * @Date: 2019-12-18 15:19:42
 * @LastEditTime: 2019-12-18 15:30:40
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /eportal/src/views/login/conctWchat.vue
 -->
<template>
  <div></div>
</template>

<script>
export default {
  name: "conctWchat",
  created() {
    this.wechat();
  },
  methods: {
    async wechat() {
      const hash = window.location.hash.slice(14);
      let href = location.href;
      let arg = href.split("?")[1];
      let code = arg.split("&")[0].split("=")[1];
      let params = {
        code: code
      };
      let { data } = await this.$request.fetch("api/isAuth", params, "post");
      if (data.status === 200) {
        let res = data.result.result;
        localStorage.setItem("headimgurl", res.headimgurl);
        localStorage.setItem("access_token", data.result.data);
        localStorage.setItem("tel", res.tel);
        // alert("欢迎登录！");
        this.$router.replace("/?auth=1");
      } else {
        alert("你还未绑定微信，请使用验证码登录或联系管理员");
        this.$router.replace("/login");
      }
      window.close();
    }
  }
};
</script>
