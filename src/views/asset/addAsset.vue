
<template>
  <div>
    <!-- 表格 -->
    <v-data-table :headers="headers" :items="checkData" class="elevation-1">
      <template v-slot:no-data>
        <a class="text-md-center" @click="addSubSets">添加子集</a>
      </template> 
      <template v-slot:items="props">
        <td class="text-xs-center" @click="addSubSets('link')">
          <a>{{ props.item.name}}</a>
        </td>
        <td class="text-xs-center">{{props.item.asset_attribute_id.name}}</td>
      </template>
    </v-data-table>
    <!-- 弹框 -->
    <v-dialog v-model="dialog" persistent max-width="700px" max-height="100px">
      <v-card>
        <v-card-title>添加子集</v-card-title>
        <v-card-text>
          <ul class="add-list">
            <li v-for="(item,index) in subSetsList" :key="index" class="header-list">
              <!-- <span>
                <v-checkbox v-model="total" :value="item.category" @change="toggleAll(item)"></v-checkbox>
              </span> -->
            <div class="add-list-type">
                <p class="bottom_line">类型：{{item.category}}</p>
              </div>
             <div class="sub-add-name">
                <span>名称</span>
                <span>属性</span>
              </div>
              <ul class="sub-add-list">
                <li v-for="(subitem,index) in item.subList" :key="index" class="sub-header-list">
                 <div class="sub-add-div">
                    <v-checkbox
                    class="sub-add-checkbox"
                      type="checkbox"
                      v-model="checkData"
                      :value="subitem"
                      @change="toggle(item)"
                    ></v-checkbox>
                    <span>{{subitem.name}}</span>
                  <span>{{subitem.asset_attribute_id.name}}</span>
                    </div>
                </li>
              </ul>
            </li>
          </ul>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" flat @click="cancel">取消</v-btn>
          <v-btn color="blue darken-1" flat @click="confirm">确定</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 弹框 结束-->
     <snackbar ref="snackbar" />
  </div>
</template>

<script>
import snackbar from '@/views/components/snackbar.vue'
import {assetMixins} from './assetMixins';
export default {
  data() {
    return {
      headers: [
        { text: "子集名", align: "center", sortable: false, value: "name" },
        { text: "资产属性", align: "center", sortable: false, value: "name" }
      ],
      dialog: false,
      checkData: [],
      total: [],
      subSetsList: [],
      link:''
    };
  },
  components: { snackbar },
  mixins:[assetMixins],
  methods: {
    cancel(){
      if(this.link === ''){
        this.checkData = [];
        this.total = [];
      }
      this.dialog = false;
    },
    confirm() {
      if(this.checkData.length <= 0){
        this.$refs.snackbar.show("请选择至少一项资产", "error");
        return
      }
      this.dialog = false;
      this.$emit("send", this.total, this.checkData);
    },
    addSubSets(type) {
      if(type === 'link'){
        this.link = 'link'
      }
      this.dialog = true;
      this.subSetsList = [];
      this.getSubSets();
    },
    async getSubSets(params) {
      let res = await this.$request.fetch("/api/asset/getSubsets");
      res = res.data;
      if (res.status === 200) {
        this.subSetsList = this.handleSubsets(res.result);
      } else {
        this.$refs.snackbar.show("刷新重试", "error");
      }
    }
  }
};
</script>

<style  scoped>

.add-list{
  margin-left: 100px;
}
.sub-header-list{
  height: 40px;
}
.add-list-type{
   margin-top: 10px;
   height: 30px;
   line-height: 30px;
}
.add-list,
.sub-add-list {
  padding-left: 20px;
  list-style: none;
  font-size: 14px;
  font-weight: normal;
}
.header-list {
  font-size: 16px;
  font-weight: 700;
}
.sub-add-name{
  height: 40px;
  line-height: 40px;
}
.sub-add-name span{
  display: inline-block;
  padding-left: 37px;
  margin: 5px 10px 10px 10px;
 width: 150px; 
}
.sub-add-div{
  position: relative;
  height: 30px;
  line-height: 30px;
}
.sub-add-div span{
  display: inline-block;
  margin: 0px 10px 10px 10px;
  padding-left: 18px;
 width: 150px; 
}
.sub-add-checkbox {
  position: absolute;
  top:-16px;
  left: -20px;
  width: 20px!important;
  /* height: 30px; */
}
.bottom_line{
  width: 80%;
border-bottom: solid 1px black;
margin-bottom: 0;
}
</style>