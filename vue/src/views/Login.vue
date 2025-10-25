<template>
  <div class="bg">
    <div style="padding:40px 20px;width: 350px;background-color: rgba(255,255,255,0.82);border-radius: 10px;box-shadow: 0px 0px 10px rgba(101,98,98,0.3);">
      <el-form  ref="formRef" :model="data.form" :rules="data.rules" >
        <div style="margin-bottom: 30px;text-align: center;font-size: 24px;color: #4b4b4b;font-weight: bold">欢 迎 登 录</div>
        <el-form-item  prop="username">
          <el-input size="large" v-model="data.form.username" autocomplete="off" prefix-icon="user" placeholder="请输入用户名"/>
        </el-form-item>
        <el-form-item  prop="password">
          <el-input size="large" show-password v-model="data.form.password" autocomplete="off" prefix-icon="Lock" placeholder="请输入密码"/>
        </el-form-item>

        <el-form-item prop="role" style="margin-left: 10px;">
          <el-radio-group style="width: 100%;align-items: center"
                          v-model="data.form.role"
          >
            <el-radio label="管理员" value="ADMIN"></el-radio>
            <el-radio label="普通用户" value="USER"></el-radio>
          </el-radio-group>
        </el-form-item>

        <div style="margin-bottom: 20px;">
          <el-button type="primary" size="large" style="width: 100%;background-color: #b40f0f" @click="login">登 录</el-button>
        </div>
        <div style="text-align: right;display: flex">
          <a style="color: #b40f0f;margin-right: 10px;cursor: pointer" @click="guestLogin">游客模式</a>
          <div style="flex: 1"></div>
          还没有账号？请 <a style="color: rgb(180,15,15);" href="/register">注册</a>
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
const data = reactive({
  form: { role:"USER" },
  rules: {
    username:[{
      required: true, message: '请输入用户名', trigger: 'blur' },
      {min: 2,  message: '用户名长度不能小于3', trigger: 'blur' }
    ],
    password:[{ required: true, message: '请输入密码', trigger: 'blur' }],
  },

})

const login = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      request.post('/login', data.form).then(res => {
        if(res.code === "200"){
          // 验证用户信息，出现错误时候可以提示
          if (!res.data.username) {
            ElMessage.error("用户信息不完整");
            console.log(res.data);
            return;
          }
          // 存储用户信息
          localStorage.setItem('code_user', JSON.stringify(res.data ||{}));
          ElMessage.success('登录成功');
          // 跳转到首页
          if("USER" === res.data.role){
            location.href = "/front";
          }else {
            router.push('/');
          }
          router.push('/');
        }else {
          ElMessage.error("登录失败");
        }
      })
    }
  })
}

const guestLogin = () => {
  // 创建游客用户数据
  const guestUser = {
    username: '游客',
    role: 'GUEST',
    permissions: ['view'], // 游客权限
    token: 'GUEST_TOKEN' // 使用字符串token而非JWT
  }
  // 存储游客信息
  localStorage.setItem('code_user', JSON.stringify(guestUser))
  ElMessage.success('已进入游客模式')
  router.push('/front/userHome')
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