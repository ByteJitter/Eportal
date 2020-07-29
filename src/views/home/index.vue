<template>
  <div class="containers">
    <v-layout class="cont-tops">
      <v-flex md12 v-if="isShowRepairs"> <repairorder /> </v-flex>
    </v-layout>
    <v-layout>
      <v-flex md12> <PersonalAssets /> </v-flex>
    </v-layout>
  </div>
</template>

<script>
import Repairorder from "./components/repairOrderSide";
import PersonalAssets from "./components/PersonalAssets";
export default {
  name: "userManagement",
  components: { Repairorder, PersonalAssets },
  data() {
    return {
      isShowRepairs:false
    };
  },
  mounted() {
    this.getdata()
  },
  methods: {
    async getdata() {
      let { data } = await this.$request.fetch("/api/repairorder/myInfo");
      if (data.status === 200) {
        this.myinfo = data.result[0];
        this.isShowRepairs = true;
      } else if (data.status === 502) {
        this.isShowRepairs = false;
      }
    }
  }
};
</script>

<style>
.containers {
  width: 100%;
  height: 790px;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  display: flex;
}
.cont-tops {
  background: rgba(255, 255, 255, 0.1);
  line-height: 26.4px;
  margin-bottom: 50px;
  display: flex;
  flex-direction: column
}
.top-tops {
  margin-right: 55px;
}

</style>
