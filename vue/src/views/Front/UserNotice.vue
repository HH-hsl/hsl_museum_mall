<template>
  <div>
    <div class="card" style="margin: 10px auto;width: 40%">
      <div style="padding-left: 15px;font-size: 24px;border-left: 5px solid #ffc8cf;align-items: center;" >系 统 公 告</div>
      <el-timeline style="max-width: 600px;margin-top: 20px">
        <el-timeline-item :timestamp="item.createTime" placement="top" color="rgb(255, 167, 167)" v-for="item in data.noticeData">
          <h4>{{ item.title }}</h4>
          <p>{{ item.content }}</p>
        </el-timeline-item>
      </el-timeline>
    </div>
  </div>
</template>

<script setup >
import {reactive} from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";

const data = reactive({
  user: JSON.parse(localStorage.getItem('code_user') || "{}"),
  noticeData:[],
})

const loadNotice = ()=>{
  request.get('/notice/selectAll').then(res=>{
    console.log(res.data)
    if(res.code === '200'){
      // data.noticeData = res.data.reverse();
      // if(data.noticeData.length >5) {
      //   data.noticeData= data.noticeData.slice(0,5)
      // }
      // 按创建时间降序排序并取前5条
      data.noticeData = res.data
          .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
          .slice(0, 5);
    }else {
      ElMessage.error(res.msg);
    }

  })
}
loadNotice()
</script>
