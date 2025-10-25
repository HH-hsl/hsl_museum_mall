<template>
    <div class="card" style="width: 60%;margin:10px auto;">
      <div style="display: flex;margin: 10px">
        <div style="font-size: 20px">全部商品 ( {{ totalQuantity }} 件)</div>
       <!-- 选择收获地址-->
        <div style="margin-left: 25px;flex: 1 1 0%">
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
        </div >

        <!--计算总价 -->
        <div style="display: flex;margin-left: 25px;font-size: 20px;align-items: center;">
          <div>已选产品</div>
          <div style=" font-size: 24px; width: 150px; text-align: center;color: red;font-weight: bold"> ￥{{ selectedTotalPrice }}</div>
          <el-button type="danger" style="float: right" @click="selectAccount"> <el-icon style="margin-right: 2px"><Coin /></el-icon>结 算</el-button>
        </div>

      </div>

      <!-- 购物车列表 -->
      <div  style="margin: 10px">
        <el-table :data="data.cartData" style="width: 100%" @selection-change="handleSelectionChange"
                  :header-cell-style="{fontWeight: 'bold',color: '#626262',backgroundColor: '#fff0f0'}">
          <el-table-column type="selection" width="80" />
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
          <el-table-column prop="productName" label="产品名称"  />
          <el-table-column prop="price" label="产品单价" width="120"  />
          <el-table-column prop="quantity" label="产品数量" :align="'center'">
            <template #default="scope">
              <el-input-number v-model="scope.row.quantity"
                               @change="(value) => updateQuantity(scope.row.cartId, value)"
                               :min="1" :max="scope.row.stock"/>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="120" :align="'center'" >
            <template #default="scope">
              <el-button type="danger" plain size="small" @click="del(scope.row.cartId)">移除购物车</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

    </div>


</template>

<script setup>
import {reactive, onMounted,computed} from "vue";
import request from "@/utils/request.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {Search} from "@element-plus/icons-vue/global";
import router from "@/router/index.js";

const data = reactive({
  user:JSON.parse(sessionStorage.getItem("code_user") || "{}"),
  addressData:[],
  cartData:[],
  formVisible:false,
  form:{
    addressId: null,
    quantity:null,
  },
  rows:[],
  // requestData:[],

})


const handleSelectionChange = (rows) => {  //rows：选中的行数据
  data.rows = rows;
}

const loadCart = () => {
  request.get('/cart/selectAll').then(res => {
    console.log(res.data)
    if (res.code === "200") {
      data.cartData = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  })
}

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
// 页面加载完成后，加载数据
onMounted(() => {
  if (data.user.role === 'GUEST') {
    ElMessage.warning('请先登录后再使用购物车功能');
    location.href ='/login';
  }
  loadCart();
  loadAddress();
});

const del = (cartId) => {
  ElMessageBox.confirm("确定要删除该产品吗？", "删除确认", {type: 'warning'}).then(() => {
    request.delete('/cart/delete/' + cartId).then(res => {
      if (res.code === "200") {
        ElMessage.success("移除成功");
        loadCart();
      } else {
        ElMessage.error(res.msg);
      }
    })
  }).catch(err => {
  });
}

// 计算购物车中商品的总数量
const totalQuantity = computed(() => {
  return data.cartData.reduce((sum, item) => sum + (item.quantity || 0), 0);
})

// 计算选中商品的总金额
const selectedTotalPrice = computed(() => {
  return data.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
})

// 更新商品数量
const updateQuantity = (cartId, quantity) => {
  request.put('/cart/updateQuantity', {
    cartId: cartId,
    quantity: quantity,
  }).then(res => {
    if (res.code === "200") {
      ElMessage.success("修改成功");
    }
  }).catch(err => {
    ElMessage.error(res.msg);
  });
};

// 结算
const selectAccount = () => {
// 1. 检查是否选择了商品
  if (data.rows.length === 0) {
    ElMessage.warning("请先选择要结算的商品");
    return;
  }
  // 2. 检查是否选择了收货地址
  if (!data.form.addressId) {
    ElMessage.warning("请选择收货地址");
    return;
  }
  // 3. 构造请求数据
  const requestData = {
    userId: data.user.id, // 当前用户 ID
    addressId: data.form.addressId, // 收货地址 ID
    totalPrice: selectedTotalPrice.value, // 总价
    name:  data.rows.length > 0 ? data.rows.map(item => item.productName).join(', ') : "默认商品名称", // 第一个商品的名称
    carts: data.rows.map(item => ({
      cartId: item.cartId,
      productId: item.productId, // 商品 ID
      quantity: item.quantity,    // 商品数量
    })),
  };
  // 4. 提交订单
  request.post('/orders/add', requestData)
      .then(res => {
        if (res.code === "200") {
          ElMessage.success("结算成功");
          // 结算成功后，清空选中商品和收货地址
          data.rows = [];
          data.form.addressId = null;
          loadCart(); // 重新加载购物车数据
        } else {
          ElMessage.error(res.msg || "结算失败");
        }
      }).catch(err => {
        ElMessage.error(res.msg);
      });
}

</script>