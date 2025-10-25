<template>
  <div>
    <div style="width: 60%;margin:10px auto;display: flex">
      <el-input clearable @clear="loadPost"
                v-model="data.title"
                :prefix-icon="Search"
                placeholder="请输入帖子名称查询"
                style="width: 300px;height: 40px">
      </el-input>
      <el-button type="primary" plain  style="margin-left: 10px;width: 70px;height: 40px" @click="loadPost">搜索</el-button>
      <el-button type="warning"  @click="reset" plain style="margin-left: 10px;width: 70px;height: 40px">重置</el-button>
      <div style="flex: 1;"></div>
      <el-button v-if="data.user.role === 'USER'" type="success" plain="true" @click="handleAdd" style="margin-left: 10px;width: 100px;height: 40px;" >发布帖子</el-button>
    </div>
<!--文创帖子内容-->
    <div  style="width: 60%;margin:10px auto;" >
      <div style="font-size: 20px;border-left: 5px solid #ffb3ba;padding-left: 10px;">文创帖子</div>
<!--        发布帖子-->
        <div @click="navTo('/front/postDetail?postId=' + item.postId)"  class="card" style="display: flex;height: 200px;margin-top: 10px;grid-gap: 20px;cursor: pointer" v-for="item in data.postDate">
        <!--图片展示区      -->
          <div style="width: 180px;" >
            <img  :src="item.img" style="width: 100%;height:180px;border-radius: 5px;object-fit: cover;">
          </div>
        <!--帖子内容展示区-->
          <div style="flex: 1;margin-right: 25px;">
            <div style="font-size: 22px;line-height: 30px;"> {{item.title}}</div>
            <div class="line4" style="margin-top: 10px;font-size: 14px;color: #5e5e5e;line-height: 20px;height: 100px;text-align: justify"> {{item.description}}</div>
            <div style="display: flex;align-items: center;margin-top: 10px;grid-gap: 10px;">
              <img :src="item.userAvatar" style="width: 30px;height: 30px;border-radius: 50%">
              <div style="font-size: 16px">{{item.userName}}</div>
              <div style="color: #7c7c7c;align-items: center;display: flex">
                <el-icon><Clock /></el-icon>
                <div style="margin-left: 3px">{{item.createTime}}</div>
              </div>
            </div>
          </div>
        </div>
    </div>
<!--    分页-->
    <div  style="width: 60%;margin:5px auto;"  >
      <el-pagination
          v-model:current-page="data.pageNumber"
          v-model:page-size="data.pageSize"
          layout="total,  prev, pager, next"
          :total="data.total"
          @current-change="loadPost"
          @size-change="loadPost"
          style="align-items: center"

      />
    </div>

    <!-- 表单   -->
    <el-dialog title="帖子信息" v-model="data.formVisible" width="50%" destroy-on-close>
      <!-- 表单-->
      <el-form  ref="formRef" :model="data.form"  label-width="120px" style="padding: 15px 10px ">
        <el-form-item label="帖子封面" prop="img">
          <el-upload
              action="http://localhost:8080/files/upload"
              :headers="{token : data.user?.token}"
              :on-success="handleFileSuccess"
              list-type="picture"
          >
            <el-button type="success" plain style="height: 30px" >点击上传</el-button>
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
          <el-button type="success" @click="add">发 布</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import {reactive , ref,onBeforeUnmount,shallowRef} from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";
import {Search} from "@element-plus/icons-vue/global";
//引入富文本所需的东西，哪个页面用法就在哪个页面引入
import '@wangeditor/editor/dist/css/style.css' //引入css
import {Editor,Toolbar} from "@wangeditor/editor-for-vue";
import router from "@/router/index.js";


const data = reactive({
  user:JSON.parse(localStorage.getItem("code_user") || "{}"),
  title:null,
  postDate:[],
  pageNumber:1,
  pageSize:10,
  total:0,
  formVisible:false,
  form:{},
  rows:[],
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
  request.get("/post/selectPage",
      {params:{
          pageNum:data.pageNumber,
          pageSize:data.pageSize,
          title:data.title,
          status: "审核通过"
        }}
  ).then(res => {
    console.log("查询结果:", res.data)
    if(res.code ==='200'){
      data.postDate = res.data.list;
      data.total = res.data.total;
    }else{
      ElMessage.error(res.msg);
    }
  })
}
loadPost();

const formRef = ref();

const reset = () => {
  data.title = null;
  loadPost()
}

const navTo = (url) => {
  location.href = url;
}

const handleAdd = () => {
  data.formVisible = true;
  data.form = {};
}


// 新增：新增
const add = () => {
  if (data.user.role === 'GUEST') {
    router.push('/login');
    return;
  }
  formRef.value.validate((valid) => {
    if (valid) {  //验证通过
      console.log("表单数据:", data.form);  // 打印表单数据
      request.post('/post/add', data.form).then(res => {
        if (res.code === "200") {
          ElMessage.success("发帖成功，等待管理员审核");
          data.formVisible = false;
          loadPost();
        } else {
          ElMessage.error("添加失败");
        }
      })
    } else {
      ElMessage.error("请检查输入项");
    }
  })
}

const handleFileSuccess = (res) => {
  console.log("下载的数据:", res);  // 打印响应
  if (res.code === "200") {
    data.form.img = res.data;
  } else {
    ElMessage.error(res.msg || "上传失败");
  }
}

</script>

