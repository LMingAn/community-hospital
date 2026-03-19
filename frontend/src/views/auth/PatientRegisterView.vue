<template>
  <div class="portal-shell" :class="{ 'dark-mode': isDark }">
    <div class="portal-card page-card page-block" style="width:min(760px,100%);">
      <div class="portal-topbar">
        <el-button circle plain class="theme-button" @click="toggleTheme">
          <span class="material-symbols-outlined">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
        </el-button>
      </div>
      <div class="portal-title-wrap compact">
        <div>
          <h1>患者注册</h1>
          <p>请填写患者基础信息，带 * 的为必填项。注册后即可在线挂号和查看就诊信息。</p>
        </div>
        <span class="material-symbols-outlined portal-icon">person_add</span>
      </div>
      <el-form :model="form" label-width="98px">
        <div class="form-grid">
          <el-form-item label="用户名 *"><el-input v-model="form.username" /></el-form-item>
          <el-form-item label="登录密码 *"><el-input v-model="form.password" type="password" show-password /></el-form-item>
          <el-form-item label="姓名 *"><el-input v-model="form.name" /></el-form-item>
          <el-form-item label="性别"><el-select v-model="form.gender"><el-option label="男" value="男" /><el-option label="女" value="女" /></el-select></el-form-item>
          <el-form-item label="年龄"><el-input-number v-model="form.age" :min="1" :max="120" style="width:100%;" /></el-form-item>
          <el-form-item label="手机号 *"><el-input v-model="form.phone" /></el-form-item>
          <el-form-item label="身份证号"><el-input v-model="form.idCard" /></el-form-item>
        </div>
        <el-form-item>
          <div class="portal-actions">
            <el-button type="primary" @click="submit">提交注册</el-button>
            <el-button class="keep-contrast-button" @click="router.push('/portal')">返回登录</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '../../api/modules'
const router = useRouter()
const isDark = ref(localStorage.getItem('hospital-theme') === 'dark')
const form = reactive({ username: '', password: '', name: '', gender: '男', age: 25, phone: '', idCard: '' })
function applyTheme() { document.documentElement.classList.toggle('dark-mode', isDark.value); localStorage.setItem('hospital-theme', isDark.value ? 'dark' : 'light') }
function toggleTheme() { isDark.value = !isDark.value; applyTheme() }
async function submit() { if (!form.username || !form.password || !form.name || !form.phone) return ElMessage.warning('请先填写必填项'); const res = await authApi.patientRegister(form); ElMessage.success(res.message || '注册成功'); router.push('/portal') }
onMounted(applyTheme)
</script>
