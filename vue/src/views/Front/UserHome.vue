<template>
  <div style="width: 60%;margin: 0 auto;">
<!-- 轮播图-->
    <div >
      <el-carousel height="500px">
        <el-carousel-item v-for="item in data.bannderData" :key="item">
          <img :src="item.img" @click="navTo('/front/productDetail?productId=' + item.productId)" style="width: 100%;height: 500px;cursor: pointer;"/>
        </el-carousel-item>
      </el-carousel>
    </div>
<!-- 热销商品列表-->
    <div style=" margin: 5px auto;">
      <div style="display: flex;align-items: center">
        <div><h2>热销文创产品</h2></div>
        <div style="flex: 1;text-align: right;cursor: pointer;" @click="navTo('/front/userProduct')">查看所有文创产品<el-icon><ArrowRight /></el-icon></div>
      </div>
      <div>
        <el-row :gutter="15">
          <el-col :span="6" v-for="item in data.productData" :key="item.productId" style="margin-bottom: 10px;">
            <div  class="card1"  style="border: 1px solid #ccc;margin-bottom: 10px;height: 350px;">
              <div @click="navTo('/front/productDetail?productId=' + item.productId)">
                <img :src="item.imgUrl" style="width: 100%;"/>
                <div style="margin-left: 5px;">
                  <div style="font-size: 18px;color: red;margin: 5px"><span style="font-size: 16px;">￥</span>{{item.price}}</div>
                  <div v-html="item.productName" style="font-size: 16px;margin: 5px; line-height:25px;height:50px;overflow: hidden;"></div>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>

<!--    热门博物馆推荐-->

  </div>
</template>

<script setup>
import { reactive } from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";

const data = reactive({
  user:JSON.parse(localStorage.getItem('code_user') || "{}"),
  bannderData:[],
  productData:[],
  form: {
    typeId: null // 类型ID搜索条件
  },
  pageSize:8,
})

// 初始化游客模式
const initGuestMode = () => {
  if (!data.user.username) {
    // 自动进入游客模式
    data.user = {
      username: '游客',
      role: 'GUEST',
      avatar: ''
    };
    localStorage.setItem('code_user', JSON.stringify(data.user));
  }
};
initGuestMode()
const loadBanner =() =>{
  request.get('/banner/selectAll').then(res => {
    if(res.code === '200'){
      data.bannderData = res.data;
    }else {
      ElMessage.error(res.msg);
    }
  })
}
loadBanner();

const loadProduct = () => {
  request.get("/product/selectPageTop8",
      {params:{
          pageSize:data.pageSize,
        }}
  ).then(res => {
    if(res.code ==='200'){
      data.productData = res.data.list;
      data.total = res.data.total;
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