<template>
  <div class="page-shell layout-shell" :class="{ 'dark-mode': isDark }">
    <aside class="layout-side">
      <div class="layout-logo">
        <span class="material-symbols-outlined logo-icon">local_hospital</span>
        <div>社区医院<small>{{ headerTitle }}</small></div>
      </div>
      <RoleMenu :menus="menus" :active-path="route.path" />
    </aside>
    <section class="layout-main">
      <header class="layout-header">
        <div class="layout-header-top">
          <div class="path-bar muted">
            <span>首页</span>
            <span class="path-sep">&gt;</span>
            <span>{{ currentGroup?.title || headerTitle }}</span>
            <span class="path-sep">&gt;</span>
            <span>{{ route.meta.title }}</span>
          </div>
          <div class="header-actions">
            <span class="muted">欢迎，{{ auth.displayName }}</span>
            <span class="muted">{{ currentTime }}</span>
            <el-tooltip content="黑白模式切换" placement="bottom">
              <el-button circle plain @click="toggleTheme">
                <span class="material-symbols-outlined">{{ isDark ? 'light_mode' : 'dark_mode' }}</span>
              </el-button>
            </el-tooltip>
            <el-button type="danger" plain @click="logout">退出登录</el-button>
          </div>
        </div>
      </header>
      <main class="layout-content"><router-view /></main>
    </section>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import RoleMenu from '../components/RoleMenu.vue'
import { roleMenus } from '../router/module-config'
import { useAuthStore } from '../stores/auth'
import { authApi } from '../api/modules'
import { formatNow } from '../utils'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const currentTime = ref(formatNow())
const isDark = ref(localStorage.getItem('hospital-theme') === 'dark')
let timer = null

const menus = computed(() => roleMenus[route.meta.role] || [])
const currentGroup = computed(() => menus.value.find((group) => group.tabs.some((tab) => tab.path === route.path)))
const headerTitle = computed(() => ({ admin: '管理员后台', doctor: '医生工作台', patient: '患者服务台' }[route.meta.role] || '系统工作台'))

function applyTheme() {
  document.documentElement.classList.toggle('dark-mode', isDark.value)
  localStorage.setItem('hospital-theme', isDark.value ? 'dark' : 'light')
}

function toggleTheme() {
  isDark.value = !isDark.value
  applyTheme()
}

async function logout() {
  const map = { admin: authApi.adminLogout, doctor: authApi.doctorLogout, patient: authApi.patientLogout }
  try {
    await map[route.meta.role]()
  } finally {
    auth.clearAuth()
    ElMessage.success('已退出登录')
    router.push('/portal')
  }
}

onMounted(() => {
  applyTheme()
  timer = window.setInterval(() => {
    currentTime.value = formatNow()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>
