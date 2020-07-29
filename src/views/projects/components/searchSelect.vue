<template>
  <v-layout class="searchStyle">
    <v-flex lg2 d-flex class="top-item">
      <v-autocomplete label="请选择/输入" :items="itemsLists" v-model="selectItem" no-data-text="暂无数据"
        @change="changeItem()" return-object></v-autocomplete>
    </v-flex>
    <v-flex lg2 d-flex class="top-item" v-if="isStatusShow">
      <v-autocomplete label="请选择/输入" :items="statusLists" v-model="selectStatus"
        no-data-text="暂无数据"></v-autocomplete>
    </v-flex>
    <v-flex xs2 md2 lg1 d-flex class="top-item">
      <v-btn round color="info" style="margin-left: 20px; border-radius:10px;" dark
        @click="search()">
        <v-icon>search</v-icon>搜索
      </v-btn>
    </v-flex>
  </v-layout>
</template>

<script>
// selectLists:[
//   { value: 'manager', text: '项目经理', itemsStatus: [ { value: 'id', text:'dora' }  ]},
//   { value: 'number', text: '项目编号', itemsStatus:['2020P001','2020P002','2020P004'] }
// ],
// defaultSelect: { item: 'status', value: '2020P002' },
export default {
  props: {
    selectLists: {
      type: Array,
      required: true
    },
    defaultSelect: {
      type: Object
    }
  },
  data() {
    return {
      itemsStatus: [{ value: "all", text: "全部" }],
      selectItem: "all",
      selectStatus: "all",
      isStatusShow: false
    };
  },
  computed: {
    itemsLists() {
      return [{ value: "all", text: "全部" }].concat(this.selectLists);
    },
    statusLists() {
      return [{ value: "all", text: "全部" }].concat(this.itemsStatus);
    }
  },
  watch: {
    selectLists() {
      if (this.defaultSelect) {
        this.getDefaultList(this.defaultSelect);
      }
    }
  },
  methods: {
    changeItem() {
      if (this.selectItem.value !== "all") {
        this.itemsStatus = this.selectItem.itemsStatus;
        this.selectStatus = "all";
        this.isStatusShow = true;
      } else {
        this.isStatusShow = false;
      }
    },
    getDefaultList(list) {
      let isItemExist = this.selectLists.some(item => {
        if (item.value === list.item) {
          this.selectItem = item;
          this.itemsStatus = item.itemsStatus;
        }
        return item.value === list.item;
      });
      if (!isItemExist) {
        return;
      }

      this.isStatusShow = true;

      if (list.value === "all") {
        this.selectStatus = "all";
        return;
      }

      let isStatusExist = this.itemsStatus.some(item => {
        if (typeof item === "string") {
          return item === list.value;
        }
        return item.value === list.value;
      });

      if (isStatusExist) {
        this.selectStatus = list.value;
      } else {
        this.selectStatus = "all";
      }
    },
    search() {
      let param = {
        item: this.selectItem === "all" ? "all" : this.selectItem.value,
        value: this.selectStatus
      };
      this.$emit("search", param);
    }
  }
};
</script>

<style>
.top-item {
  margin-right: 20px;
}
.searchStyle {
  margin-bottom: 30px;
}
</style>