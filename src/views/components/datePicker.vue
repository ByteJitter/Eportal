<!--
 * @Author: your name
 * @Date: 2019-12-26 11:16:53
 * @LastEditTime : 2019-12-26 16:47:16
 * @LastEditors  : Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /new restructure /eportal/src/views/components/datePicker.vue
 -->

<template>
  <v-flex xs12 sm2 md3>
    <v-menu v-model="isShowDate" :close-on-content-click="false" :nudge-right="40" lazy transition="scale-transition" offset-y full-width min-width="100px">
      <template v-slot:activator="{ on }">
        <v-text-field v-model="period" label="请选择开始日期" prepend-icon="event" readonly v-on="on"></v-text-field>
      </template>
      <v-date-picker v-model="period" locale="zh-cn" @input="close()"></v-date-picker>
    </v-menu>
  </v-flex>
</template>

<script>
export default {
  props:["dateTime"],
  data() {
    return {
      isShowDate:false,
      period:this.dateTime
    };
  },
  methods: {
    close() {
      this.isStartDate = false
    }
  }
};
</script>

<style>
</style>