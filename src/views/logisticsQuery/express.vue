<template>
  <v-container fluid grid-list-xl>
    <div class="box">
      <v-layout align-center justify-center>
        <img :src="domain + url1" class="img" />
      </v-layout>
      <v-layout align-center justify-center fill-height>
        <v-flex md2 class="select" v-show="url1 === 'static/jd.jpeg'? true : false">
          <v-select :items="areas" label="请选择地区" v-model="area" solo></v-select>
        </v-flex>
        <v-flex md6 class="input">
          <v-combobox v-model="chips" hide-selected label="输入运单号进行查询" chips clearable solo multiple>
            <template v-slot:selection="data">
              <v-chip small :selected="data.selected" close @input="remove(data.item)">
                <span>{{ data.item }}</span>
              </v-chip>
            </template>
          </v-combobox>
        </v-flex>
        <v-flex md2>
          <v-btn color="info" large @click="waitSearch()">查询</v-btn>
        </v-flex>
      </v-layout>
    </div>
  </v-container>
</template>
<script>
export default {
  name: "express",
  data() {
    return {
      domain: "",
      areas: [],
      area: "北京",
      clearable: true,
      chips: [],
      numbers: "",
      url1: "",
      url2: ""
    };
  },
  mounted() {
    if (window.location.host === "localhost") {
      this.domain = "https://eportal.belstar.com.cn/";
    } else {
      this.domain =
        window.location.protocol + "//" + window.location.host + "/";
    }

    this.getQuery();
    this.getAreaList();
  },
  methods: {
    getQuery() {
      this.url1 = JSON.parse(localStorage.getItem("param")).url1;
    },
    async getAreaList() {
      let { data } = await this.$request.fetch("/api/logistics/jdAreaList");
      if (data.status === 200) {
        this.areas = data.result.areaList;
      } else if (data.status === 504) {
        this.$snackbar().showError(data.msg);
      } else {
        this.$snackbar().showError("京东地区选择列表获取失败，请刷新重试");
      }
    },
    remove(item) {
      this.chips.splice(this.chips.indexOf(item), 1);
      this.chips = [...this.chips];
    },
    search() {
      if (this.chips.length <= 0) {
        this.$snackbar().showError("请输入快递单号后再点击查询");
      } else {
        // 规定单号不能少于8位，不能包含中文
        for (const element of this.chips) {
          if (element.length < 8) {
            return this.$snackbar().showError("单号不能少于8位");
          }
          if (/^[A-Za-z0-9]+$/g.test(element)) {
            this.numbers = this.chips.join(",");
            localStorage.setItem("numbers", JSON.stringify(this.numbers));
            localStorage.setItem("area", JSON.stringify(this.area));
            this.$router.push({ path: "/logisticsQuery/expressInfo" });
          } else {
            return this.$snackbar().showError("单号不能包含中文及特殊字符");
          }
        }
        return;
      }
    },
    waitSearch() {
      setTimeout(() => {
        this.search();
      }, 100);
    }
  }
};
</script>
<style scoped>
.box {
  height: 300px;
}
.img {
  display: inline-block;
  width: 150px;
  height: 55px;
  border-radius: 25%;
  margin-top: 200px;
}
.input /deep/ .v-input__icon--append {
  display: none;
}
.theme--light.v-btn {
  margin-top: -20px !important;
}
</style>