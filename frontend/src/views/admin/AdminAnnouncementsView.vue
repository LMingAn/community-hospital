<template>
  <PageContainer title="系统公告" desc="管理员可对系统公告进行新增、编辑、删除和查询">
    <div class="toolbar"><el-input v-model="keyword" placeholder="按标题搜索" clearable style="max-width:260px" /><el-button type="primary" @click="openCreate">新增公告</el-button></div>
    <el-table :data="filteredList" border>
      <el-table-column prop="title" label="标题" min-width="180" />
      <el-table-column prop="content" label="内容" min-width="260" show-overflow-tooltip />
      <el-table-column prop="publishTime" label="发布时间" min-width="180" />
      <el-table-column label="状态" width="100"><template #default="{ row }"><span class="status-tag" :class="row.status === 1 ? 'status-success' : 'status-warning'">{{ row.status === 1 ? '已发布' : '停用' }}</span></template></el-table-column>
      <el-table-column label="操作" width="180"><template #default="{ row }"><el-button link type="primary" @click="openEdit(row)">编辑</el-button><el-button link type="danger" @click="remove(row)">删除</el-button></template></el-table-column>
    </el-table>
    <el-dialog v-model="visible" :title="form.id ? '编辑公告' : '新增公告'" width="560px"><el-form :model="form" label-width="80px"><el-form-item label="标题"><el-input v-model="form.title" /></el-form-item><el-form-item label="内容"><el-input v-model="form.content" type="textarea" :rows="4" /></el-form-item><el-form-item label="状态"><el-switch v-model="form.status" :active-value="1" :inactive-value="0" /></el-form-item></el-form><template #footer><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="submit">保存</el-button></template></el-dialog>
  </PageContainer>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { adminApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import { confirmAction, successTip } from '../../utils'
const list = ref([]), visible = ref(false), keyword = ref('')
const form = reactive({ id: '', title: '', content: '', status: 1 })
const filteredList = computed(() => list.value.filter(item => !keyword.value || item.title.includes(keyword.value)))
const reset = () => Object.assign(form, { id: '', title: '', content: '', status: 1 })
async function load(){ const res = await adminApi.announcements(); list.value = res.data || [] }
function openCreate(){ reset(); visible.value = true }
function openEdit(row){ Object.assign(form, row); visible.value = true }
async function submit(){ if (form.id) await adminApi.updateAnnouncement(form.id, form); else await adminApi.createAnnouncement(form); successTip('保存成功'); visible.value = false; load() }
async function remove(row){ await confirmAction(`确认删除公告“${row.title}”吗？`); await adminApi.deleteAnnouncement(row.id); successTip('删除成功'); load() }
onMounted(load)
</script>
