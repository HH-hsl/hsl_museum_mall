import { createRouter, createWebHistory } from 'vue-router'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/',redirect: '/manager/home',},
    { path: '/manager',component: () => import('../views/Manager.vue'),
      children: [
          { path: 'home',meta:{title:'主页'} ,component: () =>  import('../views/manager/Home.vue')},
          { path: 'notice',meta:{title:'系统公告'} ,component: () =>  import('../views/manager/Notice.vue')},
          { path: 'admin',meta:{title:'管理员信息'} ,component:  () =>  import('../views/manager/Admin.vue')},
          { path: 'user',meta:{title:'用户信息'} ,component: () =>  import('../views/manager/User.vue')},
          { path: 'productType',meta:{title:'文创产品类型'} ,component: () =>  import('../views/manager/ProductType.vue')},
          { path: 'product',meta:{title:'文创产品'} ,component: () =>  import('../views/manager/Product.vue')},
          { path: 'person',meta:{title:'个人中心'} ,component: () =>  import('../views/manager/Person.vue')},
          { path: 'updatePassword',meta:{title:'修改密码'} ,component: () =>  import('../views/manager/UpdatePassword.vue')},
          { path: 'museum',meta:{title:'博物馆信息'} ,component: () =>  import('../views/manager/Museum.vue')},
          { path: 'post',meta:{title:'文创帖子'} ,component: () =>  import('../views/manager/Post.vue')},
          { path: 'banner',meta:{title:'轮播图'} ,component: () =>  import('../views/manager/Banner.vue')},
          { path: 'orders',meta:{title:'订单管理'} ,component: () =>  import('../views/manager/Orders.vue')},

      ]
    },
      { path: '/front',redirect: '/front/userHome',},
      { path: '/front',meta:{title:'用户端'} ,component: () =>  import('../views/Front.vue'),
        children: [
            { path: 'userPost',meta:{title:'论坛'} ,component: () =>  import('../views/Front/UserPost.vue')},
            { path: 'userHome',meta:{title:'首页'} ,component: () =>  import('../views/Front/UserHome.vue')},
            { path: 'userPerson',meta:{title:'用户个人中心'} ,component: () =>  import('../views/Front/UserPerson.vue')},
            { path: 'userPassword',meta:{title:'修改密码'} ,component: () =>  import('../views/Front/UserPassword.vue')},
            { path: 'userNotice',meta:{title:'系统公告'} ,component: () =>  import('../views/Front/UserNotice.vue')},
            { path: 'userCart',meta:{title:'购物车'} ,component: () =>  import('../views/Front/UserCart.vue')},
            { path: 'userOrder',meta:{title:'我的订单'} ,component: () =>  import('../views/Front/UserOrder.vue')},
            { path: 'userMuse',meta:{title:'博物馆'} ,component: () =>  import('../views/Front/UserMuse.vue')},
            { path: 'userProduct',meta:{title:'文创产品'} ,component: () =>  import('../views/Front/UserProduct.vue')},
            { path: 'address',meta:{title:'收货地址'} ,component: () =>  import('../views/Front/Address.vue')},
            { path: 'userLove',meta:{title:'我的收藏'} ,component: () =>  import('../views/Front/UserLove.vue')},
            { path: 'myPost',meta:{title:'文创论坛'} ,component: () =>  import('../views/Front/MyPost.vue')},
            { path: 'postDetail',meta:{title:'首文创帖子页'} ,component: () =>  import('../views/Front/PostDetail.vue')},
            { path: 'productDetail',meta:{title:'产品详情'} ,component: () =>  import('../views/Front/ProductDetail.vue')},
            { path: 'museumDetail',meta:{title:'博物馆信息'} ,component: () =>  import('../views/Front/MuseumDetail.vue')},
            { path: 'orderDetail',meta:{title:'订单详情'} ,component: () =>  import('../views/Front/OrderDetail.vue')},

        ]},
    { path: '/login',meta:{title:'登录'} ,component: () =>  import('../views/Login.vue'),},
    { path: '/register',meta:{title:'注册'} ,component: () =>  import('../views/Register.vue'),},
    { path: '/notFound',component: () =>  import('../views/404.vue'),},
    { path: '/:pathMatch(.*)',redirect: '/notFound',}
  ],
})

export default router
///:pathMatch(.*)