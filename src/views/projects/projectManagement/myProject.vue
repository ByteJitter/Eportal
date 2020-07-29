<!--
 * @Descripttion: 项目管理->我的项目列表页
 * @Author: Doris
 * @Date: 2020-02-19 08:52:04
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2020-04-24 09:24:51
 -->
<template>
  <div>
    <v-container fluid grid-list-xl>
      <v-layout wrap align-center>
        <v-flex md2 d-flex>
          <v-select :items="items" v-model="selected" label="请选择类别"></v-select>
        </v-flex>
        <v-flex md1>
          <v-btn round color="info" class="headerBTN" @click="search()">
            <v-icon>search</v-icon>搜索
          </v-btn>
        </v-flex>
        <v-flex md1>
          <v-btn round color="info" @click="addProj()" class="headerBTN addBTN">
            <v-icon>add</v-icon>新建项目
          </v-btn>
        </v-flex>
      </v-layout>
      <div>
        <v-layout wrap align-center>
          <v-flex md d-flex>
            <div class="table-title">
              <v-flex class="table-titleFlex">
                <div class="text1">项目管理</div>
                <div class="text2">我的项目</div>
              </v-flex>
              <div class="table">
                <v-data-table :headers="myProjectHeader" :items="myProjectData" class="elevation-1" no-data-text="暂无数据">
                  <template v-slot:items="props">
                    <td>{{ props.item.number}}</td>
                    <td>{{ props.item.name }}</td>
                    <td>{{ props.item.expect_close_date.substring(0,10) }}</td>
                    <td>{{ props.item.manager && props.item.manager.name}}</td>
                    <td>{{ props.item.status_name}}</td>
                    <td>{{ props.item.level_name}}</td>
                    <td class="text-xs-center">
                      <div v-if="isShowBTN">
                        <v-btn small color="info" v-show="props.item.status === 'draft' ? true : false" @click="editPrioj(props.item)">编辑</v-btn>
                        <v-btn small color="info" v-show="props.item.status === 'draft' ? false : true" @click="manage(props.item)">管理</v-btn>
                        <v-btn small color="info" @click="end(props.item)" v-show="props.item.status === 'pending' ? true : false">结案申请</v-btn>
                      </div>
                      <v-btn v-if="!isShowBTN" small color="info" @click="lookFunction(props.item,'look')">查看</v-btn>
                    </td>
                  </template>
                </v-data-table>
                <v-layout v-if="isShowDialog">
                  <v-dialog v-model="dialogEnd" persistent max-width="650">
                    <v-card>
                      <v-btn icon @click="dialogEnd = false" class="icon-close">
                        <v-icon>close</v-icon>
                      </v-btn>
                      <v-card-title class="headline" style="padding:50px 0 0 50px;">结案申请确认</v-card-title>
                      <v-card-text style="padding-left: 80px">
                        <p>您确认送出结案申请吗？</p>
                        <p>申请后「过程点数」将不能再进行发放动作，请确定该额度已发放完毕。</p>
                      </v-card-text>
                      <v-card-actions style="padding:0 40px 40px 0">
                        <v-spacer></v-spacer>
                        <v-btn color="info" flat @click="dialogEnd = false">取消</v-btn>
                        <v-btn color="info" flat @click="confirmEnd()">确定</v-btn>
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
import Common from "@/utils/common";
export default {
  name: "myProject",
  data() {
    return {
      selected: "我管理的项目",
      isShowBTN: true,
      isShowDialog: false,
      dialogEnd: false,
      index: "",
      items: ["我管理的项目", "我参与的项目"],
      myProjectHeader: [
        { text: "项目编号", value: "number", align: "left" },
        { text: "项目名称", value: "name" },
        { text: "预计结案日期", value: "date" },
        { text: "项目经理", value: "manager" },
        { text: "项目状态", value: "status" },
        { text: "项目等级", value: "level" },
        {
          text: "功能",
          align: "center",
          sortable: false
        }
      ],
      myProjectData: [],
      selectType: "",
      showSnackbar: false
    };
  },
  async mounted() {
    let res = await this.getProject();
    if (res.data.status === 200) {
      this.myProjectData = res.data.result;
    } else {
      this.$refs.snackbar.showError("刷新重试");
    }
  },
  async activated() {
    let res = await this.getProject();
    if (res.data.status === 200) {
      this.myProjectData = res.data.result;
    } else {
      this.$refs.snackbar.showError("刷新重试");
    }
  },
  methods: {
    search: Common.throttle(async function() {
      if (this.selected === "我管理的项目") {
        this.selectType = "manage";
        this.isShowBTN = true;
      } else {
        this.isShowBTN = false;
        this.selectType = "join";
      }

      let res = await this.getProject();

      if (res.data.status === 200) {
        this.myProjectData = res.data.result;
        this.$snackbar().showStatus("search");
      } else {
        this.$snackbar().showStatus("search", false);
      }
    }),
    async getProject() {
      return await this.$request.fetch(
        "/api/projectManagement/projectListData",
        {
          selectType: this.selectType
        }
      );
    },
    manage(item) {
      this.$router.push({
        path: "/projects/projectManagement/myProject/manage",
        query: {
          module: "myProject",
          proType: item.status,
          id: item._id
        }
      });
    },
    end(item) {
      this.isShowDialog = true;
      this.dialogEnd = true;
      this.index = item._id;
    },
    async confirmEnd() {
      this.dialogEnd = false;
      let res = await this.$request.fetch(
        "/api/projectManagement/end",
        {
          index: this.index
        },
        "put"
      );
      if (res.data.status === 200) {
        let res = await this.getProject();
        if (res.data.status === 200) {
          this.myProjectData = res.data.result;
        } else {
          this.$refs.snackbar.showError("刷新重试");
        }
        this.$snackbar().showStatus("结案申请发送成功");
      } else if (res.data.status === 500) {
        this.$snackbar().showError("结案申请发送失败");
      }
    },
    lookFunction(item, flag) {
      this.$router.push({
        path: "/projects/projectManagement/myProject/manage",
        query: {
          module: "projectList",
          proType: item.status,
          id: item._id,
          flag: flag
        }
      });
    },
    addProj() {
      this.$router.push({
        path: "addproj",
        query: {
          index: "addProj"
        }
      });
    },
    editPrioj(item) {
      this.$router.push({
        path: "addproj",
        query: {
          index: "editProj",
          id: item._id
        }
      });
    }
  }
};
</script>
<style scoped>
@import "../../../assets/css/common.css";
.container {
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.5);
  width: 100%;
  padding-bottom: 140px;
}
.table-title {
  background: #ffffff;
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.5);
  margin-top: 20px;
  padding: 40px 20px 45px 20px;
  position: relative;
}
.table-titleFlex {
  background: #e0e1e2;
  border-radius: 10px;
  padding: 10px 20px;
  margin: -65px 0 35px;
}
.text1 {
  font-family: PingFangSC-Regular;
  font-size: 20px;
  color: #333300;
  padding-left: 18px;
  padding-top: 8px;
}
.text2 {
  font-family: PingFangSC-Regular;
  font-size: 15px;
  color: #333333;
  letter-spacing: 4px;
  padding-left: 18px;
}
.table {
  background: #ffffff;
  box-shadow: 0 3px 9px 0 rgba(0, 0, 0, 0.5);
}
.icon-close {
  float: right;
}
.headerBTN {
  margin-left: 20px;
  border-radius: 10px;
}
.addBTN {
  margin-left: 50px;
}
.title {
  width: 80%;
  position: absolute;
  top: 40px;
  text-align: center;
  font-size: 30px;
  color: #4d4d4d;
}
.box {
  margin: 81px 31px 68px 31px;
}
.row-lab-sty {
  padding: 14px 0 16px 50px;
}
.row-lab-sty span {
  color: red;
  margin-left: 4px;
}
.btn-sty {
  margin: 50px 0 228px 600px;
}
.show-sty {
  padding: 14px 0 16px;
}
.btn {
  margin-right: 50px;
}
</style>
