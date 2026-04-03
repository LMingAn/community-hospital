<template>
  <PageContainer title="我的挂号" desc="查看个人所有挂号记录，并支持叫号前在线取消">
    <template #extra>
      <div class="page-toolbar">
        <div class="page-toolbar-left">
          <el-input v-model="keyword" placeholder="搜索挂号单号/医生/科室/状态" clearable class="page-search-input" />
        </div>
      </div>
    </template>
    <el-table :data="filteredList" border>
      <el-table-column label="挂号单号" min-width="180"><template #default="{ row }">{{ row.appointmentNo }}</template></el-table-column>
      <el-table-column label="就诊日期" width="180"><template #default="{ row }">{{ formatDateTime(row.visitDate) }}</template></el-table-column>
      <el-table-column prop="period" label="时段" width="90" />
      <el-table-column prop="queueNo" label="队列号" width="80" />
      <el-table-column prop="doctorName" label="医生" width="100" />
      <el-table-column prop="title" label="职称" width="110" />
      <el-table-column prop="departmentName" label="科室" width="110" />
      <el-table-column prop="fee" label="挂号费" width="90" />
      <el-table-column prop="triageResult" label="分诊建议" min-width="120" />
      <el-table-column label="状态" width="100"><template #default="{ row }"><span class="status-tag" :class="statusClass(row.status)">{{ row.status }}</span></template></el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button type="danger" plain size="small" class="keep-contrast-button stable-action-button" :disabled="row.status !== '待叫号'" @click="cancel(row)">取消挂号</el-button>
        </template>
      </el-table-column>
    </el-table>
  </PageContainer>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import { patientApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import { confirmAction, formatDateTime, statusClass, successTip } from '../../utils'
const list = ref([])
const keyword = ref('')
const filteredList = computed(() => {
  const q = keyword.value.trim()
  if (!q) return list.value
  return list.value.filter((row) => `${row.appointmentNo || ''}${row.doctorName || ''}${row.departmentName || ''}${row.status || ''}${formatDateTime(row.visitDate)}`.includes(q))
})
async function load() { 
  const res = await patientApi.appointments(); 
  list.value = res.data || [] 
}
async function cancel(row) { 
  await confirmAction(`确认取消 ${formatDateTime(row.visitDate)} ${row.period} 的挂号吗？`); 
  await patientApi.cancelAppointment(row.id); 
  successTip('挂号已取消'); 
  load() 
}
onMounted(load)
</script>