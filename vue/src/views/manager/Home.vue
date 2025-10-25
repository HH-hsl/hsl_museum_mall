<template>
  <div>
    <div class="card" style="margin-bottom: 10px;" v-if="data.user.role === 'USER'">
      <el-icon><House /></el-icon>
     <span style="margin-left: 5px;align-items: center;font-size: 14px;"> 你好，欢迎进入博物馆文创产品在线展销系统！</span>
    </div>
<!--    系统通知-->
    <div class="card" style="margin-bottom: 5px;width: 50%" v-if="data.user.role === 'USER'">
      <div style="padding-left: 20px;font-size: 16px;margin-bottom: 5px;padding-bottom: 5px;" >系 统 公 告</div>
      <el-timeline style="max-width: 600px">
        <el-timeline-item :timestamp="item.createTime" placement="top" color="rgb(255, 167, 167)" v-for="item in data.noticeData">
          <h4>{{ item.title }}</h4>
          <p>{{ item.content }}</p>
        </el-timeline-item>
      </el-timeline>
    </div>

<!--    框型统计-->
    <div style="display: flex;grid-gap: 15px">
      <div class="card" style="width: 25%;height: 120px;display: flex">
        <img src="@/assets/imgs/文创周边.png" style="width: 90px;height: 90px;margin: 5px 0 0 20px" >
        <div style="flex: 1;grid-gap: 10px;margin-top: 15px;">
          <div style="font-size: 24px;font-weight: bold;" :align="'center'">博物馆数量</div>
          <div style="font-size: 24px;font-weight: bold;margin-left: 60px">{{ data.museumCount }}</div>
        </div>
      </div>
      <div class="card" style="width: 25%;height: 120px;display: flex">
        <img src="@/assets/imgs/商品.png" style="width: 90px;height: 90px;margin: 5px 0 0 20px" alt="">
        <div style="flex: 1;grid-gap: 10px;margin-top: 15px;">
          <div style="font-size: 24px;font-weight: bold;" :align="'right'">在售文创产品数量</div>
          <div style="font-size: 24px;font-weight: bold;margin-left: 40px">{{ data.productCount }}</div>
        </div>
      </div>
      <div class="card" style="width: 25%;height: 120px;display: flex">
        <img src="@/assets/imgs/发帖.png" style="width: 90px;height: 90px;margin: 5px 0 0 20px" alt="">
        <div style="flex: 1;grid-gap: 10px;margin-top: 15px;">
          <div style="font-size: 24px;font-weight: bold;" :align="'center'">在线发帖数量</div>
          <div style="font-size: 24px;font-weight: bold;margin-left: 50px">{{ data.postCount }}</div>
        </div>
      </div>
      <div class="card" style="width: 25%;height: 120px;display: flex">
        <img src="@/assets/imgs/金额.png" style="width: 90px;height: 90px;margin: 5px 0 0 20px" alt="">
        <div style="flex: 1;grid-gap: 10px;margin-top: 15px;">
          <div style="font-size: 24px;font-weight: bold;" :align="'center'">文创订单金额</div>
          <div style="font-size: 24px;font-weight: bold;margin-left: 50px">{{ data.orderCount }}</div>
        </div>
      </div>

    </div>
<!--    数据统计-->
    <div style="margin-top: 10px;"  >
      <div class="card" >
        <div  id="line" style="height: 300px" ></div>
      </div>
      <div style="display: flex;margin-top: 10px;grid-gap: 10px" >
        <div class="card"  id="pie" style="height: 350px;width: 45%;"></div>
        <div class="card"  id="bar" style="height: 350px;width: 55%;"></div>
      </div>
    </div>

  </div>
</template>


<script setup>
import {reactive,onMounted} from "vue";
import request from "@/utils/request.js";
import {ElMessage} from "element-plus";
import * as echarts from "echarts";



const data = reactive({
  user: JSON.parse(localStorage.getItem('code_user') || "{}"),
  noticeData:[],
  museumCount:null,
  productCount:null,
  postCount:null,
  orderCount:null
})

const loadData = ()=> {
  request.get('/echarts/count').then(res => {
    if (res.code === '200') {
      data.museumCount = res.data.museumCount;
      data.productCount = res.data.productCount;
      data.postCount = res.data.postCount;
      request.get('/echarts/totalOrderAmount').then(res => {
        if (res.code === '200') {
          data.orderCount = res.data;
        }
      });
    } else {
      ElMessage.error(res.msg);
    }
  })
}
loadData()

const loadNotice = ()=>{
  request.get('/notice/selectAll').then(res=>{
    if(res.code === '200'){
      data.noticeData = res.data.reverse();
      if(data.noticeData.length >3) {
        data.noticeData= data.noticeData.slice(0,3)
      }
    }else {
      ElMessage.error(res.msg);
    }

  })
}
loadNotice()


const loadPie = () =>{
  request.get('/echarts/pie').then(res=>{
    if(res.code === '200'){
      let chartDom = document.getElementById('pie');
      let myChart = echarts.init(chartDom);
      pieOption.series[0].data = res.data;
      myChart.setOption(pieOption);
    }
  })
}

// 饼图
let pieOption = {
  title: {
    text: '不同博物馆在售文创产品数量饼状图',
    subtext: '统计维度：博物馆名称',
    left: 'center'
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      name: '数量占比',
      type: 'pie',
      radius: '50%',
      center: ['50%', '60%'],
      data: [
        { value: 1048, name: 'Search Engine' },
        { value: 735, name: 'Direct' },
        { value: 580, name: 'Email' },
        { value: 484, name: 'Union Ads' },
        { value: 300, name: 'Video Ads' }
      ],
    }
  ]
};

const loadBar = () =>{
  request.get('/echarts/bar').then(res=>{
    if(res.code === '200'){
      let chartDom = document.getElementById('bar');
      let myChart = echarts.init(chartDom);
      barOption.xAxis.data = res.data.xAxis;
      barOption.series[0].data = res.data.yAxis;
      myChart.setOption(barOption);
    }
  })
}


let barOption = {
  title: {
    text: '销量排行前10的文创产品',
    subtext: '统计维度：文创产品名称',
    left: 'center'
  },
  grid: {
    bottom: '30%'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  xAxis: {
    type: 'category',
    data: [],
    name:'产品名称',
    axisLabel: {
      show: true,
      interval: 0,
      inside: false,
      margin: 6,
      formatter: function (value) {
        // 每8个字换行
        let formattedValue = '';
        for (let i = 0; i < value.length; i += 4) {
          formattedValue += value.substring(i, i + 4) + '\n';
        }
        return formattedValue;
      }
    }
  },
  yAxis: {
    type: 'value',
    name: '销量',
  },
  series: [
    {
      name: '销量',
      radius: '50%',
      center: ['50%', '60%'],
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar'
    }
  ],
  tooltip: {
    trigger: 'axis',
    formatter: function (params) {
      // 鼠标悬停时显示完整标签，并支持换行
      let tooltipText = '';
      params.forEach(function (item) {
        let formattedName = '';
        for (let i = 0; i < item.name.length; i += 8) {
          formattedName += item.name.substring(i, i + 8) + '\n';
        }
        tooltipText += '产品名称: ' + formattedName + '<br/>';
        tooltipText += '销量: ' + item.value + '<br/>';
      });
      return tooltipText;
    }
  }
};

const loadLine = () =>{
  request.get('/echarts/line').then(res=>{
    if(res.code === '200'){
      let chartDom = document.getElementById('line');
      let myChart = echarts.init(chartDom);
      lineOption.xAxis.data = res.data.xAxis;
      lineOption.series[0].data = res.data.yAxis;
      myChart.setOption(lineOption);
    }
  })
}

// 折线图
let lineOption = {
  title: {
    text: '近一周每日发帖数量折线图',
    // subtext: '统计维度：',
    left: 'center'
  },
  grid: {
    bottom: '30%'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    name:'日期',
    axisLabel: {
      show: true,
      interval: 0,
      inside: false,
      margin: 6,
    }
  },
  yAxis: {
    type: 'value',
    name: '销量',
  },
  series: [
    {
      name: '发帖数量',
      radius: '50%',
      center: ['50%', '60%'],
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'line',
      smooth: true
    }
  ]
};

onMounted(()=>{
  loadPie();
  loadBar();
  loadLine();
})


</script>
