<template>
  <PageContainer title="患者就诊" desc="支持就诊信息的新增、查询、编辑与删除">
    <template #extra>
      <div class="page-toolbar">
        <div class="page-toolbar-left">
          <el-input v-model="keyword" placeholder="搜索挂号单号/患者/医生/诊断" clearable class="page-search-input" />
        </div>
        <div class="page-toolbar-right">
          <el-button type="primary" @click="openCreate">新增就诊记录</el-button>
        </div>
      </div>
    </template>
    <el-table :data="filteredList" border>
      <el-table-column prop="appointmentNo" label="挂号单号" min-width="180" />
      <el-table-column prop="patientName" label="患者" width="110" />
      <el-table-column prop="doctorName" label="医生" width="110" />
      <el-table-column prop="diagnosis" label="诊断结果" min-width="180" />
      <el-table-column prop="prescription" label="处方信息" min-width="180" show-overflow-tooltip />
      <el-table-column label="是否住院" width="100"><template #default="{ row }"><span class="status-tag" :class="row.needHospitalization ? 'status-warning' : 'status-success'">{{ row.needHospitalization ? '是' : '否' }}</span></template></el-table-column>
      <el-table-column prop="createdAt" label="就诊时间" min-width="180" />
      <el-table-column label="操作" width="180"><template #default="{ row }"><el-button link type="primary" @click="openEdit(row)">编辑</el-button><el-button link type="danger" @click="remove(row)">删除</el-button></template></el-table-column>
    </el-table>
    <el-dialog v-model="visible" :title="form.id ? '编辑就诊记录' : '新增就诊记录'" width="720px">
      <el-form :model="form" label-width="88px">
        <div class="form-grid">
          <el-form-item label="挂号单号"><el-select v-model="form.appointmentId" @change="syncAppointment"><el-option v-for="item in appointments" :key="item.id" :label="item.appointmentNo" :value="item.id" /></el-select></el-form-item>
          <el-form-item label="患者"><el-select v-model="form.patientId"><el-option v-for="item in patients" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
          <el-form-item label="医生"><el-select v-model="form.doctorId"><el-option v-for="item in doctors" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
          <el-form-item label="诊断结果"><el-input v-model="form.diagnosis" /></el-form-item>
          <el-form-item label="处方信息" class="span-2"><el-input v-model="form.prescription" type="textarea" :rows="3" /></el-form-item>
          <el-form-item label="医嘱病历" class="span-2"><el-input v-model="form.adviceHtml" type="textarea" :rows="4" /></el-form-item>
          <el-form-item label="建议住院"><el-switch v-model="form.needHospitalization" /></el-form-item>
        </div>
      </el-form>
      <template #footer><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="submit">保存</el-button></template>
    </el-dialog>
  </PageContainer>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { adminApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import { confirmAction, successTip } from '../../utils'
const list = ref([]), appointments = ref([]), patients = ref([]), doctors = ref([]), visible = ref(false), keyword = ref('')
const filteredList = computed(() => {
  const q = keyword.value.trim()
  if (!q) return list.value
  return list.value.filter((row) => `${row.appointmentNo || ''}${row.patientName || ''}${row.doctorName || ''}${row.diagnosis || ''}${row.prescription || ''}${row.createdAt || ''}`.includes(q))
})
const form = reactive({ id:'', appointmentId:'', patientId:'', doctorId:'', diagnosis:'', adviceHtml:'', prescription:'', needHospitalization:false })
const reset = () => Object.assign(form, { id:'', appointmentId:'', patientId:'', doctorId:'', diagnosis:'', adviceHtml:'', prescription:'', needHospitalization:false })
async function load(){ const [visitRes, appointmentRes, patientRes, doctorRes] = await Promise.all([adminApi.visits(), adminApi.appointments(), adminApi.patients(), adminApi.doctors()]); list.value = visitRes.data || []; appointments.value = appointmentRes.data || []; patients.value = patientRes.data || []; doctors.value = doctorRes.data || [] }
function syncAppointment(id){ const row = appointments.value.find(item => item.id === id); if(row){ form.patientId = row.patientId; form.doctorId = row.doctorId } }
function openCreate(){ reset(); visible.value = true }
function openEdit(row){ Object.assign(form, row, { needHospitalization: !!row.needHospitalization }); visible.value = true }
async function submit(){ if(form.id) await adminApi.updateVisit(form.id, form); else await adminApi.createVisit(form); successTip('保存成功'); visible.value = false; load() }
async function remove(row){ await confirmAction(`确认删除挂号单 ${row.appointmentNo} 的就诊记录吗？`); await adminApi.deleteVisit(row.id); successTip('删除成功'); load() }
onMounted(load)
</script>