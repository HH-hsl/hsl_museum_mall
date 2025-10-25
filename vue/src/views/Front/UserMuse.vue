<template>
  <div style="width: 60%;margin:10px auto;">
    <div style="display: flex;margin-bottom: 10px;">
      <el-input clearable @clear="loadMuseum"
                v-model="data.museumName"
                :prefix-icon="Search"
                size="large"
                placeholder="请输入博物馆名称查询"
                style="width: 300px;">
      </el-input>
      <el-button  size="large" type="primary" plain style="margin-left: 10px;" @click="loadMuseum">搜索</el-button>
      <el-button  size="large" type="warning" plain @click="reset" style="margin-left: 10px;">重置</el-button>
    </div>
<!--    博物馆数据-->
    <div>
      <div style="font-size: 20px;border-left: 5px solid #ffb3ba;padding-left: 10px;margin-bottom: 10px;">热门博物馆</div>
      <div >
        <el-row :gutter="10">
          <el-col :span="6" v-for="item in data.museumData" :key="item.museumId" style="margin-bottom: 10px;">
            <div @click="navTo('/front/museumDetail?museumId=' + item.museumId)" class="card1"  style="cursor: pointer;border: 1px solid #ccc;padding-bottom: 10px;height: 340px;overflow: hidden;">
              <img :src="item.logo" style="width: 100%;height:220px"/>
              <div style="margin-left: 10px">
                <div style="margin-top: 10px;font-size: 18px;font-weight: bold">{{item.museumName}}</div>
                <div style="margin-top: 10px;font-size: 14px;color: dodgerblue;">
                  <el-icon><PhoneFilled /></el-icon>
                  {{item.phone}}
                </div>
                <div style="margin-top: 10px;font-size: 14px;color: #5e5e5e;">
                  <el-icon><Location /></el-icon>
                  {{item.address}}
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <!--    分页-->
    <div style="margin:10px auto;"   >
      <el-pagination
          v-model:current-page="data.pageNumber"
          v-model:page-size="data.pageSize"
          layout="total,  prev, pager, next"
          :total="data.total"
          @current-change="loadMuseum"
          @size-change="loadMuseum"
      />
    </div>

  </div>
</template>

<script setup>
import {Search} from "@element-plus/icons-vue/global";
import { reactive } from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";


const data = reactive({
  user:JSON.parse(sessionStorage.getItem("code_user") || "{}"),
  museumName:null,
  museumData:[],
  pageNumber:1,
  pageSize:8,
  total:0,
})

const loadMuseum = () => {
  request.get("/museum/selectPage",
      {params:{
          pageNum:data.pageNumber,
          pageSize:data.pageSize,
          museumName:data.museumName,
        }}
  ).then(res => {
    if(res.code ==='200'){
      data.museumData = res.data.list;
      data.total = res.data.total;
    }else{
      ElMessage.error(res.msg);
    }
  })
}
loadMuseum();

const reset = () => {
  data.museumName = null;
  loadMuseum()
}

const navTo = (url) => {
  location.href = url;
}
</script>