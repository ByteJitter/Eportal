<template>
  <div></div>
</template>

<script>
export default {
  name: "conctWchat",
  created() {
    this.getDDInfo();
  },
  methods: {
    async getDDInfo(){
      let { data } = await this.$request.fetch("/api/ddUserInfo",{
        code:this.$route.query.code,
        state:this.$route.query.state
      });
      if (data.status === 200) {
        let result = data.result.ddUserInfo
        result.avatar === '' ? localStorage.setItem("headimgurl",'') : localStorage.setItem("headimgurl",result.avatar)
        localStorage.setItem("access_token", data.result.token);
        localStorage.setItem("tel", result.mobile);
        // alert("欢迎登录！");
        this.$router.replace("/?auth=1");
      }else {
        alert("找不到用户，非本公司员工无法使用钉钉登录，请联系管理员了解详情");
        this.$router.replace("/login");
      }
      window.close();
    },
    
  }
};
</script>
