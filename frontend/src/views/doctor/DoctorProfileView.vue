<template>
  <PageContainer title="个人信息" desc="查看当前医生账号信息与所属科室">
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
  医生账号: profile.value.username,
  医生姓名: profile.value.name,
  性别: profile.value.gender,
  职称: profile.value.title,
  所属科室: profile.value.departmentName,
  擅长方向: profile.value.specialty,
  联系电话: profile.value.phone,
  个人简介: profile.value.intro
}))
onMounted(async () => { const res = await authApi.doctorProfile(); profile.value = res.data || {} })
</script>
