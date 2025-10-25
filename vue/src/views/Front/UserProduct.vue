<template>
  <div  style="width: 60%;margin:10px auto;">
    <div style="margin-bottom: 10px">
      <el-select
          v-model="data.form.typeId"
          placeholder="请选择产品类型"
          size="large"
          @change="loadProduct"
          style="width: 200px;"
      >
        <el-option
            v-for="item in data.productTypeData"
            :key="item.typeId"
            :label="item.typeName"
            :value="item.typeId"
        />
      </el-select>
      <el-input clearable @clear="loadProduct"
                v-model="data.productName"
                :prefix-icon="Search"
                size="large"
                placeholder="请输入文创产品名称查询"
                style="width: 300px;margin-left: 10px;">
      </el-input>
      <el-button  size="large" type="primary" plain style="margin-left: 10px;" @click="loadProduct">搜索</el-button>
      <el-button  size="large" type="warning" plain @click="reset" style="margin-left: 10px;">重置</el-button>
    </div>
<!--    产品展示区-->
    <div style="cursor: pointer;">
      <div style="font-size: 20px;border-left: 5px solid #ffb3ba;padding-left: 10px;margin-bottom: 10px">文创产品</div>
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
<!--    分页-->
    <div style="margin:10px auto;"   >
      <el-pagination
          v-model:current-page="data.pageNumber"
          v-model:page-size="data.pageSize"
          layout="total,  prev, pager, next"
          :total="data.total"
          @current-change="loadProduct"
          @size-change="loadProduct"
      />
    </div>

  </div>
</template>

<script setup>
import {reactive, ref} from "vue";
import request from "@/utils/request.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {Search} from "@element-plus/icons-vue/global";

const data = reactive({
  user:JSON.parse(sessionStorage.getItem("code_user") || "{}"),
  productName:null,
  typeId:null,
  productData:[],
  pageNumber:1,
  pageSize:12,
  productTypeData:[],
  form: {
    typeId: null // 类型ID搜索条件
  },
  total:0,
})

const loadProduct = () => {
  request.get("/product/selectPageBySales",
      {params:{
          pageNum:data.pageNumber,
          pageSize:data.pageSize,
          productName:data.productName,
          typeId:data.form.typeId,
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

const reset = () => {
  data.productName = null;
  data.form.typeId = null;
  loadProduct()
}
const loadProductType = () => {
  request.get("/productType/selectAll").then(res => {
    if(res.code === "200"){
      data.productTypeData = res.data;
    }else {
      ElMessage.error(res.msg);
    }
  })
}
loadProductType()

const navTo = (url) => {
  location.href = url;
}
</script>