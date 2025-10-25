<template >
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input clearable @clear="load" v-model="data.username" :prefix-icon="Search" placeholder="请输入用户名查询" style="width: 240px"></el-input>
      <el-input clearable @clear="load" v-model="data.phone" :prefix-icon="Search" placeholder="请输入联系电话查询" style="width: 240px;margin-left: 10px"></el-input>
      <el-button type="primary" plain style="margin-left: 10px" @click="load">搜索</el-button>
      <el-button @click="reset" plain style="margin-left: 10px">重置</el-button>
    </div>
    <div class="card" style="margin-bottom: 5px">
      <el-button type="primary" plain @click ="handleAdd">添加</el-button>
      <el-button type="success" plain @click ="EditBatch">修改</el-button>
      <el-button type="danger" plain @click ="deleteBatch">批量删除</el-button>
    </div>
    <div class="card" style="margin-bottom: 5px">
    <el-table :data="data.tableData" @selection-change="handleSelectionChange" style="width: 100%"
              :header-cell-style="{fontWeight: 'bold',color: '#333',backgroundColor: '#fff0f0'}">
      <el-table-column type="selection" width="100" />
      <el-table-column  label="头像" width="120" >
        <template #default="scope">
          <el-image v-if="scope.row.avatar"
                    fit="cover"
                    :src="scope.row.avatar"
                    :preview-src-list="[scope.row.avatar]"
                    :preview-teleported = "true"
                    style="width:40px;height:40px;border-radius: 50%;display: block" />
        </template>
      </el-table-column>
      <el-table-column prop="username" label="用户名" width="250" />
      <el-table-column prop="phone" label="联系电话" />
      <el-table-column prop="email" label="邮箱" />
      <el-table-column prop="role" label="角色"  />
      <el-table-column fixed="right" label="操作" width="180" :align="'center'" >
        <template #default="scope">
          <el-button link type="primary" size="small" @click="handleEdit(scope.row)" icon="edit">
            修改
          </el-button>
          <el-button link type="primary" size="small" icon="delete" style="color: #ff4646" @click="del(scope.row.id)">删除</el-button>
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
          :page-sizes="[10, 30, 60]"
          :total="data.total"
          @current-change="load"
          @size-change="load"
      />
    </div>


    <el-dialog title="管理员信息" v-model="data.formVisible" width="30%" destroy-on-close>
    <!-- 表单-->
      <el-form  ref="formRef" :model="data.form" :rules="data.rules" label-width="100px" style="padding: 20px 30px 20px 3px">
        <el-form-item label="用户名：" prop="username">
          <el-input v-model="data.form.username" autocomplete="off" placeholder="请输入用户名"/>
        </el-form-item>
        <el-form-item label="联系电话：" prop="phone">
          <el-input v-model="data.form.phone" autocomplete="off" placeholder="请输入联系电话"/>
        </el-form-item>
        <el-form-item label="邮箱：" >
          <el-input v-model="data.form.email" autocomplete="off" placeholder="请输入邮箱"/>
        </el-form-item>
        <el-form-item label="头像：" prop="avatar">
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
  user:JSON.parse(localStorage.getItem('code_user') || "{}"),
  username: null,
  phone: null,
  pageNumber:1,
  pageSize:10,
  total:0,
  tableData:[],
  formVisible:false,
  form:{},
  rules: {
    username:[{ required: true, message: '请输入用户名', trigger: 'blur' }],
    phone:[{ required: true, message: '请输入练习电话', trigger: 'blur' }],
  },
  rows:[]
})
// 分页查询的请求方法
const load = () => {
  request.get('/admin/selectPage',
      {params:{
        pageNum:data.pageNumber,
        pageSize:data.pageSize,
        username:data.username,
        phone:data.phone

        }
      }).then(res => {
        if(res.code === "200"){
          data.tableData = res.data.list;
          data.total = res.data.total;
        }else {
          ElMessage.error(res.msg);
        }

  })
}
load()

const reset = () => {
  data.username = null;
  data.phone = null;
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
      request.post('/admin/add',data.form).then(res => {
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
      request.put('/admin/update',data.form).then(res => {
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
  data.form.id ? update() : add();

}
// 单个删除
const del = (id) => {
  ElMessageBox.confirm("删除后无法恢复，您确定删除改行数据吗？", "删除确认", {type: 'warning'}).then(() => {
    request.delete('/admin/delete/' + id).then(res => {
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
      request.delete('/admin/deleteBatch',{data:data.rows}).then(res => {
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
  console.log("Upload response:", res);  // 打印响应
  if (res.code === "200") {
    data.form.avatar = res.data;
  } else {
    ElMessage.error(res.msg || "上传失败");
  }
}

</script>

