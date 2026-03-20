<template>
  <PageContainer title="首页展示" desc="展示医院预约平台的基础业务数据、系统公告与今日排班情况">
    <div class="dashboard-grid">
      <StatCard title="医生总数" :value="stats.doctorCount" />
      <StatCard title="患者总数" :value="stats.patientCount" />
      <StatCard title="今日挂号" :value="stats.todayReg" />
      <StatCard title="累计就诊" :value="stats.visitCount" />
      <StatCard title="在院患者" :value="stats.hospitalCount" />
    </div>
    <div class="page-split-grid" style="margin-top:18px;">
      <div class="page-card page-block">
        <div class="section-title">系统公告</div>
        <div v-for="item in stats.announcements || []" :key="item.id" class="timeline-item">
          <div class="timeline-title">{{ item.title }}</div>
          <div class="muted" style="margin:6px 0;">{{ item.content }}</div>
          <div class="muted">{{ item.publishTime }}</div>
        </div>
      </div>
      <div class="page-card page-block">
        <div class="section-title">今日排班</div>
        <el-table :data="stats.todayDoctors || []" border>
          <el-table-column prop="departmentName" label="科室" />
          <el-table-column prop="doctorName" label="医生姓名" />
          <el-table-column prop="period" label="出诊时段" width="100" />
          <el-table-column prop="maxNumber" label="最大号源" width="100" />
        </el-table>
      </div>
    </div>
  </PageContainer>
</template>
<script setup>
import { onMounted, reactive } from 'vue'
import { adminApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import StatCard from '../../components/StatCard.vue'
const stats = reactive({ doctorCount: 0, patientCount: 0, todayReg: 0, visitCount: 0, hospitalCount: 0, todayDoctors: [], announcements: [] })
onMounted(async () => { const res = await adminApi.stats(); Object.assign(stats, res.data) })
</script>
