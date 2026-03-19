import { defineStore } from 'pinia'
import { authApi } from '../api/modules'
const profileFetchMap = { admin: () => authApi.adminCheck(), doctor: () => authApi.doctorProfile(), patient: () => authApi.patientProfile() }
export const useAuthStore = defineStore('auth', {
  state: () => ({ role: localStorage.getItem('hospital-role') || '', user: null, loading: false }),
  getters: { isLoggedIn: (state) => Boolean(state.role && state.user), displayName: (state) => state.user?.nickname || state.user?.name || state.user?.username || '未登录' },
  actions: { setAuth(role, user) { this.role = role; this.user = user; localStorage.setItem('hospital-role', role) }, clearAuth() { this.role = ''; this.user = null; localStorage.removeItem('hospital-role') }, async restore() { if (!this.role) return false; this.loading = true; try { const fn = profileFetchMap[this.role]; if (!fn) { this.clearAuth(); return false } const res = await fn(); this.user = res.data; return true } catch { this.clearAuth(); return false } finally { this.loading = false } } }
})
