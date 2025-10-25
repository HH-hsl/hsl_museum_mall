<template>
  <div class="card" style="width: 50%">
    <div style="padding-left: 20px;font-size: 24px;" :align="'center'">个 人 中 心</div>
      <el-form  ref="formRef" :model="data.user" label-width="100px" style="padding: 20px 30px 20px 3px">
        <el-form-item label="头像：" prop="avatar">
          <el-avatar shape="square" :size="100" :fit="fit" :src="data.user.avatar" />
          <el-upload
              action="http://localhost:8080/files/upload"
              :headers="{token : data.user?.token}"
              :on-success="handleFileSuccess"
              list-type="picture"
              style="padding-left: 10px;padding-bottom: 50px"
          >
            <el-button size="small" >点击上传</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item label="用户名：" prop="username">
          <el-input v-model="data.user.username" autocomplete="off" placeholder="请输入用户名"/>
        </el-form-item>
        <el-form-item label="联系电话：" prop="phone">
          <el-input v-model="data.user.phone" autocomplete="off" placeholder="请输入联系电话"/>
        </el-form-item>
        <el-form-item label="邮箱：" >
          <el-input v-model="data.user.email" autocomplete="off" placeholder="请输入邮箱"/>
        </el-form-item>

      </el-form>
    <div :align="'center'">
      <el-button  type="primary" @click="update" style="padding: 15px 30px">保 存</el-button>
    </div>


  </div>
</template>

<script setup>
import { reactive } from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";

const data = reactive({
  user:JSON.parse(localStorage.getItem('code_user') || "{}"),
})

const handleFileSuccess =(res) => {
  data.user.avatar = res.data;
}

// 同步更新manage框架的用户名
const emit = defineEmits(['updateUser'])

// 更新用户信息
const update = () => {
  let url
  if(data.user.role === "ADMIN"){
    url = "/admin/update"
  }
  if(data.user.role === "USER"){
    url = "/user/update"
  }
  request.put(url,data.user).then(res => {
    console.log(data.user)
    if(res.code === '200'){
      ElMessage.success("更新成功");
      localStorage.setItem('code_user',JSON.stringify(data.user))
      emit('updateUser')
    }else {
      ElMessage.error(res.msg)
    }
  })
}


</script>