<template>
  <v-container fluid grid-list-xl>
      <v-layout pl-5>
        <v-flex xs12 sm2 md2>
          <v-autocomplete :items="items" label="请选择/输入员工姓名" item-text="name" item-value="_id" v-model="temp_name_selected"
            no-data-text="暂无数据"></v-autocomplete>
        </v-flex>
        <v-flex xs12 sm6 md1 mt-1>
          <v-btn color="info" class="button" @click="search()">
            <v-icon>search</v-icon>
            搜索
          </v-btn>
        </v-flex>
      </v-layout>
    <v-card class="mt-5 pa-5">
      <page-title :title="title" :subtitle="subtitle" />
      <v-flex md12>
        <v-data-table v-model="selected" :headers="headers" :items="desserts" :pagination.sync="pagination" select-all
          item-key="_id" no-data-text="暂无数据" class="elevation-1">
          <template v-slot:headers="props">
            <tr>
              <th>
                <v-checkbox :input-value="props.all" :indeterminate="props.indeterminate" primary hide-details
                  @click.stop="toggleAll"></v-checkbox>
              </th>
              <th v-for="header in props.headers" :key="header.text">
                {{ header.text }}
              </th>
            </tr>
          </template>
          <template v-slot:items="props">
            <tr :active="props.selected" @click="props.selected = !props.selected">
              <td class="text-xs-center">
                <v-checkbox :input-value="props.selected" primary hide-details>
                </v-checkbox>
              </td>
              <td class="text-md-center">{{ props.item.name }}</td>
              <td class="text-md-center">{{ props.item.department_id.name }}</td>
              <td class="text-md-center">{{ props.item.last_value_index_time}}</td>
            </tr>
          </template>
        </v-data-table>
      </v-flex>
      <v-layout>
        <v-flex class="text-md-right text-lg-right">
          <v-btn color="info" @click="calculate()">
            计算 valueIndex
          </v-btn>
        </v-flex>
      </v-layout>
    </v-card>
    <!-- 弹框 -->
    <snackbar ref="snackbar" />
  </v-container>
</template>
<script>
import snackbar from "../../components/snackbar.vue";
import pageTitle from '@/views/components/pageTitle.vue';

export default {
  components: { snackbar, pageTitle },
  data: () => ({
    title: "员工管理",
    subtitle: "valueIndex 计算",
    date: new Date().toISOString().substr(0, 10),
    pagination: {
      sortBy: "name"
    },
    selected: [],
    items: [],
    temp_name_selected: "全部",
    name_selected: "全部",
    headers: [
      { text: "员工姓名", align: "center", value: "name" },
      { text: "所在部门", align: "center", value: "calories" },
      { text: "上次计算valueIndex时间", align: "center", value: "calories" }
    ],
    desserts: []
  }),
  created() {
    this.getValueCalculate();
  },
  methods: {
    async getValueCalculate() {
      let res = await this.$request.fetch("/api/salaryStructure/allValueIndex");
      if (res.data.status === 200) {
        this.desserts = res.data.result;
        for (const iterator of this.desserts) {
          this.items.push(iterator);
        }
        this.items.unshift("全部");
      }
    },
    async search(flag) { // flag 用于区分是计算之后调用 / 点击搜索按钮调用
      flag || (this.name_selected = this.temp_name_selected);
      if (this.name_selected === "全部") {
        await this.getValueCalculate();
      } else {
        let res = await this.$request.fetch(
          "/api/salaryStructure/valueIndexSearch",
          { employeeId: this.name_selected }
        );
        if (res.data.status === 200) {
          this.desserts = res.data.result;
          flag || this.$refs.snackbar.showStatus("search");
        } else {
          flag || this.$refs.snackbar.showStatus("search", false);
        }
      }
    },
    async calculate() {
      if(!this.selected || this.selected.length <= 0){
        this.$refs.snackbar.showError("请选择至少一名员工");
        return  false;
      }
      let allId = [];
      for (const iterator of this.selected) {
        allId.push(iterator._id);
      }
      let res = await this.$request.fetch(
        "/api/salaryStructure/employeeSumpoint",
        { employeeIdArr: allId },
        "post"
      );
      if (res.data.status === 200) {
        // this.getValueCalculate();
        this.$refs.snackbar.showOk("计算成功");
      } else {
        this.$refs.snackbar.showError("请稍后再试");
      }
      // 调用search展示列表页
      this.selected = [];
      this.search(true);
    },
    toggleAll() {
      if (this.selected.length) {
        this.selected = [];
      } else {
        this.selected = this.desserts;
      }
    },
    changeSort(column) {
      if (this.pagination.sortBy === column) {
        this.pagination.descending = !this.pagination.descending;
      } else {
        this.pagination.sortBy = column;
        this.pagination.descending = false;
      }
    }
  }
};
</script>
<style scoped>
@import "../../../assets/css/common.css";
</style>