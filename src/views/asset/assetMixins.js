
export const assetMixins = {
  methods: {
    handleSubsets(list) {
      let resultData  = [];
      let flag = 0;
      let itemData = {
        category: "",
        subList: ""
      };
      //   过滤后端返回数据调整至所需格式：按category分类
      for (let i = 0; i < list.length; i++) {
        let innerIndex = "";
        for (let j = 0; j < resultData.length; j++) {
          if (
            resultData[j].category === list[i].asset_attribute_id.asset_category_id.name
          ) {
            flag = 1;
            innerIndex = j;
            break;
          }
        }
        if (flag === 1) {
          let tempData = resultData[innerIndex];
          tempData.subList.push(list[i]);
          flag = 0;
        } else if (flag === 0) {
          itemData = {};
          itemData.category = list[i].asset_attribute_id.asset_category_id.name;
          itemData.subList = new Array();
          itemData.subList.push(list[i]);
          resultData.push(itemData);
        }
      }
      return resultData;
    },
    isContained(a, b) {
      if (!(a instanceof Array) || !(b instanceof Array)) return false;
      if (a.length < b.length) return false;
      for (let i = 0, len = b.length; i < len; i++) {
        if (a.indexOf(b[i]) === -1) {
          return false;
        }
      }
      return true;
    },
    toggle(item) {
      let index = this.total.indexOf(item.category);
      if (this.isContained(this.checkData, item.subList)) {
        return this.total.push(item.category);
      } else if (index >= 0) {
        this.total.splice(index, 1);
      }
    },
    toggleAll(item) {
      if (this.total.indexOf(item.category) === -1) {
        item.subList.forEach(ele => {
          let index = this.checkData.indexOf(ele);
          this.checkData.splice(index, 1);
        });
      } else {
        item.subList.forEach(ele => {
          if (this.checkData.indexOf(ele) === -1) {
            this.checkData.push(ele);
          }
        });
      }
    },
    cancel(){
      this.checkData = [];
      this.total = [];
      this.dialog = false;

    }
  }
}