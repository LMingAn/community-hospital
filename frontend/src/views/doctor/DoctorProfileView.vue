<template>
  <PageContainer title="个人信息" desc="医生可修改姓名、性别、联系电话和个人简介">
    <el-form :model="form" label-width="100px" style="max-width:720px">
      <div class="form-grid">
        <el-form-item label="医生账号"><el-input :model-value="form.username" disabled /></el-form-item>
        <el-form-item label="所属科室"><el-input :model-value="form.departmentName" disabled /></el-form-item>
        <el-form-item label="职称"><el-input :model-value="form.title" disabled /></el-form-item>
        <el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="性别"><el-select v-model="form.gender"><el-option label="男" value="男" /><el-option label="女" value="女" /></el-select></el-form-item>
        <el-form-item label="联系电话"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="擅长方向"><el-input :model-value="form.specialty" disabled /></el-form-item>
        <el-form-item label="个人简介" class="span-2"><el-input v-model="form.intro" type="textarea" :rows="4" /></el-form-item>
      </div>
      <el-form-item><el-button type="primary" @click="submit">保存修改</el-button></el-form-item>
    </el-form>
  </PageContainer>
</template>
<script setup>
import { onMounted, reactive } from 'vue'
import { authApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import { successTip } from '../../utils'
const form = reactive({ username:'', name:'', gender:'男', title:'', departmentName:'', specialty:'', phone:'', intro:'' })
async function load(){ 
  const res = await authApi.doctorProfile(); 
  Object.assign(form, res.data || {}) 
}
async function submit(){ 
  await authApi.updateDoctorProfile({ name: form.name, gender: form.gender, phone: form.phone, intro: form.intro }); 
  successTip('个人信息已更新'); 
  load() 
}
onMounted(load)
</script>
