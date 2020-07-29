<template>
  <div>
    <!-- 公司奖金发放界面 -->
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center style="margin-bottom:20px;">
        <v-flex md2 d-flex>
          <div>
            <v-autocomplete label="请输入/选择年份" :items="yearList" no-data-text="暂无数据" v-model="year"></v-autocomplete>
          </div>
        </v-flex>
        <v-flex md1>
          <v-btn round color="info" @click="search()" class="headerBTN">
            <v-icon>search</v-icon>搜索
          </v-btn>
        </v-flex>
        <v-flex md1>
          <v-btn round color="info" class="headerBTN addBTN" @click="add">
            <v-icon>add</v-icon>增加
          </v-btn>
        </v-flex>
      </v-layout>
      <div>
        <v-layout wrap align-center>
          <v-flex md d-flex>
            <div class="classify-bg">
              <v-flex class="classify-bg-flex">
                <p>项目查询</p>
                <p>公司奖金发放</p>
              </v-flex>
              <div class="table">
                <v-data-table
                  :headers="headers"
                  :items="temp?searchDate : rewardPool"
                  no-data-text="暂无数据"
                >
                  <template v-slot:items="props">
                    <td v-show="!isNaN(props.item.amount / props.item.count)">{{props.item.year}}</td>
                    <td v-show="!isNaN(props.item.amount / props.item.count)">{{props.item.amount}}</td>
                    <td v-show="!isNaN(props.item.amount / props.item.count)">{{props.item.count}}</td>
                    <td
                      v-show="!isNaN(props.item.amount / props.item.count)"
                    >{{(props.item.amount / props.item.count).toFixed(2)}}</td>
                    <td
                      class="text-xs-center"
                      v-show="!isNaN(props.item.amount / props.item.count)"
                    >
                      <v-btn color="info" @click="edit(props.item)">编辑</v-btn>
                    </td>
                  </template>
                </v-data-table>
                <v-layout justify-center>
                  <v-dialog v-model="addDialog" persistent max-width="700px">
                    <v-card>
                      <v-card-title style="padding:40px 0 15px 60px;">
                        <span class="headline">{{dialogTitle}}</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container>
                          <v-layout>
                            <span class="baseTitle">年份</span>
                            <v-flex xs12 sm6 md6>
                              <v-text-field
                                v-model.trim="addDate.year"
                                required
                                :error-messages="yearErrorsAdd"
                                @input="$v.addDate.year.$touch()"
                                @blur="$v.addDate.year.$touch()"
                              ></v-text-field>
                            </v-flex>
                          </v-layout>
                          <v-layout>
                            <span class="baseTitle">基金额</span>
                            <v-flex xs12 sm6 md6>
                              <v-text-field
                                v-model.trim="addDate.amount"
                                :error-messages="amountErrorsAdd"
                                required
                                @input="$v.addDate.amount.$touch()"
                                @blur="$v.addDate.amount.$touch()"
                              ></v-text-field>
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </v-card-text>
                      <v-card-actions style="padding-bottom:60px;">
                        <v-spacer></v-spacer>
                        <v-btn color="primary" flat @click="closeAdd">取消</v-btn>
                        <v-btn color="primary" flat @click="saveAdd">确定</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                  <v-dialog v-model="editDialog" persistent max-width="700px">
                    <v-card>
                      <v-card-title style="padding:40px 0 15px 60px;">
                        <span class="headline">{{dialogTitle}}</span>
                      </v-card-title>
                      <v-card-text>
                        <v-container>
                          <v-layout>
                            <span class="baseTitle">年份</span>
                            <v-flex xs12 sm6 md6>
                              <v-subheader v-model="editDate.year">{{editDate.year}}</v-subheader>
                            </v-flex>
                          </v-layout>
                          <v-layout>
                            <span class="baseTitle">基金额</span>
                            <v-flex xs12 sm6 md6>
                              <v-text-field
                                v-model.trim="editDate.amount"
                                :error-messages="amountErrorsEdit"
                                required
                                @input="$v.editDate.amount.$touch()"
                                @blur="$v.editDate.amount.$touch()"
                              ></v-text-field>
                            </v-flex>
                          </v-layout>
                        </v-container>
                      </v-card-text>
                      <v-card-actions style="padding-bottom:60px;">
                        <v-spacer></v-spacer>
                        <v-btn color="primary" flat @click="closeEdit()">取消</v-btn>
                        <v-btn color="primary" flat @click="saveEdit()">确定</v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-layout>
              </div>
            </div>
          </v-flex>
        </v-layout>
      </div>
    </v-container>
  </div>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import Common from "@/utils/common";
import validate from "@/utils/validate";
export default {
  name: "companyReward",
  validations: {
    editDate: {
      amount: { required }
    },
    addDate: {
      year: { required },
      amount: { required }
    }
  },
  data() {
    return {
      headers: [
        { text: "所属年份", sortable: false },
        { text: "累计基金额", sortable: false },
        { text: "累计总点数", sortable: false },
        { text: "每点金额(元/点)", sortable: false },
        { text: "功能", sortable: false, align: "center" }
      ],
      year: "全部",
      yearList: ["全部"],
      pointList: [], //点数查询返回的结果集
      rewardPool: [], // 查询rewardPool返回的结果集
      searchDate: [], // 搜索返回的结果
      addDialog: false,
      temp: false, // 判断显示全部数据还是搜索之后的数据
      editDialog: false,
      dialogTitle: "新增基金",
      addTag: true,
      searchyear: "全部",
      defaultDate: {
        year: "",
        amount: ""
      },
      editDate: {
        // id: "",
        year: "",
        amount: ""
      },
      addDate: {
        year: "",
        amount: ""
      }
    };
  },
  computed: {
    yearErrorsAdd() {
      const errors = [];
      if (!this.$v.addDate.year.$dirty) return errors;
      !this.$v.addDate.year.required && errors.push("不能为空");
      return errors;
    },
    amountErrorsAdd() {
      const errors = [];
      if (!this.$v.addDate.amount.$dirty) return errors;
      !this.$v.addDate.amount.required && errors.push("不能为空");
      return errors;
    },
    amountErrorsEdit() {
      const errors = [];
      if (!this.$v.editDate.amount.$dirty) return errors;
      !this.$v.editDate.amount.required && errors.push("不能为空");
      return errors;
    },
  },
  async mounted() {
    await this.searchAll();
    await this.getALLreward();
  },
  methods: {
    // 编辑基金
    edit(item) {
      if (item) {
        //如果有参数，则为编辑
        this.editDialog = true;
        this.addTag = false;
        this.dialogTitle = "编辑基金";
        this.editDate.id = item._id;
        this.editDate.year = item.year;
        this.editDate.amount = item.amount;
      } else {
        this.addTag = true;
        this.editDialog = true;
      }
    },
    // 取消弹框
    closeEdit() {
      this.editDialog = false;
    },
    add() {
      this.addDialog = true;
    },
    closeAdd() {
      this.addDialog = false;
      this.addDate = Object.assign({}, this.defaultItem);
      this.$v.addDate.$reset();
    },
    //添加奖金
    saveAdd:Common.throttle(async function() {
      this.addDialog = true;
      let length = 0; // 判断点数列表中添加年份是否有点数发放
      for (let i = 0; i < this.pointList.length; i++) {
        if (
          this.pointList[i]._id.belong_year === parseInt(this.addDate.year)
        ) {
          length += 1;
        }
      }
      let yearReg = /[0-9]{4,}/;
      if(!yearReg.test(this.addDate.year)) {
        return this.$snackbar().showError("请输入正确的年份");
      }else if (this.addDate.year < 2019) {
        this.$snackbar().showError("年份不能小于2019");
        return;
      } else if (length === 0) {
        this.$snackbar().showError("该年份还未发放任何点数");
      } else if (!validate.floatNumSeparator(this.addDate.amount)) {
        this.$snackbar().showError("请输入正确的金额");
      }else {
        let res = await this.$request.fetch(
          "/api/projectQueries/addRewardPool",
          {
            year: this.addDate.year,
            amount: this.addDate.amount
          },
          "post"
        );
        if (res.data.msg === "该年份已存在") {
          this.$snackbar().showError("该年份已存在");
        } else if (res.data.status === 200) {
          this.$snackbar().showOk("新增成功");
          this.addDialog = false;
          setTimeout(() => {
            this.addDate = Object.assign({}, this.defaultDate);
          }, 300);
          this.$v.$reset();
          // this.searchAll();
          this.getALLreward();
        } else {
          this.$snackbar().showError("新增失败");
        }
      }
    }),
    //保存修改
    saveEdit: Common.throttle(async function() {
      this.$v.$touch();
      if (this.$v.editDate.amount.$invalid) {
        return this.$snackbar().showError("信息填写不完整");
      }
      // if (id) {
      //有id，为编辑
      if (!validate.floatNumSeparator(this.editDate.amount)) {
        this.$snackbar().showError("请输入正确的金额");
      } else {
        let res = await this.$request.fetch(
          "/api/projectQueries/changeReawrdPool",
          {
            year: this.editDate.year,
            amount: this.editDate.amount
          },
          "post"
        );
        if (res.data.status === 200) {
          this.editDialog = false;
          // setTimeout(() => {
          this.editDate = Object.assign({}, this.defaultDate);
          // }, 300);
          this.$v.$reset();
          if (this.searchyear === "全部") {
            this.getALLreward();
          } else {
            this.searchDate[0].amount = res.data.result.amount;
          }
          this.$snackbar().showOk("编辑成功");
        } else {
          this.$snackbar().showError("编辑失败");
        }
      }
    }),
    // 在rewardPool中查找对应年份数据
    search(info) {
      this.searchyear = this.year;
      if (this.searchyear !== "全部") {
        this.temp = true;
        this.searchDate.length = 0;
        for (let i = 0; i < this.rewardPool.length; i++) {
          if (this.rewardPool[i].year === this.searchyear) {
            this.searchDate.push(this.rewardPool[i]);
          }
        }
        if (!info) {
          this.$snackbar().showStatus("search");
        }
      } else {
        this.temp = false;
        // this.searchAll();
        this.getALLreward();
        this.$snackbar().showStatus("search");
      }
    },

    // 查询所有年份对应的点数(apply_form_item apply_form)
    async searchAll() {
      let res = await this.$request.fetch("/api/projectQueries/getCountReward");
      if (res.data.status === 200) {
        this.pointList = res.data.result;
      } else {
        this.$snackbar.showError("点数查询失败");
      }
    },
    // 查询rewardPool中的数据
    async getALLreward() {
      let res = await this.$request.fetch("/api/projectQueries/getAllReward");
      if (res.data.status == 200) {
        this.rewardPool = res.data.result;
        for (let i = 0; i < this.rewardPool.length; i++) {
          for (let j = 0; j < this.pointList.length; j++) {
            if (this.rewardPool[i].year === this.pointList[j]._id.belong_year) {
              this.rewardPool[i].count = this.pointList[j].point_count;
              if (this.rewardPool[i].count !== 0) {
                this.yearList.push(this.rewardPool[i].year);
              }
            }
          }
        }
      } else {
        this.$snackbar.showError("奖金查询失败");
        return;
      }
    }
  }
};
</script>

<style>
@import "../../../assets/css/classify.css";
.add-btn {
  margin-left: 55px;
}
.baseTitle {
  margin-right: 35px;
  margin-left: 65px;
  display: inline-block;
  font-size: 18px;
  margin-top: 20px;
  width: 100px;
}
.headerBTN {
  margin-left: 20px;
  border-radius: 10px;
}
.addBTN {
  margin-left: 50px;
}
.show-sty {
  padding: 14px 0 16px;
}
</style>