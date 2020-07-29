<template>
  <div>
    <v-container fluid grid-list-xl style="padding:50px;">
      <v-layout  class= "basicline">
        <v-flex md4 >
          <p>姓名：{{employeeName}}</p>
          <p>邮箱：{{employeeEmail}}</p>
        </v-flex>
        <v-flex id="personalValue" md6 >
          <v-data-table :headers="headers" :items="exchangeBonus" class="elevation-1" no-data-text="暂无数据">
            <template v-slot:items="props">
              <td>{{ props.item._id.date }}</td>
              <td class="text-xs-right">{{props.item.pointSum}}</td>
              <td class="text-xs-right">{{props.item.RMB ? props.item.RMB : 0 }}</td>
              <!-- <td class="text-xs-right">{{props.item.beltomPoints}}</td> -->
              <!-- <td class="text-xs-right" >{{props.item.NTD ? props.item.NTD : 0}}</td> -->
            </template>
          </v-data-table>
        </v-flex>
      </v-layout>
      <v-layout>
       <v-flex>总排名:{{rankNum}}</v-flex>
      </v-layout>
      <v-layout >
       <v-flex  style="margin-right:100px;">
          <div style="display:flex;align-items:center;">
            <v-chip  color="primary"  text-color="white" style="margin-right:20px;">协作 </v-chip>
            <v-progress-linear height="12"  width="15" v-model="ccValueDeterMinate" ></v-progress-linear>
          </div>
          <div style="display:flex;justify-content:space-between; width:100%;">
            <span>排名:{{rankinfo.ccRank}}</span>
            <span>{{rankinfo.ccLevel}} ：{{rankinfo.ccpoint_sum}}/{{rankinfo.cclevelEnd}}</span>
          </div>
       </v-flex>
       <v-flex  style="margin-right:100px;">
          <div style="display:flex;align-items:center;">
            <v-chip  color="primary"  text-color="white" style="margin-right:20px;">管理 </v-chip>
            <v-progress-linear height="12"  width="15" v-model="pmValueDeterMinate" ></v-progress-linear>
          </div>
          <div style="display:flex;justify-content:space-between; width:100%;">
            <span>排名:{{rankinfo.pmRank}}</span>
            <span>{{rankinfo.pmLevel}} ：{{rankinfo.pmpoint_sum}}/{{rankinfo.pmlevelEnd}}</span>
          </div>
       </v-flex>
      </v-layout>
       <v-layout id= "sectionCharts">
           <div id="avergeCharts"></div>
           <div id="percentSection">
               <div class ="titleline">
                   <v-flex xs12 sm2 md4>
                    <v-autocomplete :items="yearList"  v-model="selectYear"  no-data-text="暂无数据" @change = "changeYear"></v-autocomplete>
                   </v-flex>
                   <v-flex xs12 sm2 md6>
                    年发放总点数的比重
                   </v-flex>
               </div>
               <div id="percentCharts"></div>
               <div class = "personadata"> 
                 <p class= "personalinfo">
                   <span>协作点数：{{personalCc}}</span>
                   <span>管理点数：{{personalPm}}</span>
                 </p>
                 <p class= "personalinfo">
                   <span>个人总和：{{personalCc+personalPm}}</span>
                   <span>公司总和：{{companyAllPoints}}</span>
                 </p>
               </div>
           </div>
       </v-layout>
       <v-layout>
          <div id="allYearPoints"></div>
       </v-layout>
       <v-layout>
        <v-flex md d-flex>
            <div >
              <p>本年度点数数据来源</p>
              <medal-list :medalList="pointSourceData"></medal-list>
            </div>
          </v-flex>
       </v-layout>
    </v-container>
  </div>
</template>

<script>
import Snackbar from "@/views/components/snackbar.vue";
import medalList from "../components/medalList";
import echarts from "echarts";
import {BigNumber} from 'bignumber.js';
import {add,multiply,divide,round} from "../../../utils/math"
export default {
  name: "personalPoints",
  components: {medalList},
  data() {
    return {  
      employeeName:"",
      employeeEmail:"",
      exchangeBonus: [],       //兑换奖金的数据
      rankNum:0,               //个人的总排名
      ccValueDeterMinate:0,    // 个人所有cc点数的level百分比
      pmValueDeterMinate:0,    // 个人所有pm点数的level百分比
      personaPointArr:[],      //个人值 协作，管理
      CompanyAvage:[],         //公司平均值 协作，管理
      yearList:[],             //获取2015至今年的年份
      selectYear:new Date().getFullYear(), //切换的值
      currYear:new Date().getFullYear(),   //当前年度
      companyAllPoints:0,     //公司总点数
      personalCc:0,           //个人总cc点数
      personalPm:0,           //个人总pm点数
      pointSourceData:[],     //个人点数数据来源
      headers: [
        { text: "年度", value: "name",sortable:false,},
        { text: "百星获得点数", value: "belstarPoints",sortable: false } ,
        { text: "RMB", value: "RMB",sortable: false },
        // { text: "百通获得点数", value: "baitongPoints" ,sortable: false },
        // { text: "NTD", value: "NTD" ,sortable: false }
      ],
      rankinfo:{},
    };
  },
  async mounted() {
    this.getPersonalInfo()                       //当前登录的用户信息
    this.getExchangeBonus()                      //兑换金额
    this.getData(this.currYear)                  //获取公司和个人的数据
    this.getAllYearPoints()                      //获取年度数据
    await this.getAvageCompare(this.currYear)    //获取个人/公司数据
    await this.getavergeCharts()                 //个人/公司的平均对照图
    await this.getpercentCharts(this.selectYear) //各个年度的占比饼图
    await this.getAllYearPointsCharts()          //所有年度的折线图
    this.getCompanyTypeRanking(this.employeeId)  //各类型排名 及总排名
    this.getpointSourceData()                    //勋章记录表格数据
  },
  methods: {
    async getPersonalInfo(){
      let res = await this.$request.fetch("/api/project/projectQueries/getPersonalInfo")
      if(res.data.status === 200){
        this.employeeName = res.data.result[0].name
        this.employeeEmail = res.data.result[0].email
        this.employeeId = res.data.result[0]._id
      }else{
        this.$snackbar().showError("获取当前用户信息失败")
      }
    },
    async getExchangeBonus(){
      let res = await this.$request.fetch("/api/project/projectQueries/getExchangeBonus")
      if(res.data.status === 200){
        this.exchangeBonus = res.data.result
      }else{
        this.$snackbar().showError("获取年度兑换金额数据失败")
      }
    },
    async getAvageCompare(year){
      let newObject = await this.getData(year)
      this.CompanyAvage = newObject.CompanyAvage
      this.personaPointArr = newObject.personaPointArr
    },
    async getData(year){
      let yearQuery = Number(year)
      let result = await this.$request.fetch("/api/project/projectQueries/getAvageCompare",{year:yearQuery}) 
      let data = []
      if(result.data.status === 200){
        data = result.data.result
        let companyAllCc = 0;
        let ccCompanyAvage ,  pmCompanyAvage ;
        let companyAllPm = 0;
        let CompanyAvage = []
        let personaPointArr = []
        if( data.ccData.length > 0){
          data.ccData.forEach(item=>{
            companyAllCc += item.pointSum
          })
          ccCompanyAvage = divide(companyAllCc,data.ccData.length)
        }else{
          ccCompanyAvage = 0
        }
        CompanyAvage.push(ccCompanyAvage)
        if( data.pmData.length > 0){
          data.pmData.forEach(item=>{
            companyAllPm += item.pointSum
          })
          pmCompanyAvage = divide(companyAllPm,data.pmData.length)
        }else{
          pmCompanyAvage = 0
        }
        CompanyAvage.push(pmCompanyAvage)
        let typeData = {}
        data.personalData.forEach(item=>{
          if( item._id.type == "cc"){
            typeData.cc = item.pointSum
            if(!typeData.pm ){
              typeData.pm = 0
            }
          }else if( item._id.type == "pm"){
            typeData.pm = item.pointSum
            if(!typeData.cc ){
              typeData.cc = 0
            }
          }
        })
        for(let key in typeData ){
          if(key == "cc"){
            personaPointArr.unshift(typeData[key])
          }else{
            personaPointArr.push(typeData[key])
          }
        }
        return { personaPointArr, CompanyAvage ,companyAllCc,companyAllPm}
      }
    },
    async getavergeCharts(){
      let myChart1 = echarts.init(document.getElementById("avergeCharts"))
      let option = {
        title: {
          text: '本年度勋章点平均与个人对照表',
          x:'center',
          y: 'top',
          padding: [60, 10, 15, 20]
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['平均值', '个人值'],
          x:"center",
          padding:[30,0,0,0]
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          top:"30%",
          containLabel: true
        },
        yAxis: {
          type: 'value',
          boundaryGap: [0, 0.01]
        },
        xAxis: {
          type: 'category',
          data: ['协作', '管理']
        },
        series: [
          {
            name: '平均值',
            type: 'bar',
            data: this.CompanyAvage
          },
          {
            name: '个人值',
            type: 'bar',
            data: this.personaPointArr
          }
        ]
      };
      myChart1.setOption(option)
    },
    getAllYear(){
      let currYear = new Date().getFullYear()
      let length =  currYear - 2015    //2020-2015
      let allYear = []
      for(let i = 0; i <= length;i++){
        allYear.push(currYear--)
      }
      let yearList = allYear.reverse()
      this.selectYear = yearList[yearList.length - 1]
      return yearList 
    },
    async getAllYearPoints(){
      let res = await this.$request.fetch("/api/project/projectQueries/getAllYearPoints") 
      this.yearList = this.getAllYear() 
      if(res.data.status === 200){
        let result = res.data.result
        let newarr = []
        let afterData = []
        result.forEach(item=>{
          if(newarr.indexOf(item._id.type) === -1){
            afterData.push({
              type :item._id.type,
              origin:[{year:item._id.year,pointSum:item.pointSum}]
            })
            newarr.push(item._id.type)
          }else{
            afterData.forEach(ele=>{
              if(ele.type === item._id.type){
                ele.origin.push({year:item._id.year,pointSum:item.pointSum})
              }
            })
          }
        })
        let personalcc = []
        let personalpm = []
        afterData.forEach(item=>{
          if(item.type === "cc"){
            personalcc = item.origin
          }else{
            personalpm = item.origin
          }
        }) 
        this.pmAllYearData = this.groupData(personalpm)
        this.ccAllYearData = this.groupData(personalcc) 
      }
    },
    groupData(dataArr){
      let data = []
      this.yearList.forEach(yearItem=>{
        let pointSum;
        let isDateExist = dataArr.some(( item)=>{
          if(item.year == yearItem){
            pointSum =  item.pointSum
          }
          return item.year === yearItem 
        })
        if(!isDateExist){
          pointSum  = 0   
        }
        data.push(pointSum)
      })
      return data   
    },
    getAllYearPointsCharts(){
      let myChart2 = echarts.init(document.getElementById("allYearPoints"))
      let option = {
        color: ['#ffd285', '#ff733f'],
        title: [{
          text: '历年个人点数',
          left: '1%',
          top: '6%'
        }],
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          x: 300,
          top: '10%',
          textStyle: {
            color: '#ffd285',
          },
          data: ['协作', '管理']
        },
        grid: {
          left: '1%',
          right: '35%',
          top: '16%',
          bottom: '6%',
          containLabel: true
        },
        toolbox: {
          "show": false,
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          "axisTick": {
            "show": false
          },
          boundaryGap: false,
          data: this.yearList
        },
        yAxis: {
          "axisTick": {
            "show": false
          },
          axisLabel: {
            textStyle: {
              color: 'black'
            }
          },
          type: 'value'
        },
        series: [{
          name: '协作',
          smooth: true,
          type: 'line',
          symbolSize: 8,
          symbol: 'circle',
          data: this.ccAllYearData
        }, {
          name: '管理',
          smooth: true,
          type: 'line',
          symbolSize: 8,
          symbol: 'circle',
          data: this.pmAllYearData
        }, ]
      }
      myChart2.setOption(option)
    },
    async getpercentCharts(year){
      let newObject = await this.getData(year)
      let companyAllCc = newObject.companyAllCc
      let companyAllPm = newObject.companyAllPm
      let personaPointArr = newObject.personaPointArr
      this.personalCc = personaPointArr[0] ? personaPointArr[0] : 0
      this.personalPm = personaPointArr[1] ? personaPointArr[1] : 0
      this.companyAllPoints = add(companyAllCc,companyAllPm)
      let ccPersent = 0, pmPersent = 0;
      if(companyAllCc !== 0){
        ccPersent = round(this.personalCc,companyAllCc)
      }else{
        ccPersent = 0  
      }
      if(companyAllPm !== 0){
        pmPersent = round(this.personalPm, companyAllPm)
      }else{
        pmPersent = 0  
      }
      let  personalAllPercent = add(ccPersent , pmPersent)
      this.percentCharts(personalAllPercent,ccPersent,pmPersent)
    },
    //饼图
    percentCharts(personalAllPercent,ccPersent,pmPersent){
      let  myPercentChart = echarts.init(document.getElementById("percentCharts"))
      let  data = [{"name": "协作", "value": ccPersent }, { "name": "管理", "value": pmPersent}]
      let option = {
        color: ['#A0CE3A', '#31C5C0'],
        title: {
          subtext: personalAllPercent + '%',
          subtextStyle: {
            fontSize: 20,
            color: ['#ff9d19'],
            align: 'center'
          },
          x: 'center',
          y: 'center',
        },
        grid: {
          bottom: 150,
          left: 100,
          right: '10%'
        },
        legend: {
          orient: 'vertical',
          right: "2%",
          top:"3%",
          textStyle: {
            color: 'black',
            fontSize: 14,

          },
          icon: 'roundRect',
          data: data,
        },
        series: [
          {
            radius: ['30%', '61%'],
            center: ['50%', '50%'],
            type: 'pie',
            label: {
              normal: {
                show: true,
                formatter: "{c}%",
                textStyle: {
                  fontSize: 20,

                },
                position: 'outside'
              },
              emphasis: {
                show: true
              }
            },
            labelLine: {
              normal: {
                show: true,
                length: 25,
                length2: 25
              },
              emphasis: {
                show: true
              }
            },
            data: data,
          },
          // 边框的设置
          {
            radius: ['30%', '34%'],
            center: ['50%', '50%'],
            type: 'pie',
            label: {
              normal: {
                show: false
              },
              emphasis: {
                show: false
              }
            },
            labelLine: {
              normal: {
                show: false
              },
              emphasis: {
                show: false
              }
            },
            animation: false,
            tooltip: {
              show: false
            },
            data: [{
              value: 1,
              itemStyle: {
                color: "rgba(250,250,250,0.3)",
              },
            }],
          }, {
            name: '外边框',
            type: 'pie',
            clockWise: false, //顺时加载
            hoverAnimation: false, //鼠标移入变大
            center: ['50%', '50%'],
            radius: ['65%', '65%'],
            label: {
              normal: {
                show: false
              }
            },
            data: [{
              value: 9,
              name: '',
              itemStyle: {
                normal: {
                  borderWidth: 2,
                  borderColor: '#0b5263'
                }
              }
            }]
          },
        ]
      };
      myPercentChart.setOption(option)
    },
    async changeYear(){
      await this.getpercentCharts(this.selectYear) 
    },
    async getpointSourceData(){
      let param = {"employeeId":this.employeeId}
      let res = await this.$request.fetch("/api/project/projectQueries/getcompanyMedalRecord",param)
      if(res.data.status === 200){
        this.pointSourceData = res.data.result
      }
    }, 
    async getCompanyTypeRanking(employeeId){
      this.rankinfo = {}
      let employeeIds = []
      let res = await this.$request.fetch( "/api/project/projectQueries/rankingList", {type:"cc"} );
      let data = await this.$request.fetch( "/api/project/projectQueries/rankingList", {type:"pm"} );
      if(res.data.status === 200){
        this.ccRankList = res.data.result
        res.data.result.forEach((item,index)=>{
          employeeIds.push(item.employee_id)
          if(item.employee_id.toString() === employeeId.toString()){
            this.rankinfo.ccRank = index + 1
            this.rankinfo.ccLevel = item.level
            this.rankinfo.ccpoint_sum = item.point_sum
            this.rankinfo.cclevelEnd = item.levelEnd
          }
        })
       
        if(this.rankinfo.cclevelEnd != 0 ){
          this.ccValueDeterMinate = round(this.rankinfo.ccpoint_sum ,this.rankinfo.cclevelEnd )
        }
        if(this.rankinfo.ccpoint_sum === 0){
          this.rankinfo.ccRank = 0
        }
      }else{
        this.$snackbar().showError("获取协作排名失败")
      }
      if(data.data.status === 200){
        this.pmRankList = data.data.result
        data.data.result.forEach((item,index)=>{
          if(employeeIds.indexOf(item.employee_id) === -1){
            employeeIds.push(item.employee_id)
          }
          if(item.employee_id.toString() === employeeId.toString()){
            this.rankinfo.pmRank = index + 1
            this.rankinfo.pmLevel = item.level
            this.rankinfo.pmpoint_sum = item.point_sum
            this.rankinfo.pmlevelEnd = item.levelEnd
          }
        })
        if(this.rankinfo.pmlevelEnd != 0 ){
          this.pmValueDeterMinate = round(this.rankinfo.pmpoint_sum ,  this.rankinfo.pmlevelEnd )
        }
        if(this.rankinfo.ccpoint_sum === 0){
          this.rankinfo.pmRank = 0
        }
      }else{
        this.$snackbar().showError("获取管理排名失败")
      }
      let newArr = this.pmRankList.concat( this.ccRankList)
      let newResult = this.dataSetUp(newArr,employeeIds)
      newResult.forEach((item,index)=>{
        if(item.employee_id.toString() == employeeId.toString()){
          this.rankNum = index + 1
          return 
        }
      })
      
    },
    dataSetUp(newArr,employeeIds){
      let data = []
      employeeIds.forEach(idItem=>{
        let pointSum = 0
        newArr.some(( item)=>{
          if(item.employee_id == idItem){
            pointSum +=  Number(item.point_sum)
          }
        })
        data.push({pointSum:pointSum,employee_id:idItem})
      })
      data.sort((a, b) => {
        return b.pointSum - a.pointSum;
      })
      return data   
    },
  }
};
</script>
<style scoped>
.container {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  width: 100%;
  padding:50px 50px 100px 50px;
}
.basicline{
    align-items:center;
    justify-content:space-between;
}

#personalValue /deep/.v-datatable__actions{
    display:none;
}
#personalValue /deep/ .theme--light.v-table{
    background: none;
}
#personalValue /deep/  tr{
height:43px;
}
#personalValue /deep/.text-xs-right{
    text-align:left!important;
}
/* sectionTwo 图表部分 */
#sectionCharts{
margin-top:50px;
display: flex;
justify-content: space-between;
}
#avergeCharts,#percentSection{
  width:48%;
  height:400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
#allYearPoints{
    margin-top:40px;
    width:70%;
    height:400px;
}
.titleline{
display:flex;
align-items: center;
}
#percentCharts{
width:90%;
height:300px;
}
.personadata{
width:70%;
}
.personalinfo{
  display: flex;
  justify-content: space-between;
}
</style>
