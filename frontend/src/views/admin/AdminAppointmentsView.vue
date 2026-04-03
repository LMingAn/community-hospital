<template>
    <PageContainer title="预约挂号" desc="支持预约挂号信息的增删查改">
        <div class="toolbar">
            <el-input v-model="keyword" placeholder="搜索挂号单号/患者/医生" clearable style="max-width:260px" />
            <el-button type="primary" @click="openCreate">新增挂号</el-button>
        </div>
        <el-table :data="filteredList" border>
            <el-table-column prop="appointmentNo" label="挂号单号" min-width="180" />
            <el-table-column label="就诊日期" min-width="180">
                <template #default="{ row }">{{ formatDateTime(row.visitDate) }}</template>
            </el-table-column>
            <el-table-column prop="period" label="时段" width="90" />
            <el-table-column prop="queueNo" label="序号" width="70" />
            <el-table-column prop="patientName" label="患者" width="110" />
            <el-table-column prop="doctorName" label="医生" width="110" />
            <el-table-column prop="departmentName" label="科室" width="110" />
            <el-table-column label="状态" width="110">
                <template #default="{ row }">
                    <span class="status-tag" :class="statusClass(row.status)">{{ row.status }}</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="180">
                <template #default="{ row }">
                    <el-button link type="primary" @click="openEdit(row)">编辑</el-button>
                    <el-button link type="danger" @click="remove(row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <el-dialog v-model="visible" :title="form.id ? '编辑挂号' : '新增挂号'" width="760px">
            <el-form :model="form" label-width="88px">
                <div class="form-grid">
                    <el-form-item label="挂号单号">
                        <el-input v-model="form.appointmentNo" />
                    </el-form-item>
                    <el-form-item label="患者">
                        <el-select v-model="form.patientId">
                            <el-option v-for="item in patients" :key="item.id" :label="item.name" :value="item.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="医生">
                        <el-select v-model="form.doctorId" @change="syncDepartment">
                            <el-option v-for="item in doctors" :key="item.id" :label="`${item.name}（${item.departmentName}）`" :value="item.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="科室">
                        <el-select v-model="form.departmentId">
                            <el-option v-for="item in departments" :key="item.id" :label="item.name" :value="item.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="就诊日期">
                        <el-date-picker v-model="form.visitDate" type="date" value-format="YYYY-MM-DD" />
                    </el-form-item>
                    <el-form-item label="时段">
                        <el-select v-model="form.period">
                            <el-option label="上午" value="上午" />
                            <el-option label="下午" value="下午" />
                            <el-option label="夜间" value="夜间" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="队列号">
                        <el-input-number v-model="form.queueNo" :min="1" />
                    </el-form-item>
                    <el-form-item label="挂号费">
                        <el-input-number v-model="form.fee" :min="0" />
                    </el-form-item>
                    <el-form-item label="状态">
                        <el-select v-model="form.status">
                            <el-option label="待叫号" value="待叫号" />
                            <el-option label="已叫号" value="已叫号" />
                            <el-option label="就诊中" value="就诊中" />
                            <el-option label="已完成" value="已完成" />
                            <el-option label="已取消" value="已取消" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="症状描述" class="span-2">
                        <el-input v-model="form.symptom" type="textarea" :rows="2" />
                    </el-form-item>
                    <el-form-item label="分诊建议" class="span-2">
                        <el-input v-model="form.triageResult" />
                    </el-form-item>
                </div>
            </el-form>
            <template #footer>
                <el-button @click="visible=false">取消</el-button>
                <el-button type="primary" @click="submit">保存</el-button>
            </template>
        </el-dialog>
    </PageContainer>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import PageContainer from '../../components/PageContainer.vue'
import { adminApi } from '../../api/modules'
import { formatDateTime, statusClass, confirmAction, successTip } from '../../utils'
const list = ref([]), doctors = ref([]), patients = ref([]), departments = ref([]), visible = ref(false), keyword = ref('')
const form = reactive({ id:'', appointmentNo:'', patientId:'', doctorId:'', departmentId:'', visitDate:'', period:'上午', queueNo:1, fee:15, symptom:'', triageResult:'', status:'待叫号' })
const filteredList = computed(() => list.value.filter(item => !keyword.value || `${item.appointmentNo}${item.patientName}${item.doctorName}`.includes(keyword.value)))
const reset = () => Object.assign(form, { id:'', appointmentNo:`YY${Date.now()}`, patientId:'', doctorId:'', departmentId:'', visitDate:'', period:'上午', queueNo:1, fee:15, symptom:'', triageResult:'', status:'待叫号' })
async function load(){ const [a,d,p,dep] = await Promise.all([adminApi.appointments(), adminApi.doctors(), adminApi.patients(), adminApi.departments()]); list.value = a.data || []; doctors.value = d.data || []; patients.value = p.data || []; departments.value = dep.data || [] }
function syncDepartment(id){ const doctor = doctors.value.find(item => item.id === id); if (doctor) form.departmentId = doctor.departmentId }
function openCreate(){ reset(); visible.value = true }
function openEdit(row){ Object.assign(form, row); visible.value = true }
async function submit(){ 
    if(form.id) 
        await adminApi.updateAppointment(form.id, form); 
    else 
        await adminApi.createAppointment(form); 
    successTip('保存成功'); 
    visible.value = false; 
    load() 
}
async function remove(row){ 
    await confirmAction(`确认删除挂号单 ${row.appointmentNo} 吗？`); 
    await adminApi.deleteAppointment(row.id); 
    successTip('删除成功'); 
    load() 
}
onMounted(load)
</script>