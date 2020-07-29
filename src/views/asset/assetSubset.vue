<template>
  <div>
    <!-- 顶部 -->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex xs3 d-flex class="search-select">
          <v-autocomplete
            v-model="categorySelect"
            :items="categoryDesserts"
            item-text="name"
            item-value="id"
            label="请选择/输入类型"
            no-data-text="暂无数据"
          ></v-autocomplete>
        </v-flex>
        <v-flex xs3 d-flex class="search-select">
          <v-autocomplete
            v-model="subsetSelect"
            :items="subsetDesserts"
            item-text="name"
            item-value="_id"
            label="请选择/输入属性"
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
              <v-container>
                <v-layout wrap v-if="isAble==false">
                  <span class="base-title">资产类型</span>
                  <v-flex xs12 sm6 d-flex>
                    <v-select
                     no-data-text="暂无数据"
                      :items="addCategory"
                      item-text="name"
                      item-value="id"
                      v-model="categoryAddSelectId"
                      label="请选择"
                      
                      required
                      @blur="$v.categoryAddSelectId.$touch()"
                      :error-messages="categoryErrors"
                    ></v-select>
                  </v-flex>
                </v-layout>
                <v-layout wrap v-if="isAble==false">
                  <span class="base-title">资产属性</span>
                  <v-flex xs12 sm6 d-flex>
                    <v-select
                      :items="addAttr"
                      item-text="name"
                      v-model="attrAddSelectId"
                      item-value="_id"
                      label="请选择"
                       no-data-text="暂无数据"
                      required
                      @blur="$v.attrAddSelectId.$touch()"
                      :error-messages="attrErrors"
                    ></v-select>
                  </v-flex>
                </v-layout>
                <v-layout>
                  <span class="base-title">资产子集</span>
                  <v-flex xs12 sm6 md4>
                    <v-text-field
                       v-model.trim="editedItem.name"
                      label="输入子集名称"
                      @blur="$v.editedItem.name.$touch()"
                      :error-messages="subErrors"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
              </v-container>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn color="blue darken-1" flat @click="close">取消</v-btn>
              <v-btn color="blue darken-1" flat @click="saveAdd">确定</v-btn>
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
        <p>资产子集管理</p>
        <p>资产子集</p>
      </v-flex>
      <v-data-table :headers="headers" :items="desserts" class="elevation-1" no-data-text="暂无数据">
        <template v-slot:items="props">
          <td class="text-xs-left">{{props.item.name}}</td>
          <td class="text-xs-left">{{props.item.asset_attribute_id.name}}</td>
          <td class="text-xs-left">{{props.item.asset_attribute_id.asset_category_id.name}}</td>
          <td class="justify-center layout px-0">
            <v-btn color="info" @click="handleEdit(props.item)">编辑</v-btn>
            <v-btn color="info" @click="handleDelete(props.item,props.item._key)">删除</v-btn>
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
  name: 'attrManagement',
  components: { snackbar },
  validations: {
    categoryAddSelectId: { required },
    attrAddSelectId: { required },
    editedItem: {
      name: { required }
    }
  },
  data() {
    return {
      currentStatus: '',
      query: {},
      addAttr: [],
      paramsSearch: {},
      dialog: false,
      isAble: false,
      addShow: false,
      editShow: false,
      delShow: false,
      categoryAddSelectId: '',
      attrAddSelectId: '',
      categorySelect: '全部', //资产类型选择
      subsetSelect: '全部', //属性选择
      //编辑弹框绑定数据
      editedItem: {
        name: ''
      },
      editedIndex: -1,
      headers: [
        { text: '资产子集', sortable: false },
        { text: '资产属性', sortable: false },
        { text: '资产类型', sortable: false },
        { text: '操作', align: 'center', sortable: false }
      ],
      newArr: ['全部'],
      desserts: [],
      subsetDesserts: [],
      categoryDesserts: [],
      addCategory: [],
      color: '',
      isChange: false
    }
  },
  created() {
    this.getAttrList()
    this.getCategories()
    this.getSubset()
  },
  computed: {
    formTitle() {
      return this.editedIndex === -1 ? '增加资产子集' : '编辑资产子集内容'
    },
    categoryErrors() {
      const errors = []
      if (!this.$v.categoryAddSelectId.$dirty) return errors
      !this.$v.categoryAddSelectId.required && errors.push('不能为空。')
      return errors
    },
    attrErrors() {
      const errors = []
      if (!this.$v.attrAddSelectId.$dirty) return errors
      !this.$v.attrAddSelectId.required && errors.push('不能为空。')
      return errors
    },
    subErrors() {
      const errors = []
      if (!this.$v.editedItem.name.$dirty) return errors
      !this.$v.editedItem.name.required && errors.push('不能为空。')
      !this.$v.editedItem.name.required
      return errors
    }
  },
  watch: {
    categorySelect(newVal) {
      this.subsetSelect = '全部'
      if (newVal === '全部' || newVal === '') {
        this.paramsSearch.categoryId = ''
        this.getAttrList()
      } else {
        this.paramsSearch.categoryId = newVal
        this.getAttrList(this.paramsSearch)
      }
    },
    categoryAddSelectId(newVal) {
      if (newVal === '全部' || newVal === '') {
        this.getAddAttr()
      } else {
        this.getAddAttr({ categoryId: newVal })
      }
    }
  },
  methods: {
    //获取所有属性
    async getCategories() {
      let res = await this.$request.fetch('/api/asset/getCategories')
      if (res.data.status === 200) {
        let categoryDesserts = []
        let addCategory = []
        let data = res.data.result
        data.forEach(cat => {
          categoryDesserts.push({ id: cat._id, name: cat.name })
          addCategory.push({ id: cat._id, name: cat.name })
        })
        this.addCategory = addCategory
        this.categoryDesserts = categoryDesserts
        this.categoryDesserts.unshift({ name: '全部' })
      } else {
        this.$refs.snackbar.showError('刷新重试')
      }
    },
    //获取数据
    async getAttrList(params) {
      let subsetDesserts = []
      let addAttr = []
      if (this.categorySelect !== '' && this.categorySelect !== '全部') {
        let res = await this.$request.fetch('/api/asset/getAttrList', params)
        if (res.data.status === 200) {
          let data = res.data.result
          data.forEach(da => {
            subsetDesserts.push({ _id: da._id, name: da.name })
          })
        } else {
          this.$refs.snackbar.showError('刷新重试')
        }
      } else {
        let res = await this.$request.fetch('/api/asset/getAttrList')
        if (res.data.status === 200) {
          let data = res.data.result
          data.forEach(da => {
            subsetDesserts.push({ _id: da._id, name: da.name })
            addAttr.push({ _id: da._id, name: da.name })
          })
          this.addAttr = addAttr
        } else {
          this.$refs.snackbar.showError('刷新重试')
        }
      }
      this.subsetDesserts = subsetDesserts
      this.subsetDesserts.unshift({ name: '全部' })
    },
    //获取数据
    async getAddAttr(params) {
      let addAttr = []
      if (this.categoryAddSelectId !== '') {
        let res = await this.$request.fetch('/api/asset/getAttrList', params)
        if (res.data.status === 200) {
          let data = res.data.result
          data.forEach(da => {
            addAttr.push({ _id: da._id, name: da.name })
          })
        } else {
          this.$refs.snackbar.showError('刷新重试')
        }
      } else {
        let res = await this.$request.fetch('/api/asset/getAttrList')
        if (res.data.status === 200) {
          let data = res.data.result
          data.forEach(da => {
            addAttr.push({ _id: da._id, name: da.name })
          })
        } else {
          this.$refs.snackbar.showError('刷新重试')
        }
      }
      this.addAttr = addAttr
    },
    async getSubset(query, search) {
      let res = {}
      if (query) {
        res = await this.$request.fetch('/api/asset/getSubsets', query)
      } else {
        res = await this.$request.fetch('/api/asset/getSubsets')
      }
      if (res.data.status === 200) {
        if (search) {
          this.$refs.snackbar.showStatus('search')
        }
        this.desserts.splice(0, this.desserts.length)
        let data = res.data.result
        this.desserts = data
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
    async handleEdit(item) {
      this.dialog = true
      this.isAble = true
      this.addShow = true
      this.delShow = false
      this.editedIndex = this.desserts.indexOf(item)
      //点击编辑的时候绑定该行的数据(v-model="editedItem.name")
      this.editedItem = Object.assign({}, item)
    },
    handleDelete(value) {
      this.dialog = true
      this.addShow = false
      this.editShow = false
      this.delShow = true
      this.value = value
    },
    async handleDelSave(value) {
      let res = await this.$request.fetch(
        '/api/asset/deleteSubset',
        { _id: this.value._id },
        'delete'
      )

      if (res.data.status === 200) {
        let index = this.desserts.indexOf(this.value)
        this.desserts.splice(index, 1)
        this.close()
        //弹框提示
        this.$refs.snackbar.showStatus('delete')
      } else {
        this.$refs.snackbar.showError(res.data.msg)
        this.close()
      }
    },
    //增、改,
    saveAdd: Common.throttle(async function() {
      this.$v.$touch()

      // if编辑else增加
      if (this.editedIndex > -1) {
        if (this.editedItem.name == '') {
          return false
        }
        let _id = this.editedItem._id.trim()
        let name = this.editedItem.name.trim()
        let res = await this.$request.fetch(
          '/api/asset/updateSubset',
          {
            name: name,
            _id: _id
          },
          'post'
        )
        if (res.data.status === 200) {
          this.$refs.snackbar.showStatus('edit')
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
        if (
          this.categoryAddSelectId == '' ||
          this.editedItem.name == '' ||
          this.attrAddSelectId == ''
        ) {
          return false
        }
        let attrId = this.attrAddSelectId.trim()
        let name = this.editedItem.name.trim()
        let res = await this.$request.fetch(
          '/api/asset/addSubset',
          {
            attrId: attrId,
            name: name
          },
          'post'
        )

        if (res.data.status === 200) {
          this.$refs.snackbar.showStatus('add')
          // this.getSubset()
          // let query = Object.assign({}, this.query, this.paramsSearch)
          this.getSubset(this.currentStatus)
          this.close()
        } else {
          this.$refs.snackbar.showError(res.data.msg)
        }
      }
    }),
    close() {
      this.dialog = false
      this.categoryAddSelectId = ''
      this.attrAddSelectId = ''
      setTimeout(() => {
        this.editedItem = Object.assign({}, { name: '' })
        this.editedIndex = -1
      }, 300)
      this.$v.$reset()
    },
    // 搜索
    handleSearch: Common.throttle(function() {
      let paramsSearch = {}
      let query = {}
      if (this.categorySelect === '全部' || this.categorySelect === '') {
        paramsSearch.categoryId = ''
      } else {
        paramsSearch.categoryId = this.categorySelect
      }
      if (this.subsetSelect === '全部' || this.subsetSelect === '') {
        query.attrId = ''
      } else {
        query.attrId = this.subsetSelect
      }
      query = Object.assign({}, query, paramsSearch)
      this.currentStatus = query
      this.getSubset(this.currentStatus, 'search')
    }, 2000),
    //数组去重
    unique(arr) {
      let result = []
      let obj = {}
      for (let i = 0; i < arr.length; i++) {
        if (!obj[arr[i].name]) {
          result.push(arr[i])
          obj[arr[i].name] = true
        }
      }
      return result
    }
  }
}
</script>
<style scoped>
@import '../../assets/css/classify.css';
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
