<!-- 添加商品和编辑商品公用页面-->
<template>
  <div class="productDetail">
    <h2>{{editor?"编辑商品":"增加商品"}}</h2>
    <v-layout>
      商品编号 <span class="star">*</span>
      <v-flex xs4 sm2 md9 d-flex class="pleaseInput">
        <v-text-field label="请输入商品编号" v-model="products.productId" class="pleaseInput1">
        </v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      商品名称 <span class="star">*</span>
      <v-flex xs4 sm2 md9 d-flex class="pleaseInput">
        <v-text-field label="请输入商品名称" v-model="products.productName" class="pleaseInput1">
        </v-text-field>
      </v-flex>
    </v-layout>
    <v-layout>
      商品图片 <span class="star">*</span>
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput">
        <img :src="'/api/'+products.productImage" alt="" v-if="products.productImage" width="100"
          height="150">
        <input type="file" title="" style="width:90px" accept=".jpg, .jpeg, .png"
          @change="addDescImage($event,'avatar')">
      </v-flex>
    </v-layout>
    <!-- 商品类型 -->
    <v-layout class="salaryClass">
      商品类型<span class="star">*</span> <span class="add star" @click="addProductType()">+</span>
    </v-layout>
    <v-layout class="selectP productType" style="display:flex;flex-direction:column">
      <v-layout v-for="(itemss,index) in products.productTypes" :key="index">
        <span class=" del" @click="delProductType(index)"></span> 物料名称
        <v-flex xs4 sm2 md9 d-flex class="pleaseInput">
          <v-text-field label="请输入物料名称" v-model="itemss.metiralName" @blur="judgeDuplication()"
            :error-messages="judgeDuplicationErrors"></v-text-field>
        </v-flex>
      </v-layout>
    </v-layout>
    <!-- 商品价格 -->
    <v-layout class="salaryClass">
      商品规格及定价<span class="star">*</span> <span class="add star" @click="addsingledata()">+</span>
    </v-layout>
    <v-layout class="selectP" v-for="(item, p) in products.salePrice" :key="p">
      <span class=" del" @click="delsingledata(p)"></span>
      <v-flex xs2 class="pleaseInput">
        <v-select label="请选择物料名称" :items="products.productTypes" item-text="metiralName"
          v-model="item.metiralName"></v-select>
      </v-flex>
      <v-flex xs2 class="pleaseInput">
        <v-text-field label="请输入规格" v-model="item.pageWeight"></v-text-field>
      </v-flex>
      <v-flex xs2 class="pleaseInput">
        <v-text-field label="请输入类型" v-model="item.pageType"></v-text-field>
      </v-flex>
      <v-flex xs2 class="pleaseInput">
        <v-text-field label="请输入单价" v-model="item.price"></v-text-field>
      </v-flex>
    </v-layout>
    <!-- 商品描述 -->
    <v-layout>
      商品描述文字 <span class="star">*</span>
      <v-flex xs4 sm2 md9 d-flex class="pleaseInput">
        <v-text-field label="请输入描述内容" v-model="products.productDescText" class="pleaseInput1">
        </v-text-field>
      </v-flex>
    </v-layout>
    <v-layout class="salaryClass">
      商品描述图片 <span class="star">*</span> （最多上传三张）
    </v-layout>
    <v-layout class="selectP">
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput img-item"
        v-for="(item,index) in products.productDesc" :key="index">
        <img :src="'/api/'+item" alt="" width="100" height="150" v-if="item">
        <span class="img-remove" @click="remove(index)">+</span>
      </v-flex>
    </v-layout>
    <v-layout class="selectP">
      <v-flex xs4 sm2 md2 d-flex class="pleaseInput"><input type="file" title="" style="width:90px"
          accept=".jpg, .jpeg, .png" @change="addDescImage($event,'desc')"></v-flex>
    </v-layout>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="info" @click="cancle">取消</v-btn>
      <v-btn color="info" @click="handleAdd">保存</v-btn>
    </v-card-actions>
  </div>
</template>

<script>
export default {
  name: "productDetail",
  data() {
    return {
      products: {
        productId: "",
        productName: "",
        productImage: "",
        productTypes: [],
        productDescText: "",
        productDesc: [],
        salePrice: []
      },
      editor: false,
      judgeDuplicationResult: true
    };
  },

  async mounted() {
    if (this.$route.query.item) {
      this.editor = true;
      let res = await this.$request.fetch("/api/individual/goods/productList", {
        id: this.$route.query.item
      });
      res = res.data;
      if (res.status === 200) {
        this.products = res.result[0];
        this.products.productTypes = this.products.metiralType;
        let temp = [];
        this.products.metiralType.forEach((item, index) => {
          item.salePrice.forEach(subitem => {
            temp.push({
              metiralName: item.metiralName,
              pageWeight: subitem.pageWeight,
              pageType: subitem.pageType,
              price: subitem.price
            });
          });
        });
        this.products.salePrice = temp;
      } else {
        this.$snackbar().showError("刷新重试");
        return;
      }
    }
  },
  computed: {
    judgeDuplicationErrors() {
      const errors = [];
      this.judgeDuplication();
      if (this.judgeDuplicationResult === false) {
        errors.push("物料名称不能重复");
      }
      return errors;
    }
  },
  methods: {
    //增加物料类型
    addProductType() {
      let typedata = {
        metiralName: "",
        pageWeight: [],
        pageType: [],
        salePrice: []
      };
      this.products.productTypes.push(typedata);
      // 强制刷新DOM
      this.$forceUpdate();
    },
    //del物料类型
    delProductType(index) {
      this.products.productTypes.splice(index, 1);
      this.$forceUpdate();
      this.judgeDuplication();
    },
    //增加单价的组合方式
    addsingledata() {
      let pricedata = {
        metiralName: "",
        pageWeight: "",
        pageType: "",
        price: ""
      };
      this.products.salePrice.push(pricedata);
      this.$forceUpdate();
    },
    //删除单价的组合方式
    delsingledata(index) {
      this.products.salePrice.splice(index, 1);
      this.$forceUpdate();
    },
    //上传描述的图片
    async addDescImage(e, origin) {
      let formData = new FormData();
      formData.append("uploadFile", e.target.files[0]);

      let res = await this.$axios({
        method: "POST",
        url: "/api/individualGood/uploadImage",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.status === 200) {
        origin === "desc"
          ? this.products.productDesc.push(res.data.result.imgName)
          : this.products.productImage = res.data.result.imgName;
      } else {
        this.$snackbar().showError("图片上传失败");
      }
    },
    cancle() {
      this.$router.push("/orderStystem/product/subproduct");
    },
    handleAdd() {
      if (this.products.productDesc.length > 3) {
        this.$snackbar().showError("商品描述图片最多只能上传三张");
      } else {
        let regex = /(^[1-9]([0-9]+)?(\.[0-9]{1,5})?$)|(^(0){1}$)|(^[0-9]\.[0-9]{1,5}?$)/;
        let priceJudgeResult = true;
        let judgeCount = 0;

        this.products.salePrice.forEach(item => {
          priceJudgeResult = regex.test(item.price);
          if (priceJudgeResult === false) {
            this.$snackbar().showError("请填写正确的商品单价");
            judgeCount++;
          }
        });

        if (judgeCount === 0 && this.judgeDuplicationResult === true) {
          this.createProduct();
        }
      }
    },
    //增加或者编辑，editor为true 编辑
    async createProduct() {
      for (const key in this.products) {
        if (this.products.hasOwnProperty(key)) {
          if (this.products[key].length <= 0 || this.products[key] === "") {
            this.$snackbar().showError("所有字段不能为空");
            return;
          }
        }
        for (
          let index = 0;
          index <= this.products.salePrice.length - 1;
          index++
        ) {
          for (let item in this.products.salePrice[index]) {
            if (this.products.salePrice[index][item] === "") {
              this.$snackbar().showError("所有字段不能为空");
              return;
            }
          }
        }
      }
      let url = this.editor
        ? "/api/individualGood/updateProductList"
        : "/api/individualGood/addProductList";
      let text = this.editor ? "编辑成功" : "新增成功";
      let res = await this.$request.fetch(
        url,
        { productInfo: this.products },
        "post"
      );
      res = res.data;
      if (res.status === 200) {
        this.$snackbar().showOk(text);
        setTimeout(() => {
          this.$router.push("/orderStystem/product/subproduct");
        }, 1000);
      } else {
        this.$snackbar().showError(res.msg);
        return;
      }
    },
    remove(index) {
      this.products.productDesc.splice(index, 1);
    },
    judgeDuplication() {
      if (this.products.productTypes.length === 1) {
        this.judgeDuplicationResult = true;
      } else {
        for (let i = 0; i < this.products.productTypes.length; i++) {
          for (let j = i + 1; j < this.products.productTypes.length; j++) {
            if (
              this.products.productTypes[i].metiralName ===
              this.products.productTypes[j].metiralName
            ) {
              this.judgeDuplicationResult = false;
            } else {
              this.judgeDuplicationResult = true;
            }
          }
        }
      }
    }
  }
};
</script>

<style scoped>
.productDetail {
  box-shadow: 0 1px 2px 2px #ccc;
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
.star {
  color: red;
  display: inline-block;
  padding: 20px;
  font-size: 20px;
}
.add {
  font-size: 35px;
}
.pleaseInput {
  display: inline-block !important;
  margin-left: 50px;
}
.productType {
  align-items: stretch !important;
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
.delSupply {
  right: 30% !important;
}
.productDetail /deep/ .theme--light.v-icon {
  color: #2886c8;
  font-size: 40px;
}
.layout {
  font-size: 18px !important;
  display: flex !important;
  /* align-items: center !important; */
  align-items: center;
}
.layoutBtn {
  margin-right: 150px;
}
.layoutBtn button:nth-of-type(1) {
  margin-right: 40px;
}
.img-item {
  float: left;
  margin-left: 10px;
  position: relative;
  width: 150px;
  text-align: center;
}
.img-remove {
  position: absolute;
  right: 4px;
  display: none;
  top: 4px;
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