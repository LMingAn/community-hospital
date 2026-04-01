<template>
  <PageContainer title="个人信息" desc="查看患者基础资料与账户余额">
    <div class="info-grid">
      <div class="info-item" v-for="(value, key) in profileMap" :key="key">
        <label>{{ key }}</label>
        <div>{{ value || '-' }}</div>
      </div>
    </div>
  </PageContainer>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'
import { authApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
const profile = ref({})
const profileMap = computed(() => ({
  患者账号: profile.value.username,
  患者姓名: profile.value.name,
  性别: profile.value.gender,
  年龄: profile.value.age,
  手机号: profile.value.phone,
  身份证号: profile.value.idCard,
  账户余额: profile.value.balance,
  注册时间: profile.value.createdAt
}))
onMounted(async () => { const res = await authApi.patientProfile(); profile.value = res.data || {} })
</script>
