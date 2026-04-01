<template>
  <div class="page-shell layout-shell">
    <aside class="layout-side">
      <div class="layout-logo">🏥<div>社区医院<small>{{ headerTitle }}</small></div></div>
      <RoleMenu :menus="menus" :active-path="route.path" />
    </aside>
    <section class="layout-main">
      <header class="layout-header">
        <div class="layout-header-top">
          <div>
            <el-breadcrumb separator=">"><el-breadcrumb-item>首页</el-breadcrumb-item><el-breadcrumb-item>{{ currentGroup?.title || headerTitle }}</el-breadcrumb-item><el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item></el-breadcrumb>
            <SecondaryTabs :tabs="currentGroup?.tabs || []" :active-path="route.path" />
          </div>
          <div style="display:flex;align-items:center;gap:12px;"><span class="muted">欢迎，{{ auth.displayName }}</span><el-button type="primary" plain @click="goPortal">返回门户</el-button><el-button type="danger" plain @click="logout">退出登录</el-button></div>
        </div>
      </header>
      <main class="layout-content"><router-view /></main>
    </section>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import RoleMenu from '../components/RoleMenu.vue'
import SecondaryTabs from '../components/SecondaryTabs.vue'
import { roleMenus } from '../router/module-config'
import { useAuthStore } from '../stores/auth'
import { authApi } from '../api/modules'
const route = useRoute(); const router = useRouter(); const auth = useAuthStore()
const menus = computed(() => roleMenus[route.meta.role] || [])
const currentGroup = computed(() => menus.value.find(group => group.tabs.some(tab => tab.path === route.path)))
const headerTitle = computed(() => ({ admin: '管理员后台', doctor: '医生工作台', patient: '患者服务台' }[route.meta.role] || '系统工作台'))
async function logout() { const map = { admin: authApi.adminLogout, doctor: authApi.doctorLogout, patient: authApi.patientLogout }; try { await map[route.meta.role]() } finally { auth.clearAuth(); ElMessage.success('已退出登录'); router.push(`/login/${route.meta.role}`) } }
function goPortal() { router.push('/portal') }
</script>
