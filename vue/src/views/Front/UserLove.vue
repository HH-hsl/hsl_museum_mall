<template>
  <div class="card" style="width: 60%;margin:10px auto;">
    <div style="font-size: 24px;border-left: 5px solid #ffb3ba;padding-left: 10px;margin: 15px">我的收藏</div>
<!--    <el-radio-group v-model="radio" style="margin-left: 10px">-->
<!--      <el-radio :value="data.favPtoData">文创产品</el-radio>-->
<!--      <el-radio :value="museum">博物馆</el-radio>-->
<!--    </el-radio-group>-->
<!-- 文创产品展示区-->
    <div style="cursor: pointer;padding: 10px">
      <el-row :gutter="15">
        <el-col :span="6" v-for="item in data.productData" :key="item.productId" style="margin-bottom: 10px;">
          <div @click="navTo('/front/productDetail?productId=' + item.productId)"
               style="border: 1px solid #ccc;padding-bottom: 10px;height: 370px;border-radius: 5px">
            <img :src="item.imgUrl" style="width: 100%;"/>
            <div style="margin-left: 5px">
              <div style="font-size: 18px;color: red;margin: 5px"><span style="font-size: 16px;">￥</span>{{item.price}}</div>
              <div v-html="item.productName" style="font-size: 16px;margin: 5px; line-height:25px;height:50px;overflow: hidden;"></div>
            </div>
          </div>
          <div style="margin-top: -35px;padding-right: 10px;">
            <el-button size="small" type="warning" plain
                       style="float: right;width: 80px"
                        @click="collect(item.productId, item.userId)"
            ><el-icon size="18" ><StarFilled /></el-icon>已收藏</el-button>
          </div>
        </el-col>
      </el-row>
    </div>

    <!--    分页-->
    <div style="padding: 10px"   >
      <el-pagination
          v-model:current-page="data.pageNumber"
          v-model:page-size="data.pageSize"
          layout="total, prev, pager, next"
          :total="data.total"
          @current-change="loadFavPro"
          @size-change="loadFavPro"
      />
    </div>

  </div>
</template>

<script setup>
import {reactive,onMounted} from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";
import {Star} from "@element-plus/icons-vue/global";


const data = reactive({
  user:JSON.parse(sessionStorage.getItem("code_user") || "{}"),
  favPtoData:[],
  productData:[],
  pageNumber:1,
  pageSize:8,
  total:0,
  isCollect:true ,
  favProData:[],
})

const loadFavPro = () => {
  request.get("/favPro/selectPage", {
    params: {
      pageNum: data.pageNumber,
      pageSize: data.pageSize,
    },
  } ).then((res) => {
    console.log(res.data.list)
        if (res.code === '200') {
          // console.log( "收藏数据", res.data)
          // 将收藏数据中的产品信息提取出来
          data.productData = res.data.list.map((fav) => ({
            productId: fav.productId,
            productName: fav.productName,
            price: fav.price,
            imgUrl: fav.imgUrl,
            favProId: fav.favProId, // 添加 favProId
            userId: fav.userId,
          }));
          data.favProData = res.data.list;
          data.total = res.data.total;
        }

      }).catch((err) => {
        ElMessage.error(res.msg);
      });
}
onMounted(() => {
  loadFavPro();
});


const navTo = (url) => {
  location.href = url;
}

const collect = (productId,userId) => {
    // 取消收藏
    // console.log('即将取消收藏，favProId:', favProId);
    request.delete("/favPro/deleteByProductId/" + productId + "/" + userId).then(res => {
      if (res.code === '200') {
        ElMessage.success("取消收藏成功");
        loadFavPro()
      } else {
        ElMessage.error(res.msg);
      }
    })

}
</script>