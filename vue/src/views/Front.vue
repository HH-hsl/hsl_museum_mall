<template>
  <div >
<!--导航栏-->
    <div style="height: 60px; background-color: #ffffff;display: flex;align-items: center;border-bottom: 1px solid #dad7d7;">
<!--logo-->
      <div style="display: flex;align-items: center;padding-left: 21px;">
        <img style="width: 30px;height: 30px;border-radius: 10%;" src="../assets/imgs/博物馆文创产品黑底发.png" alt="">
        <span  style="font-size: 18px;color:#191415;font-weight: bold;margin-left: 5px">博物馆文创产品在线展销系统</span>
      </div>
<!-- 菜单栏-->
      <div style="width:800px;margin-left: 52px;">
        <el-menu
            :default-active="router.currentRoute.value.path"
             router="true"
            class="el-menu-demo"
            mode="horizontal"
            text-color="#191415"
            active-text-color="#5a3a2a"
        >
          <el-menu-item index="/front/userHome">
            <span>首页</span>
          </el-menu-item>
          <el-menu-item index="/front/userProduct" >
            <span>文创产品</span>
          </el-menu-item>

          <el-menu-item index="/front/userMuse">
            <span>博物馆</span>
          </el-menu-item>
          <el-menu-item index="/front/userPost">
            <span>文创论坛</span>
          </el-menu-item>
          <el-menu-item @click="handleCartClick" style="text-color: #191415;active-text-color:#5a3a2a">
            <span>购物车</span>
          </el-menu-item>
          <el-menu-item @click="handleOrderClick">
            <span>我的订单</span>
          </el-menu-item>
        </el-menu>
      </div>

      <div style="flex: 1">  </div>
      <!--      头像区域-->
      <div v-if="data.user?.role === 'USER'" style="width:fit-content;margin-right: 50px;display: flex;align-items: center">
        <el-dropdown >
          <div style="display: flex;align-items: center;padding-right: 10px">
            <img style="width: 30px;height: 30px;border-radius: 50%;"
                 v-if="data.user?.avatar"   :src="data.user?.avatar"  />
            <el-avatar v-else :icon="UserFilled" />
            <span style="font-size: 16px;color:#191415;padding-left: 5px">{{ data.user?.username }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="router.push('/front/myPost')">我的帖子</el-dropdown-item>
              <el-dropdown-item @click="router.push('/front/userLove')">我的收藏</el-dropdown-item>
              <el-dropdown-item @click="router.push('/front/address')">收货地址</el-dropdown-item>
              <el-dropdown-item @click="router.push('/front/userNotice')">系统公告</el-dropdown-item>
              <el-dropdown-item @click="router.push('/front/userPerson')">个人中心</el-dropdown-item>
              <el-dropdown-item @click="router.push('/front/userPassword')">修改密码</el-dropdown-item>
              <el-dropdown-item  @click="loginOut">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>

      <div v-else-if="data.user?.role === 'GUEST'" style="width:fit-content;margin-right: 50px;display: flex;align-items: center">
        <el-button  @click="router.push('/login')">登录</el-button>
        <el-button  @click="router.push('/register')">注册</el-button>
      </div>

    </div>

    <!--   数据渲染开始-->
    <div style="display: flex;margin:0 auto;flex-direction: column; width: 100%;background-color:#fffafa;"  >
      <!--真正的数据渲染区域开始-->
      <div style="width: 100%; min-height: calc(100vh - 60px);">
        <RouterView @updateUser="updateUser"/>
      </div>
      <!--真正的数据渲染区域结束-->
    </div>

  </div>
</template>

<script setup>
import router from "@/router/index.js";
import { reactive } from "vue";
import {ElMessage} from "element-plus";
import {UserFilled} from "@element-plus/icons-vue";

const data = reactive({
  user: JSON.parse(localStorage.getItem("code_user") || "{}")
})
// 退出登录
const loginOut = () => {
  localStorage.removeItem("code_user")  // 清除用户信息
  if(data.user?.role === 'GUEST') {
    ElMessage.success('已退出游客模式')
  }
  location.href = "/login" // 跳转到登录页面
}

const updateUser = (user) => {
  data.user = JSON.parse(localStorage.getItem("code_user") || "{}")
}

// 处理购物车点击
const handleCartClick = () => {
  if (data.user?.role !== 'USER') {
    ElMessage.error('请先登录')
    router.push('/login')
  } else {
    router.push('/front/userCart')
  }
}

// 处理订单点击
const handleOrderClick = () => {
  if (data.user?.role !== 'USER') {
    ElMessage.error('请先登录')
    router.push('/login')
  } else {
    router.push('/front/userOrder')
  }
}

if(data.user.role === "ADMIN"){
  router.push("/login")
}

</script>
<!--FF8198-->
<!--B40F0FFF-->
<style>
.el-menu--horizontal {
  --el-menu-horizontal-height: 60px !important;
}
.el-menu {
  background-color: #ffffff;
  //box-shadow: 0 0 8px rgba(148, 148, 148, 0.1);
}

.el-menu-item {
  height: 60px !important;
  line-height: 60px !important;
  color: #191415;
}

.el-menu-item.is-active,
.el-menu-item:not(.is-active):hover {
  background-color: #ffe9e9 !important;
  color: #332829 !important;
}

/* 调整下拉菜单颜色 */
.el-dropdown-menu__item:hover {
  background-color: #ffe9e9 !important;
  color: #332829 !important;
}

.el-menu-item:not(.is-active):hover {
  color: #332829;
  background-color: #ffc8cf;
}

.el-dropdown {
  cursor: pointer;
}
.el-tooltip__trigger {
  outline: none;
}

#sub-menu-title {
  height: 50px;
  color: #ffffff;
}


</style>