<template>
  <v-container fluid grid-list-xl>
    <div class="after-search">
      <v-layout justify-center>
        <v-flex>
          <img :src=" domain + url2" alt class="img-icon" />
        </v-flex>
        <v-flex md2 class="select" v-show="url2 === 'static/jd1.jpeg'? true : false">
          <v-select :items="areas" label="请选择地区" v-model="area" solo></v-select>
        </v-flex>
        <v-flex md9 class="input">
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

      <express-map v-for="(items,index) in logisticList" :key="index" :logisticList="items">
      </express-map>

      <v-layout justify-center>
        <v-btn round color="info" @click="goBack()" class="btn-back">返回</v-btn>
      </v-layout>
    </div>
  </v-container>
</template>
<script>
import ExpressMap from "@/views/logisticsQuery/expressMap";
export default {
  components: { ExpressMap },
  data() {
    return {
      domain: "",
      areas: [],
      area: "",
      clearable: true,
      chips: [],
      numbers: "",
      numberData: [],
      logisticList: [],
      url2: "",
      type: "",
      startPoint: "",
      startLat: "",
      startLng: "",
      currentPoint: "",
      currentLat: "",
      currentLng: ""
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
    this.getNumbersArr();
    this.getLogistics();
  },
  computed: {
    timeline() {
      return this.logisticList.slice().reverse();
    }
  },
  methods: {
    getQuery() {
      this.url2 = JSON.parse(localStorage.getItem("param")).url2;
      this.type = JSON.parse(localStorage.getItem("param")).type;
      this.numbers = JSON.parse(localStorage.getItem("numbers"));
      this.area = JSON.parse(localStorage.getItem("area"));
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
    remove(logisticList) {
      this.chips.splice(this.chips.indexOf(logisticList), 1);
      this.chips = [...this.chips];
      this.numbers = this.chips.join(",");
      localStorage.setItem("numbers", JSON.stringify(this.numbers));
    },
    getNumbersArr() {
      this.chips = this.numbers.split(",");
    },
    async getLogistics() {
      let dataParam = {
        logistictype: this.type,
        mailNo: this.numbers,
        area: this.area
      };
      let { data } = await this.$request.fetch(
        "/api/logistics/logistic",
        dataParam
      );

      if (this.type === "sf") {
        if (data.status === 200) {
          this.logisticList = data.result.RouteResponse;
          this.logisticList.forEach((element, index) => {
            element.id = "myMap" + index;
          });
        } else {
          this.$snackbar().showError("查询失败");
        }
      } else if (this.type === "jd") {
        if (data.status === 200) {
          this.logisticList = data.result;
          this.numberData = this.numbers.split(",");
          this.logisticList.forEach((element, index) => {
            element.id = "myMap" + index;
            element.mailNo = this.numberData[index];
          });
        } else {
          this.$snackbar().showError("查询失败");
        }
      } else if (this.type === "ems") {
        if (data.status === 200) {
          this.logisticList = data.result;
          this.numberData = this.numbers.split(",");
          this.logisticList.forEach((element, index) => {
            element.id = "myMap" + index;
            element.mailNo = this.numberData[index];
          });
        } else {
          this.$snackbar().showError("查询失败");
        }
      } else if (this.type === "zto") {
        if (data.status === 200) {
          this.logisticList = data.result;
          this.numberData = this.numbers.split(",");
          // 解决搜索框单号与地图顺序显示不一致问题
          this.logisticList.sort((a, b) => {
            return (
              this.numberData.indexOf(a.billCode) -
              this.numberData.indexOf(b.billCode)
            );
          });
          this.logisticList.forEach((element, index) => {
            element.id = "myMap" + index;
          });
        } else {
          this.$snackbar().showError("查询失败");
        }
      }
    },
    search() {
      let chipsArr = [];
      if (this.chips.length <= 0) {
        this.$snackbar().showError("请输入快递单号后再点击查询");
      } else {
        // 规定单号不能少于8位，不能包含中文
        let isFind = false;
        for (const element of this.chips) {
          if (element.length < 8) {
            isFind = true;
            this.$snackbar().showError("单号不能少于8位");
          } else if (!/^[A-Za-z0-9]+$/g.test(element)) {
            isFind = true;
            this.$snackbar().showError("单号不能包含中文及特殊字符");
          } else {
            chipsArr.push(element);
          }
        }
        this.numbers = chipsArr.join(",");
        if (!isFind) {
          this.getLogistics(); //注意此方法的顺序
        }

        localStorage.setItem("numbers", JSON.stringify(this.numbers));
      }
    },
    waitSearch() {
      setTimeout(() => {
        this.search();
      }, 100);
    },
    goBack() {
      this.$router.go(-2);
    }
  }
};
</script>

<style scoped>
.after-search {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0px 2px 2px 0 rgba(0, 0, 0, 0.4);
  width: 100%;
  padding-bottom: 150px;
}
.img-icon {
  display: inline-block;
  width: 40px;
  height: 40px;
  border-radius: 10%;
  margin: 8px 0 0 60px;
  box-shadow: 1px 2px 2px 0 rgba(0, 0, 0, 0.4);
}
.seclect .input {
  margin-top: 4px;
}
.input /deep/ .v-input__icon--append {
  display: none;
}
.timeline {
  width: 88%;
  margin-left: -20px;
}
.btn-back {
  margin-top: 100px;
}
.btn-back /deep/ .v-btn__content {
  padding: 0 25px !important;
}
.after-search /deep/ .anchorBL {
  display: none;
}
</style>