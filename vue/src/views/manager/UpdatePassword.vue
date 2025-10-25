<template>
  <div class="card" style="width: 50%">
    <div style="padding-left: 20px;font-size: 24px;" :align="'center'">修 改 密 码</div>
    <el-form  ref="formRef" :rules="data.rules" :model="data.user" label-width="100px" style="padding: 20px 30px 20px 3px">
      <el-form-item label="原密码：" prop="password">
        <el-input show-password v-model="data.user.password" autocomplete="off" placeholder="请输入原密码"/>
      </el-form-item>
      <el-form-item label="新密码：" prop="newPassword">
        <el-input show-password v-model="data.user.newPassword" autocomplete="off" placeholder="请输入新密码"/>
      </el-form-item>
      <el-form-item label="确认密码：" prop="confirmNewPassword">
        <el-input show-password v-model="data.user.confirmNewPassword" autocomplete="off" placeholder="再次输入新密码"/>
      </el-form-item>

    </el-form>
    <div :align="'center'">
      <el-button  type="primary" @click="updatePassword" style="padding: 15px 30px">保 存</el-button>
    </div>


  </div>
</template>

<script setup>
import { reactive , ref} from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";

const data = reactive({
  user:JSON.parse(localStorage.getItem('code_user') || "{}"),
  // 显式定义密码相关字段
  password: "",          // 原密码
  newPassword: "",       // 新密码
  confirmNewPassword: "" ,// 确认密码
  rules:{
    newPassword:[{ required: true, message: '请输入新密码', trigger: 'blur' }],
    confirmNewPassword:[{ required: true, message: '请确认新密码', trigger: 'blur' }],
  }
})
const formRef = ref()
const updatePassword = () => {
  formRef.value.validate(valid => {
    if (valid) {
      console.log('发送到后端的数据:', data.user);
      request.post('/updatePassword', data.user).then(res => {
        if(res.code === '200'){
          ElMessage.success("修改成功");
          setInterval(() => {
            localStorage.removeItem("code_user")  // 清除用户信息
            location.href = "/login"
          },1000)
        }else {
          ElMessage.error(res.msg)
        }
      })
    }
  })
}
</script>