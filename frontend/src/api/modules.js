import http from './http'
export const publicApi = { health: () => http.get('/health'), announcements: () => http.get('/api/announcements'), departments: () => http.get('/api/departments'), todayDoctors: (params) => http.get('/api/today-doctors', { params }), triage: (data) => http.post('/api/triage', data) }
export const authApi = {
  patientRegister: (data) => http.post('/api/auth/patient/register', data),
  patientLogin: (data) => http.post('/api/auth/patient/login', data),
  patientLogout: () => http.post('/api/auth/patient/logout'),
  patientProfile: () => http.get('/api/auth/patient/profile'),
  patientPassword: (data) => http.patch('/api/auth/patient/password', data),
  patientResetCode: (data) => http.post('/api/auth/patient/reset-code', data),
  patientResetPassword: (data) => http.post('/api/auth/patient/reset-password', data),

  doctorRegister: (data) => http.post('/api/auth/doctor/register', data),
  doctorLogin: (data) => http.post('/api/auth/doctor/login', data),
  doctorLogout: () => http.post('/api/auth/doctor/logout'),
  doctorProfile: () => http.get('/api/auth/doctor/profile'),
  doctorPassword: (data) => http.patch('/api/auth/doctor/password', data),
  doctorResetCode: (data) => http.post('/api/auth/doctor/reset-code', data),
  doctorResetPassword: (data) => http.post('/api/auth/doctor/reset-password', data),

  adminLogin: (data) => http.post('/api/auth/admin/login', data),
  adminLogout: () => http.post('/api/auth/admin/logout'),
  adminCheck: () => http.get('/api/auth/admin/check'),
  adminResetCode: (data) => http.post('/api/auth/admin/reset-code', data),
  adminResetPassword: (data) => http.post('/api/auth/admin/reset-password', data)
}
export const adminApi = { profile: () => http.get('/api/admin/profile'), password: (data) => http.patch('/api/admin/password', data), stats: () => http.get('/api/admin/stats'), departments: () => http.get('/api/admin/departments'), doctors: () => http.get('/api/admin/doctors'), patients: () => http.get('/api/admin/patients'), announcements: () => http.get('/api/admin/announcements'), createAnnouncement: (data) => http.post('/api/admin/announcements', data), schedules: () => http.get('/api/admin/schedules'), createSchedule: (data) => http.post('/api/admin/schedules', data), appointments: () => http.get('/api/admin/appointments'), visits: () => http.get('/api/admin/visits'), hospitalizations: () => http.get('/api/admin/hospitalizations') }
export const doctorApi = { announcements: () => http.get('/api/doctor/announcements'), schedules: () => http.get('/api/doctor/schedules'), appointments: (params) => http.get('/api/doctor/appointments', { params }), callPatient: (id) => http.patch(`/api/doctor/appointments/${id}/call`), saveVisit: (data) => http.post('/api/doctor/visits', data) }
export const patientApi = { todayDoctors: (params) => http.get('/api/patient/today-doctors', { params }), createAppointment: (data) => http.post('/api/patient/appointments', data), cancelAppointment: (id) => http.patch(`/api/patient/appointments/${id}/cancel`), appointments: () => http.get('/api/patient/appointments'), visits: () => http.get('/api/patient/visits'), hospitalizations: () => http.get('/api/patient/hospitalizations'), recharge: (data) => http.post('/api/patient/recharge', data) }
