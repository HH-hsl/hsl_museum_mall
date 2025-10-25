<template>
  <div>
    <div class="card" style="margin-bottom: 5px">
      <el-input clearable @clear="load" v-model="data.title" :prefix-icon="Search" placeholder="请输入标题关键字" style="width: 240px"></el-input>
      <el-button type="primary" plain  style="margin-left: 10px" @click="load">搜索</el-button>
      <el-button @click="reset" plain  style="margin-left: 10px">重置</el-button>
    </div>
    <div class="card" style="margin-bottom: 5px" v-if="data.user.role === 'USER'">
      <el-button type="primary" plain @click ="handleAdd">添加</el-button>
      <el-button type="success" plain @click ="EditBatch">修改</el-button>
      <el-button type="danger" plain @click ="deleteBatch">批量删除</el-button>
    </div>
    <!--表格-->
    <div class="card" style="margin-bottom: 5px">
      <el-table :data="data.tableData" @selection-change="handleSelectionChange" style="width: 100%"
                :header-cell-style="{fontWeight: 'bold',color: '#333',backgroundColor: '#fff0f0'}">
<!--        <el-table-column type="selection" width="70" />-->
        <el-table-column  label="封面图" width="120" >
          <template #default="scope">
            <el-image v-if="scope.row.img"
                      fit="cover"
                      :src="scope.row.img"
                      :preview-src-list="[scope.row.img]"
                      :preview-teleported = "true"
                      style="width:40px;height:40px;border-radius: 10%;display: block" />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="帖子标题"  width="350" style="text-overflow: ellipsis;overflow: hidden;white-space: nowrap;"/>
        <el-table-column prop="content" label="帖子内容" >
          <template v-slot="scope">
            <el-button size="small" @click="handleContent(scope.row.content)">点击查看</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="发布用户" :align="'center'" />
        <el-table-column prop="createTime" label="发布时间" :align="'center'" width="250" />
        <el-table-column prop="status" label="审核状态"  :align="'center'"  >
          <template v-slot="scope">
            <el-tag v-if="scope.row.status === '待审核'" type="warning">{{ scope.row.status }}</el-tag>
            <el-tag v-if="scope.row.status === '审核通过'" type="success">{{ scope.row.status }}</el-tag>
            <el-tag v-if="scope.row.status === '审核未通过'" type="danger">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="审核说明"  :align="'center'"  />
        <el-table-column fixed="right" label="操作" width="180"  :align="'center'" >
          <template #default="scope">
            <el-button :disabled="scope.row.status !== '待审核'"  type="primary" size="small" @click="handleEdit(scope.row)" icon="edit">审核</el-button>
<!--            <el-button :disabled="scope.row.role !== 'USER'"  link type="primary" size="small" icon="delete" style="color: #ff4646" @click="del(scope.row.postId)">删除</el-button>-->
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
    <el-dialog title="帖子信息" v-model="data.formVisible" width="30%"  destroy-on-close>
      <!-- 表单-->
      <el-form v-if="data.role === 'USER'"  ref="formRef" :model="data.form" label-width="100px" style="padding: 20px 30px 20px 3px">
        <el-form-item label="封面图：" prop="img">
          <el-upload
              action="http://localhost:8080/files/upload"
              :headers="{token : data.user?.token}"
              :on-success="handleFileSuccess"
              list-type="picture"
          >
            <el-button size="small" >点击上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="帖子标题：" prop="title">
          <el-input  v-model="data.form.title" autocomplete="off" placeholder="请输入标题"/>
        </el-form-item>
        <!-- 富文本编辑器 -->
        <el-form-item label="帖子内容：" prop="content">
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
              v-model="data.form.content"
              :mode="mode"
              :defaultConfig="editorConfig"
              @onCreated="handleCreated"
            />
          </div>
        </el-form-item>

      </el-form>

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

    <!-- 查看内容弹窗 -->
    <el-dialog title="帖子信息" v-model="data.viewVisible" width="60%"  destroy-on-close>
       <div v-html="data.content" style="padding: 0 10px"></div>
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
  title: null,
  content: null,
  pageNumber: 1,
  pageSize: 10,
  total: 0,
  tableData: [],
  formVisible: false,
  form: {},
  rows: [],
  viewVisible: false,
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
  request.get('/post/selectPage',
      {
        params: {
          pageNum: data.pageNumber,
          pageSize: data.pageSize,
          title: data.title,
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
const handleContent = (content) =>{
  data.content = content;
  data.viewVisible = true;
}

const reset = () => {
  data.title = null;
  data.content= null;
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
      request.post('/post/add', data.form).then(res => {
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
      request.put('/post/update', data.form).then(res => {
        if (res.code === "200") {
          data.formVisible = false;
          ElMessage.success("审核完成");
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
  data.form.postId ? update() : add();
}

// 单个删除
const del = (postId) => {
  ElMessageBox.confirm("删除后无法恢复，您确定删除改行数据吗？", "删除确认", {type: 'warning'}).then(() => {
    request.delete('/post/delete/' + postId).then(res => {
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
      request.delete('/post/deleteBatch', {data: data.rows}).then(res => {
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
  console.log("Upload response:", res);  // 打印响应
  if (res.code === "200") {
    data.form.img = res.data;
  } else {
    ElMessage.error(res.msg || "上传失败");
  }
}
</script>
