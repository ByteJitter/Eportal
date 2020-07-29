<template>
  <div  class="container mt-5">
    <h1 class="border-bottom pb-2 mb-4">Vue pivot table demo</h1>

    <h2 class="border-bottom pb-2 mb-4">Pivot <small>(drag & drop UI + PivotTable)</small></h2>

    <div class="mb-5">
      <pivot
        :data="asyncData"
        :fields="fields"
        :available-field-keys="availableFieldKeys"
        :row-field-keys="rowFieldKeys"
        :col-field-keys="colFieldKeys"
        :reducer="reducer"
        :default-show-settings="defaultShowSettings"
      >
        <template v-slot:value="{ value }">
          {{ value | number }}
        </template>
        <!-- <template v-slot:countryFlagHeader="{ value }">
          <span :class="`flag-icon flag-icon-${countryCode(value)}`"></span>
        </template> -->
       <template v-slot:nameHeader="{ value }">
          {{ value | capitalize }}
        </template>
        <template v-slot:partnerHeader="{ value }">
         {{ value | capitalize }}
        </template>
        <template v-slot:computing>
          <div class="position-absolute w-100 h-100 text-center" style="z-index: 1;">
            <div class="position-sticky bg-white d-inline-block mt-5 p-3" style="top: 0;">
              <svg aria-hidden="true" data-prefix="fas" data-icon="spinner" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-inline--fa fa-spinner fa-fw fa-pulse"><path fill="currentColor" d="M304 48c0 26.51-21.49 48-48 48s-48-21.49-48-48 21.49-48 48-48 48 21.49 48 48zm-48 368c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zm208-208c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.49-48-48-48zM96 256c0-26.51-21.49-48-48-48S0 229.49 0 256s21.49 48 48 48 48-21.49 48-48zm12.922 99.078c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.491-48-48-48zm294.156 0c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48c0-26.509-21.49-48-48-48zM108.922 60.922c-26.51 0-48 21.49-48 48s21.49 48 48 48 48-21.49 48-48-21.491-48-48-48z" class=""></path></svg>
              Loading table values...
            </div>
          </div>
        </template>
      </pivot>
    </div>

  
  </div>
</template>

<script>
import gql from '../../utils/apollo'
// import Pivot from '../src/Pivot'
import Pivot from '@marketconnect/vue-pivot-table'
// import PivotTable from '../src/PivotTable'
import PivotTable from '@marketconnect/vue-pivot-table'
// import 'flag-icon-css/css/flag-icon.css'

export default {
  name: 'app',
  components: { Pivot },
  data: () => {
    return {
      testData:[
        {
          "name":"SAJ/2019/12739 (CC4042)",//name
          "contact":'MA搬迁协议-CC4042深圳市金地新沙房地产开发有限公司VS7450/PS145',//contact
          "department":"",//department
          "journal":"销售分类账1",//journal
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
          "journal":"销售分类账1",//journal
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
          "journal":"销售分类账3",//journal
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
          "journal":"销售分类账3",//journal
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
          "journal":"销售分类账2",//journal
          "period":"11/2019",//period
          "partner":"上海人寿保险股份有限公司上海分公司", 
          "amount":1867.6,
          "line_ids":[],
          "state":"已登帐"
        }
      ],
      dataList:[],
      asyncData: [],
      // Pivot params
      fields: [{
        key: 'name',
        getter: item => item.name,
        label: 'name',
        headers: [{
          slotName: 'nameHeader',
          label: 'name',
          checked: true
        }],
        headerAttributeFilter: true,
        valueFilter: true
      }, {
        key: 'partner',
        getter: item => item.partner,
        label: 'partner',
        headerSlotName: 'partnerHeader',
        valueFilter: true,
        valueFilterSlotName: 'partnerHeader'
      }, {
        key: 'journal',
        getter: item => item.journal,
        label: 'journal',
        valueFilter: true
      }],
      availableFieldKeys: [],
      rowFieldKeys: ['name', 'partner'],
      colFieldKeys: ['journal'],
      reducer: (sum, item) => sum + item.amount,
      defaultShowSettings: true,
      isDataLoading: false,

      // Pivot table standalone field params
      rowFields: [{
        getter: item => item.name,
        label: 'name',
        headerSlotNames: [ 'nameHeader']
      }, {
        getter: item => item.partner,
        label: 'partner',
        headerSlotName: 'partnerHeader'
      }],
      colFields: [{
        getter: item => item.journal,
        label: 'journal'
      }]
    }
  },
  methods: {
    // countryCode: function(country) {
    //   switch (country) {
    //     case 'Australia':
    //       return 'au'
    //     case 'China':
    //       return 'cn'
    //     case 'France':
    //       return 'fr'
    //     case 'India':
    //       return 'in'
    //     case 'United States':
    //       return 'us'
    //   }
    // },
    async test(){
      let result = await  this.$apollo
        .query({
          query: gql.getAaccountMoves,
          variables: {
            limit:100000,
            skip: 1
          },
        })
      result.data.accountMoves.forEach(item=>{
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
        this.dataList.push(ele)
       
      })   
    },
    go(){
      this.isDataLoading = true
      setTimeout(() => {
        // this.asyncData = this.dataList
        this.asyncData = this.testData
        this.isDataLoading = false
      }, 3000)
    }
  },
  async mounted(){
    this.go()
  },
  async created() {
    await this.test()
  },
  filters: {
    number: function(value) {
      return value.toLocaleString()
    },
    capitalize: function(value) {
      return value.replace(/\b\w/g, l => l.toUpperCase())
    }
  }
}
</script>
<style >
</style>

