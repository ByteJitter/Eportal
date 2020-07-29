<template>
  <div class="logistics">
    <div class="map-box">
      <div :id="logisticData.id" class="my-map" v-show="isMap"></div>
      <div class="map-info" v-show="isMap">运单号：{{mapNumber}}</div>
    </div>
    <div v-show="isTimeline" class="timeline">
      <v-timeline>
        <v-timeline-item v-for="(item,index) in timeline" :key="index" right small
          :color="index==0?'error':'primary'">
          <span slot="opposite">{{item.acceptTime}}</span>
          <span>{{item.remark}}</span>
        </v-timeline-item>
      </v-timeline>
    </div>
    <v-layout justify-start>
      <v-flex>
        <div class="tips" v-show="isTipsShow">抱歉，未查到 {{this.numbers}}
          运单的信息，您填写的运单号不对或者快递暂未揽收，请确认后重试。或致电{{this.callParams}}。</div>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
export default {
  props: ["logisticList"],
  data() {
    return {
      logisticData: this.logisticList,
      isTimeline: true,
      isMap: true,
      mapNumber: "",
      isTipsShow: false,
      numbers: "",
      callParams: ""
    };
  },
  created() {
    this.typeParams = JSON.parse(localStorage.getItem("param")).type;
    this.callParams = JSON.parse(localStorage.getItem("param")).call;
    this.getUpdateField();
  },
  methods: {
    // 根据页面跳转传参判断执行相应的方法
    getUpdateField() {
      if (this.typeParams === "sf") {
        this.updateFieldSF();
      } else if (this.typeParams === "jd") {
        this.updateFieldJD();
      } else if (this.typeParams === "ems") {
        this.getPointEMS();
      } else if (this.typeParams === "zto") {
        this.updateFieldZTO();
      }
    },
    // 顺丰修改字段
    updateFieldSF() {
      this.logisticData.Route = this.logisticData.Route.map(iterator => {
        return {
          acceptAddress: iterator.accept_address,
          acceptTime: iterator.accept_time,
          remark: iterator.remark
        };
      });
      this.getPointSF();
    },
    // ZTO修改字段
    updateFieldZTO() {
      this.logisticData.traces = this.logisticData.traces.map(iterator => {
        return {
          acceptAddress: iterator.scanSite,
          acceptTime: iterator.scanDate,
          remark: iterator.desc
        };
      });
      this.getPointZTO();
    },
    // JD修改字段
    updateFieldJD() {
      this.logisticData.data = this.logisticData.data.map(iterator => {
        return {
          opeTitle: iterator.opeTitle,
          acceptTime: iterator.opeTime,
          remark: iterator.opeRemark,
          opeName: iterator.opeName,
          opeRemark: iterator.opeRemark
        };
      });
      this.getPointJD();
    },
    // 顺丰获取起点和终点
    getPointSF() {
      if (this.logisticData.Route.length > 0) {
        this.currentPoint = this.logisticData.Route[
          this.logisticData.Route.length - 1
        ].acceptAddress;
        this.startPoint = this.logisticData.Route[0].acceptAddress;
        this.getCoord();
        let timer = setTimeout(() => {
          this.getMap();
          this.isMap = true;
          this.isTipsShow = false;
          this.isTimeline = true;
          this.mapNumber = this.logisticData.mailno;
        }, 500);
      } else {
        this.isMap = false;
        this.isTimeline = false;
        this.isTipsShow = true;
        this.numbers = this.logisticData.mailno;
      }
    },
    // 中通获取起点和终点
    getPointZTO() {
      if (!this.logisticData.traces.length == 0) {
        this.currentPoint = this.logisticData.traces[
          this.logisticData.traces.length - 1
        ].acceptAddress;
        this.startPoint = this.logisticData.traces[0].acceptAddress;
        this.getCoord();
        if (this.currentPoint && this.startPoint) {
          let timer = setTimeout(() => {
            this.getMap();
            this.isMap = true;
            this.isTipsShow = false;
            this.isTimeline = true;
            this.mapNumber = this.logisticData.billCode;
          }, 500);
        } else {
          this.isMap = false;
          this.isTipsShow = true;
          this.isTimeline = false;
          this.numbers = this.logisticData.billCode;
        }
      } else {
        this.isMap = false;
        this.isTimeline = false;
        this.isTipsShow = true;
        this.numbers = this.logisticData.billCode;
      }
    },
    // EMS获取起点和终点
    getPointEMS() {
      if (
        this.logisticData.success == "T" &&
        !this.logisticData.traces.length == 0
      ) {
        this.currentPoint = this.logisticData.traces[
          this.logisticData.traces.length - 1
        ].acceptAddress;
        this.startPoint = this.logisticData.traces[0].acceptAddress;
        this.getCoord();
        let timer = setTimeout(() => {
          this.getMap();
          this.isMap = true;
          this.isTimeline = true;
        }, 500);
        this.isTipsShow = false;
        this.mapNumber = this.logisticData.mailNo;
      } else {
        this.isMap = false;
        this.isTimeline = false;
        this.isTipsShow = true;
        this.numbers = this.logisticData.mailNo;
      }
    },
    // 京东获取起点和终点
    getPointJD() {
      if (!this.logisticData.data.length == 0) {
        const startPoint = this.logisticData.data.find((value, index, arr) => {
          return value.opeRemark.startsWith("货物已到达");
        });
        this.startPoint = startPoint.opeRemark.substring(
          6,
          startPoint.opeRemark.length - 1
        );
        const currentPoint = this.logisticData.data.find(
          (value, index, arr) => {
            return value.opeRemark.startsWith("货物已到达");
          }
        );
        this.currentPoint = currentPoint.opeRemark.substring(
          6,
          currentPoint.opeRemark.length - 1
        );
        this.getCoord();
        let timer = setTimeout(() => {
          this.getMap();
          this.isMap = true;
          this.isTipsShow = false;
          this.isTimeline = true;
          this.mapNumber = this.logisticData.mailNo;
        }, 1000);
      } else {
        this.isMap = false;
        this.isTimeline = false;
        this.isTipsShow = true;
        this.numbers = this.logisticData.mailNo;
      }
    },
    // 地名转换为经纬度
    async getCoord() {
      let { data } = await this.$request.fetch(
        `/mapCoord/geocoding/v3/?address=${this.startPoint}&output=json&ak=iybSMvqfTMHZlgVySASC6donCu3daCEF`
      );
      if (data.status === 0) {
        this.startLng = data.result.location.lng;
        this.startLat = data.result.location.lat;
      } else {
        this.startLng = "";
        this.startLat = "";
      }
      let res = await this.$request.fetch(
        `/mapCoord/geocoding/v3/?address=${this.currentPoint}&output=json&ak=iybSMvqfTMHZlgVySASC6donCu3daCEF`
      );
      if (res.data.status === 0) {
        this.currentLng = res.data.result.location.lng;
        this.currentLat = res.data.result.location.lat;
      } else {
        this.currentLng = "";
        this.currentLat = "";
      }
    },
    // 地图绘制
    getMap() {
      let map = new BMap.Map(this.logisticData.id, { enableMapClick: false });
      map.enableScrollWheelZoom(true);
      let start = new BMap.Point(this.startLng, this.startLat);
      let end = new BMap.Point(this.currentLng, this.currentLat);
      let p1 = new BMap.Point(this.currentLng, this.currentLat);
      //自定义图标
      let startIcon = new BMap.Icon(
        require("../../assets/images/point.png"),
        new BMap.Size(25, 25)
      );
      let currentIcon = new BMap.Icon(
        require("../../assets/images/car.png"),
        new BMap.Size(25, 25)
      );
      let endIcon = new BMap.Icon(
        require("../../assets/images/point.png"),
        new BMap.Size(25, 25)
      );
      let driving = new BMap.DrivingRoute(map, {
        renderOptions: { map: map, autoViewport: true },
        onMarkersSet: function(routes) {
          //标注点完成回调
          map.clearOverlays(); //删除点
          let myStart = new BMap.Marker(start, { icon: startIcon });
          map.addOverlay(myStart);
          let myEnd = new BMap.Marker(end, { icon: endIcon });
          map.addOverlay(myEnd);
          let myP1 = new BMap.Marker(p1, { icon: currentIcon });
          map.addOverlay(myP1);
        }
      });
      driving.search(start, end, { waypoints: [p1] });
    }
  },
  watch: {
    logisticList(newVal, oldVal) {
      if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        this.logisticData = newVal;
        this.getUpdateField();
      }
      this.logisticData = newVal;
    }
  },
  computed: {
    timeline() {
      if (this.typeParams === "sf") {
        if (this.logisticData.Route instanceof Array == true) {
          return this.logisticData.Route.slice().reverse();
        }
      } else if (this.typeParams === "jd") {
        if (this.logisticData.data instanceof Array == true) {
          return this.logisticData.data.slice().reverse();
        }
      } else if (this.typeParams === "ems") {
        if (this.logisticData.traces instanceof Array == true) {
          return this.logisticData.traces.slice().reverse();
        }
      } else if (this.typeParams === "zto") {
        if (this.logisticData.traces instanceof Array == true) {
          return this.logisticData.traces.slice().reverse();
        }
      }
      return [];
    }
  }
};
</script>

<style  scoped>
.logistics {
  width: 100%;
  border-top: 1px solid #ccc;
  padding-top: 30px;
}
.map-box {
  position: relative;
  width: 88%;
  margin: 0 auto;
}
.my-map {
  width: 100%;
  height: 500px;
  margin: 0 auto;
  font-family: "微软雅黑";
  margin-bottom: 60px;
  margin-top: 20px;
}
.map-info {
  margin: 0 auto;
  width: 80%;
  height: 80px;
  background-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 0 2px 1px #c5c5c5;
  border-radius: 5px;
  text-align: center;
  line-height: 80px;
  position: absolute;
  top: 3%;
  left: 10%;
  font-size: 18px;
  font-weight: 600;
}
.timeline {
  width: 95%;
  margin-left: -20px;
  margin-bottom: 20px;
  max-height: 500px;
  overflow-y: auto;
  overflow-x: hidden;
}
/* 自动滚动条样式 */
::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
::-webkit-scrollbar-thumb {
  border-radius: 1em;
  background-color: rgba(50, 50, 50, 0.3);
}
::-webkit-scrollbar-track {
  border-radius: 1em;
  background-color: rgba(50, 50, 50, 0.1);
}
/* 查询单号无数据时的提示信息样式 */
.tips {
  height: 80px;
  line-height: 80px;
  background-color: #f2f2f2;
  margin-left: 56px;
  margin-right: 54px;
  padding-left: 20px;
  color: #de162e;
  margin-bottom: 20px;
}
</style>