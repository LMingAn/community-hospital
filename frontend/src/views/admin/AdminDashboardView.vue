<template><PageContainer title="首页概览" desc="展示医院预约平台的基础业务数据与今日排班情况"><div class="dashboard-grid"><StatCard title="医生总数" :value="stats.doctorCount" /><StatCard title="患者总数" :value="stats.patientCount" /><StatCard title="今日挂号" :value="stats.todayReg" /><StatCard title="累计就诊" :value="stats.visitCount" /><StatCard title="在院患者" :value="stats.hospitalCount" /></div><div style="height:18px;" /><el-table :data="stats.todayDoctors || []" border><el-table-column prop="departmentName" label="科室" /><el-table-column prop="doctorName" label="医生姓名" /><el-table-column prop="period" label="出诊时段" width="100" /><el-table-column prop="maxNumber" label="最大号源" width="100" /></el-table></PageContainer></template>
<script setup>
import { onMounted, reactive } from 'vue'
import { adminApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import StatCard from '../../components/StatCard.vue'
const stats = reactive({ doctorCount: 0, patientCount: 0, todayReg: 0, visitCount: 0, hospitalCount: 0, todayDoctors: [] })
onMounted(async () => { const res = await adminApi.stats(); Object.assign(stats, res.data) })
</script>
