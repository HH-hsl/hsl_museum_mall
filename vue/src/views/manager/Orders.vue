<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input clearable @clear="loadOrders" v-model="data.num" :prefix-icon="Search" placeholder="请输入订单号查询" style="width: 240px"></el-input>
      <el-button type="primary" plain  style="margin-left: 10px" @click="loadOrders">搜索</el-button>
      <el-button @click="reset" plain  style="margin-left: 10px">重置</el-button>
    </div>
    <!--表格-->
    <div class="card" style="margin-bottom: 5px">
      <el-table :data="data.ordersData" style="width: 100%"
                :header-cell-style="{fontWeight: 'bold',color: '#333',backgroundColor: '#fff0f0'}">
        <!--   订单详情-->
        <el-table-column type="expand" label="订单详情" width="80">
          <template #default="scope">
            <div style="padding: 10px;">
              <el-descriptions
                  class="margin-top"
                  title="订单详情"
                  :column="4"
                  size="default"
                  border
              >
                <el-descriptions-item >
                  <template #label>
                    <div class="cell-item">订单号</div>
                  </template> {{ scope.row.num }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <div class="cell-item">用户名称</div>
                  </template> {{ scope.row.userName }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <div class="cell-item">下单时间</div>
                  </template>{{ scope.row.createTime }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <div class="cell-item">订单状态</div>
                  </template> {{ scope.row.status }}
                </el-descriptions-item>
                <!--收货信息-->
                <el-descriptions-item>
                  <template #label>
                    <div class="cell-item">收货人</div>
                  </template> {{ scope.row.addressName }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <div class="cell-item">联系方式</div>
                  </template> {{ scope.row.phone }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <div class="cell-item">收货地址</div>
                  </template> {{ scope.row.address }}
                </el-descriptions-item>
                <el-descriptions-item>
                <template #label>
                  <div class="cell-item">实付金额(元)</div>
                </template> {{ scope.row.totalPrice }}
              </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <div class="cell-item">支付宝交易号</div>
                  </template> {{ scope.row.payNum }}
                </el-descriptions-item>
                <el-descriptions-item>
                  <template #label>
                    <div class="cell-item">支付时间</div>
                  </template> {{ scope.row.payTime }}
                </el-descriptions-item>
              </el-descriptions>
              <!--订单商品-->
              <el-card  shadow>
                <el-table :data="scope.row.orderDetails" style="width: 100%">
                  <el-table-column  label="产品图片" width="200" >
                    <template #default="scope">
                      <el-image v-if="scope.row.imgUrl"
                                fit="cover"
                                :src="scope.row.imgUrl"
                                :preview-src-list="[scope.row.imgUrl]"
                                :preview-teleported = "true"
                                style="width:50px;height:50px;display: block" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="productName" label="产品名称" width="450"/>
                  <el-table-column prop="quantity" label="数量" />
                  <el-table-column prop="price" label="单价" />
                  <el-table-column prop="totalPrice" label="总价" >
                    <template #default="scope">
                      {{ (scope.row.price * scope.row.quantity).toFixed(2) }}
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </div>
          </template>
        </el-table-column>
        <!--订单信息-->
        <el-table-column prop="num" label="订单号" width="220"/>
        <el-table-column prop="userName" label="用户名称" />
        <el-table-column prop="quantity" label="产品数量" :align="'center'" />
        <el-table-column prop="totalPrice" label="实付金额" :align="'center'" />
        <el-table-column prop="createTime" label="下单时间" :align="'center'"/>
        <el-table-column prop="status" label="订单状态"  :align="'center'"  >
          <template v-slot="scope">
            <el-tag v-if="scope.row.status === '待付款'" type="info">{{ scope.row.status }}</el-tag>
            <el-tag v-else-if="scope.row.status === '已支付'" type="success">{{ scope.row.status }}</el-tag>
            <el-tag v-else-if="scope.row.status === '已发货'" type="warning">{{ scope.row.status }}</el-tag>
            <el-tag v-else-if="scope.row.status === '待收货'" type="danger">{{ scope.row.status }}</el-tag>
            <el-tag v-else-if="scope.row.status === '已签收'" type="success">{{ scope.row.status }}</el-tag>
            <el-tag v-else>{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <!--操作-->
        <el-table-column fixed="right" label="操作" width="180"  :align="'center'" >
          <template #default="scope">
            <el-button v-if="scope.row.status === '待付款'" disabled="true" plain size="small">等待支付</el-button>
            <el-button v-if="scope.row.status === '已支付'" plain type="primary" size="small" @click="handleShip(scope.row)">发货</el-button>
            <el-button v-if="scope.row.status === '已发货'" plain type="success" size="small" @click="handleDeliver(scope.row)">已送达</el-button>
          </template>
        </el-table-column>

      </el-table>
    </div>

    <!--分页-->
    <div class="card" style="margin-bottom: 5px">
      <el-pagination
          v-model:current-page="data.pageNumber"
          v-model:page-size="data.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10,30,60]"
          :total="data.total"
          @current-change="loadOrders"
          @size-change="loadOrders"
      />
    </div>

    <el-dialog>
    <!--      审核-->
    <el-form  ref="formRef" :model="data.form" label-width="120px" style="padding: 10px 0 0 10px">
      <el-form-item label="审核状态" prop="status">
        <el-radio-group v-model="data.form.status">
          <el-radio-button label="待审核" value="待审核" />
          <el-radio-button label="审核通过" value="审核通过" />
          <el-radio-button label="审核未通过" value="审核未通过" />
        </el-radio-group>
      </el-form-item>
      <el-form-item label="审核说明" prop="reason" v-if="data.form.status === '审核未通过'">
        <el-input  v-model="data.form.reason" autocomplete="off" placeholder="请输入未通过理由"/>
      </el-form-item>
    </el-form>
    <!--弹窗底部按钮-->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="data.formVisible = false">取 消</el-button>
        <el-button type="primary" @click="save">保 存</el-button>
      </div>
    </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {Search} from "@element-plus/icons-vue/global";
import {reactive , ref} from "vue";
import request from "@/utils/request.js";
import {ElMessage, ElMessageBox} from "element-plus";

const data = reactive({
  user:JSON.parse(localStorage.getItem('code_user') || "{}"),
  num:null,
  userName:null,
  pageNumber: 1,
  pageSize: 10,
  total: 0,
  ordersData: [],
  formVisible: false,
  form: {},
  rows: [],
  viewVisible: false,
  orderDetails: [],

})
const formRef = ref(null);
const loadOrders = () => {
  request.get('/orders/selectPage',
      {
        params: {
          pageNum: data.pageNumber,
          pageSize: data.pageSize,
          num: data.num,
        }
      }).then(res => {
    console.log('请求响应数据：', res);
    if (res.code === "200") {
      console.log(res.data.list)
      data.ordersData = res.data?.list;
      // 计算每个订单的产品数量
      data.ordersData = res.data?.list.map(order => ({
        ...order,
        quantity: order.orderDetails?.reduce((total, detail) => total + detail.quantity, 0) || 0,
      }))
      data.total = res.data?.total;
      data.orderDetails = res.data?.list.orderDetails;
    } else {
      ElMessage.error(res.msg);
    }

  })
}
loadOrders()

const reset = () => {
  data.num = null;
  loadOrders()
}

// 编辑：获取行数据
const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row));  //深拷贝
  data.formVisible = true;
}

// 发货操作
const handleShip = (row) => {
  ElMessageBox.confirm("确定要发货吗？", "发货确认", { type: 'warning' }).then(() => {
        request.put("/orders/ship/" + row.orderId)
            .then(res => {
              if (res.code === "200") {
                ElMessage.success("发货成功");
                loadOrders(); // 重新加载订单列表
              } else {
                ElMessage.error(res.msg);
              }
            }).catch(() => {
              ElMessage.error(res.msg);
            });
      })
};

// 已送达操作
const handleDeliver = (row) => {
  ElMessageBox.confirm("确定订单已送达吗？", "已送达确认", { type: 'warning' }).then(() => {
        request.put("/orders/deliver/" + row.orderId)
            .then(res => {
              if (res.code === "200") {
                ElMessage.success("订单状态已更新为已送达");
                loadOrders(); // 重新加载订单列表
              } else {
                ElMessage.error(res.msg);
              }
            }).catch(() => {
              ElMessage.error(res.msg);
            });
      })
};


</script>

<style >
.cell-item {
  display: flex;
  align-items: center;
}
</style>