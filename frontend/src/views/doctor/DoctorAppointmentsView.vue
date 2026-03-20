<template>
  <PageContainer title="挂号患者" desc="查看当天挂自己号的患者挂号信息">
    <template #extra>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
        <el-date-picker v-model="date" type="date" value-format="YYYY-MM-DD" />
        <el-input v-model="keyword" placeholder="搜索挂号单号/患者/手机号/状态" clearable style="max-width: 320px" />
        <el-button type="primary" @click="load">刷新列表</el-button>
      </div>
    </template>
    <el-table :data="filteredList" border>
      <el-table-column prop="appointmentNo" label="挂号单号" min-width="180" />
      <el-table-column prop="patientName" label="患者姓名" width="110" />
      <el-table-column prop="gender" label="性别" width="80" />
      <el-table-column prop="age" label="年龄" width="80" />
      <el-table-column prop="phone" label="手机号" min-width="130" />
      <el-table-column label="就诊日期" min-width="180"><template #default="{ row }">{{ formatDateTime(row.visitDate) }}</template></el-table-column>
      <el-table-column prop="period" label="时段" width="90" />
      <el-table-column prop="queueNo" label="队列号" width="80" />
      <el-table-column prop="symptom" label="症状描述" min-width="180" show-overflow-tooltip />
      <el-table-column label="状态" width="100"><template #default="{ row }"><span class="status-tag" :class="statusClass(row.status)">{{ row.status }}</span></template></el-table-column>
    </el-table>
  </PageContainer>
</template>
<script setup>
import { computed, ref } from 'vue'
import { doctorApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import { formatDateTime, statusClass } from '../../utils'
const date = ref(new Date().toISOString().slice(0, 10))
const list = ref([])
const keyword = ref('')
const filteredList = computed(() => {
  const q = keyword.value.trim()
  if (!q) return list.value
  return list.value.filter((row) => `${row.appointmentNo || ''}${row.patientName || ''}${row.phone || ''}${row.status || ''}${row.symptom || ''}${formatDateTime(row.visitDate)}`.includes(q))
})
async function load() { const res = await doctorApi.appointments({ date: date.value }); list.value = res.data || [] }
load()
</script>