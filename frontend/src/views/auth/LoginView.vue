<template>
<<<<<<< HEAD
  <div class="portal-shell">
    <div class="portal-card page-card page-block">
=======
  <div class="portal-shell" :class="{ 'dark-mode': isDark }">
    <div class="portal-card page-card page-block">
      <div class="portal-topbar">
        <el-button circle plain class="theme-button" @click="toggleTheme">
          <span class="material-symbols-outlined">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
        </el-button>
      </div>
>>>>>>> b85cd96 (v8（修复部分页面缺失黑白切换按钮，统一前端设计风格，补齐黑暗模式样式，调整用户信息栏区块，导航栏优化）)
      <div class="portal-title-wrap compact">
        <div>
          <h1>用户登录</h1>
          <p>请选择角色并输入账号密码后进入对应工作台。</p>
        </div>
        <span class="material-symbols-outlined portal-icon">login</span>
      </div>
      <el-form :model="form" label-width="88px" @submit.prevent>
        <el-form-item label="选择角色">
          <el-select v-model="form.role" @change="changeRole">
            <el-option label="管理员" value="admin" />
            <el-option label="医生" value="doctor" />
            <el-option label="患者" value="patient" />
          </el-select>
        </el-form-item>
        <el-form-item label="登录账号"><el-input v-model="form.username" placeholder="请输入账号" /></el-form-item>
        <el-form-item label="登录密码"><el-input v-model="form.password" type="password" show-password placeholder="请输入密码" /></el-form-item>
        <el-form-item>
          <div class="portal-actions">
            <el-button type="primary" :loading="loading" @click="submit">登录</el-button>
            <el-button @click="router.push('/portal')">返回首页</el-button>
<<<<<<< HEAD
            <el-button v-if="form.role !== 'admin'" plain @click="router.push(`/register/${form.role}`)">去注册</el-button>
=======
            <el-button v-if="form.role !== 'admin'" class="keep-contrast-button" @click="router.push(`/register/${form.role}`)">去注册</el-button>
>>>>>>> b85cd96 (v8（修复部分页面缺失黑白切换按钮，统一前端设计风格，补齐黑暗模式样式，调整用户信息栏区块，导航栏优化）)
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
<<<<<<< HEAD
import { reactive, watch, ref } from 'vue'
=======
import { reactive, watch, ref, onMounted } from 'vue'
>>>>>>> b85cd96 (v8（修复部分页面缺失黑白切换按钮，统一前端设计风格，补齐黑暗模式样式，调整用户信息栏区块，导航栏优化）)
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '../../api/modules'
import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
<<<<<<< HEAD
const form = reactive({ role: route.params.role || 'patient', username: '', password: '' })

=======
const isDark = ref(localStorage.getItem('hospital-theme') === 'dark')
const form = reactive({ role: route.params.role || 'patient', username: '', password: '' })

function applyTheme() {
  document.documentElement.classList.toggle('dark-mode', isDark.value)
  localStorage.setItem('hospital-theme', isDark.value ? 'dark' : 'light')
}
function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme()
}

>>>>>>> b85cd96 (v8（修复部分页面缺失黑白切换按钮，统一前端设计风格，补齐黑暗模式样式，调整用户信息栏区块，导航栏优化）)
watch(() => route.params.role, (value) => { if (value) form.role = value })

function changeRole(value) {
  router.replace(`/login/${value}`)
}

async function submit() {
  if (!form.username || !form.password) return ElMessage.warning('请输入完整账号和密码')
  loading.value = true
  try {
    const apiMap = { admin: authApi.adminLogin, doctor: authApi.doctorLogin, patient: authApi.patientLogin }
    const res = await apiMap[form.role]({ username: form.username, password: form.password })
    auth.setAuth(form.role, res.data)
    ElMessage.success(res.message || '登录成功')
    router.push(`/${form.role}`)
  } finally {
    loading.value = false
  }
}
<<<<<<< HEAD
=======

onMounted(applyTheme)
>>>>>>> b85cd96 (v8（修复部分页面缺失黑白切换按钮，统一前端设计风格，补齐黑暗模式样式，调整用户信息栏区块，导航栏优化）)
</script>
