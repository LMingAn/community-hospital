import { ElMessage, ElMessageBox } from 'element-plus'

export function statusClass(status) {
  if (['已完成', '正常', '启用', '待入院'].includes(status)) return 'status-success'
  if (['已叫号', '待叫号', '可预约'].includes(status)) return 'status-primary'
  if (['较忙', '高峰', '停用'].includes(status)) return 'status-warning'
  if (['已取消', '已出院'].includes(status)) return 'status-danger'
  return 'status-primary'
}

export function weekdayLabel(value) {
  return ['', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'][Number(value)] || value
}

export function getDoctorHeat(item) {
  const remain = Number(item.remainingNumber || 0)
  if (remain <= 2) return '高峰'
  if (remain <= 5) return '较忙'
  return '推荐'
}

export async function confirmAction(message, title = '操作确认') {
  await ElMessageBox.confirm(message, title, { type: 'warning' })
}

export function successTip(message) {
  ElMessage.success(message)
}

export function padNumber(value) {
  return String(value).padStart(2, '0')
}

export function formatDateTime(value) {
  if (!value) return ''
  if (typeof value === 'string') {
    const normalized = value.replace('T', ' ').replace(/\.\d{3}Z$/, '').replace(/Z$/, '')
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(normalized)) return normalized
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) return `${normalized} 00:00:00`
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())} ${padNumber(date.getHours())}:${padNumber(date.getMinutes())}:${padNumber(date.getSeconds())}`
}

export function formatDate(value) {
  const text = formatDateTime(value)
  return text ? text.slice(0, 10) : ''
}

export function formatNow() {
  return formatDateTime(new Date())
}
