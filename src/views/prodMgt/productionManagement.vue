<template>
  <v-container fluid grid-list-xl>
    <v-layout pl-5>
      <v-flex xs12 sm2 md3>
        <v-autocomplete label="请选择/输入生产中心" :items="allWork" item-text="workName" item-value="_id" v-model="pro_chosen"
          no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm2 md2>
        <v-autocomplete label="请选择/输入机器" :items="allNickname" item-text="nickName" item-value="_id" v-model="mac_chosen"
          no-data-text="暂无数据"></v-autocomplete>
      </v-flex>
      <v-flex xs12 sm2 md1 ml-2 mt-1>
        <v-btn color="info" class="button" @click="handleSearch()">
          <v-icon left>search</v-icon>搜索
        </v-btn>
      </v-flex>
      <v-flex xs12 sm2 md1 ml-5 mt-1>
        <v-btn color="info" class="button" @click="add">
          <v-icon>add</v-icon>新增
        </v-btn>
      </v-flex>
    </v-layout>
    <!-- topBar end -->
    <v-card class="mt-5 pa-5">
      <page-title :title="title" :subtitle="subtitle" />
      <v-flex xs12 sm12 md12 d-flex>
        <v-card class="margin_card">
          <v-data-table :headers="headers" :items="allMachine" class="elevation-1" no-data-text="暂无数据">
            <template v-slot:items="props">
              <td class="text-xs-center">{{ props.item.serialNumber }}</td>
              <td class="text-xs-center">{{ props.item.nickName }}</td>
              <td class="text-xs-center">{{ props.item.workCenterId.workName}}</td>
              <td class="text-xs-center">{{ props.item.category }}</td>
              <td class="text-xs-center" id="td">
                <div id="type">
                  <p v-for="(types,index2) in props.item.type" :key="index2">{{types|filterKey}}</p>
                </div>
              </td>
              <td class="text-xs-center" id="td">
                <div id="p">
                  <p v-for="(value, key) in props.item.click_count" :key="key">{{key|filterKey}}&nbsp;&nbsp;{{value}}
                  </p>
                </div>
              </td>
              <td class="text-xs-center">
                <v-icon :color="props.item.status==='1'?'success':(props.item.status==='0'?'error':'disabled')">
                  fiber_manual_record</v-icon>
              </td>
              <td class="text-xs-center">
                <v-btn color="info" @click="edit(props.item)" small>编辑</v-btn>
                <v-btn color="info" @click="confirmDialog(props.item)" small>删除</v-btn>
                <v-btn color="info" @click="downloadMiniProCode(props.item)" small>下载录入码</v-btn>
              </td>
            </template>
          </v-data-table>
          <v-layout class="absoluted">
            <div>
              <v-icon color="success">fiber_manual_record</v-icon>
              <span>开机</span>
            </div>
            <div>
              <v-icon color="error">fiber_manual_record</v-icon>
              <span>关机</span>
            </div>
            <div>
              <v-icon color="disabled">fiber_manual_record</v-icon>
              <span>报废</span>
            </div>
          </v-layout>
        </v-card>
      </v-flex>
    </v-card>
    <!-- add/edit machine dialog start -->
    <v-dialog v-model="dialog" persistent max-width="600px">
      <v-card>
        <v-card-title>
          <v-flex md3 class="headline pt-3 pl-3">{{operate}}机器</v-flex>
        </v-card-title>
        <v-card-text>
          <v-container grid-list-md>
            <v-layout wrap align-center>
              <v-flex xs12 sm6 md3>
                <div class="subtitle-2">
                  所属打印中心
                  <span class="empis">*</span>
                </div>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-select :items="addWorks" item-text="workName" item-value="_id" label placeholder="请选择"
                  v-model="workName" :error-messages="workNameErrors" @change="$v.workName.$touch()"
                  @blur="$v.workName.$touch()" no-data-text="暂无数据"></v-select>
              </v-flex>
            </v-layout>
            <v-layout wrap align-center>
              <v-flex xs12 md3>
                <div class="subtitle-2">
                  机器序列号
                  <span class="empis">*</span>
                </div>
              </v-flex>
              <v-flex xs12 md8>
                <v-text-field v-model.trim="serialNumber" label type="text" required
                  :error-messages="serialNumberErrors" @blur="$v.serialNumber.$touch()"></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout wrap align-center mb-5>
              <v-flex xs12 sm6 md3>
                <div class="subtitle-2">
                  设备分类
                  <span class="empis">*</span>
                </div>
              </v-flex>
              <v-flex xs12 sm6 md8>
                <v-select :disabled="operate == '编辑'?true:false" :items="categoryList" label placeholder="请选择"
                  v-model="category" :error-messages="categoryErrors" @change="$v.category.$touch()"
                  @blur="$v.category.$touch()"></v-select>
              </v-flex>
            </v-layout>
            <v-layout wrap align-center>
              <v-flex xs12 md3>
                <div class="subtitle-2">
                  机器小名
                  <span class="empis">*</span>
                </div>
              </v-flex>
              <v-flex xs12 md8>
                <v-text-field label type="text" required v-model.trim="nickName" :error-messages="nickNameErrors"
                  @blur="$v.nickName.$touch()"></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout wrap align-center>
              <v-flex xs12 sm6 md3>
                <div class="subtitle-2">
                  设备状态
                  <span class="empis">*</span>
                </div>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-select :items="status_mac" label placeholder="请选择" v-model="status" :error-messages="statusErrors"
                  @change="$v.status.$touch()" @blur="$v.status.$touch()"></v-select>
              </v-flex>
            </v-layout>
            <v-layout wrap align-center v-show="this.category=='打印机'?true:false">
              <v-flex xs12 sm6 md3>
                <div class="subtitle-2">
                  设备类型
                  <span class="empis">*</span>
                </div>
              </v-flex>
              <v-flex xs12 sm6 md4>
                <v-select :items="machineType" v-model="type" label="请选择" required multiple :class="noType ? 'tip':''">
                </v-select>
              </v-flex>
            </v-layout>
            <v-layout wrap align-center v-show="(category=='打印机')?true:false" v-for="(item,index) in type" :key="index">
              <v-flex xs12 sm6 md3>
                <div class="subtitle-2">
                  {{item}}&nbsp;&nbsp; 计数值
                  <span class="empis">*</span>
                </div>
              </v-flex>
              <v-flex xs12 md8>
                <v-text-field label type="text" required v-model.trim="clickCount[changeItem(item)]"
                  :error-messages="clickCountErrors" :class="!reg.test(clickCount[changeItem(item)])?'tips':''">
                </v-text-field>
                {{clickCount[item]}}
              </v-flex>
            </v-layout>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="info" @click="close" mr-2>取消</v-btn>
          <v-btn color="info" @click="saveInfo()">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- 确认删除弹框 -->
    <confirmDialog ref="confirmDialog" @enableDelete="enableDelete" />
    <!-- 弹框 -->
    <snackbar ref="snackbar" />
  </v-container>
</template>
<script>
import { log } from "util";
import Common from "../../utils/common";
import snackbar from "../components/snackbar";
import confirmDialog from "../components/confirmDialog";
import pageTitle from "@/views/components/pageTitle.vue";

import { required, alphaNum, numeric } from "vuelidate/lib/validators";
export default {
  name: "productionManagement",
  validations: {
    serialNumber: { required, alphaNum },
    nickName: { required },
    workName: { required },
    category: { required },
    type: { required },
    status: { required },
    clickCount: { required }
  },
  data() {
    return {
      title: "生产管理",
      subtitle: "机器列表",
      noType: false,
      noCount: false,
      reg: new RegExp("^[0-9]*$"),
      deleteItem: [],
      addWorks: [],
      currentStatus: "", //点击了搜索按钮才会赋值
      query: {},
      machineId: "", //编辑、删除时要用的机器id
      allMachine: [], //所有的机器
      allWork: [], //所有制作中心
      status_mac: ["开机", "关机", "损坏"],
      pro_chosen: "全部", //制作中心选中
      mac_chosen: "全部", //机器选中
      dialog: false, //弹框
      operate: "", //判断新增还是编辑
      showStep: false,
      serialNumber: "",
      nickName: "",
      workName: "",
      category: "",
      status: "",
      type: [],
      allNickname: [], //所有机器小名
      categoryList: ["打印机", "覆膜机", "胶装机", "其它"],
      machineType: ["黑白A3", "彩色A3", "黑白A4", "彩色A4"], //设备类型为打印机时的类别
      headers: [
        {
          text: "序列号",
          value: "",
          sortable: false,
          align: "center"
        },
        { text: "小名", value: "nikeName", sortable: false, align: "left" },
        {
          text: "制作中心",
          value: "",
          sortable: false,
          align: "center"
        },
        {
          text: "设备分类",
          value: "",
          sortable: false,
          align: "center"
        },
        { text: "类型", value: "", sortable: false, align: "center" },
        {
          text: "计数值",
          value: "",
          sortable: false,
          align: "center"
        },
        { text: "状态", value: "", sortable: false, align: "center" },
        {
          text: "操作",
          value: "",
          sortable: false,
          align: "center",
          width: "360px"
        }
      ],
      clickCount: {
        type: Object,
        required: true
      }
    };
  },
  components: {
    snackbar,
    confirmDialog,
    pageTitle
  },
  filters: {
    filterKey(item) {
      if (item === "blackA3") {
        return "黑白A3";
      }
      if (item === "blackA4") {
        return "黑白A4";
      }
      if (item === "colorA3") {
        return "彩色A3";
      }
      if (item === "colorA4") {
        return "彩色A4";
      }
    },
    filterCount(item, count) {
      if (item === "黑白A3") {
        return count.blackA3;
      }
      if (item === "黑白A4") {
        return count.blackA4;
      }
      if (item === "彩色A3") {
        return count.colorA3;
      }
      if (item === "彩色A4") {
        return count.colorA4;
      }
    }
  },
  computed: {
    serialNumberErrors() {
      const errors = [];
      if (!this.$v.serialNumber.$dirty) return errors;
      !this.$v.serialNumber.required && errors.push("机器序列号不能为空");
      !this.$v.serialNumber.alphaNum && errors.push("非法机器序列号");
      return errors;
    },
    nickNameErrors() {
      const errors = [];
      if (!this.$v.nickName.$dirty) return errors;
      !this.$v.nickName.required && errors.push("机器小名不能为空");
      return errors;
    },
    workNameErrors() {
      const errors = [];
      if (!this.$v.workName.$dirty) return errors;
      !this.$v.workName.required && errors.push("请选择制作中心");
      return errors;
    },
    categoryErrors() {
      const errors = [];
      if (!this.$v.category.$dirty) return errors;
      !this.$v.category.required && errors.push("请选择设备类型");
      return errors;
    },
    statusErrors() {
      const errors = [];
      if (!this.$v.status.$dirty) return errors;
      !this.$v.status.required && errors.push("请选择设备状态");
      return errors;
    },
    clickCountErrors(val) {
      const errors = [];
      if (!this.$v.clickCount.$dirty) return errors;
      !this.$v.clickCount.required && errors.push("打印总量不能为空");
      return errors;
    }
  },
  methods: {
    add() {
      this.$v.$reset();
      this.nickName = "";
      this.workName = "";
      this.category = "";
      this.type = "";
      this.serialNumber = "";
      this.status = "";
      this.clickCount = 0;
      this.dialog = true;
      this.operate = "新增";
      this.showStep = true;
    },
    edit(item) {
      this.dialog = true;
      this.operate = "编辑";
      this.showStep = false;
      this.machineId = item._id;
      //default data
      this.nickName = item.nickName;
      this.category = item.category;
      if (this.category != "打印机") {
        this.type = [];
      } else {
        for (let key in this.clickCount) {
          if (!this.clickCount[key]) {
            return;
          }
        }
      }
      if (this.category === "打印机") {
        let list = [];
        item.type.forEach(doc => {
          if (doc === "blackA3") {
            list.push("黑白A3");
          }
          if (doc === "blackA4") {
            list.push("黑白A4");
          }
          if (doc === "colorA3") {
            list.push("彩色A3");
          }
          if (doc === "colorA4") {
            list.push("彩色A4");
          }
        });
        this.type = list;
      } else {
        this.type = [];
      }
      this.workName = item.workCenterId._id; // TODO: 点击按钮后需要默认显示
      this.serialNumber = item.serialNumber;
      this.clickCount = item.click_count;
      if (item.status === "1") {
        this.status = "开机";
      } else if (item.status === "0") {
        this.status = "关机";
      } else {
        this.status = "损坏";
      }
    },
    saveInfo() {
      this.$v.$touch();
      if (
        this.serialNumber === "" ||
        this.serialNumber === false ||
        !/^[0-9a-zA-Z]*$/g.test(this.serialNumber) ||
        this.nickName === "" ||
        this.nickName === false ||
        this.workName === "" ||
        this.category === "" ||
        this.status === "" ||
        this.clickCount === ""
      ) {
        return false;
      }
      if (this.category === "打印机" && this.type.length === 0) {
        this.noType = true;
        return false;
      }
      if (this.category != "打印机") {
        this.type = [];
      } else {
        let reg = new RegExp("^[0-9]*$");
        for (let key in this.clickCount) {
          if (!reg.test(this.clickCount[key]) || !this.clickCount[key]) {
            return false;
          }
        }
        this.type.forEach(type => {
          if (
            this.clickCount[type] === null ||
            this.clickCount[type] === undefined ||
            this.clickCount[type] === ""
          ) {
            this.noCount = true;
          }
        });
      }
      this.$v.$reset();
      if (this.operate === "新增") {
        this.addMachine();
      } else {
        this.editMachine();
      }
    },
    close() {
      this.dialog = false;
      this.$v.$reset();
    },
    async addMachine() {
      let status = "";
      let list = [];
      if (
        Object.prototype.toString.call(this.type) === "[object Array]" &&
        this.type.length > 0
      ) {
        this.type.forEach(el => {
          if (el === "黑白A3") {
            list.push("blackA3");
          }
          if (el === "黑白A4") {
            list.push("blackA4");
          }
          if (el === "彩色A3") {
            list.push("colorA3");
          }
          if (el === "彩色A4") {
            list.push("colorA4");
          }
        });
      }
      if (this.status === "开机") {
        status = "1";
      } else if (this.status === "关机") {
        status = "0";
      } else {
        status = "2";
      }
      let res = await this.$request.fetch(
        "/api/productionManagement/addMachine",
        {
          nickName: this.nickName,
          workCenterId: this.workName,
          serialNumber: this.serialNumber,
          category: this.category,
          status: status,
          type: list,
          click_count: this.clickCount
        },
        "post"
      );
      if (res.data.status === 200) {
        this.$refs.snackbar.showStatus("add");
        this.searchMachines(this.currentStatus);
        this.getWorkMachine(true);
        this.dialog = false;
      } else {
        this.$refs.snackbar.show(res.data.msg, "error");
      }
    },
    async editMachine() {
      //send request to update machine info
      let list = [];
      let status = "";
      this.type.forEach(el => {
        if (el === "黑白A3") {
          list.push("blackA3");
        }
        if (el === "黑白A4") {
          list.push("blackA4");
        }
        if (el === "彩色A3") {
          list.push("colorA3");
        }
        if (el === "彩色A4") {
          list.push("colorA4");
        }
      });
      if (this.status === "开机") {
        status = "1";
      } else if (this.status === "关机") {
        status = "0";
      } else {
        status = "2";
      }
      let res = await this.$request.fetch(
        "/api/productionManagement/updateMachine",
        {
          machineId: this.machineId,
          workId: this.workName,
          updateList: {
            serialNumber: this.serialNumber,
            nickName: this.nickName,
            category: this.category,
            status: status,
            type: list,
            click_count: this.clickCount
          }
        },
        "post"
      );
      if (res.data.status === 200) {
        this.$refs.snackbar.showStatus("edit");
        this.searchMachines(this.currentStatus);
        this.getWorkMachine(true);
      } else {
        this.$refs.snackbar.show(res.data.msg, "error");
      }
      this.dialog = false;
    },
    confirmDialog(item) {
      this.$refs.confirmDialog.show();
      this.deleteItem = item;
      this.machineId = item._id;
    },
    async enableDelete() {
      let res = await this.$request.fetch(
        "/api/productionManagement/delMachine",
        {
          machineId: this.machineId
        },
        "delete"
      );
      if (res.data.status === 200) {
        let index = this.allMachine.indexOf(this.deleteItem);
        this.allMachine.splice(index, 1);
        this.$refs.snackbar.showStatus("delete");
        if (!this.pro_chosen || this.pro_chosen === "全部") {
          let res = await this.$request.fetch(
            "/api/productionManagement/getAllMachine"
          );
          if (res.data.status === 200) {
            let allMachine = res.data.result;
            this.allNickname = [];
            let works = [];
            this.allWork.forEach(work => {
              works.push(work._id);
            });
            // if (!isTrue) {
            allMachine = allMachine.filter(machine => {
              return works.indexOf(machine.workCenterId._id) != -1;
            });
            // }
            allMachine.forEach(machine => {
              this.allNickname.push({
                _id: machine._id,
                nickName: machine.nickName
              });
            });
            if (this.query.machineId) {
              this.mac_chosen = "全部";
            }
            this.allMachine = allMachine;
            this.allNickname.unshift({ nickName: "全部" });
          }
        } else {
          this.getWorkMachine();
        }
      } else {
        this.$refs.snackbar.show("删除数据失败，请刷新重试", "error");
      }
    },
    async _getUserCenters() {
      const tel = localStorage.getItem("tel");
      let res = await this.$request.fetch(
        "/api/productionManagement/getUserCenters",
        { tel: tel }
      );
      if (res.data.status === 200) {
        this.allWork = res.data.result;
        let addWorks = [];
        this.allWork.forEach(data => {
          addWorks.push({
            _id: data._id,
            workName: data.workName
          });
        });
        this.addWorks = addWorks;
        this.allWork.unshift({ workName: "全部" });
      } else {
        this.$refs.snackbar.show("获取数据失败，请刷新重试", "error");
      }
    },
    async getAllMachine() {
      let res = await this.$request.fetch(
        "/api/productionManagement/getAllMachine"
      );
      if (res.data.status === 200) {
        let allMachine = res.data.result;
        this.allNickname = [];
        let works = [];
        this.allWork.forEach(work => {
          works.push(work._id);
        });
        allMachine = allMachine.filter(machine => {
          return works.indexOf(machine.workCenterId._id) != -1;
        });
        allMachine.forEach(machine => {
          this.allNickname.push({
            _id: machine._id,
            nickName: machine.nickName
          });
        });
        this.mac_chosen = "全部";
        this.allMachine = allMachine;
        this.allNickname.unshift({ nickName: "全部" });
      }
    },
    async getWorkMachine(isTrue) {
      let res = await this.$request.fetch(
        "/api/productionManagement/getAllMachine"
      );
      if (res.data.status === 200) {
        let allMachine = res.data.result;
        this.allNickname = [];
        let works = [];
        this.allWork.forEach(work => {
          works.push(work._id);
        });
        if (!this.pro_chosen || this.pro_chosen === "全部") {
          if (!isTrue) {
            allMachine = allMachine.filter(machine => {
              return works.indexOf(machine.workCenterId._id) != -1;
            });
          }
          allMachine.forEach(machine => {
            this.allNickname.push({
              _id: machine._id,
              nickName: machine.nickName
            });
          });
        } else {
          if (
            !isTrue &&
            this.query.workId != "" &&
            this.query.workId != "全部"
          ) {
            allMachine = allMachine.filter(machine => {
              return machine.workCenterId._id == this.pro_chosen;
            });
          }
          allMachine.forEach(machine => {
            if (machine.workCenterId._id == this.pro_chosen) {
              this.allNickname.push({
                _id: machine._id,
                nickName: machine.nickName
              });
            }
          });
          if (this.query.machineId) {
            this.mac_chosen = "全部";
          }
          // this.allMachine = allMachine
        }
        this.allNickname.unshift({ nickName: "全部" });
        if (!isTrue) {
          this.allMachine = allMachine;
        }
      }
    },
    handleSearch: Common.throttle(function() {
      if (this.pro_chosen != "全部" && this.pro_chosen) {
        this.query.workId = this.pro_chosen;
      } else {
        this.query.workId = "";
      }
      if (this.mac_chosen != "全部" && this.mac_chosen) {
        this.query.machineId = this.mac_chosen;
      } else {
        this.query.machineId = "";
      }
      this.currentStatus = this.query;
      this.searchMachines(this.query, "search");
    }, 2000),
    async searchMachines(query, type) {
      let res = await this.$request.fetch(
        "/api/productionManagement/searchMachines",
        query
      );
      if (res.data.status === 200) {
        this.allMachine = [];
        let works = [];
        let allMachine = res.data.result;
        this.allWork.forEach(work => {
          works.push(work._id);
        });
        allMachine = allMachine.filter(machine => {
          return works.indexOf(machine.workCenterId._id) != -1;
        });
        this.allMachine = allMachine;
        if (type === "search") {
          this.$refs.snackbar.showStatus("search");
        }
      } else {
        this.$refs.snackbar.show("获取数据失败，请刷新重试", "error");
      }
    },
    changeItem(item) {
      if (item === "黑白A3") {
        return "blackA3";
      }
      if (item === "黑白A4") {
        return "blackA4";
      }
      if (item === "彩色A3") {
        return "colorA3";
      }
      if (item === "彩色A4") {
        return "colorA4";
      }
    },
    // 下载该机器的小程序码
    async downloadMiniProCode(item) {
      // 发送请求获取小程序的access_token
      let token;
      const { data } = await this.$request.fetch("/api/productionManagement/productToken");
      if (data.status === 200) {
        token = data.result.token;
      } else {
        this.$refs.snackbar.showError("下载失败，请刷新重试");
        return;
      }

      let response = await this.$request.fetch(
        `/wx/wxa/getwxacodeunlimit?access_token=${token}`, // 请求URL
        {
          scene: `id=${item._id}`,
          page: "pages/index/index"
        },
        "post",
        { responseType: "blob" } // 设置返回的数据类型为二进制数据
      );

      this.downloadFile(response, item); // 将返回结果作为参数调用本地下载文件方法
    },
    downloadFile(data, item) {
      let _that = this;
      if (!data) {
        return;
      }
      let url = window.URL.createObjectURL(new Blob([data.data])); // 后台返回结果data是个对象，其中的data属性才是文件的二进制数据
      let link = document.createElement("a"); // 创建a标签
      link.style.display = "none"; // 设置a标签不可见
      link.href = url; // 设置a标签的URL属性
      link.setAttribute("download", `${item.nickName}.jpg`); // 给a标签添加download属性并指定下载的文件名
      document.body.appendChild(link); // 将a标签节点添加在DOM中
      link.click(); // 触发a标签
    }
  },
  async mounted() {
    await this._getUserCenters();
    this.getAllMachine();
  },
  watch: {
    type(val) {
      let click_count = {};
      let clickCount = this.clickCount;
      if (Object.prototype.toString.call(val) === "[object Array]" && val[0]) {
        val.forEach(el => {
          let ele = this.changeItem(el);
          click_count[ele] = clickCount[ele];
        });
      }
      this.clickCount = click_count;
    },
    pro_chosen(val) {
      this.mac_chosen = "全部";
      this.query.machineId = "";
      this.query.workId = "";
      this.getWorkMachine(true);
    }
  }
};
</script>

<style scoped>
@import "../../assets/css/common.css";

.empis {
  font-size: 12px;
  color: #ff5252;
  margin-left: 4px;
}
.text {
  line-height: 20px;
  color: #333300;
  letter-spacing: 4px;
  margin-left: 30px;
  cursor: pointer;
  font-size: 16px;
}
.margin_card {
  margin: 20px;
  position: relative;
}
.tips {
  font-size: 12px;
  position: relative;
  color: rgb(135, 135, 135);
}
.tips::after {
  position: absolute;
  top: 75%;
  content: "计数值只能为数字类型";
  font-size: 12px;
  color: #ff5252;
}
.tip {
  font-size: 12px;
  position: relative;
  color: rgb(135, 135, 135);
}
.tip::after {
  position: absolute;
  top: 75%;
  content: "请填写机器类型或计数值";
  font-size: 12px;
  color: #ff5252;
}

.absoluted {
  position: absolute;
  bottom: 27px;
  left: 36px;
  font-size: 0;
}
.absoluted div span {
  font-size: 16px;
  margin-right: 40px !important;
  vertical-align: top;
}
.flex {
  display: flex;
  flex-direction: column;
}
#td {
  padding: 0;
}
#type,
#p {
  width: 100%;
}
</style>