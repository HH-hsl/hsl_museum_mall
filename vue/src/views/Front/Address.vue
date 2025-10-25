<template>
  <div class="card"  style="width: 60%;margin: 10px auto;">
    <div style="font-size: 24px;border-left: 5px solid #ffb3ba;padding-left: 10px;margin: 15px">收货地址</div>
<!--  搜索栏-->
    <div style="margin:15px;display: flex">
      <div style="flex: 1;">
        <el-input clearable @clear="loadAddress" v-model="data.name" :prefix-icon="Search" placeholder="请输入收货人姓名查询" style="width: 250px;height: 40px"></el-input>
        <el-button type="primary" plain style="margin-left: 10px;width: 70px;height: 40px" @click="loadAddress">搜索</el-button>
        <el-button type="warning"  @click="reset" plain style="margin-left: 10px;width: 70px;height: 40px">重置</el-button>

        <el-button type="success"  @click ="handleAdd" style=" float: right;width: 70px;height: 40px;">添加</el-button>
      </div>
    </div>

<!--   地址表格-->
    <div  style="margin: 15px">
      <el-table :data="data.addressDate" style="width: 100%"
                :header-cell-style="{fontWeight: 'bold',color: '#333',backgroundColor: '#fff0f0'}">
        <el-table-column prop="name" label="收货人" width="150"/>
        <el-table-column prop="phone" label="联系方式" width="200"/>
        <el-table-column prop="address" label="详细地址" />
        <el-table-column fixed="right" label="操作" width="120" :align="'center'" >
          <template #default="scope">
            <el-button type="primary" size="small"  icon="edit" circle @click="handleEdit(scope.row)"></el-button>
            <el-button type="danger" size="small" icon="delete" circle @click="del(scope.row.addressId)"></el-button>

          </template>
        </el-table-column>
      </el-table>
    </div>

    <!--分页-->
    <div  style="margin: 15px">
      <el-pagination
          v-model:current-page="data.pageNumber"
          v-model:page-size="data.pageSize"
          layout="total, prev, pager, next"
          :total="data.total"
          @current-change="loadAddress"
          @size-change="loadAddress"
      />

    </div>

    <!-- 表单   -->
    <el-dialog title="收货地址信息" v-model="data.formVisible" width="40%" destroy-on-close>
      <!-- 表单-->
      <el-form  ref="formRef" :model="data.form"  label-width="120px" style="padding: 20px 30px 20px 3px">
        <el-form-item label="收货人" prop="name">
          <el-input v-model="data.form.name" autocomplete="off" placeholder="请输入收货人姓名"/>
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="data.form.phone" autocomplete="off" placeholder="请输入联系方式"/>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input :rows="2" v-model="data.form.address"  placeholder="请输入地址" size="medium"/>
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
import {reactive, ref} from "vue";
import request from "@/utils/request.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {Search} from "@element-plus/icons-vue/global";

const data = reactive({
  user:JSON.parse(sessionStorage.getItem("code_user") || "{}"),
  name:null,
  address:null,
  addressDate:[],
  pageNumber:1,
  pageSize:5,
  total:0,
  formVisible:false,
  form:{},
  rows:[],
})

const loadAddress = () => {
  request.get("/address/selectPage",
      {params:{
          pageNum:data.pageNumber,
          pageSize:data.pageSize,
          name:data.name,
          address:data.address,
        }}
  ).then(res => {
    if(res.code ==='200'){
      data.addressDate = res.data.list;
      data.total = res.data.total;
    }else{
      ElMessage.error(res.msg);
    }
  })
}
loadAddress();


const reset = () => {
  data.name = null;
  data.address = null;
  loadAddress()
}

const formRef = ref();

// 编辑：获取行数据
const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row));  //深拷贝
  data.formVisible = true;
}


const handleAdd = () => {
  data.formVisible = true;
  data.form = {};
}

// 新增：新增
const add = () => {
  formRef.value.validate((valid) => {
    if (valid) {  //验证通过
      console.log("表单数据:", data.form);  // 打印表单数据
      request.post('/address/add',data.form).then(res => {
        if(res.code === "200"){
          ElMessage.success("添加成功");
          data.formVisible = false;
          loadAddress();
        }else {
          ElMessage.error("添加失败");}
      })
    }else {
      ElMessage.error("请检查输入项");
    }
  })
}

// 修改：新增或修改
const update = () => {
  formRef.value.validate((valid) => {
    if (valid) {  //验证通过
      request.put('/address/update',data.form).then(res => {
        console.log("表单数据:", data.form);
        if(res.code === "200"){
          data.formVisible = false;
          ElMessage.success("修改成功");
          loadAddress();
        }else {
          ElMessage.error(res.msg);}
      })
    }else {
      ElMessage.error('请检查输入项');
    }
  })
}

// 保存：新增或修改
const save = () => {
  data.form.addressId ? update() : add();
}

// 单个删除
const del = (addressId) => {
  ElMessageBox.confirm("删除后无法恢复，您确定删除改行数据吗？", "删除确认", {type: 'warning'}).then(() => {
    request.delete('/address/delete/' + addressId).then(res => {
      if(res.code === "200"){
        ElMessage.success("删除成功");
        loadAddress();
      }else {
        ElMessage.error(res.msg);}
    })
  }).catch(err => {});
}

</script>

<style scoped>

</style>