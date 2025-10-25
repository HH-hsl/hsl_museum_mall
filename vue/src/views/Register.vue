<template>
  <div class="bg">
    <div style="padding:40px 20px;width: 350px;background-color: rgba(255,255,255,0.82);border-radius: 10px;box-shadow: 0px 0px 10px rgba(101,98,98,0.3);">
      <el-form  status-icon ref="formRef" :model="data.form" :rules="data.rules" >
        <div style="margin-bottom: 30px;text-align: center;font-size: 24px;color: #4b4b4b;font-weight: bold">欢 迎 注 册</div>
        <el-form-item  prop="username">
          <el-input size="large" v-model="data.form.username" autocomplete="off" prefix-icon="user" placeholder="请输入用户名"/>
        </el-form-item>
        <el-form-item  prop="phone">
          <el-input size="large" v-model="data.form.phone" autocomplete="off" prefix-icon="user" placeholder="请输入联系电话"/>
        </el-form-item>
        <el-form-item  prop="password">
          <el-input size="large" show-password v-model="data.form.password" autocomplete="off" prefix-icon="Lock" placeholder="请输入密码"/>
        </el-form-item>
        <el-form-item  prop="confirmPassword">
          <el-input size="large" show-password v-model="data.form.confirmPassword" autocomplete="off" prefix-icon="Lock" placeholder="请再次输入密码"/>
        </el-form-item>
        <div style="margin-bottom: 20px;">
          <el-button type="primary" size="large" style="width: 100%;background-color: #b40f0f;" @click="register">注 册</el-button>
        </div>
        <div style="text-align: right">
          已有账号？请 <a style="color: rgb(180,15,15);" href="/login">登录</a>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";
import router from "@/router/index.js";

const formRef = ref()
const validatePass = (rule, value, callback) => {
if (value !== data.form.password) {
    callback(new Error("两次密码不匹配！"))
  } else {
    callback()
  }
}

const data = reactive({
  form: {},
  rules: {
    username:[
      {required: true, message: '请输入用户名', trigger: 'blur' },
      {min: 3,  message: '用户名长度不能小于3', trigger: 'blur' }
    ],
    phone:[{required: true, message: '请输入联系电话', trigger: 'blur' },],
    password:[
      { required: true, message: '请输入密码', trigger: 'blur' }],
    confirmPassword: [
      {required: true, message: '请再次输入密码', trigger: 'blur' },
      { validator: validatePass, trigger: 'blur' }]
    },

})


const register = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      console.log('发送到后端的数据:', data.form); // 添加日志输出
      request.post('/register', data.form).then(res => {
        if(res.code === "200"){
          ElMessage.success('注册成功');
          router.push('/login');
        }else {
          ElMessage.error("注册失败");
        }
      })
    }
  })

}

</script>

<style scoped>
.bg{
  height: 100vh;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  background-image: url('@/assets/imgs/bg6.jpg');
  bsckground-size: cover;
  background-position: center;
}
</style>