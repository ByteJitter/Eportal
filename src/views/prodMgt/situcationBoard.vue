<template>
  <v-container fluid grid-list-xl>
    <!-- 搜索 -->
    <div class="search">
      <v-layout>
        <v-form>
          <!-- @change="$v.selectedWorkCenter.$touch()" :error-messages="workCenterIdError" -->
            <v-autocomplete v-model="selectedWorkCenter" :disabled="isUpdating"  :items="workCenterData"  filled chips label="请选择/输入打印中心"  item-text="workName"  item-value="_id" multiple  no-data-text="暂无数据" >
            </v-autocomplete>
          </v-form>
        <v-flex xs12 sm2 md2>
          <v-menu v-model="isStartOpen" :close-on-content-click="false" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
            <template v-slot:activator="{ on }">
              <v-text-field v-model="startDate" label="请选择开始日期" prepend-icon="event" readonly v-on="on"></v-text-field>
            </template>
            <v-date-picker v-model="startDate" locale="zh-cn" @input="closeStartDate()" :max="currentDate"  ></v-date-picker>
          </v-menu>
        </v-flex>
        <v-flex xs12 sm2 md2>
          <v-menu v-model="isEndOpen" :close-on-content-click="false" :nudge-right="40" lazy transition="scale-transition" offset-y full-width max-width="290px" min-width="290px">
            <template v-slot:activator="{ on }">
              <v-text-field v-model="endDate" label="请选择结束日期" prepend-icon="event" readonly v-on="on"></v-text-field>
            </template>
            <v-date-picker v-model="endDate" locale="zh-cn" @input="closeEndDate()" :min="endDateStart" :max="endDateEnd" ></v-date-picker>
          </v-menu>
        </v-flex>
        <v-flex xs12 sm6 md2> 
          <v-btn color="info" @click="search()" >
            <v-icon>search</v-icon>搜索
          </v-btn>
        </v-flex>
      </v-layout>
    </div>
    <div id="totalEcharts" v-show="totalEchartsData.length>0"></div>
    <div id="finishEcharts" v-show="finishEchartsData.length>0"></div>
    <div id="undoneEcharts" v-show="undoneEchartsData.length>0"></div>
    <div> 
        <v-data-table :items="headers" class="elevation-1" hide-actions hide-headers id="table">
              <template v-slot:items="props">
                <td>{{props.item.name}}</td>
                <td>{{props.item.date}}</td>
                <td>{{props.item.total}}</td>
                <td>{{props.item.finish}}</td>
                <td>{{props.item.undone}}</td>
              </template>
            </v-data-table>
      <v-expansion-panel v-if="tableLists.length>0">
        <v-expansion-panel-content v-for="(item,i) in tableLists" :key="i">
          <template v-slot:header>
            <div >{{item.name}}</div>
            <div>{{item.data[0].date}}</div>
            <div >{{item.data[0].total_print_data}}</div>
            <div >{{item.data[0].completed_print_data}}</div>
            <div >{{item.data[0].undone_print_data}}</div>
          </template>
            <!-- 收缩内容 -->
            <v-data-table :items="item.endData" class="elevation-1" hide-actions hide-headers id="table" no-data-text="暂无数据">
              <template v-slot:items="props">
                <td></td>
                <td>{{props.item.date}}</td>
                <td>{{props.item.total_print_data}}</td>
                <td>{{props.item.completed_print_data}}</td>
                <td>{{props.item.undone_print_data}}</td>
              </template>
            </v-data-table>
        </v-expansion-panel-content>
      </v-expansion-panel>
      <div v-else class="noData">暂无数据</div>
    </div>
    <snackbar ref="snackbar" />
  </v-container>
</template>
<script>
import util from"../../utils/util";
import Common from "../../utils/common";
import snackbar from "../components/snackbar";
import echarts from "echarts";
import { required } from "vuelidate/lib/validators";
export default {
  components: { snackbar },
  validations: {
    selectedWorkCenter: required
  },
  data() {
    return {
      isStartOpen: false,
      isEndOpen: false,
      currentDate :'',
      startDate :'',
      endDate :'',
      endDateStart :'',
      endDateEnd:'',
      timeInterval: 29,
      tableLists:[],
      totalEchartsData:[],
      finishEchartsData:[],
      undoneEchartsData:[],
      headers: [
        {name:"制作中心",date:"记录日期",total:"总量",finish:"已完成量",undone:'未完成量'}
      ],
      workCenterData:[],
      selectedWorkCenter:[],
      isUpdating:false
    };
  },
  // computed:{
  //   workCenterIdError() {
  //     const errors = [];
  //     if (!this.$v.selectedWorkCenter.$dirty) {
  //       return errors;
  //     }
  //     !this.$v.selectedWorkCenter.required && errors.push("请选择/输入制作中心");
  //     return errors;
  //   },
  // },
  async mounted() {
    await this.getWorkcenterData()
    await this.dateInit();
    await this.getPrintDataLists(this.selectedWorkCenter,this.startDate, this.endDate)
    await this.getTableDataLists(this.startDate, this.endDate)
  },
  methods: {
    closeStartDate() {
      this.startDateChange()
      this.isStartOpen = false;
    },
    closeEndDate() {
      this.isEndOpen = false;
    },
    search: Common.throttle(async function() {
      this.getPrintDataLists(this.selectedWorkCenter,this.startDate, this.endDate,"search")
      this.getTableDataLists(this.startDate, this.endDate)
    }),
    //制作中心echart图的数据
    async getPrintDataLists(workCenterId,startDate, endDate,type) {
      workCenterId = workCenterId && workCenterId.length > 0 ? workCenterId : []
      if(workCenterId.length == 0){
        return 
      }
      let res = await  this.$request.fetch("/api/situationBoard/echartData/getWorkCenterAmount",{workCenterId:workCenterId,startDate:startDate, endDate:endDate})
      if (res.data.status === 200) {
        let dataLists = res.data.result;
        let printDataLists = this.mapData(dataLists)
        this.getEchartsLists(printDataLists);
        if(type == "search"){
          this.$refs.snackbar.showStatus("search")
        }
      } else {
        if(type == "search"){
          this.$refs.snackbar.showStatus("search",false)
        }else{
          this.$refs.snackbar.showError();
        }
      }
    },
    mapData(dataLists){
      let printDataLists = dataLists.map((data) => {
        let date = util.formatDate(data.date);
        let { total_print_data,completed_print_data,undone_print_data} = data;
        return {
          name: data.work_center_id.workName,
          date,
          total_print_data,
          completed_print_data,
          undone_print_data
        }
      })  
      return printDataLists;
    },
    //表格的数据
    async getTableDataLists(startDate, endDate) {
      let res = await  this.$request.fetch("/api/situationBoard/echartData/getTableData",{startDate:startDate, endDate:endDate})
      if (res.data.status === 200) {
        let dataLists = res.data.result;
        let printDataLists = this.mapData(dataLists)
        this.getTabelLists(printDataLists);
      } else {
        this.$refs.snackbar.show("获取表格数据失败","error")
      }
    },
    dateInit() {
      let currentDate = util.getCurrentDate(1);
      let preIntervalDate = this.getIntervalDate(currentDate);
      this.currentDate = currentDate
      this.startDate = preIntervalDate
      this.endDate = currentDate
      this.endDateStart = preIntervalDate
      this.endDateEnd = currentDate
    },
    // 获取间隔日期，pre 是前29天日期，post 是后29天日期
    getIntervalDate(date, type = 'pre') {
      let interval = -this.timeInterval;
      if (type === 'post') {
        interval = this.timeInterval;
      }
      return util.getNextDate(date, interval);
    },
    startDateChange() {
      let postIntervalDate = this.getIntervalDate(this.startDate, 'post');
      let endDateEnd, endDate;

      // 开始日期+19 大于 当前日期    结束日期 终 = 当前日期
      if (new Date(postIntervalDate) > new Date(this.currentDate)) {
        endDateEnd = this.currentDate;
      } else {
        endDateEnd = postIntervalDate;
      }

      // 已选结束日期 大于 终止结束日期 || 小于 起始结束日期   结束日期 = 终止结束日期
      if (new Date(this.endDate) > new Date(endDateEnd) || new Date(this.endDate) < new Date(this.startDate)) {
        endDate = endDateEnd;
      } else {
        endDate = this.endDate;
      }

      this.startDate = this.startDate
      this.endDateStart = this.startDate
      this.endDateEnd = endDateEnd
      this.endDate = endDate
    },
    //获取表格数据
    getTabelLists(dataLists) {
      let tableLists1 = this.groupArrBy(dataLists, 'name', 'data');
      tableLists1.forEach(item => {
        item.data.sort((first, last) => {
          return new Date(last.date).getTime() - new Date(first.date).getTime();
        })
        item.endData = item.data.splice(1);
      })
      this.tableLists = tableLists1
    },
    groupArrBy(objectArray, property, field) {
      return objectArray.reduce((arr, obj) => {
        let isPropertyExist = arr.some((item) => {
          if (item[property] === obj[property]) {
            item[field].push(obj)
          }
          return item[property] === obj[property];
        });
        if (!isPropertyExist) {
          arr.push({
            [property]: obj[property],
            [field]: [obj]
          })
        }
        return arr;
      }, []);
    },
    //获取echarts数据
    getEchartsLists(dataLists) {
      this.totalEchartsData = [];
      this.finishEchartsData = [];
      this.undoneEchartsData = [];
      dataLists.forEach(list => {
        this.totalEchartsData.push({ name:list.name, date:list.date, printData:list.total_print_data  });
        this.finishEchartsData.push({ name:list.name, date:list.date, printData:list.completed_print_data  });
        this.undoneEchartsData.push({ name:list.name, date:list.date, printData:list.undone_print_data  });
      })
      this.initEcTotalLine()
      this.initEcFinishLine()
      this.initEcUndoneLine()
    },
    initEcTotalLine() {
      let canvas = document.getElementById("totalEcharts")
      const barChart = echarts.init(canvas);
      if(this.totalEchartsData.length <= 0){
        return
      }
      barChart.setOption(this.getBarOption("总量", this.totalEchartsData));
    },
    initEcFinishLine() {
      let canvas = document.getElementById("finishEcharts")
      const barChart = echarts.init(canvas);
      if(this.finishEchartsData.length <= 0){
        return
      }
      barChart.setOption(this.getBarOption("已完成量", this.finishEchartsData));
    },
    initEcUndoneLine() {
      let canvas = document.getElementById("undoneEcharts")
      const barChart = echarts.init(canvas);
      if(this.undoneEchartsData.length <= 0){
        return
      }
      barChart.setOption(this.getBarOption("未完成量", this.undoneEchartsData));
    },
    getBarOption(type, data) {
      let xAxis = this.getXAxisData(data, 'date');
      let seriesData = this.getSeriesData(data, xAxis);
      let legendData = seriesData.map(item => {
        return item.name
      })
      return {
        title: {
          text: ` ${type} `,
        },
        legend: {
          data: legendData,
          top: 30,
          z: 100
        },
        grid: {
          left: '2%',
          right: '10%',
          containLabel: true
        },
        tooltip: {
          show: true,
          trigger: 'axis',
          position: [40,50]
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          axisLabel: {
            fontSize: 10,
            interval: 0,
            rotate: 60
          },
          data: xAxis.map(date => {
            return date.slice(5).replace(/-/g, '/')
          }),
        },
        yAxis: {
          x: 'center',
          type: 'value',
          splitLine: {
            lineStyle: {
              type: 'dashed'
            }
          },
          axisLabel: {
            fontSize: 10
          },
        },
        series: seriesData
      };
    },
    //获取x轴的日期
    getXAxisData(data, field) {
      let dateData = this.groupArrBy(data, 'date', 'data')
      let arr = [];
      dateData.forEach(item => {
        arr.push(item[field])
      });
      arr.sort((first,last) => {
        return new Date(first).getTime() - new Date(last).getTime()
      })
      return arr;
    },
    getSeriesData(data, dateArr) {
      let nameData = this.groupArrBy(data, 'name', 'data')
      let arr = [];
      nameData.forEach(nameItem => {
        let item = {
          name: nameItem.name,
          type: 'line',
          data: []
        }
        //日期去匹配
        dateArr.forEach(dateItem => {
          let printData;
          let isDateExist = nameItem.data.some((nameItem) => {
            if (nameItem.date === dateItem) {
              printData = nameItem.printData
            }
            return nameItem.date === dateItem
          })
          if (!isDateExist) {
            printData = 0;
          }
          item.data.push(printData);
        })
        arr.push(item);
      })
      return arr;
    },
    //获取制作中心列表
    async getWorkcenterData(){
      let {data} = await this.$request.fetch("/api/situationBoard/echartData/getWorkcenters")
      if(data.status === 200){
        data.result.forEach(item=>{
          this.workCenterData.push(item)
        })
        if(data.result.length > 0){
          this.selectedWorkCenter.push(this.workCenterData[0]._id)
          return
        }
      }
    }
  }
};
</script>
<style scoped>
.btn_color {
  background: rgb(148, 147, 147) !important;
  color: black !important;
}
.btnCalculate {
  text-align: right;
}
.btnCalculate button {
  margin: 20px 80px 0 0;
}
.search {
  margin: 20px 0 20px 0;
  padding-left: 60px;
}
.search button {
  border-radius: 10px;
  margin-top: 15px;
}
.headerlist {
  background-color: #e0e1e2;
  border-radius: 10px;
  padding: 10px 20px;
  margin: -75px 0 30px;
}
.headerlist p:nth-of-type(2) {
  color: #333333;
  font-size: 13px;
  margin-top: -15px;
  margin-bottom: 0px;
}
.bg {
  box-shadow: 0 0 5px #979797;
  padding: 50px;
  margin-top: 50px;
  display: flex;
  flex-direction: row;
}
#totalEcharts,
#finishEcharts,
#undoneEcharts {
  width: 980px !important;
  height: 400px;
  margin: 0 0 20px 20px;
}
.v-expansion-panel__header /deep/ div {
  flex: 1;
}
.v-expansion-panel /deep/ .v-expansion-panel__header>:not(.v-expansion-panel__header__icon){
  flex:1 1;
}
#table table.v-table tbody  tr td{
 width:20%;
}
#tableth table.v-table thead  th{
  width:25%!important;
  display: flex;
}
.v-expansion-panel__header div{
  margin-left:70px
}
.v-expansion-panel__header div:first-child{
  margin-left:0;
}
.theme--light.v-table thead /deep/th{
  padding:0;
}
.noData{
  width:100%;
  height:48px;
  line-height:48px;
  border:1px solid rgba(218, 214, 214, 0.42);
  text-align:center;
  background:white;
}

</style>