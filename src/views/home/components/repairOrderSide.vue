<template>
  <div class="allSide">
    <v-layout class="pb-3 px-4 top">
      <v-flex>
        <div class="countSides">
          <div class= "leftside">
             <v-icon large color="info">business</v-icon>
          </div>
          <div class="rightside"> 
            <div>个人提交工单总数量 </div>
            <div style="font-size:20px">{{daifenpai+ingNumber+finishNumber}}</div>
          </div>
        </div>
      </v-flex>
      <v-flex>
        <div class="countSide">
          <div class= "leftside">
             <v-icon large color="error" > mdi-dots-horizontal-circle-outline</v-icon>    
          </div>
          <div class="rightside"> 
            <div>待分派工单数量</div>
            <div style="font-size:20px">{{daifenpai}}</div>
          </div>
        </div>
      </v-flex>
    </v-layout>
    <v-layout class="pb-3 px-4 top">
      <v-flex>
        <div class="countSides">
          <div class= "leftside">
             <v-icon large color="warning" > mdi-progress-check</v-icon>
             <!-- clock-outline -->
          </div>
          <div class="rightside"> 
            <div>审核中工单数量</div>
            <div style="font-size:20px">{{ingNumber}}</div>
          </div>
        </div>
      </v-flex>
      <v-flex>
        <div class="countSide">
          <div class= "leftside">
             <!-- <v-icon large color="info">mdi-checkbox-marked-outline </v-icon> -->
             <v-icon large color="success">mdi-check-bold </v-icon>
          </div>
          <div class="rightside"> 
            <div>已完成工单数量</div>
            <div style="font-size:20px">{{finishNumber}}</div>
          </div>
        </div>
      </v-flex>
    </v-layout>
    <div class="pb-3 px-4 all" >
      <v-layout class="pb-3">
        <v-flex id="countsection"> </v-flex>
      </v-layout>
      <v-layout>
        <v-flex id= "remarksection"> </v-flex>
      </v-layout>
    </div>
  </div>
</template>

<script>
import echarts from "echarts";
import formdate from "../../../utils/formatDateTime"
export default {
  name: "userManagement",
  data() {
    return {
      daifenpai:0,
      ingNumber:0,
      finishNumber:0,
      draftNumber:0,
      currDate:new Date().toISOString().substr(0, 10),
      date:[],
      resultData:[],
    };
  },
  mounted() {
    this.getcount()
    this.getRepairOrderInfo()
    this.getBeforeDate()
    this.getCommetRadarData();
  },
  methods: {
    async getcount(){
      let { data } = await this.$request.fetch("/api/repairorder/getRepaircount");
      data.result.forEach(item=>{
        if(item._id === 1002){
          this.daifenpai = item.statusData.length
        }else if(item._id === 1003){
          this.ingNumber = item.statusData.length
        }else if(item._id === 1004 || item._id === 1005){
          this.finishNumber += item.statusData.length
        }else if(item._id === 1001){
          this.draftNumber = item.statusData.length
        }
      })
    },
    async getRepairOrderInfo(){
      let { data } = await this.$request.fetch("/api/repairorder/getRepairOrderInfo");
      if(data.status === 200){
        this.repairOrdersCountLists = data.result
        this.resultData = this.getdata(this.repairOrdersCountLists)
        this.getWeekumber()
      }
      
     
    },
    getWeekumber(){
      let myChart2 = echarts.init(document.getElementById("countsection"))
      let option = {
        title: {
          text: '近七天个人工单提交情况'
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.date
        },
        yAxis: {
          type: 'value'
        },
        series: [
            
          {
            name: '工单数量',
            type: 'line',
            color:"#4893ff",
            smooth:true,
            data: this.resultData
          },
        ]
      };

      myChart2.setOption(option)
    },
    getBeforeDate(e){
      const temp = [];
      for (let i = 0; i < 6; i++) {
        const time = new Date(new Date().setDate(new Date().getDate() + i - 6));
        const year = time.getFullYear();
        const month = `0${time.getMonth() + 1}`.slice(-2);
        const strDate = `0${time.getDate()}`.slice(-2);
        temp.push(`${year}-${month}-${strDate}`)
      }

      temp.push(this.currDate)
      this.date = temp
    },
    getdata(data){
      let arr = []
      this.date.forEach(dateItem=>{
        let isDateExist = data.some(dataitem=>{
          if(dateItem === dataitem._id ){
            arr.push(dataitem.statusData.length)
          }
          return dateItem === dataitem._id
        })
        if(!isDateExist){
          arr.push(0)
        }
      })
      return arr

    },
    async getCommetRadarData() {
      let res = await this.$request.fetch(
        "/api/repairorder/getCommentRadarChart"
      );
      if (res.data.status === 200) {
        let commentData = res.data.result;
        let { personalData, allAvg} = commentData;
        let max = 5 
        // if (commentData === "no data") {
        //   attitudeSumAvg = 0
        //   professionalSumAvg = 0
        //   timeLinessSumAvg = 0
        // }
        let indicator = [
          { name: "态度", max },
          { name: "专业", max },
          { name: "时效", max }
        ];
        this.getRadarCharts(indicator, personalData,allAvg);
      }
      //  else if (res.data.status === 504) {
      //   return this.$refs.snackbar.showError("没有工单权限");
      // } else {
      //   return this.$refs.snackbar.showError("数据获取失败");
      // }
    },

    getRadarCharts(indicator, personalData,allAvg) {
      let radarEcharts = echarts.init(document.getElementById("remarksection"));
      let option = {
        title: {
          text: "工单评价平均值"
        },
        tooltip: {},
        legend: {
          orient: 'vertical',
          data: ['总评价平均值', '个人评分平均值'],
          x:"right"
        },
        radar: {
          shape: "circle",
          splitNumber: 3,
          name: {
            textStyle: {
              color: "#333",
              fontSize: 18
            }
          },
          indicator: indicator
        },
        series: [
          {
            name: "个人评价",
            type: "radar",
            areaStyle: {
              normal: {
                width: 1,
                opacity: 0.7
              }
            },
            data: [
              {
                value: allAvg,
                name: '总评价平均值',
                symbol: "circle",
                symbolSize: 5,
                areaStyle: {
                  normal: {
                    color: "rgba(120,167,245,0.5)"
                  }
                },
                itemStyle: {
                  color: 'rgba(120,167,245,0.5)',
                  borderColor: 'rgba(120,167,245,0.8)',
               
                },
                lineStyle: {
                  normal: {
                    color: "rgba(120,167,245,1)",
                    width: 2
                  }
                },
              },
              {
                value: personalData,
                name: '个人评分平均值',
                symbol: "circle",
                symbolSize: 5,

              }
            ]
          }
        ]
      };
      radarEcharts.setOption(option);
    }

  }
};
</script>

<style  scoped>
.allSide{
  margin-top: 25px;
}
.top{
  width: 555px;
}
.countSide{
  width: 250px;
  display: flex;
  justify-content: space-around;
  height:50px;
  background:white;
}
.countSides{
  width: 250px;
  display: flex;
  height: 50px;
  justify-content: space-around;
  background:white;
}
.leftside{
  height:100%;
  display: flex;
}
.rightside{
  width: 150px;
  height:100%;
  display: flex;
  justify-content: space-around;
  line-height: 50px;
  font-weight: bold;
}
.rightside div:nth-child(1){
  font-weight: 400;
}
.echartssection{
  margin-top:30px;
  margin-bottom: 30px;
}
.all{
  width: 555px;
}
#remarksection{
  height:295px;
  background:#FFF;
  padding-top:4%;
  width:535px;
  padding:20px;
}
#countsection{
  height:295px;
  background:#FFF;
  width:100%;
  padding:20px;
}
#rightside div:nth-child(1){
  margin-bottom:10px;
}
</style>