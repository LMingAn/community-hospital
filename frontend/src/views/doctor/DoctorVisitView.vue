<template>
  <PageContainer title="就诊处理" desc="医生可选择已叫号患者填写诊断、医嘱和住院建议">
    <div class="toolbar">
      <div class="left">
        <el-date-picker v-model="date" type="date" value-format="YYYY-MM-DD" />
        <el-button type="primary" @click="load">刷新患者列表</el-button>
      </div>
    </div>
    <el-row :gutter="18">
      <el-col :lg="10" :md="24" :sm="24">
        <div class="page-card page-block" style="height:100%;">
          <div class="section-title">待处理患者</div>
          <el-empty v-if="visitableRows.length === 0" description="暂无可处理患者" />
          <div v-for="item in visitableRows" :key="item.id" class="doctor-card" :style="selected?.id===item.id?'border-color:#8fb0ea;background:#f8fbff;':''">
            <div class="doctor-card-header">
              <div>
                <div style="font-weight:700;">{{ item.patientName }} <span class="muted">· {{ item.gender }} · {{ item.age || '-' }}岁</span></div>
                <div class="muted" style="margin-top:6px;">{{ item.visitDate }} {{ item.period }} ｜ 队列号 {{ item.queueNo }}</div>
              </div>
              <span class="status-tag" :class="statusClass(item.status)">{{ item.status }}</span>
            </div>
            <div class="muted" style="line-height:1.8; margin-bottom:12px;">症状：{{ item.symptom || '无' }}</div>
            <el-button type="primary" plain @click="selectRow(item)">选择此患者</el-button>
          </div>
        </div>
      </el-col>
      <el-col :lg="14" :md="24" :sm="24">
        <div class="page-card page-block">
          <div class="section-title">病历填写</div>
          <el-alert v-if="!selected" title="请先从左侧选择要处理的患者" type="info" :closable="false" show-icon style="margin-bottom:16px;" />
          <el-form :model="form" label-width="92px">
            <el-form-item label="当前患者">
              <el-input :model-value="selected ? `${selected.patientName}（${selected.appointmentNo}）` : ''" disabled placeholder="请先选择患者" />
            </el-form-item>
            <el-form-item label="诊断结果"><el-input v-model="form.diagnosis" placeholder="请输入诊断结果" /></el-form-item>
            <el-form-item label="处方信息"><el-input v-model="form.prescription" type="textarea" :rows="3" placeholder="请输入处方或用药建议" /></el-form-item>
            <el-form-item label="医嘱病历"><RichEditor v-model="form.adviceHtml" /></el-form-item>
            <el-form-item label="建议住院"><el-switch v-model="form.needHospitalization" /></el-form-item>
            <template v-if="form.needHospitalization">
              <div class="form-grid">
                <el-form-item label="病区"><el-input v-model="form.wardNo" placeholder="如：内科一区" /></el-form-item>
                <el-form-item label="床位"><el-input v-model="form.bedNo" placeholder="如：A-08" /></el-form-item>
              </div>
              <el-form-item label="住院原因"><el-input v-model="form.reasonText" type="textarea" :rows="3" placeholder="请输入住院原因" /></el-form-item>
            </template>
            <el-form-item>
              <el-button type="primary" :disabled="!selected" @click="submit">保存就诊记录</el-button>
            </el-form-item>
          </el-form>
        </div>
      </el-col>
    </el-row>
  </PageContainer>
</template>
<script setup>
import { computed, reactive, ref } from 'vue'
import { doctorApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import RichEditor from '../../components/RichEditor.vue'
import { statusClass, successTip } from '../../utils'
const date = ref(new Date().toISOString().slice(0, 10))
const list = ref([])
const selected = ref(null)
const form = reactive({ diagnosis: '', adviceHtml: '', prescription: '', needHospitalization: false, wardNo: '', bedNo: '', reasonText: '' })
const visitableRows = computed(() => (list.value || []).filter(item => ['待叫号', '已叫号', '就诊中'].includes(item.status)))
async function load() { const res = await doctorApi.appointments({ date: date.value }); list.value = res.data || []; if (selected.value) selected.value = list.value.find(i => i.id === selected.value.id) || null }
function selectRow(row) { selected.value = row; form.diagnosis=''; form.adviceHtml=`<p><strong>主诉：</strong>${row.symptom || '无明显主诉'}</p><p><strong>检查建议：</strong></p><p><strong>医嘱：</strong></p>`; form.prescription=''; form.needHospitalization=false; form.wardNo=''; form.bedNo=''; form.reasonText='' }
async function submit() { if (!selected.value) return; await doctorApi.saveVisit({ appointmentId: selected.value.id, ...form }); successTip('就诊记录保存成功'); selected.value = null; await load() }
load()
</script>
