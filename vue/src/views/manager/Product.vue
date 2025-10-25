<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input clearable @clear="load" v-model="data.productName" :prefix-icon="Search" placeholder="请输入产品名称" style="width: 240px"></el-input>
      <el-button type="primary" plain  style="margin-left: 10px" @click="load">搜索</el-button>
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
        <el-table-column  label="产品首图" width="120" >
          <template #default="scope">
            <el-image v-if="scope.row.imgUrl"
                      fit="cover"
                      :src="scope.row.imgUrl"
                      :preview-src-list="[scope.row.imgUrl]"
                      :preview-teleported = "true"
                      style="width:70px;height:70px;display: block" />
          </template>
        </el-table-column>
        <el-table-column prop="productName" label="产品名称"   />
        <el-table-column prop="museumName" label="博物馆" />
        <el-table-column prop="typeName" label="产品分类" />
        <el-table-column prop="description" label="产品介绍" >
          <template v-slot="scope">
            <el-button size="small" @click="handleContent(scope.row.description)">点击查看</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="price" label="售价(元)" />
        <el-table-column prop="stock" label="库存(件)" />
        <el-table-column prop="sales" label="销量(件)" />
        <el-table-column fixed="right" label="操作" width="180" :align="'center'" >
          <template #default="scope">
            <el-button link type="primary" size="small" @click="handleEdit(scope.row)" icon="edit">
              修改
            </el-button>
            <el-button link type="primary" size="small" icon="delete" style="color: #ff4646" @click="del(scope.row.productId)">删除</el-button>
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
          :page-sizes="[5,15,30]"
          :total="data.total"
          @current-change="load"
          @size-change="load"
      />
    </div>

    <!-- 表单   -->
    <el-dialog title="文创产品信息" v-model="data.formVisible" width="60%"  destroy-on-close>
      <!-- 表单-->
      <el-form  ref="formRef" :model="data.form" label-width="100px" style="padding: 20px 30px 20px 3px">
        <el-form-item label="产品首图：" prop="imgUrl">
          <el-upload
              action="http://localhost:8080/files/upload"
              :headers="{token : data.user?.token}"
              :on-success="handleFileSuccess"
              list-type="picture"
          >
            <el-button size="small" >点击上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="产品名称：" prop="productName">
          <el-input  v-model="data.form.productName" autocomplete="off" placeholder="请输入产品名称"/>
        </el-form-item>
        <el-form-item label="博物馆：" prop="museumName">
            <el-select
                v-model="data.form.museumId"
                placeholder="请选择博物馆"
                style="width: 100%"
            >
              <el-option
                  v-for="item in data.museumData"
                  :key="item.museumId"
                  :label="item.museumName"
                  :value="item.museumId"
              />
            </el-select>
        </el-form-item>
        <el-form-item label="产品分类：" prop="typeName">
          <el-select
              v-model="data.form.typeId"
              placeholder="请选择产品分类"
              style="width: 100%"
          >
            <el-option
                v-for="item in data.typeData"
                :key="item.typeId"
                :label="item.typeName"
                :value="item.typeId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="售价：" prop="price">
          <el-input  v-model="data.form.price" autocomplete="off" placeholder="请输入售价"/>
        </el-form-item>
        <el-form-item label="库存：" prop="stock">
          <el-input  v-model="data.form.stock" autocomplete="off" placeholder="请输入库存"/>
        </el-form-item>
        <!-- 富文本编辑器 -->
        <el-form-item label="产品介绍：" prop="description">
          <div style="border: 1px solid #ccc;">
            <!--工具栏  -->
            <Toolbar
                style="border-bottom: 1px solid #ccc"
                :editor="editorRef"
                :mode="mode"
            />
            <!--富文本编辑器  -->
            <Editor
                style="height: 400px;overflow-y:hidden "
                v-model="data.form.description"
                :mode="mode"
                :defaultConfig="editorConfig"
                @onCreated="handleCreated"
            />
          </div>
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
    <el-dialog title="文创产品信息" v-model="data.viewVisible" width="60%"  destroy-on-close>
      <div v-html="data.description" style="padding: 0 10px"></div>
    </el-dialog>
  </div>
</template>

<script setup>
import {Search} from "@element-plus/icons-vue/global";
import {reactive , ref,onBeforeUnmount,shallowRef} from "vue";
import request from "@/utils/request.js";
import {ElMessage, ElMessageBox} from "element-plus";
//引入富文本所需的东西，哪个页面用法就在哪个页面引入
import '@wangeditor/editor/dist/css/style.css' //引入css
import {Editor,Toolbar} from "@wangeditor/editor-for-vue";

const data = reactive({
  user:JSON.parse(localStorage.getItem('code_user') || "{}"),
  productName: null,
  description: null,
  pageNumber: 1,
  pageSize: 5,
  total: 0,
  tableData: [],
  formVisible: false,
  form: {},
  rows: [],
  viewVisible: false,
  museumData:[],
  typeData:[],
})

/* wangeditor开始 */

const editorRef = shallowRef(null);
const mode = 'default'
const editorConfig = {MENU_CONF:{}}
//图片上传配置
editorConfig.MENU_CONF['uploadImage'] ={
  headers:{
    token: data.user?.token,
  },
  server: 'http://localhost:8080/files/wang/upload',
  fieldName: 'file',
}
//组件销毁时，也及时销毁编辑器，否则可能造成内存泄漏
onBeforeUnmount(() => {
  const editor = editorRef.value;
  if (editor == null) return;
  editor.destroy();
})
//记录editor实例，重要
const handleCreated = (editor) => {
  editorRef.value = editor;
}

/* wangeditor结束 */

// 分页查询的请求方法
const load = () => {
  request.get('/product/selectPage',
      {
        params: {
          pageNum: data.pageNumber,
          pageSize: data.pageSize,
          productName: data.productName,
        }
      }).then(res => {
    console.log('请求响应数据：', res);
    if (res.code === "200") {
      console.log(res.data.list)
      data.tableData = res.data?.list;
      data.total = res.data?.total;
    } else {
      ElMessage.error(res.msg);
    }

  })
}
load()

//查看内容,获取content内容
const handleContent = (description) =>{
  data.description = description;
  data.viewVisible = true;
}

//重置
const reset = () => {
  data.productName = null;
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
      request.post('/product/add', data.form).then(res => {
        if (res.code === "200") {
          ElMessage.success("添加成功");
          data.formVisible = false;
          load();
        } else {
          ElMessage.error("添加失败");
        }
      })
    } else {
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
      request.put('/product/update', data.form).then(res => {
        if (res.code === "200") {
          data.formVisible = false;
          ElMessage.success("修改成功");
          load();
        } else {
          ElMessage.error(res.msg);
        }
      })
    } else {
      ElMessage.error('请检查输入项');
    }
  })
}

// 保存：新增或修改
const save = () => {
  data.form.productId ? update() : add();

}

// 单个删除
const del = (productId) => {
  ElMessageBox.confirm("删除后无法恢复，您确定删除改行数据吗？", "删除确认", {type: 'warning'}).then(() => {
    request.delete('/product/delete/' + productId).then(res => {
      if (res.code === "200") {
        ElMessage.success("删除成功");
        load();
      } else {
        ElMessage.error(res.msg);
      }
    })
  }).catch(err => {
  });
}

const handleSelectionChange = (rows) => {  //rows：选中的行数据
  data.rows = rows;
}
// 批量删除
const deleteBatch = () => {
  if (data.rows.length === 0) {
    ElMessage.error("请选择要删除的行");
  } else {
    ElMessageBox.confirm("删除后无法恢复，您确定删除改行数据吗？", "删除确认", {type: 'warning'}).then(() => {
      request.delete('/product/deleteBatch', {data: data.rows}).then(res => {
        if (res.code === "200") {
          ElMessage.success("批量删除成功");
          load();
        } else {
          ElMessage.error(res.msg);
        }
      })
    }).catch(err => {
    });
  }
}

// 修改
const EditBatch = () => {
  if (data.rows.length === 0) {
    ElMessage.error("请选择要修改的行");
  } else if (data.rows.length > 1) {
    ElMessage.error("多选时不允许修改，请只选择一行");
  } else {
    handleEdit(data.rows[0]);
  }
}
const handleFileSuccess = (res) => {
  console.log("下载的数据:", res);  // 打印响应
  if (res.code === "200") {
    data.form.imgUrl = res.data;
  } else {
    ElMessage.error(res.msg || "上传失败");
  }
}

const loadMuseum = () => {
  request.get('/museum/selectAll').then(res => {
    if (res.code === "200") {
      data.museumData = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  })
}
loadMuseum()

const loadType = () => {
  request.get('/productType/selectAll').then(res => {
    if (res.code === "200") {
      data.typeData = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  })
}
loadType()
</script>