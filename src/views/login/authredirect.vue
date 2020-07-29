<template>
  <div>
    微信绑定
  </div>
</template>

<script>
export default {
  name: "authredirect",
  created() {
    this.wechat();
  },
  methods: {
    async wechat() {
      // 锚点模式无法使用，须针对锚点改写
      // const hash = window.location.search.slice(1)
      // window.opener.location.href = window.location.origin + '/login' + hash
      const hash = window.location.hash.slice(14);
      //  window.opener.location.href ='http://localhost/#/personal' + hash
      let code;
      if (location.href.indexOf("?") != -1) {
        code = location.href.split("?")[1];
        code = code.split("=")[1];
        code = code.split("&")[0];
      }
      if (
        localStorage.getItem("code") &&
        localStorage.getItem("code") == code
      ) {
        this.$router.replace("/");
      } else {
        localStorage.setItem("code", code);
        let params = { code: code };
        let { data } = await this.$request.fetch("api/getUserInfo", params);
        if (data.status === 200) {
          localStorage.setItem("headimgurl", data.result.headimgurl);
          alert("绑定微信成功");
          this.$router.replace("/?lock");
        }
      }
      window.close();
    }
  }
};
</script>
