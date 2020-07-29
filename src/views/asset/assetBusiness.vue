<template>
  <div>
    <!-- 顶部 -->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex xs3 class="search-select">
          <v-autocomplete
            v-model="secrchSelect"
            :items="newArr"
            label="请选择/输入类型"
            item-text="name"
            item-value="_id"
            no-data-text="暂无数据"
          ></v-autocomplete>
        </v-flex>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleSearch">
          <v-icon left>search</v-icon>搜索
        </v-btn>
        <v-btn color="info" style="margin-left: 20px; border-radius:10px;" @click="handleAdd">
          <v-icon left>add</v-icon>增加
        </v-btn>
        <!-- 点击增加出现的弹框 -->
        <v-dialog v-model="dialog" persistent max-width="600px">
          <v-card v-show="addShow">
            <v-card-title>
              <span class="headline">{{formTitle}}</span>
            </v-card-title>
            <v-card-text>
              <v-container grid-list-md>
                <v-layout>
                  <span class="base-title">类型名称</span>
                  <v-flex xs12 sm6 md4>
                    <v-text-field
                      label="输入类型名称"
                      v-model.trim="editedItem.name"
                      @blur="$v.editedItem.name.$touch()"
                      :error-messages="nameErrors"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
              <v-btn color="blue darken-1" flat @click="save">确定</v-btn>
            </v-card-actions>
          </v-card>
          <v-card v-show="delShow">
            <v-container grid-list-md class="delcontainer">你确定要删除吗?</v-container>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
              <v-btn color="blue darken-1" flat @click="handleDelSave">确定</v-btn>
            </v-card-actions>
            <span class="del-span" @click="close">X</span>
          </v-card>
        </v-dialog>
      </v-layout>
    </v-container>
    <!-- 表格 -->
    <div class="classify-bg">
      <v-flex xs12 class="classify-bg-flex">
        <p>资产类型管理</p>
        <p>资产类型</p>
      </v-flex>
      <v-data-table :headers="headers" :items="desserts" class="elevation-1" no-data-text="暂无数据">
        <template v-slot:items="props">
          <td class="text-xs-left">{{ props.item.name }}</td>
          <td class="justify-center layout px-0">
            <v-btn color="info" @click="handleEdit(props.item)">编辑</v-btn>
            <v-btn color="info" @click="handleDelete(props.item)">删除</v-btn>
          </td>
        </template>
      </v-data-table>
    </div>
    <!-- 弹框 -->
    <snackbar ref="snackbar" />
  </div>
</template>
<script>
import Common from '../../utils/common'
import snackbar from '../components/snackbar'
import { required } from 'vuelidate/lib/validators'
export default {
  name: 'assetManagement',
  components: { snackbar },
  validations: {
    editedItem: {
      name: { required }
    }
  },
  data() {
    return {
      indexs: [], //删除后判断显示全部还是维持原来条件
      currentStatus: '',
      dialog: false,
      editedIndex: -1,
      isAble: false,
      addShow: false,
      delShow: false,
      categoryId: '',
      secrchSelect: '全部',
      //编辑弹框绑定数据
      editedItem: {
        name: ''
      },
      headers: [
        { text: '名称', sortable: false },
        { text: '操作', align: 'center', value: '操作', sortable: false }
      ],
      desserts: [],
      newArr: []
    }
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? '增加资产类型' : '编辑资产内容'
    },
    nameErrors() {
      const errors = []
      if (!this.$v.editedItem.name.$dirty) return errors
      !this.$v.editedItem.name.required && errors.push('不能为空。')
      !this.$v.editedItem.name.required
      return errors
    }
  },
  created() {
    let init = true
    this.getCategoryAccount(init)
  },
  methods: {
    async getCategoryAccount(init) {
      let res = await this.$request.fetch('/api/asset/getCategoryAccount')
      if (res.data.status === 200) {
        let data = res.data.result
        if (init) {
          this.desserts = []
          this.desserts = data
        }
        let newArr = []
        let indexs = []
        data.forEach(re => {
          newArr.push({ name: re.name, _id: re._id })
          indexs.push(re._id)
        })
        this.newArr = []
        this.indexs = []
        this.indexs = indexs
        this.newArr = newArr
        this.newArr.unshift({ name: '全部' })
      } else {
        this.$refs.snackbar.showError('刷新重试')
      }
    },
    handleAdd() {
      this.dialog = true
      this.isAble = false
      this.addShow = true
      this.delShow = false
    },
    handleEdit(item) {
      this.dialog = true
      this.isAble = true
      this.addShow = true
      this.delShow = false
      this.editedIndex = this.desserts.indexOf(item)
      //点击编辑的时候绑定该行的数据(v-model="editedItem.name")
      this.editedItem = Object.assign({}, item)
    },
    handleDelete(item) {
      this.dialog = true
      this.addShow = false
      this.delShow = true
      this.item = item
    },
    async handleDelSave() {
      let res = await this.$request.fetch(
        '/api/asset/deleteCategory',
        { _id: this.item._id },
        'delete'
      )
      if (res.data.status === 200) {
        // 前端页面上的假删除
        let index = this.desserts.indexOf(this.item)
        this.desserts.splice(index, 1)
        this.close()
        let noSearch = true
        let [...newArr] = this.newArr
        newArr.shift()
        let searchSelectIndex = newArr.findIndex(val => {
          return val._id === this.secrchSelect
        })
        if (this.currentStatus) {
          this.secrchSelect = '全部'
        }
        if (index === searchSelectIndex) {
          this.secrchSelect = '全部'
        }
        this.currentStatus = ''
        await this.getCategoryAccount()
        await this.getAccounts()
        //弹框提示
        this.$refs.snackbar.showStatus('delete')
      } else {
        this.$refs.snackbar.showError(res.data.msg)
        this.close()
      }
    },
    //增、改,
    save: Common.throttle(async function() {
      this.$v.$touch()
      // if编辑else增加
      if (this.editedIndex > -1) {
        if (this.editedItem.name == '') {
          return false
        }
        let name = this.editedItem.name.trim()
        let _id = this.editedItem._id.trim()
        let res = await this.$request.fetch(
          '/api/asset/update',
          {
            name: name,
            _id: _id
          },
          'post'
        )
        if (res.data.status === 200) {
          this.$refs.snackbar.showStatus('edit')
          let noSearch = true
          await this.getCategoryAccount()
          await this.getAccounts(this.currentStatus)
          // 在前端页面上编辑，不需要在重新调用获取所有数据的方法 this.getCategoryAccount();
          for (const v of this.desserts) {
            if (v._id === this.editedItem._id) {
              const index = this.desserts.indexOf(v)
              this.desserts.splice(index, 1, this.editedItem)
              break
            }
          }
        } else {
          this.$refs.snackbar.showError(res.data.msg)
        }
        this.close()
      } else {
        if (this.editedItem.name == '') {
          return false
        }
        let name = this.editedItem.name.trim()
        let res = await this.$request.fetch(
          '/api/asset/addAssetCategory',
          {
            name: name
          },
          'post'
        )
        if (res.data.status === 200) {
          let noSearch = true
          await this.getCategoryAccount()
          this.getAccounts(this.currentStatus)
          this.close()
          this.$refs.snackbar.showStatus('add')
        } else {
          this.$refs.snackbar.showError(res.data.msg)
        }
      }
    }),
    close() {
      this.dialog = false
      setTimeout(() => {
        this.editedItem = Object.assign({}, { _id: '' })
        this.editedIndex = -1
      }, 200)
      this.$v.$reset()
    },
    handleSearch: async function() {
      let param = {}
      if (this.secrchSelect !== '' && this.secrchSelect !== '全部') {
        param._id = this.secrchSelect
      }
      this.currentStatus = param
      await this.getAccounts(this.currentStatus, 'search')
    },
    async getAccounts(currentStatus, search) {
      let res = await this.$request.fetch(
        '/api/asset/getCategoryAccount',
        currentStatus
      )
      if (res.data.status === 200) {
        let data = res.data.result
        this.desserts = data
        if (search) {
          this.$refs.snackbar.showStatus('search')
        }
      } else {
        this.$refs.snackbar.showError('刷新重试')
      }
    }
  }
}
</script>
<style scoped>
.search-select
  /deep/
  .v-text-field.v-text-field--solo:not(.v-text-field--solo-flat)
  > .v-input__control
  > .v-input__slot {
  box-shadow: none;
  border-bottom: 1px solid #ccc;
  background: #f9f9f9;
}
.search-select /deep/ .theme--light.v-chip {
  background: none;
  font-size: 16px;
}
.classify-bg {
  padding: 40px 20px 30px;
  box-shadow: 0px 0px 6px 1px #ccc;
  position: relative;
}
.classify-bg-flex {
  background: #e0e1e2;
  border-radius: 10px;
  padding: 10px 20px;
  margin: -65px 0 35px;
}
.classify-bg-flex p {
  margin-bottom: 0px;
}
.classify-bg-flex p:nth-of-type(1) {
  color: #333300;
  font-size: 20px;
  margin-bottom: 5px;
}
.classify-bg-flex p:nth-of-type(1) {
  color: #333333;
  font-size: 15px;
}
.base-title {
  margin-right: 35px;
  margin-left: 65px;
  display: inline-block;
  font-size: 18px;
}
.layout {
  align-items: center !important;
}
.delcontainer {
  padding: 30px;
  font-size: 20px;
  position: relative;
}
.del-span {
  position: absolute;
  top: 15px;
  right: 25px;
  cursor: pointer;
}
.elevation-1
  /deep/
  .v-input--selection-controls:not(.v-input--hide-details)
  .v-input__slot {
  margin-top: 12px !important;
  margin-bottom: 0px !important;
}
.elevation-1 /deep/ .accent--text {
  color: rgb(37, 72, 226) !important;
}
</style>

