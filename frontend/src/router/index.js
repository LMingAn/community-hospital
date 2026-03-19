import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
const routes = [
  { path: '/', redirect: '/portal' },
  { path: '/portal', component: () => import('../views/public/PortalView.vue'), meta: { title: '系统门户', guestOnly: true } },
  { path: '/login/:role(admin|doctor|patient)', component: () => import('../views/auth/LoginView.vue'), meta: { guestOnly: true, title: '登录' } },
  { path: '/register/patient', component: () => import('../views/auth/PatientRegisterView.vue'), meta: { guestOnly: true, title: '患者注册' } },
  { path: '/register/doctor', component: () => import('../views/auth/DoctorRegisterView.vue'), meta: { guestOnly: true, title: '医生注册' } },
  { path: '/admin', component: () => import('../layouts/RoleLayout.vue'), meta: { role: 'admin', title: '管理员后台' }, children: [
    { path: '', redirect: '/admin/dashboard' }, { path: 'dashboard', component: () => import('../views/admin/AdminDashboardView.vue'), meta: { title: '首页概览' } }, { path: 'announcements', component: () => import('../views/admin/AdminAnnouncementsView.vue'), meta: { title: '公告信息' } }, { path: 'departments', component: () => import('../views/admin/AdminDepartmentsView.vue'), meta: { title: '科室信息' } }, { path: 'schedules', component: () => import('../views/admin/AdminSchedulesView.vue'), meta: { title: '医生排班' } }, { path: 'appointments', component: () => import('../views/admin/AdminAppointmentsView.vue'), meta: { title: '预约挂号' } }, { path: 'visits', component: () => import('../views/admin/AdminVisitsView.vue'), meta: { title: '患者就诊' } }, { path: 'hospitalizations', component: () => import('../views/admin/AdminHospitalizationsView.vue'), meta: { title: '住院登记' } }, { path: 'doctors', component: () => import('../views/admin/AdminDoctorsView.vue'), meta: { title: '医生信息' } }, { path: 'patients', component: () => import('../views/admin/AdminPatientsView.vue'), meta: { title: '患者信息' } }, { path: 'profile', component: () => import('../views/admin/AdminProfileView.vue'), meta: { title: '管理员信息' } }, { path: 'password', component: () => import('../views/admin/AdminPasswordView.vue'), meta: { title: '修改密码' } }
  ] },
  { path: '/doctor', component: () => import('../layouts/RoleLayout.vue'), meta: { role: 'doctor', title: '医生工作台' }, children: [
    { path: '', redirect: '/doctor/announcements' }, { path: 'announcements', component: () => import('../views/doctor/DoctorAnnouncementsView.vue'), meta: { title: '系统公告' } }, { path: 'profile', component: () => import('../views/doctor/DoctorProfileView.vue'), meta: { title: '个人信息' } }, { path: 'schedules', component: () => import('../views/doctor/DoctorSchedulesView.vue'), meta: { title: '我的排班' } }, { path: 'appointments', component: () => import('../views/doctor/DoctorAppointmentsView.vue'), meta: { title: '挂号患者' } }, { path: 'calls', component: () => import('../views/doctor/DoctorCallsView.vue'), meta: { title: '患者叫号' } }, { path: 'visit', component: () => import('../views/doctor/DoctorVisitView.vue'), meta: { title: '就诊处理' } }, { path: 'password', component: () => import('../views/doctor/DoctorPasswordView.vue'), meta: { title: '修改密码' } }
  ] },
  { path: '/patient', component: () => import('../layouts/RoleLayout.vue'), meta: { role: 'patient', title: '患者服务台' }, children: [
    { path: '', redirect: '/patient/home' }, { path: 'home', component: () => import('../views/patient/PatientHomeView.vue'), meta: { title: '系统公告' } }, { path: 'profile', component: () => import('../views/patient/PatientProfileView.vue'), meta: { title: '个人信息' } }, { path: 'appointment', component: () => import('../views/patient/PatientAppointmentView.vue'), meta: { title: '预约挂号' } }, { path: 'appointments', component: () => import('../views/patient/PatientAppointmentsView.vue'), meta: { title: '我的挂号' } }, { path: 'visits', component: () => import('../views/patient/PatientVisitsView.vue'), meta: { title: '我的就诊' } }, { path: 'hospitalizations', component: () => import('../views/patient/PatientHospitalizationsView.vue'), meta: { title: '住院登记' } }, { path: 'recharge', component: () => import('../views/patient/PatientRechargeView.vue'), meta: { title: '账户充值' } }, { path: 'password', component: () => import('../views/patient/PatientPasswordView.vue'), meta: { title: '修改密码' } }
  ] }
]
const router = createRouter({ history: createWebHistory(), routes })
router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.user && auth.role) await auth.restore()
  if (to.meta?.guestOnly && auth.user) return `/${auth.role}`
  const requiredRole = to.meta?.role
  if (requiredRole) {
    if (!auth.user) { auth.clearAuth(); return `/login/${requiredRole}` }
    if (auth.role !== requiredRole) return `/${auth.role}`
  }
  document.title = `${to.meta?.title || '系统'} - 社区医院预约挂号系统`
  return true
})
export default router
