export const roleMenus = {
  admin: [
    { key: 'dashboard', title: '首页', icon: 'home', path: '/admin/dashboard' },
    { key: 'info', title: '信息管理', icon: 'inventory_2', tabs: [ { label: '系统公告', path: '/admin/announcements' }, { label: '科室信息', path: '/admin/departments' }, { label: '医生排班', path: '/admin/schedules' } ] },
    { key: 'medical', title: '预约就诊', icon: 'assignment', tabs: [ { label: '预约挂号', path: '/admin/appointments' }, { label: '患者就诊', path: '/admin/visits' }, { label: '住院登记', path: '/admin/hospitalizations' } ] },
    { key: 'users', title: '用户管理', icon: 'group', tabs: [ { label: '管理员信息', path: '/admin/profile' }, { label: '医生信息', path: '/admin/doctors' }, { label: '患者信息', path: '/admin/patients' } ] },
    { key: 'account', title: '个人中心', icon: 'manage_accounts', tabs: [ { label: '修改密码', path: '/admin/password' } ] }
  ],
  doctor: [
    { key: 'home', title: '首页', icon: 'home', path: '/doctor/home' },
    { key: 'schedule', title: '排班与挂号', icon: 'event_note', tabs: [ { label: '我的排班', path: '/doctor/schedules' }, { label: '挂号患者', path: '/doctor/appointments' }, { label: '患者叫号', path: '/doctor/calls' } ] },
    { key: 'visit', title: '患者就诊', icon: 'medical_services', tabs: [ { label: '就诊处理', path: '/doctor/visit' } ] },
    { key: 'account', title: '账号管理', icon: 'badge', tabs: [ { label: '个人信息', path: '/doctor/profile' }, { label: '修改密码', path: '/doctor/password' } ] }
  ],
  patient: [
    { key: 'home', title: '首页', icon: 'home', path: '/patient/home' },
    { key: 'register', title: '挂号服务', icon: 'calendar_month', tabs: [ { label: '预约挂号', path: '/patient/appointment' }, { label: '我的挂号', path: '/patient/appointments' } ] },
    { key: 'visit', title: '就诊住院', icon: 'medication', tabs: [ { label: '我的就诊', path: '/patient/visits' }, { label: '住院登记', path: '/patient/hospitalizations' } ] },
    { key: 'center', title: '个人中心', icon: 'account_balance_wallet', tabs: [ { label: '个人信息', path: '/patient/profile' }, { label: '账户充值', path: '/patient/recharge' }, { label: '修改密码', path: '/patient/password' } ] }
  ]
}
