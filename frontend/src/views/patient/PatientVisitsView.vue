<template>
  <PageContainer title="我的就诊" desc="查看个人历史就诊记录、医嘱和处方信息">
    <el-collapse>
      <el-collapse-item v-for="item in list" :key="item.id" :title="`${formatDateTime(item.visitDate)} ｜ ${item.doctorName} ｜ ${item.diagnosis || '未填写诊断'}`" :name="item.id">
        <div class="info-grid" style="margin-bottom:14px;">
          <div class="info-item"><label>挂号单号</label><div>{{ item.appointmentNo }}</div></div>
          <div class="info-item"><label>就诊时间</label><div>{{ formatDateTime(item.createdAt || item.visitDate) }}</div></div>
          <div class="info-item"><label>就诊医生</label><div>{{ item.doctorName }}</div></div>
          <div class="info-item"><label>诊断结果</label><div>{{ item.diagnosis || '-' }}</div></div>
          <div class="info-item"><label>处方信息</label><div>{{ item.prescription || '-' }}</div></div>
        </div>
        <div class="page-card page-block">
          <div class="section-title">医嘱病历</div>
          <div v-html="item.adviceHtml || '<p>暂无医嘱内容</p>'" class="rich-content" style="min-height:auto;border:1px solid var(--line);border-radius:8px;"></div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </PageContainer>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { patientApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import { formatDateTime } from '../../utils'
const list = ref([])
onMounted(async () => { const res = await patientApi.visits(); list.value = res.data || [] })
</script>
