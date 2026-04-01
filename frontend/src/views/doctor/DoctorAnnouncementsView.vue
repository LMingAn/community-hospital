<template>
  <PageContainer title="系统公告" desc="查看平台发布的最新公告与就诊通知">
    <el-timeline>
      <el-timeline-item v-for="item in list" :key="item.id" :timestamp="item.publishTime?.slice?.(0, 16)">
        <div style="font-weight:700;margin-bottom:6px;">{{ item.title }}</div>
        <div class="muted" style="line-height:1.8;">{{ item.content }}</div>
      </el-timeline-item>
    </el-timeline>
  </PageContainer>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { doctorApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
const list = ref([])
onMounted(async () => { const res = await doctorApi.announcements(); list.value = res.data || [] })
</script>
