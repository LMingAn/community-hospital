<template>
  <PageContainer title="我的挂号" desc="查看个人所有挂号记录，并支持叫号前在线取消">
    <el-table :data="list" border>
      <el-table-column prop="appointmentNo" label="挂号单号" min-width="180" />
      <el-table-column prop="visitDate" label="就诊日期" width="120" />
      <el-table-column prop="period" label="时段" width="90" />
      <el-table-column prop="queueNo" label="队列号" width="80" />
      <el-table-column prop="doctorName" label="医生" width="100" />
      <el-table-column prop="title" label="职称" width="110" />
      <el-table-column prop="departmentName" label="科室" width="110" />
      <el-table-column prop="fee" label="挂号费" width="90" />
      <el-table-column prop="triageResult" label="分诊建议" min-width="120" />
      <el-table-column label="状态" width="100"><template #default="{ row }"><span class="status-tag" :class="statusClass(row.status)">{{ row.status }}</span></template></el-table-column>
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="danger" plain size="small" :disabled="row.status !== '待叫号'" @click="cancel(row)">取消挂号</el-button>
        </template>
      </el-table-column>
    </el-table>
  </PageContainer>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { patientApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import { confirmAction, statusClass, successTip } from '../../utils'
const list = ref([])
async function load() { const res = await patientApi.appointments(); list.value = res.data || [] }
async function cancel(row) { await confirmAction(`确认取消 ${row.visitDate} ${row.period} 的挂号吗？`); await patientApi.cancelAppointment(row.id); successTip('挂号已取消'); load() }
onMounted(load)
</script>
