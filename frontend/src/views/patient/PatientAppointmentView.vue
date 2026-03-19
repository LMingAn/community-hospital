<template>
  <PageContainer title="预约挂号" desc="查看当天在号医生并在线完成挂号">
    <div class="toolbar">
      <div class="left">
        <el-date-picker v-model="date" type="date" value-format="YYYY-MM-DD" />
        <el-select v-model="departmentId" placeholder="全部科室" clearable style="width: 180px;">
          <el-option v-for="item in departments" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <el-button type="primary" @click="loadDoctors">查询医生</el-button>
      </div>
    </div>

    <div class="doctor-card-grid">
      <div v-for="item in filteredDoctors" :key="`${item.scheduleId}-${item.visitDate}`" class="doctor-card">
        <div class="doctor-card-header">
          <div>
            <div style="font-size:18px;font-weight:700;">{{ item.doctorName }} <span class="muted">· {{ item.title }}</span></div>
            <div class="muted" style="margin-top:6px;">{{ item.departmentName }} ｜ {{ item.period }} ｜ {{ formatDateTime(item.visitDate) }}</div>
          </div>
          <span class="status-tag" :class="statusClass(getDoctorHeat(item))">{{ getDoctorHeat(item) }}</span>
        </div>
        <div class="muted" style="line-height:1.8;">擅长：{{ item.specialty || '暂无简介' }}</div>
        <div style="margin: 10px 0 14px; line-height:1.8;">
          <div>挂号费：<strong>￥{{ item.fee }}</strong></div>
          <div>号源余量：<strong>{{ item.remainingNumber }}</strong> / {{ item.maxNumber }}</div>
        </div>
        <el-input v-model="symptomMap[item.scheduleId]" type="textarea" :rows="3" placeholder="请输入症状描述，用于挂号和分诊建议" />
        <div style="margin-top:14px;display:flex;justify-content:space-between;gap:10px;align-items:center;">
          <div class="muted">系统将自动生成队列号</div>
          <el-button type="primary" :disabled="item.remainingNumber <= 0" @click="submitAppointment(item)">立即挂号</el-button>
        </div>
      </div>
    </div>
  </PageContainer>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import { patientApi, publicApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import { formatDateTime, getDoctorHeat, statusClass, successTip } from '../../utils'
const date = ref(new Date().toISOString().slice(0, 10))
const departmentId = ref('')
const doctors = ref([])
const departments = ref([])
const symptomMap = ref({})
const filteredDoctors = computed(() => {
  if (!departmentId.value) return doctors.value
  return doctors.value.filter(item => String(item.departmentId) === String(departmentId.value))
})
async function loadDoctors() { const res = await patientApi.todayDoctors({ date: date.value }); doctors.value = res.data || [] }
async function submitAppointment(item) {
  await patientApi.createAppointment({ doctorId: item.doctorId, departmentId: item.departmentId, visitDate: item.visitDate, period: item.period, symptom: symptomMap.value[item.scheduleId] || '' })
  successTip('挂号成功')
  await loadDoctors()
}
onMounted(async () => { const depRes = await publicApi.departments(); departments.value = depRes.data || []; await loadDoctors() })
</script>
