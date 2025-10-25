<template>
  <div style="width: 60%;margin: 0 auto;">
    <div style="margin-top: 10px;" @click="back">
      <el-icon size="25" color="#191415"><Back /></el-icon>
    </div>
<!--    文创产品关键信息-->
   <div class="card" style=" margin: 5px auto;display: flex;grid-gap: 10px">
     <div  >
       <img :src="data.productData.imgUrl" style="width: 100%;height:300px;padding:5px" />
     </div >
     <div style="flex: 1;padding: 15px;">
       <div style="font-size: 23px;font-weight: bold;margin-bottom: 10px;line-height: 1.5">{{data.productData.productName}}</div>
       <div class="infoProduct">所属博物馆：{{data.productData.museumName}}</div>
       <div class="infoProduct">产品类型：{{data.productData.typeName}}</div>
       <div class="infoProduct">价 格：<span style="color: red;font-size: 28px;font-weight: bold;">￥{{data.productData.price}}</span></div>
       <div class="infoProduct">销 量：{{data.productData.sales}}</div>
       <div style="margin-top: 20px;display: flex">
        <el-input-number v-model="data.form.quantity" :min="1" :max="data.productData.stock" >
          <template #suffix>
            <span style="color: #7c7c7c">件</span>
          </template>
        </el-input-number>
        <div style="flex:1;margin-left: 30px">
          <el-button v-if="data.productData.stock === 0" type="danger" style="font-size: 14px;">已下架</el-button>
          <el-button v-else style="background-color: orange;color: white" @click="addToCart" >加入购物车</el-button>
          <el-button v-if="data.productData.stock !== 0"
                     @click="showPurchase"
                     style="background-color: red;color: white"
          >立即购买</el-button>
          <el-button type="warning"  :icon="Star"  style="float: right;width: 80px" @click="collect" v-if="data.isCollect !== true" >收藏</el-button>
          <el-button type="warning" plain style="float: right;width: 80px" v-else @click="collect" ><el-icon size="18" ><StarFilled /></el-icon>已收藏</el-button>
        </div>
       </div>
     </div>
   </div>

<!--    文创产品详情介绍-->
    <div  class="card" style=" margin-top: 10px;padding: 10px">
      <el-tabs class="demo-tabs" >
        <el-tab-pane   label="文创产品详情" >
          <div v-html="data.productData.description" style="margin: 10px;line-height: 2;font-size: 16px;"></div>
        </el-tab-pane>

        <el-tab-pane label="产品评论区">
          <!--评论区-->
          <div v-if="data.evaluations.length > 0" style="margin: 10px;">
            <div v-for="evaluation in data.evaluations" :key="evaluation.productId" style="margin-bottom: 15px; padding: 10px; border-bottom: 1px solid #eee;">
              <div style="display: flex;align-items: center;margin-bottom: 10px;">
                <img :src="evaluation.userAvatar" style="width: 30px;height: 30px;border-radius: 50%;">
                <div style=" font-weight: bold;margin-left: 10px">
                  {{ evaluation.username }}
                  <span v-if="evaluation.username === data.user.username" style="color: #aba9a9">(我）</span>
                  <div style="font-size: 12px; color: #999;">{{ evaluation.evalTime }}</div>
                </div>
                <div style="flex: 1"></div>
                <div style="font-size: 14px; ">{{ evaluation.rating }} <el-icon color="#ffd51b" size="20" ><StarFilled /></el-icon></div>
              </div>
              <div style="font-size: 14px; color: #666; margin-top: 5px;margin-left: 30px">{{ evaluation.evaluation }}</div>

            </div>
          </div>
          <div v-else  style="text-align: center; padding: 20px; color: #999">
            <el-empty :image-size="150" description="暂无评价"  />
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 新增购买弹窗 -->
    <el-dialog v-model="data.purchaseVisible" title="确认订单" width="50%">
      <el-form :model="data.purchaseForm" label-width="100px">
        <!-- 收货地址选择 -->
        <el-form-item label="收货地址">
          <el-select
              v-model="data.purchaseForm.addressId"
              placeholder="请选择收货地址"
              style="width: 100%"
          >
            <el-option
                v-for="address in data.addressData"
                :key="address.addressId"
                :label="`${address.name} - ${address.address} - ${address.phone}`"
                :value="address.addressId"
            />
          </el-select>
        </el-form-item>

        <!-- 商品信息 -->
        <el-form-item label="商品信息">
          <div style="display: flex; align-items: center;">
            <img :src="data.productData.imgUrl" style="width: 80px; height: 80px; margin-right: 15px;">
            <div>
              <div>{{ data.productData.productName }}</div>
              <div style="color: #999; font-size: 12px;">x{{ data.form.quantity }}</div>
            </div>
          </div>
        </el-form-item>

        <!-- 结算信息 -->
        <el-form-item label="商品金额">
        <span style="color: red; font-weight: bold;">
          ￥{{selectedTotalPrice }}
        </span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="data.purchaseVisible = false">取消</el-button>
        <el-button type="primary" @click="submitOrder">确认下单</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { reactive ,ref,onMounted,computed} from "vue";
import router from "@/router/index.js";
import request from "@/utils/request.js";
import {ElMessage,ElLoading} from "element-plus";
import {Star} from "@element-plus/icons-vue/global";


const data = reactive({
  user:JSON.parse(localStorage.getItem('code_user') || "{}"),
  productId:router.currentRoute.value.query.productId,
  productData:{},  //是一个对象，不是数组
  form:{
    quantity:1,
  },
  isCollect:false,
  favProData:{
    favProId:null,
  },
  evaluations: [], // 存储用户评价
  purchaseVisible:false,
  purchaseForm:{
    addressId: null,
  },
  addressData:[],
})
const formRef = ref(null);


const loadProduct =() => {
  request.get("/product/selectById/" + data.productId).then(res => {
    console.log(res.data)
    if(res.code === '200'){
      data.productData = res.data;
    }else{
      ElMessage.error(res.msg);
    }
  })
}

// 加载用户评价
const loadEvaluations = () => {
  request.get("/orderDetail/evaluations/" + data.productId).then(res => {
    if (res.code === '200') {
      console.log(res.data)
      data.evaluations = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  });
};

// 加载收货地址
const loadAddress = () => {
  if (data.user.role === 'GUEST') {
    data.addressData = [];
    return;
  }
  request.get('/address/selectAllMy').then(res => {
    console.log(res.data)
    if (res.code === "200") {
      data.addressData = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  })
}

onMounted(() => {
  loadProduct();
  loadEvaluations();
  loadAddress();
});


const back=() => {
  router.push('/front/userProduct');
}

const addToCart = () => {
  if (data.user.role === 'GUEST') {
    ElMessage.warning('请先登录后再添加购物车');
    router.push('/login');
    return;
  }
  request.post("/cart/add",{
    productId:data.productId,
    quantity:data.form.quantity,
    userId:data.user.id,
  } ).then(res => {
    if(res.code === '200'){
      ElMessage.success("加入购物车成功");
    }else{
      ElMessage.error(res.msg);
    }
  })
}


const checkCollectStatus = () => {
  if (data.user.role === 'GUEST') {
    data.isCollect = false;
    return;
  }
  request.get("/favPro/selectById/"  + data.productId + "/" + data.user.id).then(res => {
    console.log(res.data)
    if (res.code === '200') {
      if (res.data !== null) {
        data.favProData.favProId = res.data.favProId; // 收藏记录ID
        data.isCollect = true;
      } else {
        data.isCollect = false;
      }
    } else {
      ElMessage.error(res.msg);
    }
  }).catch(err => {
    ElMessage.error("网络错误，请稍后重试");
  });
};
// 页面加载时调用
checkCollectStatus();

const collect = () => {
  if (data.user.role === 'GUEST') {
    ElMessage.warning('请先登录后再收藏');
    router.push('/login');
    return;
  }
  if (data.isCollect) {
    // 取消收藏
    console.log('即将取消收藏，favProId:', data.favProData.favProId);
    request.delete("/favPro/deleteByProductId/" +  data.productId + "/" + data.user.id).then(res => {
      if (res.code === '200') {
        ElMessage.success("取消收藏成功");
        data.favProData.favProId = null;
        data.isCollect = false;
      } else {
        ElMessage.error(res.msg);
      }
    })
  }else {
    // 收藏
    request.post("/favPro/add",{
      productId:data.productId,
      userId:data.user.id,
    } ).then(res => {
      if(res.code === '200'){
        ElMessage.success("收藏成功");
        data.isCollect = true;
        data.favProData.favProId = res.data.favProId; // 保存收藏记录ID
      }else{
        ElMessage.error(res.msg);
      }
    })
  }
}

const selectedTotalPrice = computed(() => {
  return (data.productData.price * data.form.quantity).toFixed(2);
})

const showPurchase = () => {
  if (data.user.role === 'GUEST') {
    ElMessage.warning('请先登录后再购买');
    router.push('/login');
    return;
  }
  data.purchaseVisible = true;
  data.purchaseForm.addressId = data.addressData[0]?.addressId;
}

// 提交订单
const submitOrder =  () => {
  if (!data.purchaseForm.addressId) {
    ElMessage.warning("请选择收货地址");
    return;
  }
  const loading = ElLoading.service({
    lock: true,
    text: '订单提交中...',
  });
  request.post("/orders/addDetail", {
    productId: data.productId,
    quantity: data.form.quantity,
    addressId: data.purchaseForm.addressId,
    userId: data.user.id,
    totalAmount: data.productData.price * data.form.quantity
  }).then(res => {
    loading.close();
    if (res.code === '200') {
      ElMessage.success("下单成功");
      data.purchaseVisible = false;
      // 跳转到订单详情页
      router.push(`/orders/orderDetail?orderId=` + res.data.orderId);
    } else {
      ElMessage.error(res.msg);
    }
  }).catch(err => {
    loading.close();
    ElMessage.error(res.msg);
  })
};

</script>

<style>
.infoProduct {
  line-height: 30px;font-size: 18px;margin-bottom: 10px;color: #595959
}


demo-tabs > .el-tabs__content {
 color: #6b778c;
 font-size: 32px;
 font-weight: 600;
}

</style>

