<template>
    <PageContainer title="患者信息" desc="管理员可对患者信息进行新增、编辑、删除和查询">
        <div class="toolbar">
            <el-input v-model="keyword" placeholder="搜索姓名/账号/手机号" clearable style="max-width:260px" />
            <el-button type="primary" @click="openCreate">新增患者</el-button>
        </div>
        <el-table :data="filteredList" border>
            <el-table-column prop="username" label="账号" width="120" />
            <el-table-column prop="name" label="姓名" width="110" />
            <el-table-column prop="gender" label="性别" width="80" />
            <el-table-column prop="age" label="年龄" width="80" />
            <el-table-column prop="phone" label="手机号" min-width="140" />
            <el-table-column label="状态" width="90"><template #default="{ row }"><span class="status-tag" :class="row.status === 1 ? 'status-success' : 'status-warning'">{{ row.status === 1 ? '正常' : '停用' }}</span></template></el-table-column>
            <el-table-column prop="createdAt" label="注册时间" min-width="180" />
            <el-table-column label="操作" width="180"><template #default="{ row }"><el-button link type="primary" @click="openEdit(row)">编辑</el-button><el-button link type="danger" @click="remove(row)">删除</el-button></template></el-table-column>
        </el-table>
        <el-dialog v-model="visible" :title="form.id ? '编辑患者' : '新增患者'" width="680px">
            <el-form :model="form" label-width="88px">
                <div class="form-grid">
                    <el-form-item label="账号"><el-input v-model="form.username" /></el-form-item>
                    <el-form-item :label="form.id ? '重置密码' : '登录密码'"><el-input v-model="form.password" placeholder="编辑时留空表示不修改密码" /></el-form-item>
                    <el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item>
                    <el-form-item label="性别"><el-select v-model="form.gender"><el-option label="男" value="男" /><el-option label="女" value="女" /></el-select></el-form-item>
                    <el-form-item label="年龄"><el-input-number v-model="form.age" :min="0" :max="120" /></el-form-item>
                    <el-form-item label="手机号"><el-input v-model="form.phone" /></el-form-item>
                    <el-form-item label="身份证号"><el-input v-model="form.idCard" /></el-form-item>
                    <el-form-item label="状态"><el-switch v-model="form.status" :active-value="1" :inactive-value="0" /></el-form-item>
                </div>
            </el-form><template #footer><el-button @click="visible=false">取消</el-button><el-button type="primary" @click="submit">保存</el-button></template>
        </el-dialog>
    </PageContainer>
</template>
<script setup>
import { computed, onMounted, reactive, ref } from 'vue'; 
import { adminApi } from '../../api/modules'; 
import PageContainer from '../../components/PageContainer.vue'; 
import { confirmAction, successTip } from '../../utils'
const list = ref([]), visible = ref(false), keyword = ref('');
const form = reactive({ id:'', username:'', password:'', name:'', gender:'男', age:18, phone:'', idCard:'', status:1 });
const filteredList = computed(() => list.value.filter(item => !keyword.value || `${item.username}${item.name}${item.phone}`.includes(keyword.value)));
const reset = () => Object.assign(form, { id:'', username:'', password:'', name:'', gender:'男', age:18, phone:'', idCard:'', status:1 });
async function load(){ 
    const res = await adminApi.patients(); 
    list.value = res.data || [] 
}
function openCreate(){ reset(); visible.value = true }
function openEdit(row){ Object.assign(form, { ...row, password:'' }); visible.value = true }
async function submit(){ 
    if(form.id) 
        await adminApi.updatePatient(form.id, form); 
    else 
        await adminApi.createPatient(form); 
    successTip('保存成功'); 
    visible.value = false; 
    load() 
}
async function remove(row){ 
    await confirmAction(`确认删除患者“${row.name}”吗？`); 
    await adminApi.deletePatient(row.id); 
    successTip('删除成功'); 
    load() 
}
onMounted(load)
</script>