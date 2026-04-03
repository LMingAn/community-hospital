import http from './http'
export const publicApi = { 
  health: () => http.get('/health'), 
  announcements: () => http.get('/api/announcements'), 
  departments: () => http.get('/api/departments'), 
  todayDoctors: (params) => http.get('/api/today-doctors', { params }), 
  triage: (data) => http.post('/api/triage', data) 
}
export const authApi = {
  patientRegister: (data) => http.post('/api/auth/patient/register', data),
  patientLogin: (data) => http.post('/api/auth/patient/login', data),
  patientLogout: () => http.post('/api/auth/patient/logout'),
  patientProfile: () => http.get('/api/auth/patient/profile'),
  updatePatientProfile: (data) => http.put('/api/auth/patient/profile', data),
  patientPassword: (data) => http.patch('/api/auth/patient/password', data),
  patientResetCode: (data) => http.post('/api/auth/patient/reset-code', data),
  patientResetPassword: (data) => http.post('/api/auth/patient/reset-password', data),
  doctorRegister: (data) => http.post('/api/auth/doctor/register', data),
  doctorLogin: (data) => http.post('/api/auth/doctor/login', data),
  doctorLogout: () => http.post('/api/auth/doctor/logout'),
  doctorProfile: () => http.get('/api/auth/doctor/profile'),
  updateDoctorProfile: (data) => http.put('/api/auth/doctor/profile', data),
  doctorPassword: (data) => http.patch('/api/auth/doctor/password', data),
  doctorResetCode: (data) => http.post('/api/auth/doctor/reset-code', data),
  doctorResetPassword: (data) => http.post('/api/auth/doctor/reset-password', data),
  adminLogin: (data) => http.post('/api/auth/admin/login', data),
  adminLogout: () => http.post('/api/auth/admin/logout'),
  adminCheck: () => http.get('/api/auth/admin/check'),
  adminResetCode: (data) => http.post('/api/auth/admin/reset-code', data),
  adminResetPassword: (data) => http.post('/api/auth/admin/reset-password', data)
}
export const adminApi = {
  profile: () => http.get('/api/admin/profile'), password: (data) => http.patch('/api/admin/password', data), stats: () => http.get('/api/admin/stats'),
  departments: () => http.get('/api/admin/departments'), createDepartment: (data) => http.post('/api/admin/departments', data), updateDepartment: (id, data) => http.put(`/api/admin/departments/${id}`, data), deleteDepartment: (id) => http.delete(`/api/admin/departments/${id}`),
  doctors: () => http.get('/api/admin/doctors'), createDoctor: (data) => http.post('/api/admin/doctors', data), updateDoctor: (id, data) => http.put(`/api/admin/doctors/${id}`, data), deleteDoctor: (id) => http.delete(`/api/admin/doctors/${id}`),
  patients: () => http.get('/api/admin/patients'), createPatient: (data) => http.post('/api/admin/patients', data), updatePatient: (id, data) => http.put(`/api/admin/patients/${id}`, data), deletePatient: (id) => http.delete(`/api/admin/patients/${id}`),
  announcements: () => http.get('/api/admin/announcements'), createAnnouncement: (data) => http.post('/api/admin/announcements', data), updateAnnouncement: (id, data) => http.put(`/api/admin/announcements/${id}`, data), deleteAnnouncement: (id) => http.delete(`/api/admin/announcements/${id}`),
  schedules: () => http.get('/api/admin/schedules'), createSchedule: (data) => http.post('/api/admin/schedules', data), updateSchedule: (id, data) => http.put(`/api/admin/schedules/${id}`, data), deleteSchedule: (id) => http.delete(`/api/admin/schedules/${id}`),
  appointments: () => http.get('/api/admin/appointments'), createAppointment: (data) => http.post('/api/admin/appointments', data), updateAppointment: (id, data) => http.put(`/api/admin/appointments/${id}`, data), deleteAppointment: (id) => http.delete(`/api/admin/appointments/${id}`),
  visits: () => http.get('/api/admin/visits'), createVisit: (data) => http.post('/api/admin/visits', data), updateVisit: (id, data) => http.put(`/api/admin/visits/${id}`, data), deleteVisit: (id) => http.delete(`/api/admin/visits/${id}`),
  hospitalizations: () => http.get('/api/admin/hospitalizations'), createHospitalization: (data) => http.post('/api/admin/hospitalizations', data), updateHospitalization: (id, data) => http.put(`/api/admin/hospitalizations/${id}`, data), deleteHospitalization: (id) => http.delete(`/api/admin/hospitalizations/${id}`)
}
export const doctorApi = { 
  announcements: () => http.get('/api/doctor/announcements'), 
  schedules: (params) => http.get('/api/doctor/schedules', { params }), 
  appointments: (params) => http.get('/api/doctor/appointments', { params }), 
  callPatient: (id) => http.patch(`/api/doctor/appointments/${id}/call`), 
  saveVisit: (data) => http.post('/api/doctor/visits', data) 
}
export const patientApi = { 
  todayDoctors: (params) => http.get('/api/patient/today-doctors', { params }), 
  createAppointment: (data) => http.post('/api/patient/appointments', data), 
  cancelAppointment: (id) => http.patch(`/api/patient/appointments/${id}/cancel`), 
  appointments: () => http.get('/api/patient/appointments'), 
  visits: () => http.get('/api/patient/visits'), 
  hospitalizations: () => http.get('/api/patient/hospitalizations'), 
}
