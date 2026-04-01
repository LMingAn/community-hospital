<template>
  <PageContainer title="账户充值" desc="患者可在个人中心进行账户充值操作">
    <div class="page-card page-block" style="max-width:560px;">
      <div class="section-title">充值表单</div>
      <el-form :model="form" label-width="96px">
        <el-form-item label="当前余额"><el-input :model-value="profile.balance ?? 0" disabled /></el-form-item>
        <el-form-item label="充值金额"><el-input-number v-model="form.amount" :min="1" :step="50" style="width: 100%;" /></el-form-item>
        <el-form-item label="充值说明"><el-input value="患者自助充值" disabled /></el-form-item>
        <el-form-item><el-button type="primary" @click="submit">确认充值</el-button></el-form-item>
      </el-form>
    </div>
  </PageContainer>
</template>
<script setup>
import { onMounted, reactive, ref } from 'vue'
import { authApi, patientApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import { successTip } from '../../utils'
const profile = ref({})
const form = reactive({ amount: 100 })
async function loadProfile() { const res = await authApi.patientProfile(); profile.value = res.data || {} }
async function submit() { await patientApi.recharge({ amount: form.amount }); successTip('充值成功'); await loadProfile() }
onMounted(loadProfile)
</script>
