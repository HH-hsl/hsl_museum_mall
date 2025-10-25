<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-button type="primary" plain @click ="handleAdd">添加</el-button>
      <el-button type="success" plain @click ="EditBatch">修改</el-button>
      <el-button type="danger" plain @click ="deleteBatch">批量删除</el-button>
    </div>
    <!--表格-->
    <div class="card" style="margin-bottom: 5px">
      <el-table :data="data.tableData" @selection-change="handleSelectionChange" style="width: 100%"
                :header-cell-style="{fontWeight: 'bold',color: '#333',backgroundColor: '#fff0f0'}">
        <el-table-column type="selection" width="100" />
        <el-table-column prop="productName" label="关联产品名称"  width="400" />
        <el-table-column  label="轮播图"  >
          <template #default="scope">
            <el-image v-if="scope.row.img"
                      fit="cover"
                      :src="scope.row.img"
                      :preview-src-list="[scope.row.img]"
                      :preview-teleported = "true"
                      style="width:40px;height:40px;border-radius: 10%;display: block" />
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="150" :align="'center'" >
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEdit(scope.row)" icon="edit">
              修改
            </el-button>
            <el-button link type="primary" size="small" icon="delete" style="color: #ff4646" @click="del(scope.row.bannerId)">删除</el-button>
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
          @current-change="load"
          @size-change="load"
      />
    </div>
    <!-- 表单   -->
    <el-dialog title="轮播图信息" v-model="data.formVisible" width="40%" destroy-on-close>
      <!-- 表单-->
      <el-form  ref="formRef" :model="data.form"  label-width="100px" style="padding: 20px 30px 20px 3px">
        <el-form-item label="关联产品：" prop="productName">
          <el-select
              v-model="data.form.productId"
              placeholder="请选择关联产品"
              style="width: 100%"
          >
            <el-option
                v-for="item in data.productData"
                :key="item.productId"
                :label="item.productName"
                :value="item.productId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="轮播图片：" prop="img">
          <el-upload
              action="http://localhost:8080/files/upload"
              :headers="{token : data.user?.token}"
              :on-success="handleFileSuccess"
              list-type="picture"
          >
            <el-button size="small" >点击上传</el-button>
          </el-upload>
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
import {reactive , ref} from "vue";
import {Search} from "@element-plus/icons-vue/global";
import request from "@/utils/request.js";
import {ElMessage, ElMessageBox} from "element-plus";

const data = reactive({
  user:JSON.parse(localStorage.getItem("code_user") || "{}"),
  pageNumber:1,
  pageSize:10,
  total:0,
  tableData:[],
  formVisible:false,
  form:{},
  rows:[],
  productData:[],

})
// 分页查询的请求方法
const load = () => {
  request.get('/banner/selectPage',
      {params:{
          pageNum:data.pageNumber,
          pageSize:data.pageSize,
        }
      }).then(res => {
    console.log('请求响应数据：', res);
    if(res.code === "200"){
      console.log(res.data.list)
      data.tableData = res.data.list;
      data.total = res.data.total;
    }else {
      ElMessage.error(res.msg);
    }

  })
}
load()



const formRef = ref();

// 新增：弹窗
const handleAdd = () => {
  data.formVisible = true;
  data.form = {};
}
// 新增：新增
const add = () => {
  formRef.value.validate((valid) => {
    if (valid) {  //验证通过
      console.log("表单数据:", data.form);  // 打印表单数据
      request.post('/banner/add',data.form).then(res => {
        if(res.code === "200"){
          ElMessage.success("添加成功");
          data.formVisible = false;
          load();
        }else {
          ElMessage.error("添加失败");}
      })
    }else {
      ElMessage.error("请检查输入项");
    }
  })
}
// 编辑：获取行数据
const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row));  //深拷贝
  data.formVisible = true;
}
// 修改：新增或修改
const update = () => {
  formRef.value.validate((valid) => {
    if (valid) {  //验证通过
      request.put('/banner/update',data.form).then(res => {
        if(res.code === "200"){
          data.formVisible = false;
          ElMessage.success("修改成功");
          load();
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
  data.form.bannerId ? update() : add();

}
// 单个删除
const del = (bannerId) => {
  ElMessageBox.confirm("删除后无法恢复，您确定删除改行数据吗？", "删除确认", {type: 'warning'}).then(() => {
    request.delete('/banner/delete/' + bannerId).then(res => {
      if(res.code === "200"){
        ElMessage.success("删除成功");
        load();
      }else {
        ElMessage.error(res.msg);}
    })
  }).catch(err => {});
}

const handleSelectionChange = (rows) => {  //rows：选中的行数据
  data.rows = rows;
}
// 批量删除
const deleteBatch = () => {
  if(data.rows.length === 0){
    ElMessage.error("请选择要删除的行");
  }else {
    ElMessageBox.confirm("删除后无法恢复，您确定删除改行数据吗？", "删除确认", {type: 'warning'}).then(() => {
      request.delete('/banner/deleteBatch',{data:data.rows}).then(res => {
        if(res.code === "200"){
          ElMessage.success("批量删除成功");
          load();
        }else {
          ElMessage.error(res.msg);}
      })
    }).catch(err => {});
  }
}

// 修改
const EditBatch = () => {
  if(data.rows.length === 0){
    ElMessage.error("请选择要修改的行");
  } else if (data.rows.length > 1) {
    ElMessage.error("多选时不允许修改，请只选择一行");
  } else {
    handleEdit(data.rows[0]);
  }
}

const handleFileSuccess = (res) => {
  console.log("上传的数据:", res);  // 打印响应
  if (res.code === "200") {
    data.form.img = res.data;
  } else {
    ElMessage.error(res.msg || "上传失败");
  }
}

const loadProduct = () => {
  request.get('/product/select').then(res => {
    console.log(res.data)
    if (res.code === "200") {
      data.productData = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  })
}
loadProduct()
</script>
