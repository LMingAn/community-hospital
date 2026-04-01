<template>
  <PageContainer title="挂号患者" desc="查看当天挂自己号的患者信息">
    <template #extra>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <el-date-picker v-model="date" type="date" value-format="YYYY-MM-DD" />
        <el-button type="primary" @click="load">查询</el-button>
      </div>
    </template>
    <el-table :data="list" border>
      <el-table-column prop="appointmentNo" label="挂号单号" min-width="180" />
      <el-table-column prop="patientName" label="患者" width="100" />
      <el-table-column prop="gender" label="性别" width="80" />
      <el-table-column prop="age" label="年龄" width="80" />
      <el-table-column prop="phone" label="手机号" min-width="130" />
      <el-table-column prop="departmentName" label="科室" width="100" />
      <el-table-column prop="visitDate" label="就诊日期" width="120" />
      <el-table-column prop="period" label="时段" width="90" />
      <el-table-column prop="queueNo" label="队列号" width="80" />
      <el-table-column prop="symptom" label="症状描述" min-width="180" show-overflow-tooltip />
      <el-table-column label="状态" width="110"><template #default="{ row }"><span class="status-tag" :class="statusClass(row.status)">{{ row.status }}</span></template></el-table-column>
    </el-table>
  </PageContainer>
</template>
<script setup>
import { ref } from 'vue'
import { doctorApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import { statusClass } from '../../utils'
const date = ref(new Date().toISOString().slice(0, 10))
const list = ref([])
async function load() { const res = await doctorApi.appointments({ date: date.value }); list.value = res.data || [] }
load()
</script>
