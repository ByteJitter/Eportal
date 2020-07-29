<template>
  <div class="editOrder">
    <v-layout>
      <p class="detailTit">标题 <span class="star">*</span></p>:
      <v-flex xs12 sm2 md6 style="margin-left:30px;">
        <v-text-field class="pleaseInput1" v-model.trim="editItem.title" label="输入标题" :error-messages="titleErrors" @blur="$v.editItem.title.$touch()"></v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      <p class="detailTit">工单类型 <span class="star">*</span></p>:
      <v-flex xs4 sm2 md3 d-flex style="margin-left:30px;">
        <v-autocomplete label="输入工单类型" no-data-text="暂无数据" :items="orderCategory" item-value="_id" item-text="name" v-model.trim="editItem.category" @change="changeCategory(editItem.category)" :error-messages="categoryErrors" @blur="$v.editItem.category.$touch()"></v-autocomplete>
      </v-flex>
    </v-layout>
    <v-layout>
      <p class="detailTit">工单分类 <span class="star">*</span></p>:
      <v-flex xs4 sm2 md3 d-flex style="margin-left:30px;">
        <v-autocomplete label="输入工单分类" no-data-text="暂无数据" :items="orderClass" item-value="_id" item-text="name" v-model.trim="editItem.class" @change="changeClass(editItem.class)" :error-messages="classErrors" @blur="$v.editItem.class.$touch()"></v-autocomplete>
      </v-flex>
    </v-layout>
    <v-layout>
      <p class="detailTit ">内容 <span class="star">*</span></p>:
      <v-flex xs6 style="margin-left:30px;">
        <v-textarea auto-grow solo name="input-7-4" label="请输入内容" v-model.trim="editItem.content" value="" :error-messages="contentErrors" @blur="$v.editItem.content.$touch()"></v-textarea>
      </v-flex>
    </v-layout>

    <v-layout>
      <p class="detailTit ">图片</p>:
      <v-flex xs12 sm2 md6 class="pleaseInput">
        <div>
          <input type="file" multiple accept=".jpg, .jpeg, .png" id="file" name="file" style="width:90px" @change="addDescImage($event)">
          <span>（最多上传九张）</span>
        </div>
        <v-layout class="imgInfo">
          <div :key="index" v-for="(item,index) in img" class="fileList">
            <img :src="item" class="img-item" @click="jump(item)">
            <span class="img-remove" @click="remove(index, item)">+</span>
          </div>
        </v-layout>
      </v-flex>
    </v-layout>

    <v-layout>
      <p class="detailTit">期望完成时间 <span class="star">*</span></p>:
      <v-flex xs12 sm2 md3 style="margin-left:30px;">
        <v-menu v-model="menu_start" :close-on-content-click="false" :nudge-right="40" lazy transition="scale-transition" offset-y full-width min-width="100px">
          <template v-slot:activator="{ on }">
            <v-text-field v-model.trim="editItem.estimate_time" label="请选择时间" prepend-icon="event" readonly v-on="on" :error-messages="estimateTimeErrors" @blur="$v.editItem.estimate_time.$touch()"></v-text-field>
          </template>
          <v-date-picker v-model="editItem.estimate_time" locale="zh-cn" prepend-icon="event" @input="menu_start = false" :min="limitDate"></v-date-picker>
        </v-menu>
      </v-flex>
    </v-layout>
    <v-layout class="returnback">
      <v-flex md2>
        <v-btn small color="info" @click="goBack">返回</v-btn>
      </v-flex>
      <v-flex md2>
        <v-btn small color="info" @click="addForm">保存</v-btn>
      </v-flex>
      <v-flex md2>
        <v-btn small color="info" @click="addFormOrder">提交工单</v-btn>
      </v-flex>
    </v-layout>
  </div>
</template>
<script>
import { required } from "vuelidate/lib/validators";
import { imgHost } from "../../utils/conf.js";
export default {
  name: "editOrder",
  validations: {
    editItem: {
      title: { required },
      category: { required },
      class: { required },
      content: { required },
      estimate_time: { required }
    }
  },
  data() {
    return {
      menu_start: false,
      menuStart: false,
      //工单类型
      orderCategory: [],
      //工单分类
      orderClass: [],
      editItem: {
        title: "",
        category: "",
        class: "",
        content: "",
        estimate_time: "",
        images: []
      },
      edit: 0,
      categoryId: "",
      classId: "",
      limitDate: new Date().toISOString().substr(0, 10),
      img: []
    };
  },
  computed: {
    titleErrors() {
      const errors = [];
      if (!this.$v.editItem.title.$dirty) return errors;
      !this.$v.editItem.title.required && errors.push("标题不能为空");
      return errors;
    },
    categoryErrors() {
      const errors = [];
      if (!this.$v.editItem.category.$dirty) return errors;
      !this.$v.editItem.category.required && errors.push("请选择分类");
      return errors;
    },
    classErrors() {
      const errors = [];
      if (!this.$v.editItem.class.$dirty) return errors;
      !this.$v.editItem.class.required && errors.push("请选择类型");
      return errors;
    },
    contentErrors() {
      const errors = [];
      if (!this.$v.editItem.content.$dirty) return errors;
      !this.$v.editItem.content.required && errors.push("内容不能为空");
      return errors;
    },
    estimateTimeErrors() {
      const errors = [];
      if (!this.$v.editItem.estimate_time.$dirty) return errors;
      !this.$v.editItem.estimate_time.required &&
        errors.push("请选择期望完成时间");
      return errors;
    }
  },
  mounted() {
    this.selectData();
    if (this.$route.query.edit == 1) {
      // 草稿状态是userlist传过来的edit状态为1
      this.edit = 1;
      this.init();
    } else {
      this.edit = 0;
    }
  },
  methods: {
    async selectData() {
      let res = await this.$request.fetch("/api/thr/getThr", {
        thrType: "repairOrder"
      });
      if (res.data.status === 200) {
        this.orderCategory = res.data.result;
        // 默认工单分类显示账号分类
        this.orderClass = res.data.result[0].class;
      } else {
        this.$snackbar().showError("获取数据失败，请刷新重试");
      }

      // let res1 = await this.$request.fetch("/api/thr/getThr", {
      //   thrType: "repairPrioritys"
      // })
      // if(res1.data.status === 200){
      //   this.allPriority = res1.data.result
      // }else{
      //   this.$refs.snackbar.showError("刷新重试");
      // }
    },
    async changeCategory(category_id) {
      for (const item of this.orderCategory) {
        if (category_id === item._id) {
          this.orderClass = item.class;
          this.editItem.content = "";
        }
      }
    },
    async changeClass(class_id) {
      for (const item of this.orderClass) {
        if (class_id === item._id && item.content) {
          let str = item.content.replace(/；/g, "\n");
          this.editItem.content = str;
        }
      }
    },
    async init() {
      let host = imgHost();
      let res4 = await this.$request.fetch("/api/repairorder/orderDetail", {
        _id: this.$route.query._id
      });
      this.editItem = res4.data.result[0];
      this.editItem.category = this.editItem.category;
      this.editItem.class = this.editItem.class;
      this.editItem.estimate_time = this.editItem.estimate_time.substr(0, 10);
      if (this.editItem.images) {
        this.img = [];
        let image = this.editItem.images;
        image.forEach(e => {
          if (e.indexOf("dingtalk") !== -1) {
            this.img.push(e);
          } else {
            this.img.push(host + e);
          }
        });
      }

      for (const item of this.orderCategory) {
        if (item._id === this.editItem.category) {
          this.orderClass = item.class;
        }
      }
    },
    // 保存
    async addForm() {
      this.$v.$touch();
      if (
        !this.editItem.title ||
        !this.editItem.category ||
        !this.editItem.class ||
        !this.editItem.content ||
        !this.editItem.estimate_time
      ) {
        return false;
      }
      if (this.editItem.images && this.editItem.images.length > 9) {
        return this.$snackbar().showError("附件图片最多只能上传九张");
      }
      let formInfo = {
        title: this.editItem.title,
        category: this.editItem.category,
        class: this.editItem.class,
        content: this.editItem.content,
        estimate_time: this.editItem.estimate_time,
        images: this.editItem.images
      };

      if (this.edit === 0) {
        formInfo["status"] = 1001;
        //新增工单
        let res = await this.$request.fetch(
          "/api/repairorder/addForm",
          { forminfo: formInfo },
          "post"
        );
        if (res.data.status === 200) {
          this.$snackbar().showOk("保存成功");
          setTimeout(() => {
            this.$router.push({
              path: "/repairOrder/userList"
            });
          }, 500);
        } else if (res.data.status === 504) {
          this.$snackbar().showError(res.data.msg);
        } else {
          this.$snackbar().showError("保存失败");
        }
      } else {
        //编辑草稿状态工单
        let res = await this.$request.fetch(
          "/api/repairorder/updateFormandsave",
          {
            formdata: formInfo,
            status_id: 1001,
            form_id: this.$route.query._id
          },
          "post"
        );
        if (res.data.status === 200) {
          this.$snackbar().showStatus("edit");
          setTimeout(() => {
            this.$router.push({
              path: "/repairOrder/userList"
            });
          }, 500);
        } else if (res.data.status === 504) {
          this.$snackbar().showError(res.data.msg);
        } else {
          this.$snackbar().showStatus("edit", false);
        }
      }
    },
    goBack() {
      this.$router.go(-1);
    },

    //提交工单
    async addFormOrder() {
      this.$v.$touch();
      if (
        !this.editItem.title ||
        !this.editItem.category ||
        !this.editItem.class ||
        !this.editItem.content ||
        !this.editItem.estimate_time
      ) {
        return false;
      }
      if (this.editItem.images && this.editItem.images.length > 9) {
        return this.$snackbar().showError("附件图片最多只能上传九张");
      }
      let formInfo = {
        title: this.editItem.title,
        category: this.editItem.category,
        class: this.editItem.class,
        content: this.editItem.content,
        estimate_time: this.editItem.estimate_time,
        images: this.editItem.images
      };

      let res;
      if (this.edit === 0) {
        formInfo["status"] = 1002;
        res = await this.$request.fetch(
          "/api/repairorder/addForm",
          { forminfo: formInfo },
          "post"
        );
      } else {
        res = await this.$request.fetch(
          "/api/repairorder/updateFormandsave",
          {
            formdata: formInfo,
            status_id: 1002,
            form_id: this.$route.query._id
          },
          "post"
        );
      }
      if (res.data.status === 200) {
        this.$snackbar().showOk("提交工单成功");
        setTimeout(() => {
          this.$router.push({
            path: "/repairOrder/userList"
          });
        }, 500);
      } else {
        this.$snackbar().showError("提交工单失败");
      }
    },

    //上传描述的图片
    async addDescImage(e) {
      let host = imgHost();
      let file = document.getElementsByName("file")[0].files[0];
      let formData = new FormData();
      formData.append("uploadFile", e.target.files[0]);
      let res = await this.$axios({
        method: "POST",
        url: "/api/repairorder/uploadFile",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.status === 200) {
        this.productImage = res.data.result.imgName;
        if (this.productImage.indexOf("dingtalk") !== -1) {
          this.img.push(this.productImage);
        } else {
          this.img.push(host + this.productImage);
        }
        this.editItem.images.push(this.productImage);
      } else if(res.data.status = 413){
        this.$snackbar().showError("上传图片超出最大限制(5MB)");
      } else {
        this.$snackbar().showError("图片上传失败");
      }
      e.target.value = "";
    },
    async remove(index, imgName) {
      this.img.splice(index, 1);
      this.editItem.images.splice(index, 1);

      let res = await this.$request.fetch(
        "/api/repairorder/deleteFile",
        {
          imgName: imgName
        },
        "post"
      );
      if (res.data.status === 200) {
        this.$snackbar().showOk("删除成功");
      } else {
        this.$snackbar().showError("删除失败");
      }
    },
    jump(url) {
      const newWin = window.open(url, "_blank");
      newWin.document.title = "图片预览";
    }
  }
};
</script>
<style scoped>
.detailTit {
  width: 130px;
  margin-bottom: 0;
  line-height: 68px;
}
.editOrder {
  margin: 20px 50px;
}
.layout {
  font-size: 18px;
  align-items: center !important;
}
.star {
  color: #a29595;
  display: inline-block;
  line-height: 68px;
}
.returnback {
  text-align: right;
  margin: 30px 0 0 8%;
}
.v-input--selection-controls /deep/ .v-input__control {
  width: 100% !important;
}
.v-radio /deep/ {
  flex: 1;
}
.v-textarea.v-text-field--enclosed /deep/ .v-text-field__slot textarea {
  padding-right: 12px;
  font-size: 16px;
  line-height: 24px;
}

.productDetail {
  /*box-shadow: 0 1px 2px 2px #ccc;*/
  padding: 40px 60px 160px;
  color: #333;
  width: 85%;
}
.productDetail h2 {
  text-align: center;
  opacity: 0.8;
  margin-bottom: 20px;
}
.productDetail h2 span {
  color: red;
}
.productDetail .selectP {
  position: relative;
}
.productDetail .selectP .del {
  display: inline-block;
  width: 24px;
  padding: 10px;
  border-top: 2px solid red;
  margin-top: 4px;
  margin: 18px 15px 0 4px;
  cursor: pointer;
}
.productDetail /deep/ .theme--light.v-icon {
  color: #2886c8;
  font-size: 40px;
}
.layoutBtn button:nth-of-type(1) {
  margin-right: 40px;
}

.pleaseInput {
  margin-left: 30px;
}

.imgInfo {
  display: flex;
  flex-flow: wrap;
}
.fileList {
  display: flex;
  margin: 10px;
}
.img-item {
  width: 100px;
  height: 100px;
}
.img-remove {
  display: none;
  width: 20px;
  height: 20px;
  font-size: 20px;
  text-align: center;
  color: white;
  cursor: pointer;
  line-height: 20px;
  border-radius: 100%;
  transform: rotate(45deg);
  background: rgba(0, 0, 0, 0.5);
}
.img-remove {
  display: inline;
}
</style>

