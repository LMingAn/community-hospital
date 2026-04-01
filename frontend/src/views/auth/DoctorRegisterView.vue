<template>
<<<<<<< HEAD
  <div class="auth-wrap">
    <div class="auth-card">
      <section class="auth-cover">
        <h1>医生注册</h1>
        <p>医生注册成功后可登录医生工作台，查看排班、当日挂号患者，并完成叫号和就诊记录填写。</p>
      </section>
      <section class="auth-panel">
        <PageContainer title="医生注册" desc="请填写医生基础信息，带 * 的为必填项">
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
              <el-button type="primary" @click="submit">提交注册</el-button>
              <el-button @click="router.push('/portal')">返回登录</el-button>
            </el-form-item>
          </el-form>
        </PageContainer>
      </section>
=======
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
            <el-button @click="router.push('/portal')">返回登录</el-button>
          </div>
        </el-form-item>
      </el-form>
>>>>>>> b85cd96 (v8（修复部分页面缺失黑白切换按钮，统一前端设计风格，补齐黑暗模式样式，调整用户信息栏区块，导航栏优化）)
    </div>
  </div>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi, publicApi } from '../../api/modules'
<<<<<<< HEAD
import PageContainer from '../../components/PageContainer.vue'
const router = useRouter(); const departments = ref([]); const form = reactive({ username: '', password: '', name: '', gender: '男', departmentId: '', title: '', specialty: '', phone: '', intro: '' })
onMounted(async () => { const res = await publicApi.departments(); departments.value = res.data })
=======
const router = useRouter(); const departments = ref([]); const form = reactive({ username: '', password: '', name: '', gender: '男', departmentId: '', title: '', specialty: '', phone: '', intro: '' })
const isDark = ref(localStorage.getItem('hospital-theme') === 'dark')
function applyTheme() { document.documentElement.classList.toggle('dark-mode', isDark.value); localStorage.setItem('hospital-theme', isDark.value ? 'dark' : 'light') }
function toggleTheme() { isDark.value = !isDark.value; applyTheme() }
onMounted(async () => { applyTheme(); const res = await publicApi.departments(); departments.value = res.data })
>>>>>>> b85cd96 (v8（修复部分页面缺失黑白切换按钮，统一前端设计风格，补齐黑暗模式样式，调整用户信息栏区块，导航栏优化）)
async function submit() { if (!form.username || !form.password || !form.name || !form.departmentId || !form.title || !form.phone) return ElMessage.warning('请先填写必填项'); const res = await authApi.doctorRegister(form); ElMessage.success(res.message || '注册成功'); router.push('/portal') }
</script>
