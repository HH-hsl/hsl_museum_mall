import axios from 'axios';
import {ElMessage} from 'element-plus';
import router from "@/router/index.js";

const request = axios.create({
  baseURL: 'http://localhost:8080',
    timeout:3000
    });

request.interceptors.request.use(config => {
  config.headers['Content-Type'] = 'application/json;charset=UTF-8';
  let user = JSON.parse(localStorage.getItem('code_user') || "{}");
    config.headers['token'] = user.token;
  return config
}, error => {
    return Promise.reject(error)
});
//response拦截器
//可以在接口响应后统一处理
request.interceptors.response.use(response => {
    let res = response.data;
    if(typeof res === 'string'){
        res = res ? JSON.parse(res) : res
    }
    if(res.code === 401){
        ElMessage.error(res.msg);
        router.push('/login');
    }else {
        return res;
    }

},
    error => {
        if(error.response.status === 404){
            ElMessage.error('未找到请求接口');
        }else if(error.response.status === 500){
            ElMessage.error('系统异常，请查看后端控制台报错');
        }else {
            console.log(error.message)
        }
        return Promise.reject(error)
    }
)
// request.js
request.interceptors.request.use(config => {
    let user = JSON.parse(localStorage.getItem('code_user') || '{}');

    // 自动初始化游客身份
    if (!user.role) {
        user = {
            username: '游客',
            role: 'GUEST',
            avatar: '',
            token: 'GUEST_TOKEN'
        };
        localStorage.setItem('code_user', JSON.stringify(user));
    }
    config.headers['Content-Type'] = 'application/json;charset=UTF-8';
    // 确保游客请求携带token
    config.headers['token'] = user.token || 'GUEST_TOKEN';
    return config;
});
router.beforeEach((to, from, next) => {
    const user = JSON.parse(localStorage.getItem('code_user') || {} );
    // 公共路径 - 任何人都可以访问
    const publicRoutes = [
        '/login',
        '/register',
        '/front/userHome',
        '/front/userProduct',
        '/front/userPost',
        '/front/userMuse',
        '/front/productDetail',
        '/front/postDetail',
        '/front/museumDetail'
    ];
    // 需要登录的路径
    const protectedRoutes = [
        '/front/userCart',
        '/front/userOrder',
        '/front/userLove',
        '/front/myPost',
        '/front/address'
    ];
    // 管理员路径
    const adminRoutes = [
        /^\/manager/
    ];
    // 检查是否为公共路径
    if (publicRoutes.includes(to.path)) {
        next();
        return;
    }
    // 检查管理员路径
    if (adminRoutes.some(route => route.test(to.path))) {
        if (user.role !== 'ADMIN') {
            ElMessage.error('请使用管理员账号登录');
            next('/login');
            return;
        }
    }
    // 检查需要登录的路径
    if (protectedRoutes.includes(to.path)) {
        if (user.role !== 'USER') {
            ElMessage.warning('此功能需要登录后使用');
            next('/login');
            return;
        }
    }
    next();
});
export default request;