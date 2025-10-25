<template>

  <div style="width: 60%;margin: 0 auto;">
    <div style="margin-top: 10px;" @click="back">
      <el-icon size="25" color="#191415"><Back /></el-icon>
    </div>
<!--    博物馆相关信息-->
    <div class="card" style="display: flex;height: 250px;margin-top: 5px;grid-gap: 20px;">
      <div style="width: 220px;">
        <img :src="data.museumData.logo" style="width: 100%;height:220px;border-radius: 10px;object-fit: cover;margin: 5px" />
      </div>
      <div style="flex: 1;margin: 10px;">
        <div style="display: flex">
          <div style="font-size: 24px;font-weight: bold;flex: 1;">{{data.museumData.museumName}}</div>

        </div>
        <div style="font-size: 16px;margin-top: 5px;cursor: pointer">
          <el-icon><PhoneFilled /></el-icon>
          {{data.museumData.phone}}</div>
        <div style="font-size: 16px;margin-top: 5px;">
          <el-icon><Location /></el-icon>
          {{data.museumData.address}}</div>
        <div style="font-size: 16px;margin-top: 5px;cursor: pointer">
          <a :href="data.museumData.url">官网地址：{{data.museumData.url}}</a>
        </div>
        <div style="margin-top: 5px" >
          <div class="line4" v-html="'简介：' + data.museumData.introduction" style="font-size: 16px;line-height: 1.5;margin-right: 10px"></div>
        </div>
      </div>
    </div>
<!--    博物馆相关产品-->
    <div  class="card"  style="margin-top: 10px;">
      <div style="font-size: 20px;height: 35px;font-weight: bold;border-bottom:1px solid #ccc;margin-top: 5px;padding-left: 10px ">在售文创产品</div>
      <div style="flex: 1;margin: 10px;">
        <el-row :gutter="10" >
          <el-col :span="6" v-for="item in data.productData" :key="item.productId" style="margin-bottom: 10px;cursor: pointer;object-fit: cover;">
            <div @click="navTo('/front/productDetail?productId=' + item.productId)" style="border: 1px solid #ccc;padding-bottom: 10px;height: 340px;overflow: hidden;border-radius: 5px;">
              <img :src="item.imgUrl" style="width: 100%;height: auto; "/>
              <div style="font-size: 18px;color: red;margin: 5px"><span style="font-size: 16px;">￥</span>{{item.price}}</div>
              <div v-html="item.productName" style="font-size: 16px;margin: 5px; line-height:25px;height:50px;overflow: hidden;"></div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from "vue";
import router from "@/router/index.js";
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";
import {Star} from "@element-plus/icons-vue/global";


const data = reactive({
  user:JSON.parse(localStorage.getItem('code_user') || "{}"),
  museumId:router.currentRoute.value.query.museumId,
  museumData:{},  //是一个对象，不是数组
  productData:[],

})

const back=() => {
  router.push('/front/userMuse');
}

const loadMuseum =() => {
  console.log('museumId:', data.museumId); // 添加日志输出
  request.get("/museum/selectById/" + data.museumId).then(res => {
    if(res.code === '200'){
      data.museumData = res.data;
    }else{
      ElMessage.error(res.msg);
    }
  })
}
loadMuseum();

const loadProduct =() => {
  request.get("/product/selectByMuseumId/" + data.museumId).then(res => {
    console.log(res.data)
    if(res.code === '200'){
      data.productData = res.data;
    }else{
      ElMessage.error(res.msg);
    }
  })
}
loadProduct();

const navTo = (url) => {
  location.href = url;
}
</script>

