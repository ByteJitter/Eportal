
<template>
  <v-container fluid grid-list-xl>
    <v-layout fill-height align-center justify-center>
      <v-flex md2 v-for="(express,index) in expressInfo" :key="index">
        <div class="box">
          <div @click="clickButton(express)">
            <img :src="domain + express.url1" alt class="img" />
          </div>
          <v-btn round large @click="clickButton(express)">{{express.name}}</v-btn>
        </div>
      </v-flex>
    </v-layout>
    <v-layout>
      <v-flex class="more">请期待更多合作快递 ……</v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      domain: "",
      expressInfo: []
    };
  },
  mounted() {
    if (window.location.host === "localhost") {
      this.domain = "https://eportal.belstar.com.cn/";
    } else {
      this.domain =
        window.location.protocol + "//" + window.location.host + "/";
    }

    this.getExpressList();
  },
  methods: {
    async getExpressList() {
      let { data } = await this.$request.fetch("/api/logistics/logisticInfo");
      if (data.status === 200) {
        this.expressInfo = data.result;
      } else if (data.status === 504) {
        this.$snackbar().showError(data.msg);
      } else {
        this.$snackbar().showError("快递列表获取失败，请刷新重试");
      }
    },
    clickButton(express) {
      localStorage.setItem("param", JSON.stringify(express));
      this.$router.push({ path: "/logisticsQuery/express" });
    }
  }
};
</script>

<style scoped>
.container {
  height: 600px;
}
.box {
  text-align: center;
}
.img {
  width: 150px;
  height: 55px;
  border-radius: 10%;
  margin: 20px auto;
}
.img:hover {
  cursor: pointer;
}
.more {
  font-family: serif;
  text-align: center;
}
.box /deep/ .v-btn__content {
  padding: 0 20px !important;
}
</style>