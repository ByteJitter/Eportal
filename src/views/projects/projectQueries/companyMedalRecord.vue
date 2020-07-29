<template>
  <div>
    <v-container fluid grid-list-xl>
      <public-select :selectLists = "selectLists"   v-on:search="search" ></public-select>
      <div>
        <v-layout wrap align-center>
          <v-flex md d-flex>
            <div class="classify-bg">
              <v-flex class="classify-bg-flex">
                <p>项目查询</p>
                <p>公司勋章记录</p>
              </v-flex>
              <medal-list :medalList="medalList"></medal-list>
            </div>
          </v-flex>
        </v-layout>
      </div>
    </v-container>
  </div>
</template>

<script>
import publicSelect from "../components/searchSelect";
import  { getSelectData, handleLists } from "../../../utils/project";
import medalList from "../components/medalList"
export default {
  name: "companyRecord",
  components: {publicSelect,medalList},
  data() {
    return {
      selectLists:[],
      defaultSelect: { item: 'all', value: 'all' },
      medalList: [], //表格数据
      test:[],
    };
  },
  async mounted() {
    await this.getMedalList();
    await this.getitems() 
  },
  methods: {
    async getMedalList(type,param) {
      this.medalList = []
      if(!param){
        param = {}
      }
      param.item =  param.item == "all" ? "" : param.item
      param.value =  param.value == "all" ? "" : param.value
      
      let res = await this.$request.fetch("/api/project/projectQueries/getcompanyMedalRecord",param);
      if (res.data.status === 200) {
        this.medalList = res.data.result
        if (type === "search") {
          this.$snackbar().showStatus('search', true)
        }
      } else {
        this.$snackbar().showStatus('search', false)
      }
    },
    getitems(){
      let newarr = []
      this.medalList.forEach(item=>{
        let obj = {
          name:item.projectName,
          level:item.projectLevel,
          status:item.projectStatus,
          is_reward:item.is_reward,
          number: item.projectNumber,
          status_name: item.status_name,
          level_name: item.projectLevel_name,
          managerInfo:{
            _id:item.managerId,
            name:item.managerName,
          }
        }
        newarr.push(obj)
      })
      this.selectLists =  getSelectData(newarr)
    },
    //TODO  是否需要更改project的model 加一个project_id的字段
    search(param) {
      this.categoryItem = param.item
      this.categoryData = param.value
      this.getMedalList("search",param);
    },
  },

};
</script>
<style scoped>
@import "../../../assets/css/classify.css";
.container {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  width: 100%;
  padding-bottom: 160px;
}
.table {
  background: #ffffff;
}
.td-btn {
  padding: 0px !important;
}
</style>
