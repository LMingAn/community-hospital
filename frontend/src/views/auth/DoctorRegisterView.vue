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
          <h1>医生注册</h1>
          <p>请填写医生基础信息，带 * 的为必填项。注册成功后可登录医生工作台。</p>
        </div>
        <span class="material-symbols-outlined portal-icon">badge</span>
      </div>
      <el-form :model="form" label-width="98px">
        <div class="form-grid">
          <el-form-item label="账号 *"><el-input v-model="form.username" /></el-form-item>
          <el-form-item label="密码 *"><el-input v-model="form.password" type="password" show-password /></el-form-item>
          <el-form-item label="姓名 *"><el-input v-model="form.name" /></el-form-item>
          <el-form-item label="性别"><el-select v-model="form.gender"><el-option label="男" value="男" /><el-option label="女" value="女" /></el-select></el-form-item>
          <el-form-item label="所属科室 *"><el-select v-model="form.departmentId" placeholder="请选择科室"><el-option v-for="item in departments" :key="item.id" :label="item.name" :value="item.id" /></el-select></el-form-item>
          <el-form-item label="职称 *"><el-input v-model="form.title" /></el-form-item>
          <el-form-item label="擅长方向"><el-input v-model="form.specialty" /></el-form-item>
          <el-form-item label="手机号 *"><el-input v-model="form.phone" /></el-form-item>
          <el-form-item label="简介" style="grid-column:1/-1;"><el-input v-model="form.intro" type="textarea" :rows="3" /></el-form-item>
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
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi, publicApi } from '../../api/modules'
const router = useRouter(); const departments = ref([]); const form = reactive({ username: '', password: '', name: '', gender: '男', departmentId: '', title: '', specialty: '', phone: '', intro: '' })
const isDark = ref(localStorage.getItem('hospital-theme') === 'dark')
function applyTheme() { document.documentElement.classList.toggle('dark-mode', isDark.value); document.body.classList.toggle('dark-mode', isDark.value); document.body.style.background = isDark.value ? '#151922' : '#f4f6fa'; localStorage.setItem('hospital-theme', isDark.value ? 'dark' : 'light') }
function toggleTheme() { isDark.value = !isDark.value; applyTheme() }
onMounted(async () => { applyTheme(); const res = await publicApi.departments(); departments.value = res.data })
async function submit() { if (!form.username || !form.password || !form.name || !form.departmentId || !form.title || !form.phone) return ElMessage.warning('请先填写必填项'); const res = await authApi.doctorRegister(form); ElMessage.success(res.message || '注册成功'); router.push('/portal') }
</script>
