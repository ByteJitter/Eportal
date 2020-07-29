
<template>
  <div class="add-asset">
    <h2>新建员工资产使用</h2>
    <v-layout>
      <v-flex xs2 sm2 md2 d-flex>
        <v-btn color="info" @click="which='addAsset'" >资产子集</v-btn>
        <v-btn color="info" @click="which='addUsers'">员工</v-btn>
      </v-flex>
    </v-layout>
    <v-layout>
      <v-flex xs12 sm12 md12 d-flex>
        <keep-alive>
          <component :is="which" @send="receive(arguments)"></component>
        </keep-alive>
      </v-flex>
    </v-layout>
    <v-layout>
      <v-btn small color="info" @click="back">取消</v-btn>
      <v-btn small color="info" @click="save">确认</v-btn>
    </v-layout>
    <snackbar ref="snackbar" />
  </div>
</template>

<script>
import snackbar from '@/views/components/snackbar.vue'
import addAsset from './addAsset.vue'
import addUsers from './addUsers.vue'
export default {
  data() {
    return {
      which: 'addAsset',
      subSet: [],
      subSetUsers: [],
      assetData: []
    }
  },
  methods: {
    back() {
      this.subSet = [];
      this.subSetUsers = [];
      this.assetData = [];
      this.$router.go(-1)
    },
    receive(data) {
      data.length > 1 ? this.subSet = data[1] : this.subSetUsers = data[0]
      this.subSet.map((item, index) => {
        this.subSetUsers.map((item2, index2) => {
          this.assetData.push(
            Object.assign(
              {},
              {
                asset_category_id: item.asset_attribute_id.asset_category_id._id,
                asset_attribute_id: item.asset_attribute_id._id,
                asset_subset_id: item._id,
                employee_id: item2._id,
                create_time: new Date().toISOString().substr(0, 10)
              }
            )
          )
        })
      })
    },
    async save() {
      if(this.subSet.length <= 0 || this.subSetUsers.length <= 0){
        this.$refs.snackbar.show('请确认是否选择员工或者资产','error')
        return
      }
      let res = await this.$request.fetch('/api/asset/addAssetUsers',{ assetData: this.assetData },'post')
      if(res.data.status === 200){
        this.$refs.snackbar.show('增加成功')
        setTimeout(()=>{
          this.$router.go(-1)
        },1000)

      }else{
        this.$refs.snackbar.show('添加失败','error')
      }
    }
  },
  components: {
    addAsset,
    addUsers,
    snackbar
  }
}
</script>

<style scoped>
.add-asset {
  box-shadow: 0 1px 2px 2px #ccc;
  padding: 40px 60px 160px;
  color: #333;
}
.add-asset h2 {
  text-align: center;
  opacity: 0.8;
}
.high-light {
  box-shadow: 0 1px 2px 2px #ccc;
}
</style>