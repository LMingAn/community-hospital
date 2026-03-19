<template><PageContainer title="公告信息" desc="管理员可查看和新增系统公告"><el-form :model="form" label-width="80px"><el-form-item label="公告标题"><el-input v-model="form.title" /></el-form-item><el-form-item label="公告内容"><el-input v-model="form.content" type="textarea" :rows="4" /></el-form-item><el-form-item><el-button type="primary" @click="submit">发布公告</el-button></el-form-item></el-form><el-divider /><el-table :data="list" border><el-table-column prop="title" label="标题" min-width="180" /><el-table-column prop="content" label="内容" min-width="260" show-overflow-tooltip /><el-table-column prop="publishTime" label="发布时间" min-width="180" /><el-table-column label="状态" width="100"><template #default="{ row }"><span class="status-tag status-success">{{ row.status === 1 ? '已发布' : '停用' }}</span></template></el-table-column></el-table></PageContainer></template>
<script setup>
import { onMounted, reactive, ref } from 'vue'
import { adminApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import { successTip } from '../../utils'
const list = ref([]); const form = reactive({ title: '', content: '' })
async function load() { const res = await adminApi.announcements(); list.value = res.data }
async function submit() { await adminApi.createAnnouncement(form); successTip('公告发布成功'); form.title=''; form.content=''; load() }
onMounted(load)
</script>
