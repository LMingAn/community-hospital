<template>
  <PageContainer title="我的排班" desc="按星期和时段查看当前医生排班安排">
    <el-table :data="list" border>
      <el-table-column label="星期" width="110">
        <template #default="{ row }">{{ weekdayLabel(row.weekday) }}</template>
      </el-table-column>
      <el-table-column prop="period" label="出诊时段" width="120" />
      <el-table-column prop="maxNumber" label="最大号源" width="100" />
      <el-table-column prop="fee" label="挂号费" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }"><span class="status-tag" :class="row.status === 1 ? 'status-success' : 'status-warning'">{{ row.status === 1 ? '正常' : '停用' }}</span></template>
      </el-table-column>
    </el-table>
  </PageContainer>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { doctorApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import { weekdayLabel } from '../../utils'
const list = ref([])
onMounted(async () => { 
  const res = await doctorApi.schedules(); 
  list.value = res.data || [] 
})
</script>
