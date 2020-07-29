<template>
  <v-container fluid grid-list-xl>
    <v-card class="mt-5 pa-5">
      <v-layout md12>
        <page-title :title="title" :subtitle="subtitle" />
      </v-layout>
      <v-layout md12>
        <div id="main" class="mx-auto d-flex align-center text-xs-center">
          <p class="headline" v-if="showNoPayslipTip">本月薪资单暂未生成</p>
        </div>
      </v-layout>
      <!-- snackBar -->
      <snackbar ref="snackbar" />
    </v-card>
  </v-container>
</template>
<script >
import echarts from "echarts";
import snackbar from "@/views/components/snackbar.vue";
import pageTitle from "@/views/components/pageTitle.vue";
import Common from '@/utils/common';

export default {
  components: { snackbar, pageTitle },
  data() {
    return {
      title: "员工薪资构成",
      subtitle: "薪资构成力导向图",
      basicSum: 0, // 基本薪资总和
      addedSum: 0, // 每月加给总和
      rewordSum: 0, // 特别调整的嘉奖项
      adjustSum: 0, // 特别调整的调整项
      rewordData: [],
      adjustData: [],
      bonusSum: 0, // 年度发放的奖金总和
      basicData: [], // 基本薪资数据
      addedData: [], // 每月加给数据
      bonusData: [], // 年度发放奖金数据
      showNoPayslipTip: false
    };
  },
  mounted() {
    this.getMonthlyPayslip();
  },
  methods: {
    async getMonthlyPayslip() {
      let { data } = await this.$request.fetch('/api/salaryList/monthlyPayslip');
      if (data.status === 200) {
        this.showNoPayslipTip = false;
        this.resetData(data.result);
      } else if(data.status === 500){
        this.showNoPayslipTip = true;
      } else {
        this.$refs.snackbar.showError('获取数据失败，请刷新重试');
      }
    },
    resetData(monthlyPayslip){
      let linkList = [];
      // 基本薪资 & 每月加给
      if (monthlyPayslip.employee_salary_structure_ids.length !== 0) {
        monthlyPayslip.employee_salary_structure_ids.forEach((salary, index) => {
          let node = {
            id: 7 + index,
            name: salary.category_id.name,
            symbolSize: 20,
            category: "月度发放记录",
            draggable: "true",
            value: salary.amount
          };
          if (salary.category_type === "基本薪资") {
            this.basicSum = Common.addition(this.basicSum, salary.amount);
            let link = {
              source: "3",
              target: node.id
            };
            this.basicData.push(node);
            linkList.push(link);
          } else {
            this.addedSum = Common.addition(this.addedSum, salary.amount);
            let link = {
              source: "4",
              target: node.id
            };
            this.addedData.push(node);
            linkList.push(link);
          }
        })
      }
      // 年度发放的奖金
      if (monthlyPayslip.bonus_wait_id.length !== 0) {
        monthlyPayslip.bonus_wait_id.forEach((bonus, index) => {
          const amount = bonus.amount;
          this.bonusSum = Common.addition(this.bonusSum, amount);
          let node = {
            id: 7 + monthlyPayslip.employee_salary_structure_ids.length + index + monthlyPayslip.special_adjust.length,
            name: bonus.bonus_type,
            symbolSize: 20,
            category: "年度发放记录",
            draggable: "true",
            value: amount
          };
          let link = {
            source: "5",
            target: node.id
          };
          linkList.push(link);
          this.bonusData.push(node);
        })
      }
      // 特别调整
      if (monthlyPayslip.special_adjust.length !== 0) {
        monthlyPayslip.special_adjust.forEach((adjust, index) => {
          const amount = adjust.amount;
          let node = {
            id: 7 + index + monthlyPayslip.employee_salary_structure_ids.length,
            name: adjust.adjust_type,
            symbolSize: 20,
            category: "月度发放记录",
            draggable: "true",
            value: amount
          };
          if (adjust.adjust_type === "嘉奖") {
            this.rewordSum = Common.addition(this.rewordSum, amount);
            let link = {
              source: "2",
              target: node.id
            };
            linkList.push(link);
            this.rewordData.push(node);
          } else {
            this.adjustSum = Common.addition(this.adjustSum, amount);
            let link = {
              source: "2",
              target: node.id
            };
            linkList.push(link);
            this.adjustData.push(node);
          }
        })
      }
      let rootNodes = [
        {
          id: 0,
          name: "员工薪资单",
          symbolSize: 60,
          draggable: true,
          category: "父节点",
          value: Common.addition(Common.addition(Common.addition(Common.addition(this.basicSum, this.addedSum), this.bonusSum), this.rewordSum), this.adjustSum)
        },
        {
          id: 1,
          name: "月度发放记录",
          symbolSize: 40,
          category: "月度发放记录",
          draggable: "true",
          value: Common.addition(this.basicSum, this.addedSum)
        },
        {
          id: 2,
          name: "特别调整",
          symbolSize: 30,
          category: "月度发放记录",
          draggable: "true",
          value: Common.addition(this.rewordSum, this.adjustSum)
        },
        {
          id: 3,
          name: "基本薪资",
          symbolSize: 30,
          category: "月度发放记录",
          draggable: "true",
          value: this.basicSum
        },
        {
          id: 4,
          name: "每月加给",
          symbolSize: 30,
          category: "月度发放记录",
          draggable: "true",
          value: this.addedSum
        },
        {
          id: 5,
          name: "年度发放记录",
          symbolSize: 30,
          category: "年度发放记录",
          draggable: "true",
          value: this.bonusSum
        },
        {
          id: 6,
          name: "季度绩效试算",
          symbolSize: 40,
          category: "季度绩效试算",
          draggable: "true",
          value: 0
        }
      ];
      let rootLinks = [
        {
          source: "0",
          target: "1"
        },
        {
          source: "0",
          target: "5"
        },
        {
          source: "0",
          target: "6"
        },
        {
          source: "1",
          target: "2"
        },
        {
          source: "1",
          target: "3"
        },
        {
          source: "1",
          target: "4"
        }
      ];
      let forceData = [
        ...rootNodes,
        ...this.addedData,
        ...this.basicData,
        ...this.rewordData,
        ...this.adjustData,
        ...this.bonusData
      ];
      rootLinks = [...rootLinks, ...linkList];
      this.forceGraph(forceData, rootLinks);
    },
    forceGraph(forceData, rootLinks){
      let myChart = echarts.init(document.getElementById("main"));
      // 指定图表的配置项和数据
      let option = {
        backgroundColor: "#f9f9f9",
        tooltip: {},
        legend: [
          {
            formatter: function(name) {
              return echarts.format.truncateText(
                name,
                40,
                "14px Microsoft Yahei",
                "…"
              );
            },
            tooltip: {
              show: true
            },
            selectedMode: "true",
            bottom: 800,
            data: [
              "员工薪资单",
              "月度发放记录",
              "季度绩效试算",
              "年度发放记录",
              "特别调整"
            ]
          }
        ],
        toolbox: {
          show: true,
          feature: {
            dataView: {
              show: true,
              readOnly: true
            },
            restore: {
              show: true
            },
            saveAsImage: {
              show: true
            }
          }
        },
        animationDuration: 1000,
        animationEasingUpdate: "quinticInOut",
        series: [
          {
            name: "员工薪资单",
            type: "graph",
            layout: "force",
            //正表的间距
            force: {
              repulsion: 400,
              //线的长度
              edgeLength: 120
            },
            data: forceData,
            links: rootLinks,
            categories: [
              {
                name: "员工薪资单组成"
              },
              {
                name: "月度发放记录"
              },
              {
                name: "年度发放记录"
              },
              {
                name: "季度绩效试算"
              },
              {
                name: "特别调整"
              },
              {
                name: "父节点"
              }
            ],
            focusNodeAdjacency: true,
            roam: true,
            //字的设置
            label: {
              normal: {
                show: true,
                position: "top"
              }
            },
            lineStyle: {
              normal: {
                color: "source",
                curveness: 0,
                type: "solid"
              }
            }
          }
        ]
      };
      myChart.setOption(option);
    }
  }
};
</script>

<style scoped>
@import "../../../assets/css/common.css";
.mx-auto {
  height: 600px;
  width: 100%;
}
</style>
