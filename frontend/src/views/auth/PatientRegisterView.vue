<template>
  <div class="auth-wrap"><div class="auth-card"><section class="auth-cover"><h1>患者注册</h1><p>注册后即可登录患者端，完成在线挂号、预约取消、查看就诊记录与住院信息等操作。</p></section><section class="auth-panel"><PageContainer title="患者注册" desc="请填写基础个人信息"><el-form :model="form" label-width="92px"><div class="form-grid"><el-form-item label="用户名"><el-input v-model="form.username" /></el-form-item><el-form-item label="登录密码"><el-input v-model="form.password" type="password" show-password /></el-form-item><el-form-item label="姓名"><el-input v-model="form.name" /></el-form-item><el-form-item label="性别"><el-select v-model="form.gender"><el-option label="男" value="男" /><el-option label="女" value="女" /></el-select></el-form-item><el-form-item label="年龄"><el-input-number v-model="form.age" :min="1" :max="120" /></el-form-item><el-form-item label="手机号"><el-input v-model="form.phone" /></el-form-item><el-form-item label="身份证号"><el-input v-model="form.idCard" /></el-form-item></div><el-form-item><el-button type="primary" @click="submit">提交注册</el-button><el-button @click="router.push('/login/patient')">返回登录</el-button></el-form-item></el-form></PageContainer></section></div></div>
</template>
<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
const router = useRouter(); const form = reactive({ username: '', password: '', name: '', gender: '男', age: 25, phone: '', idCard: '' })
async function submit() { if (!form.username || !form.password || !form.name || !form.phone) return ElMessage.warning('请先填写必填项'); const res = await authApi.patientRegister(form); ElMessage.success(res.message || '注册成功'); router.push('/login/patient') }
</script>
