
<template>
    <div>
      <v-layout>
        <v-flex md2>
          <v-text-field label="请输入请求数据量" v-model="count"></v-text-field>
        </v-flex>
        <v-flex>
        <v-btn color="info" class="button ml-5 mt-1" @click="search"> <v-icon left>search</v-icon>搜索 </v-btn>
        </v-flex>
      </v-layout>
      <div class="dialog"  v-if="dataList.length<=0">
        <v-progress-circular
      :width="3"
      color="info"
      indeterminate
      class ="circle"
    ></v-progress-circular>   请求数据中......
      </div>
     <div id="pivotContainer2">
       这个是Flexmonster will appear here
      
       </div>
     <!-- <div id="wdr-component" style= "margin-top:50px;"> WebDataRocks will WebDataRocks </div>  -->
    </div>
    
</template>

<script>
import gql from '../../utils/apollo'
export default {
  data(){
    return {
      count:1000,
      dataList:[],
      testData:[
        {
          "name":"SAJ/2019/12739 (CC4042)",//name
          "contact":'MA搬迁协议-CC4042深圳市金地新沙房地产开发有限公司VS7450/PS145',//contact
          "department":"",//department
          "journal":"销售分类账",//journal
          "period":"12/2019",//period
          "partner":"深圳市金地新沙房地产开发有限公司",
          "amount":164900,
          "line_ids":[],
          "state":"已登帐"
        }, 
        {
          "name":"SAJ/2019/12738 (CB4046-7)",//name
          "contact":'Click维护-CB4046重庆邮政VS7450',//contact
          "department":"",//department
          "journal":"销售分类账",//journal
          "period":"12/2019",//period
          "partner":"中国邮政集团公司重庆市邮区中心局",
          "amount":12656.52,
          "line_ids":[],
          "state":"已登帐"
        },
        {
          "name":"SAJ/2019/12737 (SO40357)",//name
          "contact":'销售耗材及备件',//contact
          "department":"",//department
          "journal":"销售分类账",//journal
          "period":"12/2019",//period
          "partner":"上海航空印刷有限公司",
          "amount":11543.25,
          "line_ids":[],
          "state":"已登帐"
        },
        {
          "name":"SAJ/2019/12736 (CD5038-11)",//name
          "contact":'保单外包服务-CD5038-上海人寿',//contact
          "department":"",//department
          "journal":"销售分类账",//journal
          "period":"10/2019",//period
          "partner":"上海良奕电器有限公司",
          "amount":12343.25,
          "line_ids":[],
          "state":"已登帐"
        },
        {
          "name":"SAJ/2019/12735 (CD5038-11)",//name
          "contact":'保单外包服务-CD5038-上海人寿',//contact
          "department":"",//department
          "journal":"销售分类账",//journal
          "period":"11/2019",//period
          "partner":"上海人寿保险股份有限公司上海分公司", 
          "amount":1867.6,
          "line_ids":[],
          "state":"已登帐"
        }
      ],
      licenseKey:"Z71A-XF834H-0A2F3T-6L3Y0R-31280Y-4D2G3O-2J020Q-6R1A6O-6Y640B-633X"
    }
  },
  created(){
    this.getUrl()
  },
  async mounted(){
    await this.test(this.count)
  },
  methods:{	
    getUrl(){
      let url = window.location.host
      if(url === "et.belstar.com.cn"){
        this.licenseKey = "Z734-XFF86L-2O3P1V-153R6X-6B6A0W-662446-6Q406K-1S2H0L-1Y281Q-1Y"
      }else if(url === "eportal.belstar.com.cn"){
        this.licenseKey = "Z7RY-XJI712-355B4D-390V66-5Y1K03-6K6X24-1U6Z6L-2R6C5Y-1G6G2O-503Z4V-0W0Q"
      }
    },
    //这个是Flexmonster 库
    async go(){
      let pivot = new Flexmonster({
        container: "pivotContainer2",
        toolbar: true,
        report: {
          dataSource: {
            data: this.dataList
            // data: this.testData
          },
          slice: {
            rows: [
              { uniqueName: "name" },
              { uniqueName: "[Measures]" }
            ],
            columns: [
              { uniqueName: "partner" }
            ],
            measures: [
              {
                uniqueName: "amount",
                aggregation: "sum",
                "format": "2sfou03a"
              }
            ],
          },
          formats: [{
            name: "2sfou03a",
            thousandsSeparator: ",",
            decimalSeparator: ".",
            decimalPlaces: 2,
            // currencySymbol: "$",
            currencySymbolAlign: "left",
            nullValue: "",
            textAlign: "right",
            isPercent: false,
            // maxDecimalPlaces:2
          }] 
        },
        licenseKey: this.licenseKey
      });
    },
    //这个是社区版本WebDataRocks的库 不能超过1m
    async test(count){
      this.dataList = []
      let countdata = Number(count)
      let data = await   this.$apollo
        .query({
          query: gql.getAaccountMoves,
          variables: {
            limit: countdata,
            skip: 2
          },
        })
      let result = data.data.accountMoves;
      result.forEach(item=>{
        let ele = {
          "name":"",//name
          "contact":'',//contact
          "department":"",//department
          "journal":"",//journal
          "period":"",//period
          "partner":"",
          "amount":0,
          "line_ids":[],
          "state":""
        }
        ele.name = item.name
        ele.contact = item.contract_id ? item.contract_id.name : ""
        ele.department = item.department_id ? item.department_id.name : ""
        ele.journal = item.journal_id ? item.journal_id.name : "" //不确定字段
        ele.period = item.period_id ? item.period_id.name : ""
        ele.partner = item.partner_id ? item.partner_id.name : ""
        ele.amount = item.amount ? item.amount : 0
        ele.state = item.state ? item.state : ""
        // ele.line_ids = item.amount ? item.amount : 0  //待确认
        this.dataList.push(ele)
      })
      this.go()
      // console.log(this.dataList.length,"v-datatable__actions__select")
      // let pivot = new WebDataRocks({
      //   container: "#wdr-component",
      //   toolbar: true,
      //   report: {
      //     dataSource: {
      //       data: this.dataList
      //       // data: this.testData
      //     },
      //     slice: {
      //       rows: [
      //         { uniqueName: "name" },
      //         { uniqueName: "[Measures]" }
      //       ],
      //       columns: [
      //         { uniqueName: "partner" }
      //       ],
      //       measures: [
      //         {
      //           uniqueName: "amount",
      //           aggregation: "sum"
      //         }
      //       ]
      //     }
      //   },
      //   // licenseKey: "XXXX-XXXX-XXXX-XXXX-XXXX"
      // });
    },
    search(){
      this.test(this.count)
    }
  }
}
</script>
<style >
.wdr-ui-label.wdr-credits{
  display:none;
}
#wdr-component{
  height:500px!important;
}
#wdr-tab-connect,#wdr-tab-open,#wdr-tab-fullscreen{
display:none!important;
}
#fm-pivot-view #fm-branding-bar{
display:none!important;
}
#fm-tab-connect,#fm-tab-open,.fm-divider,#fm-tab-charts,#fm-tab-grid,#fm-tab-fullscreen{
 display:none!important;

}
#pivotContainer2{
  position:relative;
  /* z-index:2; */
}
.dialog{
  width:160px;
  height:50px;
  position:absolute;
  top:50%;
  right:50%;
  margin-top:80px;
  margin-right:-80px;
  z-index:999999;
  background:white;
  display:flex;
  justify-content: center;
  align-items: center;
  font-size:16px;
  border:1px solid gray;
  box-shadow:0px 0px  3px gray;
}
.circle{
  margin-right:10px;
}
</style>