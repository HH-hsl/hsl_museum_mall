<template>
  <div style="width: 60%;margin: 0 auto;" >
    <div class="card" style="margin: 10px auto;">
      <div style="margin-right: 5px;  float: right;" @click="back">
        <el-icon size="20" color="#333"><Close /></el-icon>
      </div>
      <div style="text-align: center;font-size: 24px;font-weight: bold;margin-top: 20px"> {{data.postData.title}}</div>
      <div style="margin-top: 10px;display: flex;grid-gap: 20px;align-items: center;justify-content: center">
        <img :src="data.postData.userAvatar" style="width: 30px;height: 30px;border-radius: 50%;">
        <div style="color: #7c7c7c">发布人：{{data.postData.userName}}</div>
        <div style="color: #7c7c7c">发布时间：{{data.postData.createTime}}</div>
      </div>
      <div v-html="data.postData.content" style="margin-top: 30px;padding: 0 50px"></div>
    </div>

    <!-- 评论区 -->
    <div class="card" style="margin: 10px auto;" >
      <div style="font-size: 20px; font-weight: bold; padding: 10px; border-bottom: 1px solid #eee;">
        评论区（{{ data.commentData.length }}条）
      </div>
      <!-- 评论输入框 -->
      <el-form style="padding: 15px;"
               v-if="data.user.id"
               :model="data.form"
      >
         <el-form-item >
           <el-input
               v-model="data.form.comment"
               type="textarea"
               placeholder="请输入评论内容"
               :rows="3"
               maxlength="200"
           ></el-input>
         </el-form-item>

        <div style="text-align: right; margin-top: 10px;">
          <el-button type="primary"
                     plain
                     size="default"
                     @click="submitComment"
          >发布评论</el-button>
        </div>
      </el-form>

      <div v-else style="padding: 15px; text-align: center;">
        请<a href="/login" style="color: #409EFF;">登录</a>后发表评论
      </div>

      <!-- 评论列表 -->
      <div v-if="data.commentData.length > 0" style="padding: 10px;">
        <div v-for="comment in data.commentData" :key="comment.commentId" style="margin-bottom: 15px; padding: 10px; border-bottom: 1px solid #f5f5f5;">
          <div style="display: flex; align-items: center;">
            <img :src="comment.userAvatar" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 10px;">
            <div>
              <div style="font-weight: bold;">{{ comment.userName }}</div>
              <div style="font-size: 12px; color: #999;">{{ comment.createTime }}</div>
            </div>
            <div v-if="comment.userId === data.user.id"
                 @click="deleteComment(comment.commentId)"
                 style="flex: 1; text-align: right;cursor: pointer;"
            > <el-icon><Delete /></el-icon></div>
          </div>
          <div style="margin-top: 5px; font-size: 14px;padding-left: 30px">{{ comment.comment }}</div>
        </div>
      </div>
      <div v-else style="text-align: center; padding: 20px; color: #999;">
        <el-empty :image-size="100" description="暂无评论"  />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive ,onMounted,ref} from "vue";
import router from "@/router/index.js";
import request from "@/utils/request.js";
import {ElMessage, ElMessageBox} from "element-plus";


const data = reactive({
  user:JSON.parse(localStorage.getItem('code_user') || "{}"),
  postId:router.currentRoute.value.query.postId,
  postData:{},  //是一个对象，不是数组
  commentData: [], // 评论列表
  form: {
    comment:"", // 评论内容
  },
})
const formRef = ref(null);
const back=() => {
  router.push('/front/userPost');
}

const loadPost =() => {
  console.log('postId:', data.postId); // 添加日志输出
  request.get("/post/selectById/" + data.postId).then(res => {
    if(res.code === '200'){
      data.postData = res.data;
    }else{
      ElMessage.error(res.msg);
    }
  })
}

// 加载评论
const loadComments = () => {
  request.get("/comment/selectAll/" + data.postId).then(res => {
    if (res.code === '200') {
      data.commentData = res.data;
    } else {
      ElMessage.error(res.msg);
    }
  });
};

// 提交评论
const submitComment = () => {
  if (data.user.role === 'GUEST') {
    ElMessage.warning('请先登录后再评论');
    router.push('/login');
    return;
  }
  if (data.form.comment.length ===0) {
    ElMessage.warning("评论内容不能为空");
    return;
  }
  data.form.postId = data.postId;
  request.post("/comment/add",data.form).then(res => {
    console.log("评论数据" ,res.data)
    if (res.code === '200') {
      ElMessage.success("评论成功");
      data.form.comment = ""; // 清空输入框
      loadComments(); // 重新加载评论
    } else {
      ElMessage.error(res.msg || "评论失败，请稍后重试");
    }
  });
};

// 删除评论
const deleteComment = (commentId) => {
  ElMessageBox.confirm("您确认要删除该评论吗？", "删除确认", {type: 'warning'}).then(() => {
    request.delete('/comment/deleteById/' + commentId).then(res => {
      if(res.code === "200"){
        ElMessage.success("删除成功");
        loadComments();
      }else {
        ElMessage.error(res.msg);}
    })
  }).catch(err => {});
}

onMounted(() => {
  loadPost();
  loadComments()
});
</script>

