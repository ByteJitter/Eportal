<template>
  <div>
    <!-- 公司奖金发放界面(其他员工查看) -->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center style="margin-bottom:20px;">
        <v-flex md2 d-flex>
          <div>
            <v-autocomplete label="请输入年份" :items="yearList" no-data-text="暂无数据" v-model="year"></v-autocomplete>
          </div>
        </v-flex>
        <v-flex md1>
          <v-btn round color="info" @click="search(year)" class="headerBTN">
            <v-icon>search</v-icon>搜索
          </v-btn>
        </v-flex>
      </v-layout>
      <div>
        <v-layout wrap align-center>
          <v-flex md d-flex>
            <div class="classify-bg">
              <v-flex class="classify-bg-flex">
                <p>项目查询</p>
                <p>公司奖金发放</p>
              </v-flex>
              <div class="table">
                <v-data-table
                  :headers="headers"
                  :items="temp?searchDate : rewardPool"
                  no-data-text="暂无数据"
                >
                 <template v-slot:items="props">
                    <td v-show="!isNaN(props.item.amount / props.item.count)">{{props.item.year}}</td>
                    <td v-show="!isNaN(props.item.amount / props.item.count)">{{props.item.amount}}</td>
                    <td v-show="!isNaN(props.item.amount / props.item.count)">{{props.item.count}}</td>
                    <td v-show="!isNaN(props.item.amount / props.item.count)">{{(props.item.amount / props.item.count).toFixed(2)}}</td>
                  </template>
                </v-data-table>
              </div>
            </div>
          </v-flex>
        </v-layout>
      </div>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "companyReward",
  data() {
    return {
      headers: [
        { text: "所属年份", sortable: false },
        { text: "累计基金额", sortable: false },
        { text: "累计总点数", sortable: false },
        { text: "每点金额(元/点)", sortable: false }
      ],
      year: "全部",
      yearList: ["全部"],
      pointList: [], //点数查询返回的结果集
      rewardPool: [], // 查询rewardPool返回的结果集
      searchDate: [], // 搜索返回的结果
      temp: false,  // 判断显示全部数据还是搜索之后的数据\
    };
  },
  async mounted() {
    await this.searchAll();
    await this.getALLreward();
  },
  methods: {
    // 在rewardPool中查找对应年份数据,如果搜索固定年份,则在总的奖金池中循环到对应年份的数据，插入至搜所数据的数组并显示
    search(year) {
      if (year !== "全部") {
        this.temp = true;
        this.searchDate.length = 0;
        for (let i = 0; i < this.rewardPool.length; i++) {
          if (this.rewardPool[i].year === year) {
            this.searchDate.push(this.rewardPool[i]);
          }
        }
        this.$snackbar().showStatus("search");
      } else {
        this.temp = false;
        this.searchAll();
        this.getALLreward();
        this.$snackbar().showStatus("search");
      }
    },

    // 查询所有年份对应的点数
    async searchAll() {
      let res = await this.$request.fetch(
        "/api/projectQueries/getCountReward",
      );
      if (res.data.status === 200) {
        this.pointList = res.data.result;
      }else {
        this.$snackbar().showError("点数查询失败");
        return;
      }
    },
    // 查询rewardPool中的数据
    async getALLreward() {
      let res = await this.$request.fetch("/api/projectQueries/getAllReward");
      if (res.data.status == 200) {
        this.rewardPool = res.data.result;
        for (let i = 0; i < this.rewardPool.length; i++) {
          for (let j = 0; j < this.pointList.length; j++) {
            if (this.rewardPool[i].year === this.pointList[j]._id.belong_year) {
              this.rewardPool[i].count = this.pointList[j].point_count;
              if(this.rewardPool[i].count !== 0){
                this.yearList.push(this.rewardPool[i].year);
              }
            }
          }
        }
      }else {
        this.$snackbar.showError("奖金查询失败");
        return;
      }
    }
  }
};
</script>

<style>
@import "../../../assets/css/classify.css";
.add-btn {
  margin-left: 55px;
}
.baseTitle {
  margin-right: 35px;
  margin-left: 65px;
  display: inline-block;
  font-size: 18px;
  margin-top: 20px;
  width: 100px;
}
.headerBTN{
  border-radius: 10px;
}
.show-sty {
  padding: 14px 0 16px;
}
</style>