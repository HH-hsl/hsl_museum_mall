<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input clearable @clear="load" v-model="data.typeName" :prefix-icon="Search" placeholder="请输入类型查询" style="width: 240px"></el-input>
      <el-button type="primary"  plain style="margin-left: 10px" @click="load">搜索</el-button>
      <el-button @click="reset" plain style="margin-left: 10px">重置</el-button>
    </div>
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
        <el-table-column prop="typeName" label="类型名称"  width="300" />
        <el-table-column prop="description" label="描述" />
        <el-table-column fixed="right" label="操作" width="150" :align="'center'" >
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEdit(scope.row)" icon="edit">
              修改
            </el-button>
            <el-button link type="primary" size="small" icon="delete" style="color: #ff4646" @click="del(scope.row.typeId)">删除</el-button>
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
    <el-dialog title="文创产品类型信息" v-model="data.formVisible" width="30%" destroy-on-close>
      <!-- 表单-->
      <el-form  ref="formRef" :model="data.form" :rules="data.rules" label-width="100px" style="padding: 20px 30px 20px 3px">
        <el-form-item label="类型名称：" prop="typeName">
          <el-input v-model="data.form.typeName" autocomplete="off" placeholder="请输入类型名称"/>
        </el-form-item>
        <el-form-item label="描述：" >
          <el-input :rows="4" v-model="data.form.description" type="textarea" placeholder="请输入类型描述" size="medium"/>
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
  typeName: null,
  description: null,
  pageNumber:1,
  pageSize:10,
  total:0,
  tableData:[],
  formVisible:false,
  form:{},
  rules: {
    typeName:[{ required: true, message: '请输入类型名称', trigger: 'blur' }],
  },
  rows:[]
})
// 分页查询的请求方法
const load = () => {
  request.get('/productType/selectPage',
      {params:{
          pageNum:data.pageNumber,
          pageSize:data.pageSize,
          typeName:data.typeName,
          description:data.description
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

const reset = () => {
  data.typeName = null;
  load()
}

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
      request.post('/productType/add',data.form).then(res => {
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
      request.put('/productType/update',data.form).then(res => {
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
  data.form.typeId ? update() : add();

}
// 单个删除
const del = (typeId) => {
  ElMessageBox.confirm("删除后无法恢复，您确定删除改行数据吗？", "删除确认", {type: 'warning'}).then(() => {
    request.delete('/productType/delete/' + typeId).then(res => {
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
      request.delete('/productType/deleteBatch',{data:data.rows}).then(res => {
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




</script>
