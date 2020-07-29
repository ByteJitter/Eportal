<template>
<div class="assets">
  <v-layout>
    <v-card>
      <v-card-title class="text-center justify-center basil" style="width:555px">
        <p class="font-weight-bold basil--text botts">个人资产使用情况</p>
      </v-card-title>
      <v-tabs class="center" v-model="tab" background-color="transparent" grow>
        <v-tab
          v-for="item in items"
          :key="item._id"
          @click="getData(item._id)"
        >{{ item.name }}</v-tab>
      </v-tabs>
      <v-tabs-items v-model="tab">
        <v-tab-item v-for="item in items" :key="item._id">
          <v-card class="bott">
            <v-flex>
              <v-data-table :headers="headers" :items="points" no-data-text="暂无数据" class="btn">
                <template v-slot:items="props">
                  <td class="text-xs-center">{{ props.item.asset_subset_id.name }}</td>
                  <td class="text-xs-center">{{ props.item.asset_attribute_id.name }}</td>
                </template>
              </v-data-table>
            </v-flex>
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-card>
  </v-layout>
</div>
</template>

<script>
export default {
  name: "personal",
  data() {
    return {
      tab: null,
      items: [],
      headers: [
        { text: "名称", align: "center", sortable: false },
        { text: "属性", align: "center", value: "操作", sortable: false }
      ],
      desserts: [],
      points: []
    };
  },
  async mounted() {
    await this.getAssets();
    await this.getData(this.items[0]._id);
  },
  methods: {
    async getAssets() {
      let res = await this.$request.fetch("/api/asset/getCategoryAccount");
      if (res.data.status === 200) {
        let data = res.data.result;
        this.items = data;
        if(!this.items.length){
          this.items.push({name:"暂无数据"})
        }
      } else {
        this.$snackbar().showError("刷新重试", false);
      }
    },
    async getData(asset_category_id) {
      let searchData = {
        searchCategorySelect:asset_category_id,
        homeSingleData:true
      }
      let res = await this.$request.fetch("/api/asset/getAssetUsers",searchData);
      if (res.data.status === 200) {
        this.points = res.data.result
      } else {
        this.$snackbar().showError("刷新重试", false);
      }
    }
  }
};
</script>

<style>
.btn{
  height: 330px;
}
.basil {
  background-color: #4a94ff !important;
  height: 50px;
}
.basil--text {
  color: white !important;
}
.foot {
  margin-top: 30px;
}
.bott {
  width: 555px;
  display: flex;
  justify-content: space-around;
}
.botts {
  font-size: 20px;
  margin-top: -5px;
  /* line-height: 0px; */
}
.size {
  line-height: 42px;
}
.assets{
  width: 555px;
  height: 500px;
  /* background: white; */
  margin-top: 25px;
}
</style>