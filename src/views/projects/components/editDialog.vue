<template>
  <div>
    <v-layout justify-center>
      <v-dialog v-model="showDialog" persistent max-width="700">
        <v-card>
          <v-card-title class="row-title">编辑</v-card-title>
          <v-layout>
            <v-flex lg4 class="row-lab-sty">
              <v-subheader>项目经理</v-subheader>
            </v-flex>
            <v-flex xs6>
              <v-select label="请选择..." no-data-text="暂无数据" :items="managerContent" item-text="name" item-value="_id" v-model.trim="editInfo.manager" :error-messages="managerErrors" required @input="$v.editInfo.manager.$touch()" @blur="$v.editInfo.manager.$touch()"></v-select>
            </v-flex>
          </v-layout>
          <v-card-actions class="row-btn">
            <v-btn color="info" dark @click="cancel()" class="btn-sty">取消</v-btn>
            <v-btn color="info" :disabled="btnSubmit" @click="save()" class="btn-sty">确定</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-layout>
  </div>
</template>
<script>
import Common from "@/utils/common";
import { required } from "vuelidate/lib/validators";
export default {
  props: ["editInfo"],
  validations: {
    editInfo: {
      manager: { required }
    }
  },
  data() {
    return {
      showDialog: false,
      btnSubmit: false,
      managerContent: [],
      alreadyUpdate: "alreadyUpdate"
    };
  },
  watch: {
    editInfo(val){
      if(val.manager){
        this.showDialog = true;
      }
    }
  },
  computed: {
    managerErrors() {
      const errors = [];
      if (!this.$v.editInfo.manager.$dirty) return errors;
      !this.$v.editInfo.manager.required && errors.push("不能为空");
      return errors;
    }
  },
  created() {
    this.dropDownList();
  },
  methods: {
    async dropDownList() {
      let res = await this.$request.fetch("/api/project/pmo/allEmployeeForPM");
      if (res.data.status === 200) {
        this.managerContent = res.data.result;
      }
    },
    async save() {
      this.$v.editInfo.$touch();
      if (this.editInfo.manager == "") {
        return false;
      }
      let res = await this.$request.fetch(
        "/api/project/pmo/projectDetail",
        {
          data: this.editInfo
        },
        "put"
      );
      if (res.data.status === 200) {
        this.$snackbar().showStatus("edit");
        this.showDialog = false;
      } else if (res.data.status === 504) {
        this.$snackbar().showError(res.data.msg);
        this.showDialog = true;
      } else {
        this.$snackbar().showStatus("edit", false);
        this.showDialog = true;
      }
      this.$emit("update", this.alreadyUpdate);
    },
    cancel() {
      this.$v.$reset();
      this.showDialog = false;
      this.$emit("update", this.alreadyUpdate);
    }
  }
};
</script>
<style scoped>
.row-title {
  font-family: PingFangSC-Regular;
  font-size: 40px;
  color: #2e2929;
  padding: 40px 0 0 50px;
}
.row-lab-sty {
  padding: 14px 0 16px 70px;
}
.row-btn {
  padding: 10px 0 40px 50%;
}
.btn-sty {
  margin-right: 50px;
}
.icon-close {
  float: right;
}
</style>