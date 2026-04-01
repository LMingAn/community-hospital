<template>
  <PageContainer title="住院登记" desc="支持住院登记信息的新增、查询、编辑与删除">
    <template #extra>
      <div class="toolbar">
        <el-input v-model="keyword" placeholder="搜索患者/病区/床位/状态" clearable style="max-width:280px" />
        <el-button type="primary" @click="openCreate">新增住院登记</el-button>
      </div>
    </template>
    <el-table :data="filteredList" border>
      <el-table-column prop="patientName" label="患者" width="110" />
      <el-table-column prop="wardNo" label="病区" width="110" />
      <el-table-column prop="bedNo" label="床位" width="110" />
      <el-table-column prop="reasonText" label="住院原因" min-width="220" />
      <el-table-column prop="status" label="状态" width="110"><template #default="{ row }"><span class="status-tag" :class="statusClass(row.status)">{{ row.status }}</span></template></el-table-column>
      <el-table-column prop="createdAt" label="登记时间" min-width="180" />
      <el-table-column label="操作" width="180"><template #default="{ row }"><el-button link type="primary" @click="openEdit(row)">编辑</el-button><el-button link type="danger" @click="remove(row)">删除</el-button></template></el-table-column>
    </el-table>
    <el-dialog v-model="visible" :title="form.id ? '编辑住院登记' : '新增住院登记'" width="640px">
      <el-form :model="form" label-width="88px">
        <div class="form-grid">
          <el-form-item label="患者"><el-select v-model="form.patientId"><el-option v-for="item in patients" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
          <el-form-item label="就诊记录"><el-select v-model="form.visitRecordId"><el-option v-for="item in visits" :key="item.id" :label="`${item.appointmentNo} / ${item.patientName}`" :value="item.id" /></el-select></el-form-item>
          <el-form-item label="病区"><el-input v-model="form.wardNo" /></el-form-item>
          <el-form-item label="床位"><el-input v-model="form.bedNo" /></el-form-item>
          <el-form-item label="住院原因" class="span-2"><el-input v-model="form.reasonText" type="textarea" :rows="3" /></el-form-item>
          <el-form-item label="状态"><el-select v-model="form.status"><el-option label="待入院" value="待入院" /><el-option label="住院中" value="住院中" /><el-option label="已出院" value="已出院" /></el-select></el-form-item>
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
import { statusClass, confirmAction, successTip } from '../../utils'
const list = ref([]), patients = ref([]), visits = ref([]), visible = ref(false), keyword = ref('')
const filteredList = computed(() => {
  const q = keyword.value.trim()
  if (!q) return list.value
  return list.value.filter((row) => `${row.patientName || ''}${row.wardNo || ''}${row.bedNo || ''}${row.reasonText || ''}${row.status || ''}${row.createdAt || ''}`.includes(q))
})
const form = reactive({ id:'', patientId:'', visitRecordId:'', wardNo:'', bedNo:'', reasonText:'', status:'待入院' })
const reset = () => Object.assign(form, { id:'', patientId:'', visitRecordId:'', wardNo:'', bedNo:'', reasonText:'', status:'待入院' })
async function load(){ const [hRes,pRes,vRes] = await Promise.all([adminApi.hospitalizations(), adminApi.patients(), adminApi.visits()]); list.value = hRes.data || []; patients.value = pRes.data || []; visits.value = vRes.data || [] }
function openCreate(){ reset(); visible.value = true }
function openEdit(row){ Object.assign(form, row); visible.value = true }
async function submit(){ if(form.id) await adminApi.updateHospitalization(form.id, form); else await adminApi.createHospitalization(form); successTip('保存成功'); visible.value = false; load() }
async function remove(row){ await confirmAction(`确认删除 ${row.patientName} 的住院登记吗？`); await adminApi.deleteHospitalization(row.id); successTip('删除成功'); load() }
onMounted(load)
</script>