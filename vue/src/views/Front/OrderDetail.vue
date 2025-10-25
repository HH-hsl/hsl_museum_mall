<template>
  <div class="card" style="width: 60%;margin: 10px auto;">
    <div style="text-align: center;font-size: 24px;font-weight: bold;margin-top: 20px;">订 单 详 情</div>

    <el-card shadow="never" style="margin-top: 20px;line-height: 2;">
      <div class="order-id">收货人：{{data.ordersData?.addressName}}</div>
      <el-button type="primary" plain style="float: right;margin-top: -25px" v-if="data.ordersData.status === '待付款'" @click="handleEdit(data.ordersData)">修改地址</el-button>
      <div class="order-id">联系方式：{{data.ordersData?.phone}}</div>
      <div class="order-id">收货地址：{{data.ordersData?.address}}</div>
    </el-card>

    <el-card shadow="never" style="margin-top: 20px;">
      <div style="margin-bottom: 15px;font-size: 15px">物流详情：</div>
      <el-steps style="max-width: 100%" :active="getActiveStep(data.ordersData.status)" finish-status="success" :align-center="true" >
        <el-step :title="'待付款'"  />
        <el-step :title="'已支付'"  />
        <el-step :title="'已发货'"  />
        <el-step :title="'待收货'"  />
        <el-step :title="'待评价'"  />
        <el-step :title="'已评价'" />
      </el-steps>
    </el-card>

    <el-card shadow="never" class="order-card" style="margin-top: 20px">
      <!-- 订单摘要 -->
      <div class="order-summary" style="border-bottom: 1px solid #d5d4d4;padding-bottom: 10px;">
        <span>订单状态：
            <el-tag v-if="data.ordersData.status === '待付款'" type="info">{{ data.ordersData.status}}</el-tag>
            <el-tag v-else-if="data.ordersData.status === '已支付'" type="warning">待发货</el-tag>
            <el-tag v-else-if="data.ordersData.status === '已发货'" type="error">{{ data.ordersData.status}}</el-tag>
            <el-tag v-else-if="data.ordersData.status === '已签收'" type="success">{{ data.ordersData.status }}</el-tag>
            <el-tag v-else-if="data.ordersData.status === '已收货'" type="warning">{{ data.ordersData.status }}</el-tag>
            <el-tag v-else-if="data.ordersData.status === '已评价'">{{ data.ordersData.status }}</el-tag>
            </span>
      </div>
      <!-- 订单商品列表 -->
      <el-table :data="data.orderDetails" style="width: 100%" v-if="data.orderDetails && data.orderDetails.length > 0">
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
        <el-table-column prop="productName" label="产品名称" width="400">
          <template #default="scope">
            <span
                  class="product-name"
                  @click="navTo('/front/productDetail?productId=' + scope.row.productId)"
              >
            {{ scope.row.productName }}
             </span>
          </template>
        </el-table-column>
        <el-table-column prop="quantity" label="数量" width="140" />
        <el-table-column prop="price" label="单价" />
        <el-table-column prop="totalPrice" label="总价" >
          <template #default="scope">
            {{ (scope.row.price * scope.row.quantity).toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column v-if="data.ordersData.status === '已收货' || data.ordersData.status === '已评价'" label="操作" width="120" >
          <template #default="scope">
            <el-button v-if="scope.row.rating === null" type="text" @click="handleEvaluate(scope.row.detailId)">评价</el-button>
            <el-button v-else type="text" style="color: orangered" >已评价</el-button>
          </template>
        </el-table-column>
      </el-table>


<!--订单信息-->
      <div class="order-header" style="margin-top: 20px;">
        <div>实付款：   <b>￥{{ data.ordersData.totalPrice }}</b></div>
        <div style="font-size: 14px;color: #666;margin-top: 10px;">订单编号：{{ data.ordersData.num }}</div>
        <div style="font-size: 14px;color: #666;margin-top: 10px;" v-if="data.ordersData.status !== '待付款'">支付宝交易号：{{ data.ordersData.payNum }}</div>
        <div style="font-size: 14px;color: #666;margin-top: 10px;">下单时间：{{ data.ordersData.createTime }}</div>
        <div style="font-size: 14px;color: #666;margin-top: 10px;" v-if="data.ordersData.status !== '待付款'">付款时间：{{ data.ordersData.payTime }}</div>
      </div>

<!--      相关按钮-->
      <div class="order-footer">
        <el-button @click="handlePay(data.ordersData.num)" v-if="data.ordersData.status === '待付款'" >在线支付</el-button>
        <el-button @click="del(data.ordersData.orderId)" v-if="data.ordersData.status === '待付款' || data.ordersData.status === '已支付'">取消订单</el-button>
        <el-button v-else-if="data.ordersData.status === '已签收' || data.ordersData.status === '已发货' || data.ordersData.status === '待收货' " type="danger" @click="confirmReceipt(data.ordersData.orderId)">确认收货</el-button>

        <el-button v-if="data.ordersData.status === '已收货'" type="warning" @click="handleServiceEvaluate">服务评价</el-button>
        <el-button v-else-if="data.ordersData.status === '已评价'" >已评价</el-button>

      </div>
    </el-card>

<!--    修改收货地址-->
    <!-- 表单   -->
    <el-dialog title="修改收货地址" v-model="data.formVisible" width="40%" destroy-on-close>
      <!-- 表单-->
      <el-form  ref="formRef" :model="data.form"  label-width="120px" style="padding: 20px 30px 20px 3px">
        <el-form-item label="收货地址">
          <el-select
              v-model="data.form.addressId"
              placeholder="请选择收货地址"
              style="width: 450px"
          >
            <el-option
                v-for="item in data.addressData"
                :key="item.addressId"
                :label="`${item.name} - ${item.address} - ${item.phone}`"
                :value="item.addressId"
            />
          </el-select>
        </el-form-item>

      </el-form>

      <!--弹窗底部按钮-->
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="data.formVisible = false">取 消</el-button>
          <el-button type="primary" @click="update">保 存</el-button>
        </div>
      </template>
    </el-dialog>

<!--    评价弹窗-->
    <el-dialog title="产品评价" v-model="data.evaluateVisible" width="30%" destroy-on-close>
      <el-form :model="data.evaluationForm" label-width="80px">
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="data.evaluationForm.rating" :max="5" show-score size="large"></el-rate>
        </el-form-item>
        <el-form-item label="产品评价">
          <el-input
              v-model="data.evaluationForm.evaluation"
              type="textarea"
              placeholder="请输入评价内容"
              :rows="3"
              style="width: 90%;"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary"  @click="submitEvaluation">提交评价</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 服务评价弹窗 -->
    <el-dialog title="服务评价" v-model="data.serviceEvaluateVisible" width="30%" destroy-on-close>
      <el-form :model="data.serviceEvaluationForm" label-width="80px">
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="data.serviceEvaluationForm.rating" :max="5" show-score size="large"></el-rate>
        </el-form-item>
        <el-form-item label="服务评价">
          <el-input
              v-model="data.serviceEvaluationForm.evaluation"
              type="textarea"
              placeholder="请输入评价内容"
              :rows="3"
              style="width: 90%;"
          ></el-input>
        </el-form-item>
        <el-form-item >
<!--          <template #footer>-->
          <el-button type="primary" @click="submitServiceEvaluation">提交评价</el-button>
<!--            </template>-->
        </el-form-item>
      </el-form>
    </el-dialog>


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
  orderId:router.currentRoute.value.query.orderId,
  formVisible:false,
  evaluateVisible:false,
  serviceEvaluateVisible:false,
  form:{},
  evaluationForm:{},
  serviceEvaluationForm:{},
  rows:[],
  ordersData:{
    status:null,
    num:null,
  },
  // num:null,
  orderDetails:[],
  addressData:[],
})
const formRef = ref(null);
const loadOrderDetail = () => {
  request.get("/orders/selectById/" + data.orderId).then(res => {
    console.log(res.data)
    if(res.code ==='200'){
      data.ordersData = res.data
      data.orderDetails = res.data.orderDetails;
    }else{
      ElMessage.error(res.msg);
    }
  })
}
loadOrderDetail();

const loadAddress = () => {
  request.get('/address/selectAllMy').then(res => {
    console.log(res.data)
    if (res.code === "200") {
      data.addressData = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  })
}
loadAddress();

const handleEdit = (row) => {
  // data.form = JSON.parse(JSON.stringify(row));  //深拷贝
  data.form = {
    orderId: row.orderId,         // 订单ID
    addressId: row.addressId,     // 当前地址ID
  };
  data.formVisible = true;
}

// 修改：新增或修改
const update = () => {
  formRef.value.validate((valid) => {
    if (valid) {  //验证通过
      // 构造请求数据
      const requestData = {
        orderId: data.ordersData.orderId, // 当前订单ID
        addressId: data.form.addressId,   // 新的地址ID
      };
      request.put('/orders/updateAddress',data.form).then(res => {
        console.log("表单数据:", data.form);
        if(res.code === "200"){
          data.formVisible = false;
          ElMessage.success("修改成功");
          loadOrderDetail();
        }else {
          ElMessage.error(res.msg);}
      })
    }else {
      ElMessage.error('请检查输入项');
    }
  })
}

const navTo = (url) => {
  location.href = url;
}

//取消订单
const del = (orderId) => {
  ElMessageBox.confirm("您确定要取消该订单吗？ ", "取消订单确认", {type: 'warning'}).then(() => {
    request.delete('/orders/delete/' + orderId).then(res => {
      if(res.code === "200"){
        ElMessage.success("取消成功");
        router.push('/front/userOrder');
      }else {
        ElMessage.error(res.msg);}
    })
  }).catch(err => {
    ElMessage.error(res.msg);
  });
}

// 在线支付
const handlePay = (num) => {
        // request.get('http://localhost:8080/alipay/pay?num=' +  num)
  // location.href = `/alipay/pay?num=` + num;
  window.open('http://localhost:8080/alipay/pay?num=' +  num)
};

// 将订单状态映射为步骤索引
const getActiveStep = (status) => {
  switch (status) {
    case '待付款':
      return 1;
    case '已支付':
      return 2;
    case '已发货':
      return 3;
    case '已签收':
      return 4;
    case '已收货':
      return 5;
    case '已评价':
      return 6;
    default:
      return 0; // 默认显示第一步
  }
};

// 确认收货
const confirmReceipt = (orderId) => {
  request.put("/orders/confirm/" + orderId)
      .then(res => {
        if (res.code === "200") {
          ElMessage.success("确认收货成功");
          loadOrderDetail(); // 重新加载订单详情
        } else {
          ElMessage.error(res.msg);
        }
      })
      .catch(() => {
        ElMessage.error("操作失败，请稍后重试");
      });
};

// 产品评价
const handleEvaluate = (detailId) => {
  data.evaluationForm = {
    detailId: detailId,
    rating: 0,
    evaluation: "",
  }
  data.evaluateVisible = true;
}

const submitEvaluation = () => {
  if (!data.evaluationForm.rating || !data.evaluationForm.evaluation) {
    ElMessage.warning("请填写评分和评价内容");
    return;
  }
  request.post("/orderDetail/evaluate", data.evaluationForm).then(res => {
    console.log(res.data)
    if (res.code === "200") {
      ElMessage.success("评价成功");
      data.evaluateVisible = false;
    } else {
      ElMessage.error(res.msg);
    }
  });
};

// 服务评价
// 服务评价
const handleServiceEvaluate = () => {
  data.serviceEvaluationForm = {
    orderId: data.orderId,
    rating: 0,
    evaluation: "",
  };
  data.serviceEvaluateVisible = true;
};

const submitServiceEvaluation = () => {
  if (!data.serviceEvaluationForm.rating || !data.serviceEvaluationForm.evaluation) {
    ElMessage.warning("请填写评分和评价内容");
    return;
  }
  request.post("/orders/evaluateService", data.serviceEvaluationForm).then(res => {
    if (res.code === "200") {
      ElMessage.success("服务评价成功");
      data.serviceEvaluateVisible = false;
      loadOrderDetail(); // 重新加载订单详情
    } else {
      ElMessage.error(res.msg);
    }
  });
};
</script>

<style>
.order-card {
  margin-bottom: 20px;
}

.order-header {
  //display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.order-date {
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

.product-name {
  cursor: pointer; /* 鼠标悬停时显示手型 */
  color: #333; /* 默认颜色 */
  transition: color 0.3s; /* 添加颜色变化的过渡效果 */
}

.product-name:hover {
  color: #409EFF; /* 鼠标悬停时的颜色 */
}
</style>