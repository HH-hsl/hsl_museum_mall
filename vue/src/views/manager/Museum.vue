<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input clearable @clear="load" v-model="data.museumName" :prefix-icon="Search" placeholder="请输入博物馆名称查询" style="width: 240px"></el-input>
      <el-input clearable @clear="load" v-model="data.address" :prefix-icon="Search" placeholder="请输入地址查询" style="width: 240px;margin-left: 10px"></el-input>
      <el-button type="primary"  style="margin-left: 10px" plain @click="load">搜索</el-button>
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
        <el-table-column type="selection" width="70" />
        <el-table-column  label="博物馆logo" width="150" >
          <template #default="scope">
            <el-image v-if="scope.row.logo"
                      fit="cover"
                      :src="scope.row.logo"
                      :preview-src-list="[scope.row.logo]"
                      :preview-teleported = "true"
                      style="width:40px;height:40px;border-radius: 10%;display: block" />
          </template>
        </el-table-column>
        <el-table-column prop="museumName" label="博物馆名称"  />
        <el-table-column prop="phone" label="联系电话"  />
        <el-table-column prop="address" label="博物馆地址" width="300"  />
        <el-table-column prop="url" label="官网地址"  >
          <template #default="scope">
            <a :href="scope.row.url" target="_blank" @click="navTo(scope.row.url)">{{scope.row.museumName}}</a>
          </template>
        </el-table-column>
        <el-table-column prop="introduction" label="博物馆简介"  width="250">
          <template v-slot="scope">
            <el-button size="small" @click="handleIntroduction(scope.row.introduction)">点击查看</el-button>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="150" :align="'center'" >
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEdit(scope.row)" icon="edit">
              修改
            </el-button>
            <el-button link type="primary" size="small" icon="delete" style="color: #ff4646" @click="del(scope.row.museumId)">删除</el-button>
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
    <el-dialog title="博物馆信息" v-model="data.formVisible" width="50%" destroy-on-close>
      <!-- 表单-->
      <el-form  ref="formRef" :model="data.form"  label-width="120px" style="padding: 20px 30px 20px 3px">
        <el-form-item label="博物馆logo：" prop="logo">
          <el-avatar shape="square" :size="100" :fit="'cover'" :src="data.form.logo" />
          <el-upload
              action="http://localhost:8080/files/upload"
              :headers="{token : data.user?.token}"
              :on-success="handleFileSuccess"
              list-type="picture"
          >
            <el-button size="small"  style="margin-left: 10px">点击上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="博物馆名称：" prop="museumName">
          <el-input v-model="data.form.museumName" autocomplete="off" placeholder="请输入名称"/>
        </el-form-item>
        <el-form-item label="联系电话：" prop="phone">
          <el-input v-model="data.form.phone" autocomplete="off" placeholder="请输入联系电话"/>
        </el-form-item>
        <el-form-item label="博物馆地址：" prop="address">
        <el-input :rows="2" v-model="data.form.address"  placeholder="请输入地址" size="medium"/>
      </el-form-item>
        <el-form-item label="官网地址：" prop="url">
          <el-input :rows="2" v-model="data.form.url"  placeholder="请输入官网地址" size="medium"/>
        </el-form-item>
        <!-- 富文本编辑器 -->
        <el-form-item label="博物馆简介：" prop="introduction">
          <el-input :rows="4" v-model="data.form.introduction" type="textarea" placeholder="请输入博物馆简介" size="medium"/>
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

    <!-- 查看内容弹窗 -->
    <el-dialog title="博物馆信息" v-model="data.viewVisible" width="40%" height="300px"  destroy-on-close>
      <div v-html="data.introduction" style="padding: 0 10px"></div>
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
  museumName: null,
  address: null,
  pageNumber:1,
  pageSize:10,
  total:0,
  tableData:[],
  formVisible:false,
  form:{},
  rows:[],
  introduction:null,
  viewVisible:false,
})



// 分页查询的请求方法
const load = () => {
  request.get('/museum/selectPage',
      {params:{
          pageNum:data.pageNumber,
          pageSize:data.pageSize,
          museumName:data.museumName,
          address:data.address
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

//查看内容,获取content内容
const handleIntroduction = (introduction) =>{
  data.introduction = introduction;
  data.viewVisible = true;
}

const reset = () => {
  data.museumName = null;
  data.address = null;
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
      request.post('/museum/add',data.form).then(res => {
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
      request.put('/museum/update',data.form).then(res => {
        console.log("表单数据:", data.form);
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
  data.form.museumId ? update() : add();
}
// 单个删除
const del = (museumId) => {
  ElMessageBox.confirm("删除后无法恢复，您确定删除改行数据吗？", "删除确认", {type: 'warning'}).then(() => {
    request.delete('/museum/delete/' + museumId).then(res => {
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
      request.delete('/museum/deleteBatch',{data:data.rows}).then(res => {
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
    data.form.logo = res.data;
  } else {
    ElMessage.error(res.msg || "上传失败");
  }
}
const navTo = (url) => {
  location.href = url;
}
</script>