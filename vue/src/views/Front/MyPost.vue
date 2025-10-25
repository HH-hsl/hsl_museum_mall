<template>
  <div class="card"  style="width: 60%;margin: 10px auto;">
    <div style="font-size: 24px;border-left: 5px solid #ffb3ba;padding-left: 10px;margin: 15px">我的帖子</div>
    <!--  搜索栏-->
    <div style="margin:15px;display: flex">
      <div style="flex: 1;">
        <el-input clearable @clear="loadPost" v-model="data.title" :prefix-icon="Search" placeholder="请输入标题查询" style="width: 250px;height: 40px"></el-input>
        <el-button type="primary" plain style="margin-left: 10px;width: 70px;height: 40px" @click="loadPost">搜索</el-button>
        <el-button type="warning"  @click="reset" plain style="margin-left: 10px;width: 70px;height: 40px">重置</el-button>
      </div>
    </div>

    <!--   帖子表格-->
    <div  style="margin: 15px">
      <el-table :data="data.postDate" style="width: 100%"
                :header-cell-style="{fontWeight: 'bold',color: '#333',backgroundColor: '#fff0f0'}">
        <el-table-column  label="封面图" width="100" >
          <template #default="scope">
            <el-image v-if="scope.row.img"
                      fit="cover"
                      :src="scope.row.img"
                      :preview-src-list="[scope.row.img]"
                      :preview-teleported = "true"
                      style="width:40px;height:40px;border-radius: 10%;display: block" />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="帖子标题" width="200"  />
        <el-table-column prop="content" label="帖子内容" >
          <template v-slot="scope">
            <el-button size="small" @click="handleContent(scope.row.content)">点击查看</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发帖时间" :align="'center'" width="180"/>
        <el-table-column prop="status" label="审核状态"  :align="'center'"  >
          <template v-slot="scope">
            <el-tag v-if="scope.row.status === '待审核'" type="warning">{{ scope.row.status }}</el-tag>
            <el-tag v-if="scope.row.status === '审核通过'" type="success">{{ scope.row.status }}</el-tag>
            <el-tag v-if="scope.row.status === '审核未通过'" type="danger">{{ scope.row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="审核说明" :align="'center'" />
        <el-table-column fixed="right" label="操作" width="120" :align="'center'" >
          <template #default="scope">
            <el-button :disabled="scope.row.status !== '待审核'" type="primary"  icon="edit" circle @click="handleEdit(scope.row)"></el-button>
            <el-button type="danger" icon="delete" circle @click="del(scope.row.postId)"></el-button>

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
          @current-change="loadPost"
          @size-change="loadPost"
      />

    </div>

    <!-- 表单   -->
    <el-dialog title="帖子信息" v-model="data.formVisible" width="60%" destroy-on-close>
      <!-- 表单-->
      <el-form  ref="formRef" :model="data.form"  label-width="80px" style="padding: 10px 20px 0 0 ">
        <el-form-item label="封面图" prop="img">
          <el-avatar shape="square" :size="100" fit="cover" :src="data.form.img" />
          <el-upload
              action="http://localhost:8080/files/upload"
              :headers="{token : data.user?.token}"
              :on-success="handleFileSuccess"
              list-type="picture"
          >
            <el-button type="success"  style="color: #191415;height: 30px;margin-left: 10px" >点击上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="帖子标题" prop="title">
          <el-input v-model="data.form.title" autocomplete="off" placeholder="请输入标题"/>
        </el-form-item>
        <el-form-item label="帖子内容" prop="content">
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

      <!--弹窗底部按钮-->
      <template #footer>
        <div class="dialog-footer" style="margin-right: 10px">
          <el-button @click="data.formVisible = false">取 消</el-button>
          <el-button type="success" @click="update">保 存</el-button>
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
import {reactive , ref,onBeforeUnmount,shallowRef} from "vue";
import request from "@/utils/request.js";
import {ElMessage, ElMessageBox} from "element-plus";
import {Search} from "@element-plus/icons-vue/global";
//引入富文本所需的东西，哪个页面用法就在哪个页面引入
import '@wangeditor/editor/dist/css/style.css' //引入css
import {Editor,Toolbar} from "@wangeditor/editor-for-vue";

const data = reactive({
  user:JSON.parse(sessionStorage.getItem("code_user") || "{}"),
  title:null,
  postDate:[],
  pageNumber:1,
  pageSize:5,
  total:0,
  formVisible:false,
  form:{},
  rows:[],
  viewVisible:false,
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

const loadPost = () => {
  request.get("/post/selectPageMy",
      {params:{
          pageNum:data.pageNumber,
          pageSize:data.pageSize,
          title:data.title,
        }}
  ).then(res => {
    if(res.code ==='200'){
      data.postDate = res.data.list;
      data.total = res.data.total;
    }else{
      ElMessage.error(res.msg);
    }
  })
}
loadPost();


//查看内容,获取content内容
const handleContent = (content) =>{
  data.content = content;
  data.viewVisible = true;
}


const reset = () => {
  data.title = null;
  loadPost()
}

const formRef = ref();

// 编辑：获取行数据
const handleEdit = (row) => {
  data.form = JSON.parse(JSON.stringify(row));  //深拷贝
  data.formVisible = true;
}

// 修改：新增或修改
const update = () => {
  formRef.value.validate((valid) => {
    if (valid) {  //验证通过
      request.put('/post/update',data.form).then(res => {
        console.log("表单数据:", data.form);
        if(res.code === "200"){
          data.formVisible = false;
          ElMessage.success("修改成功");
          loadPost();
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
  data.form.postId ? update() : add();
}

// 单个删除
const del = (postId) => {
  ElMessageBox.confirm("删除后无法恢复，您确定删除改行数据吗？", "删除确认", {type: 'warning'}).then(() => {
    request.delete('/post/delete/' + postId).then(res => {
      if(res.code === "200"){
        ElMessage.success("删除成功");
        loadPost();
      }else {
        ElMessage.error(res.msg);}
    })
  }).catch(err => {});
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

<style>
.text-container {
  width: 200px; /* 设置容器的宽度 */
  white-space: nowrap; /* 防止文本换行 */
  overflow: hidden; /* 隐藏超出容器的部分 */
  text-overflow: ellipsis; /* 使用省略号表示被截断的文本 */
}
</style>