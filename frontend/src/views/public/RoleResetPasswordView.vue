<template>
  <div class="portal-shell" :class="{ 'dark-mode': isDark }">
    <div class="portal-card page-card page-block reset-card">
      <div class="portal-topbar">
        <div class="reset-top-actions">
          <el-button class="keep-contrast-button" @click="router.push('/portal')">返回门户</el-button>
          <el-button circle plain class="theme-button" @click="toggleTheme">
            <span class="material-symbols-outlined">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
          </el-button>
        </div>
      </div>
      <div class="portal-title-wrap compact">
        <div>
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageDesc }}</p>
        </div>
        <span class="material-symbols-outlined portal-icon">lock_reset</span>
      </div>
      <el-form :model="form" label-width="92px" @submit.prevent>
        <el-form-item label="手机号">
          <el-input v-model="form.phone" placeholder="请输入注册手机号" />
        </el-form-item>
        <el-form-item label="验证码">
          <div class="code-row">
            <el-input v-model="form.code" placeholder="请输入4位验证码" />
            <el-button class="neutral-fixed-button" @click="getCode">获取验证码</el-button>
          </div>
        </el-form-item>
        <el-form-item v-if="demoCode" label="演示验证码">
          <el-tag type="success">{{ demoCode }}</el-tag>
        </el-form-item>
        <el-form-item label="新密码">
          <el-input v-model="form.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item>
          <div class="portal-actions">
            <el-button type="primary" :loading="submitting" @click="submitReset">重置密码</el-button>
            <el-button class="keep-contrast-button" @click="router.push('/portal')">返回登录</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { authApi } from '../../api/modules'
import { successTip } from '../../utils'

const props = defineProps({
  role: {
    type: String,
    required: true
  }
})

const router = useRouter()
const submitting = ref(false)
const demoCode = ref('')
const isDark = ref(localStorage.getItem('hospital-theme') === 'dark')
const form = reactive({ phone: '', code: '', newPassword: '' })

const roleMap = {
  patient: {
    label: '患者',
    getCode: authApi.patientResetCode,
    resetPassword: authApi.patientResetPassword
  },
  doctor: {
    label: '医生',
    getCode: authApi.doctorResetCode,
    resetPassword: authApi.doctorResetPassword
  }
}

const roleConfig = computed(() => roleMap[props.role])
const pageTitle = computed(() => `${roleConfig.value.label}修改密码`)
const pageDesc = computed(() => `通过手机号和验证码重置${roleConfig.value.label}账号密码，页面内容与系统内“忘记密码”一致。`)

function applyTheme() {
  document.documentElement.classList.toggle('dark-mode', isDark.value)
  document.body.classList.toggle('dark-mode', isDark.value)
  document.body.style.background = isDark.value ? '#151922' : '#f4f6fa'
  localStorage.setItem('hospital-theme', isDark.value ? 'dark' : 'light')
}

function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme()
}

async function getCode() {
  if (!form.phone) return ElMessage.warning('请输入手机号')
  const res = await roleConfig.value.getCode({ phone: form.phone })
  demoCode.value = res.data?.code || ''
  successTip('验证码已生成')
}

async function submitReset() {
  if (!form.phone || !form.code || !form.newPassword) return ElMessage.warning('请完整填写手机号、验证码和新密码')
  submitting.value = true
  try {
    await roleConfig.value.resetPassword(form)
    successTip('密码重置成功')
    form.phone = ''
    form.code = ''
    form.newPassword = ''
    demoCode.value = ''
    router.push('/portal')
  } finally {
    submitting.value = false
  }
}

onMounted(applyTheme)
</script>

<style scoped>
.reset-card {
  width: min(560px, 100%);
}

.reset-top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.code-row {
  display: flex;
  gap: 10px;
  width: 100%;
}

@media (max-width: 560px) {
  .reset-top-actions,
  .code-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>