<template>
  <PageContainer title="患者叫号" desc="对当天待叫号患者执行叫号操作">
    <template #extra>
      <div class="page-toolbar">
        <div class="page-toolbar-left">
          <el-date-picker v-model="date" type="date" value-format="YYYY-MM-DD" />
          <el-input v-model="keyword" placeholder="搜索挂号单号/患者/状态" clearable class="page-search-input" />
        </div>
        <div class="page-toolbar-right">
          <el-button type="primary" @click="load">刷新列表</el-button>
        </div>
      </div>
    </template>
    <el-table :data="filteredList" border>
      <el-table-column prop="appointmentNo" label="挂号单号" min-width="180" />
      <el-table-column prop="patientName" label="患者姓名" width="110" />
      <el-table-column label="日期" min-width="180"><template #default="{ row }">{{ formatDateTime(row.visitDate) }}</template></el-table-column>
      <el-table-column prop="period" label="时段" width="90" />
      <el-table-column prop="queueNo" label="队列号" width="80" />
      <el-table-column prop="symptom" label="症状描述" min-width="180" show-overflow-tooltip />
      <el-table-column label="状态" width="100"><template #default="{ row }"><span class="status-tag" :class="statusClass(row.status)">{{ row.status }}</span></template></el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="primary" size="small" class="keep-contrast-button stable-action-button" :disabled="row.status !== '待叫号'" @click="callPatient(row)">叫号</el-button>
        </template>
      </el-table-column>
    </el-table>
  </PageContainer>
</template>
<script setup>
import { computed, ref } from 'vue'
import { doctorApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import { confirmAction, formatDateTime, statusClass, successTip } from '../../utils'
const date = ref(new Date().toISOString().slice(0, 10))
const list = ref([])
const keyword = ref('')
const filteredList = computed(() => {
  const q = keyword.value.trim()
  if (!q) return list.value
  return list.value.filter((row) => `${row.appointmentNo || ''}${row.patientName || ''}${row.status || ''}${row.symptom || ''}${formatDateTime(row.visitDate)}`.includes(q))
})
async function load() { const res = await doctorApi.appointments({ date: date.value }); list.value = res.data || [] }
async function callPatient(row) { await confirmAction(`确认叫号患者 ${row.patientName} 吗？`); await doctorApi.callPatient(row.id); successTip('叫号成功'); load() }
load()
</script>