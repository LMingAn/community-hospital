<template>
  <div class="auth-wrap">
    <div class="auth-card">
      <section class="auth-cover">
        <h1>{{ roleTitle }}登录</h1>
        <p>{{ introText }}</p>
        <el-alert title="演示建议" type="info" :closable="false" show-icon><template #default>登录后系统会根据角色自动进入相应工作台，未登录访问业务页会自动拦截。</template></el-alert>
      </section>
      <section class="auth-panel">
        <PageContainer :title="`${roleTitle}登录`" desc="请输入账号和密码">
          <el-form :model="form" label-width="78px" @submit.prevent>
            <el-form-item label="账号"><el-input v-model="form.username" placeholder="请输入账号" /></el-form-item>
            <el-form-item label="密码"><el-input v-model="form.password" type="password" show-password placeholder="请输入密码" /></el-form-item>
            <el-form-item><div style="display:flex; gap:10px; flex-wrap:wrap;"><el-button type="primary" :loading="loading" @click="submit">登录</el-button><el-button @click="router.push('/portal')">返回门户</el-button><el-button v-if="role !== 'admin'" plain @click="router.push(`/register/${role}`)">去注册</el-button></div></el-form-item>
          </el-form>
        </PageContainer>
      </section>
    </div>
  </div>
</template>
<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '../../api/modules'
import { useAuthStore } from '../../stores/auth'
import PageContainer from '../../components/PageContainer.vue'
const route = useRoute(); const router = useRouter(); const auth = useAuthStore(); const role = computed(() => route.params.role); const loading = ref(false); const form = reactive({ username: '', password: '' })
const roleTitle = computed(() => ({ admin: '管理员', doctor: '医生', patient: '患者' }[role.value]))
const introText = computed(() => ({ admin: '管理员可查看平台概况、公告、排班、挂号和住院信息。', doctor: '医生可查看个人排班、挂号患者、执行叫号并填写病历。', patient: '患者可在线挂号、查看我的就诊记录和住院登记信息。' }[role.value]))
async function submit() { if (!form.username || !form.password) return ElMessage.warning('请输入完整账号和密码'); loading.value = true; try { const apiMap = { admin: authApi.adminLogin, doctor: authApi.doctorLogin, patient: authApi.patientLogin }; const res = await apiMap[role.value]({ ...form }); auth.setAuth(role.value, res.data); ElMessage.success(res.message || '登录成功'); router.push(`/${role.value}`) } finally { loading.value = false } }
</script>
