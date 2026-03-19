<template>
  <PageContainer title="住院登记" desc="查看本人住院安排、病区和床位信息">
    <el-table :data="list" border>
      <el-table-column prop="doctorName" label="就诊医生" width="110" />
      <el-table-column prop="diagnosis" label="诊断结果" min-width="180" />
      <el-table-column prop="wardNo" label="病区" width="110" />
      <el-table-column prop="bedNo" label="床位" width="110" />
      <el-table-column prop="reasonText" label="住院原因" min-width="220" />
      <el-table-column label="状态" width="100"><template #default="{ row }"><span class="status-tag" :class="statusClass(row.status)">{{ row.status }}</span></template></el-table-column>
      <el-table-column label="登记时间" min-width="180"><template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template></el-table-column>
    </el-table>
  </PageContainer>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { patientApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import { formatDateTime, statusClass } from '../../utils'
const list = ref([])
onMounted(async () => { const res = await patientApi.hospitalizations(); list.value = res.data || [] })
</script>
