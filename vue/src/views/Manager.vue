<template>
  <div>
  <!--   头部开始-->
    <div style="height: 60px; background-color: #b40f0f;display: flex;align-items: center">
      <div style="display: flex;align-items: center;padding-left: 20px">
        <img style="width: 30px;height: 30px;border-radius: 10%;" src="@/assets/imgs/博物馆文创产品白底.png" alt="">
        <span  style="font-size: 20px;color: #eeeeee;font-weight: bold;margin-left: 5px">博物馆文创产品在线展销系统</span>
      </div>
      <div style="flex: 1"></div>
<!--      头像区域-->
      <div style="width: fit-content;padding-right: 20px;display: flex;align-items: center">
        <el-dropdown >
          <div style="display: flex;align-items: center;padding-right: 10px">
            <img style="width: 30px;height: 30px;border-radius: 50%;"
                 v-if="data.user?.avatar"   :src="data.user?.avatar"  />
            <img v-else style="width: 30px;height: 30px;border-radius: 50%;" src="@/assets/imgs/头像.png">
            <span style="font-size: 16px;color: #fff;padding-left: 5px">{{ data.user?.username }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="router.push('/manager/person')">个人中心</el-dropdown-item>
              <el-dropdown-item @click="router.push('/manager/updatePassword')">修改密码</el-dropdown-item>
              <el-dropdown-item  @click="loginOut">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
    <!--   头部结束-->

    <!--   下方区域开始-->
    <div style="display: flex">
      <!--   菜单栏开始-->
      <div style="width: 200px">
        <el-menu router :default-openeds="['1','2']"
                 :default-active="router.currentRoute.value.path"
                 style="min-height: calc(100vh - 60px)"
        >
          <el-menu-item index="/manager/home">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </el-menu-item>
          <el-sub-menu index="1" >
            <template #title>
              <el-icon><Present /></el-icon>
              <span id="sub-menu-title">文创产品信息管理</span>
            </template>
            <el-menu-item index="/manager/product">
              <span>文创产品管理</span>
            </el-menu-item>
            <el-menu-item index="/manager/productType">
              <span>文创产品类型管理</span>
            </el-menu-item>
            <el-menu-item index="/manager/museum">
              <span >博物馆信息管理</span>
            </el-menu-item>
            <el-menu-item index="/manager/post">
              <span>文创帖子管理</span>
            </el-menu-item>
            <el-menu-item index="/manager/banner">
              <span>轮播图管理</span>
            </el-menu-item>
            <el-menu-item index="/manager/orders">
              <span>订单管理</span>
            </el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="2" >
            <template #title>
              <el-icon><User style="color: #eeeeee" /></el-icon>
              <span id="sub-menu-title">用户管理</span>
            </template>
              <el-menu-item index="/manager/user">用户信息管理</el-menu-item>
              <el-menu-item index="/manager/admin">管理员信息管理</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/manager/notice">
              <el-icon><Monitor /></el-icon>
              <span>系统公告</span>
          </el-menu-item>
        </el-menu>
      </div>
      <!--   菜单栏结束-->

      <!--   数据渲染开始-->
       <div style="display: flex; flex-direction: column;width: 100%;">
        <!--  导航栏开始-->
         <div style="display: flex;align-items: center;border-bottom: 1px solid #ddd;height: 40px;padding-left: 15px;">
           <span style="font-size: 14px;" @click="router.push('/manager/home')">首页   / </span>
            <span style="margin-left: 5px"> {{$route.meta.title}} </span>
         </div>
         <!-- 导航栏结束-->

         <!--真正的数据渲染区域开始-->
         <div style="flex: 1;background-color:#fff4f5;padding: 10px;">
           <RouterView @updateUser="updateUser"/>
         </div>
         <!--真正的数据渲染区域结束-->

       </div><!--   数据渲染结束-->

    </div>
    <!--   下方区域结束-->

  </div>
</template>

<script setup>
import router from "@/router/index.js";
import { reactive } from "vue";

const data = reactive({
  user: JSON.parse(localStorage.getItem("code_user") || "{}")
})
// 退出登录
const loginOut = () => {
  localStorage.removeItem("code_user")  // 清除用户信息
  location.href = "/login" // 跳转到登录页面
}

const updateUser = (user) => {
  data.user = JSON.parse(localStorage.getItem("code_user") || "{}")
}

// 判断是否登录,没登陆就跳转到登录页面
if (!data.user?.username) {
  location.href = "/login"
}

if(data.user.role === "USER"){
  router.push('/login')
}

</script>

<style>
.el-menu {
  background-color: rgb(203, 23, 23);
  box-shadow: 0 0 8px rgba(148, 148, 148, 0.1);
}

.el-menu-item{
  height: 50px !important;
  color: #fffefe ;
}
.el-sub-menu__title{
  background-color: rgb(203, 23, 23) !important;
  color: #fffefe ;
}

.el-menu-item span {
  margin-left: 2px;
}

.el-menu .is-active {
  background-color: rgb(255, 179, 179) !important;
  color:#332829 ;
}

.el-menu-item:not(.is-active):hover {
  background-color: rgb(255, 167, 167) !important;
  color: #332829 !important;
}

/* 禁用父菜单的悬停效果 */
.el-sub-menu__title:hover {
  background-color: transparent !important;
}

.el-dropdown{
  cursor: pointer;
}
.el-tooltip__trigger{
  outline: none;
}



</style>