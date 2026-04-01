<template>
  <PageContainer title="个人信息" desc="患者可修改姓名、性别、年龄、手机号和身份证号">
    <el-form :model="form" label-width="100px" style="max-width:760px">
      <div class="form-grid">
        <el-form-item label="患者账号"><el-input :model-value="form.username" disabled /></el-form-item>
        <el-form-item label="账户余额"><el-input :model-value="form.balance" disabled /></el-form-item>
        <el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="性别"><el-select v-model="form.gender"><el-option label="男" value="男" /><el-option label="女" value="女" /></el-select></el-form-item>
        <el-form-item label="年龄"><el-input-number v-model="form.age" :min="0" :max="120" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="身份证号" class="span-2"><el-input v-model="form.idCard" /></el-form-item>
        <el-form-item label="注册时间" class="span-2"><el-input :model-value="formatDateTime(form.createdAt)" disabled /></el-form-item>
      </div>
      <el-form-item><el-button type="primary" @click="submit">保存修改</el-button></el-form-item>
    </el-form>
  </PageContainer>
</template>
<script setup>
import { onMounted, reactive } from 'vue'
import { authApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import { formatDateTime, successTip } from '../../utils'
const form = reactive({ username:'', name:'', gender:'男', age:18, phone:'', idCard:'', balance:0, createdAt:'' })
async function load(){ const res = await authApi.patientProfile(); Object.assign(form, res.data || {}) }
async function submit(){ await authApi.updatePatientProfile({ name: form.name, gender: form.gender, age: form.age, phone: form.phone, idCard: form.idCard }); successTip('个人信息已更新'); load() }
onMounted(load)
</script>
