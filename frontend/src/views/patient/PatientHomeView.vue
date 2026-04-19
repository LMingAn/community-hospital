<template>
  <PageContainer title="信息概览" desc="公开展示医院今日排班、系统公告与基础科室信息">
    <div class="page-split-grid">
      <div class="page-card page-block">
        <div class="section-title">系统公告</div>
        <div v-for="item in announcements" :key="item.id" class="timeline-item">
          <div class="timeline-title">{{ item.title }}</div>
          <div class="muted timeline-content">{{ item.content }}</div>
          <div class="muted">{{ item.publishTime }}</div>
        </div>
        <el-empty v-if="!announcements.length" description="暂无公告" />
      </div>
      <div class="page-card page-block">
        <div class="section-title">今日排班</div>
        <el-table :data="todayDoctors" border>
          <el-table-column prop="departmentName" label="科室" />
          <el-table-column prop="doctorName" label="医生姓名" />
          <el-table-column prop="title" label="职称" width="120" />
          <el-table-column prop="period" label="出诊时段" width="100" />
          <el-table-column prop="remainingNumber" label="剩余号源" width="100" />
        </el-table>
      </div>
    </div>
    <div class="page-card page-block" style="margin-top:18px;">
      <div class="section-title">科室信息</div>
      <el-table :data="departments" border>
        <el-table-column prop="name" label="科室名称" width="160" />
        <el-table-column prop="location" label="门诊位置" width="160" />
        <el-table-column prop="description" label="科室简介" min-width="240" show-overflow-tooltip />
      </el-table>
    </div>
  </PageContainer>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import PageContainer from '../../components/PageContainer.vue'
import { publicApi } from '../../api/modules'
const announcements = ref([])
const todayDoctors = ref([])
const departments = ref([])
onMounted(async () => {
  const [announcementRes, doctorRes, departmentRes] = await Promise.all([
    publicApi.announcements(),
    publicApi.todayDoctors(),
    publicApi.departments()
  ])
  announcements.value = announcementRes.data || []
  todayDoctors.value = doctorRes.data || []
  departments.value = departmentRes.data || []
})
</script>
