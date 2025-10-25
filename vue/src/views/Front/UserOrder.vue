<template>
  <div class="card" style="width: 60%;margin:10px auto;">
    <div style="font-size: 24px;border-left: 5px solid #ffb3ba;padding-left: 10px;margin: 15px">我的订单</div>
    <!--  搜索栏-->
    <div style="margin:15px;display: flex">
      <div style="flex: 1;">
        <el-input clearable @clear="loadOrders" v-model="data.num" :prefix-icon="Search" placeholder="请输入订单号查询" style="width: 250px;height: 40px"></el-input>
        <el-button type="primary" plain style="margin-left: 10px;width: 70px;height: 40px" @click="loadOrders">搜索</el-button>
        <el-button type="warning"  @click="reset" plain style="margin-left: 10px;width: 70px;height: 40px">重置</el-button>
      </div>
    </div>
    <!--   地址表格-->
    <div  style="margin: 15px">
      <el-card shadow="hover" v-for="order in data.ordersDate" :key="order.orderId" class="order-card" style="margin-bottom: 20px">
        <div class="order-header">
          <span class="order-id">订单号：{{ order.num }}</span>
          <span class="order-date">下单时间：{{ order.createTime }}</span>
        </div>

        <!-- 订单摘要 -->
        <div class="order-summary" style="border-bottom: 1px solid #d5d4d4;padding-bottom: 10px;">
          <span>订单金额：<b>￥{{ order.totalPrice }}</b></span>
          <span>订单状态：
            <el-tag v-if="order.status === '待付款'" type="info">{{ order.status }}</el-tag>
            <el-tag v-else-if="order.status === '已支付'" type="success">待发货</el-tag>
            <el-tag v-else-if="order.status === '已发货'" type="error">{{ order.status }}</el-tag>
            <el-tag v-else-if="order.status === '已签收'" type="warning">{{ order.status }}</el-tag>
            <el-tag v-else-if="order.status === '已收货'" type="success">{{ order.status }}</el-tag>
            <el-tag v-else type="danger">{{ order.status }}</el-tag>
            </span>
        </div>

        <!-- 订单商品列表 -->
        <el-table :data="[order.orderDetails[0]]" style="width: 100%" v-if="order.orderDetails && order.orderDetails.length > 0">
          <el-table-column  label="产品图片" width="120" >
            <template #default="scope">
              <el-image v-if="scope.row.imgUrl"
                        fit="cover"
                        :src="scope.row.imgUrl"
                        :preview-src-list="[scope.row.imgUrl]"
                        :preview-teleported = "true"
                        style="width:70px;height:70px;display: block" />
            </template>
          </el-table-column>
          <el-table-column prop="productName" label="产品名称" width="400" />
          <el-table-column prop="quantity" label="数量" width="140" />
          <el-table-column prop="price" label="单价" />
          <el-table-column prop="totalPrice" label="总价" >
            <template #default="scope">
              {{ (scope.row.price * scope.row.quantity).toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
        <div v-else style="text-align: center; padding: 20px; color: #999">
          暂无数据
        </div>
        <!-- 订单操作 -->
        <div class="order-footer">
          <el-button type="primary" link @click="handlePay(order.num)"  v-if="order.status === '待付款'">在线支付</el-button>
          <el-button type="primary"  link  @click="navTo('/front/orderDetail?orderId=' + order.orderId)">订单详情<el-icon><DArrowRight /></el-icon></el-button>
          <el-button type="primary" link @click="evaluateOrder(order.orderId)" v-if="order.status === '已收货'">评价</el-button>
          <el-button link style="color: #ff6f6f" @click="del(order.orderId)" v-if="order.status === '待评价'">删除订单</el-button>

        </div>
      </el-card>

    </div>

    <!--分页-->
    <div  style="margin: 15px">
      <el-pagination
          v-model:current-page="data.pageNumber"
          v-model:page-size="data.pageSize"
          layout="total, prev, pager, next"
          :total="data.total"
          @current-change="loadOrders"
          @size-change="loadOrders"
      />
    </div>


  </div>
</template>

<script setup>
import {reactive , ref} from "vue";
import request from "@/utils/request.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {Search} from "@element-plus/icons-vue/global";
import router from "@/router/index.js";

const data = reactive({
  user:JSON.parse(sessionStorage.getItem("code_user") || "{}"),
  pageNumber:1,
  pageSize:5,
  total:0,
  formVisible:false,
  form:{},
  rows:[],
  ordersDate:[],
  userName:router.currentRoute.value.query.userName,
  num:null,
  orderDetails:[],

})

const loadOrders = () => {
  request.get("/orders/selectPage",
      {params:{
          pageNum:data.pageNumber,
          pageSize:data.pageSize,
          num:data.num,
        }}
  ).then(res => {
    console.log(res.data.list)
    if(res.code ==='200'){
      data.ordersDate = res.data?.list;
      data.total = res.data?.total;
      data.orderDetails = res.data?.list.orderDetails;
    }else{
      ElMessage.error(res.msg);
    }
  })
}
loadOrders();

const reset = () => {
  data.num = null;
  loadOrders()
}

const formRef = ref();


// 修改：新增或修改
const update = () => {
  formRef.value.validate((valid) => {
    if (valid) {  //验证通过
      request.put('/post/update',data.form).then(res => {
        console.log("表单数据:", data.form);
        if(res.code === "200"){
          data.formVisible = false;
          ElMessage.success("修改成功");
          loadOrders();
        }else {
          ElMessage.error(res.msg);}
      })
    }else {
      ElMessage.error('请检查输入项');
    }
  })
}

// 单个删除
const del = (orderId) => {
  ElMessageBox.confirm("删除后无法恢复，您确定删除改行数据吗？", "删除确认", {type: 'warning'}).then(() => {
    request.delete('/orders/delete/' + orderId).then(res => {
      if(res.code === "200"){
        ElMessage.success("删除成功");
        loadOrders();
      }else {
        ElMessage.error(res.msg);}
    })
  }).catch(err => {
    ElMessage.error(res.msg);
  });
}

// 查看订单详情
const navTo = (url) => {
  location.href = url;
}

// 在线支付
const handlePay = (num) => {
  window.open('http://localhost:8080/alipay/pay?num=' +  num)

};

</script>

<style scoped>
.order-card {
  margin-bottom: 20px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.order-date {
  font-size: 14px;
  color: #666;
}

.order-id {
  font-size: 14px;
  color: #666;
}

.order-summary {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.order-footer {
  text-align: right;
  margin-top: 10px;
}
</style>