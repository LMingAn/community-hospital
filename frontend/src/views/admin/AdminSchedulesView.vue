<template>
  <PageContainer title="医生排班" desc="按星期几与时段统一管理医生排班">
    <div class="toolbar">
      <div class="left">
        <el-input v-model="filters.doctorName" placeholder="搜索医生名称" clearable style="width: 180px" />
        <el-select v-model="filters.weekday" placeholder="星期几" clearable style="width: 140px">
          <el-option v-for="n in 7" :key="n" :label="weekdayLabel(n)" :value="n" />
        </el-select>
        <el-select v-model="filters.departmentName" placeholder="科室" clearable style="width: 160px">
          <el-option v-for="item in departmentOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </div>
      <div class="right">
        <el-button class="neutral-fixed-button" @click="resetFilters">重置</el-button>
        <el-button type="primary" @click="openCreate">新增排班</el-button>
      </div>
    </div>
    <el-table :data="filteredList" border>
      <el-table-column prop="departmentName" label="科室" />
      <el-table-column prop="doctorName" label="医生" />
      <el-table-column label="星期" width="100"><template #default="{ row }">{{ weekdayLabel(row.weekday) }}</template></el-table-column>
      <el-table-column prop="period" label="时段" width="100" />
      <el-table-column prop="maxNumber" label="号源" width="90" />
      <el-table-column prop="fee" label="费用" width="90" />
      <el-table-column label="状态" width="90"><template #default="{ row }"><span class="status-tag" :class="row.status === 1 ? 'status-success' : 'status-warning'">{{ row.status === 1 ? '正常' : '停用' }}</span></template></el-table-column>
      <el-table-column label="操作" width="180"><template #default="{ row }"><el-button link type="primary" @click="openEdit(row)">编辑</el-button><el-button link type="danger" @click="remove(row)">删除</el-button></template></el-table-column>
    </el-table>
    <el-dialog v-model="visible" :title="form.id ? '编辑排班' : '新增排班'" width="620px">
      <el-form :model="form" label-width="88px"><div class="form-grid"><el-form-item label="医生"><el-select v-model="form.doctorId"><el-option v-for="item in doctors" :key="item.id" :label="`${item.name}（${item.departmentName}）`" :value="item.id" /></el-select></el-form-item><el-form-item label="星期"><el-select v-model="form.weekday"><el-option v-for="n in 7" :key="n" :label="weekdayLabel(n)" :value="n" /></el-select></el-form-item><el-form-item label="时段"><el-select v-model="form.period"><el-option label="上午" value="上午" /><el-option label="下午" value="下午" /><el-option label="夜间" value="夜间" /></el-select></el-form-item><el-form-item label="最大号源"><el-input-number v-model="form.maxNumber" :min="1" :max="100" /></el-form-item><el-form-item label="挂号费用"><el-input-number v-model="form.fee" :min="1" :max="500" /></el-form-item><el-form-item label="状态"><el-switch v-model="form.status" :active-value="1" :inactive-value="0" /></el-form-item></div></el-form><template #footer><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="submit">保存</el-button></template></el-dialog>
  </PageContainer>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'; import { adminApi } from '../../api/modules'; import PageContainer from '../../components/PageContainer.vue'; import { successTip, weekdayLabel, confirmAction } from '../../utils'
const list = ref([]); const doctors = ref([]); const visible = ref(false); const form = reactive({ id:'', doctorId: '', weekday: 1, period: '上午', maxNumber: 20, fee: 15, status:1 })
const filters = reactive({ doctorName: '', weekday: '', departmentName: '' })
const departmentOptions = computed(() => [...new Set((list.value || []).map((item) => item.departmentName).filter(Boolean))])
const filteredList = computed(() => (list.value || []).filter((item) => {
  const doctorOk = !filters.doctorName || item.doctorName?.includes(filters.doctorName.trim())
  const weekdayOk = !filters.weekday || Number(item.weekday) === Number(filters.weekday)
  const departmentOk = !filters.departmentName || item.departmentName === filters.departmentName
  return doctorOk && weekdayOk && departmentOk
}))
const reset = () => Object.assign(form, { id:'', doctorId:'', weekday:1, period:'上午', maxNumber:20, fee:15, status:1 })
const resetFilters = () => Object.assign(filters, { doctorName: '', weekday: '', departmentName: '' })
async function loadAll() { const [scheduleRes, doctorRes] = await Promise.all([adminApi.schedules(), adminApi.doctors()]); list.value = scheduleRes.data || []; doctors.value = doctorRes.data || [] }
function openCreate(){ reset(); visible.value = true }
function openEdit(row){ Object.assign(form, row); visible.value = true }
async function submit() { if(form.id) await adminApi.updateSchedule(form.id, form); else await adminApi.createSchedule(form); successTip('保存成功'); visible.value = false; loadAll() }
async function remove(row){ await confirmAction(`确认删除 ${row.doctorName} 的排班吗？`); await adminApi.deleteSchedule(row.id); successTip('删除成功'); loadAll() }
onMounted(loadAll)
</script>
