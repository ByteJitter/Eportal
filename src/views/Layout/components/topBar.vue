<template>
  <v-layout class="top-bar">
    <v-flex md12>ePortal · {{title}}</v-flex>
    <v-flex md2 offset-md4>
      <v-tabs centered id="tabs">
      <v-tabs-slider color="white"></v-tabs-slider>
      <v-flex md1>
        <span class="divided-line"></span>
      </v-flex>
      <v-tab href="#tab-4" id="tabs4" @click="showUserLogin" :style="{background:hasclickAvatar==true?'#deeafb':''}">
        <v-flex md2 offset-md8 class="topbar-avatar center">
          <div>
            <v-avatar color="grey lighten-4" :tile="false" size="26px">
              <img v-if="hasimg" :src="headimgurl" alt="avatar" />
              <span v-else>VJ</span>
            </v-avatar>
            <v-icon x-small :style="{transform:hasclickAvatar?'rotate(180deg)':'rotate(0deg)'}" style="transition:all 0.5s;" class="menu-down">mdi-menu-down</v-icon>
          </div>
        </v-flex>
      </v-tab>
      <v-tab-item value="tab-1">
        <transition name="fade">
          <v-text-field v-if="hasSearch" v-model="searchText" label="Search" required class="search-side" clearable></v-text-field>
        </transition>
      </v-tab-item>
      <v-tab-item value="tab-4">
        <transition name="fade">
          <v-card class="mx-auto" max-width="300" tile v-if="hasclickAvatar">
            <v-list>
              <v-list-tile >
                <v-list-tile-content>
                  <v-list-tile-title>{{userName}}</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile @click="mycenter">
                <v-list-tile-content>
                  <v-list-tile-title>绑定微信</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
              <v-list-tile @click="loginOut">
                <v-list-tile-content>
                  <v-list-tile-title>注销</v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-card>
        </transition>
      </v-tab-item>
    </v-tabs>
    </v-flex>

    <!-- 弹框 -->
    <snackbar ref="snackbar" />
  </v-layout>

</template>
<script>
import { removeAccessToken } from "@/utils/auth";
import snackbar from "@/views/components/snackbar";

export default {
  components: { snackbar },
  data() {
    return {
      tile: true,
      hasimg: true,
      searchText: "",
      hasSearch: false,
      hasclickAvatar: false,
      headimgurl: require("../../../assets/images/user.jpg"),
      userName:""
    };
  },
  computed: {
    title() {
      return this.$route.name;
    }
  },
  mounted() {
    this.getUser();
  },
  methods: {
    showUserLogin() {
      this.hasSearch = false;
      this.hasclickAvatar = !this.hasclickAvatar;
    },
    async mycenter() {
      let params = {
        redirect_uri: `${document.domain}/#/authredirect`
      };
      let { data } = await this.$request.fetch("api/getQrCode", params);
      if (data.status === 200) {
        location.href = data.result.url;
      } else if (data.status === 505) {
        //token  error
        this.$refs.snackbar.show(data.msg, "error");
      } else {
        this.$refs.snackbar.show(data.msg, "error");
      }
      this.hasclickAvatar = false;
    },
    async getUser() {
      this.userName = localStorage.getItem('userName')
      let id, auth, lock;
      if (this.$route.fullPath.indexOf("?id") != -1) {
        id = this.$route.fullPath.split("?")[1].split("=")[0];
      }
      if (this.$route.fullPath.indexOf("?auth") != -1) {
        auth = this.$route.fullPath.split("?")[1].split("=")[0];
      }
      if (this.$route.fullPath.indexOf("?lock") != -1) {
        lock = this.$route.fullPath.split("?")[1].split("=")[0];
      }
      if (id === "id" && localStorage.getItem("tel")) {
        //非微信登录用户只展示系统默认头像
      } else if (auth === "auth") {
        this.headimgurl = localStorage.getItem('headimgurl') === '' ? require("../../../assets/images/user.jpg") : localStorage.getItem('headimgurl')
      } else if (lock === "lock") {
        this.headimgurl = localStorage.getItem('headimgurl')
      }
    },
    loginOut() {
      removeAccessToken();
      localStorage.clear();
      location.reload();
    }
  }
};
</script>

<style  scoped>
.v-tabs__item {
  width: 60px !important;
}

.currclick-active {
  background: red;
}
.center {
  display: flex;
  width: 60px;
  height: 40px;
  justify-content: center;
  border-radius: 5px;
}
.top-bar {
  background-color: #fff;
  height: 60px;
  padding: 10px;
  line-height: 35px;
  justify-content: space-between;
}
.topbar-notice {
  padding-top: 5px;
}
.topbar-notice .v-badge__badge {
  width: 10px !important;
  height: 10px !important;
  display: inline-block;
}
.topbar-notice .v-badge--overlap .v-badge__badge {
  top: 4px;
  right: -5px;
}
.divided-line {
  display: inline-block;
  width: 2px;
  height: 25px;
  background: #f4f4f4;
  margin: 9px 5px 0 10px;
}
.topbar-avatar {
  position: relative;
  align-items: center;
  display: flex;
}
.menu-down {
  position: absolute;
  bottom: 0px;
  left: 15px;
}
.mx-auto {
  position: absolute;
  left: 0px;
  top: 13px;
  z-index: 888;
}
#tabs {
  position: relative;
}
.search-side {
  position: absolute;
  top: -51px;
  left: -241px;
}
.fade-enter,
.fade-leave-to {
  transition: translateX(-100px);
  opacity: 0;
  transition: 0.5s ease-in-out;
}
.fade-enter-active,
.fade-leave-active {
  transition: 0.5s ease-in-out;
}
</style>