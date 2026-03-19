<template>
  <div class="portal-shell" :class="{ 'dark-mode': isDark }">
    <div class="portal-card page-card page-block">
      <div class="portal-topbar">
        <el-button circle plain class="theme-button" @click="toggleTheme">
          <span class="material-symbols-outlined">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
        </el-button>
      </div>
      <div class="portal-title-wrap">
        <div>
          <h1>社区医院预约挂号系统</h1>
          <p>请选择身份后登录系统。未登录时可从此页面进入患者或医生注册。</p>
        </div>
        <span class="material-symbols-outlined portal-icon">local_hospital</span>
      </div>
      <el-form :model="form" label-width="88px" @submit.prevent>
        <el-form-item label="选择角色">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="医生" value="doctor" />
            <el-option label="患者" value="patient" />
          </el-select>
        </el-form-item>
        <el-form-item label="登录账号">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="登录密码">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <div class="portal-actions">
            <el-button type="primary" :loading="loading" @click="submit">登录系统</el-button>
            <el-button v-if="form.role !== 'admin'" class="keep-contrast-button" @click="router.push(`/register/${form.role}`)">立即注册</el-button>
          </div>
        </el-form-item>
      </el-form>
      <div class="portal-tip muted">
        演示账号可使用初始化数据：管理员 admin / 123456，医生 doctor01 / 123456，患者 patient01 / 123456。
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '../../api/modules'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const isDark = ref(localStorage.getItem('hospital-theme') === 'dark')
const form = reactive({ role: 'patient', username: '', password: '' })

function applyTheme() {
  document.documentElement.classList.toggle('dark-mode', isDark.value)
  localStorage.setItem('hospital-theme', isDark.value ? 'dark' : 'light')
}
function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme()
}

async function submit() {
  if (!form.role || !form.username || !form.password) return ElMessage.warning('请完整填写登录信息')
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

onMounted(applyTheme)
</script>
