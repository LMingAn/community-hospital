<template>
  <PageContainer title="修改密码" desc="支持原密码修改，也支持手机号 + 4 位验证码重置密码">
    <el-tabs v-model="activeName">
      <el-tab-pane label="正常修改" name="change">
        <el-form :model="changeForm" label-width="96px" style="max-width: 520px;">
          <el-form-item label="原密码"><el-input v-model="changeForm.oldPassword" type="password" show-password /></el-form-item>
          <el-form-item label="新密码"><el-input v-model="changeForm.newPassword" type="password" show-password /></el-form-item>
          <el-form-item><el-button type="primary" @click="submitChange">提交修改</el-button></el-form-item>
        </el-form>
      </el-tab-pane>
      <el-tab-pane label="忘记密码" name="reset">
        <el-form :model="resetForm" label-width="110px" style="max-width: 560px;">
          <el-form-item label="手机号"><el-input v-model="resetForm.phone" /></el-form-item>
          <el-form-item label="验证码">
            <div style="display:flex; gap:10px; width:100%;">
              <el-input v-model="resetForm.code" placeholder="请输入4位验证码" />
              <el-button class="neutral-fixed-button" @click="getCode">获取验证码</el-button>
            </div>
          </el-form-item>
          <el-form-item v-if="demoCode" label="演示验证码"><el-tag type="success">{{ demoCode }}</el-tag></el-form-item>
          <el-form-item label="新密码"><el-input v-model="resetForm.newPassword" type="password" show-password /></el-form-item>
          <el-form-item><el-button type="primary" @click="submitReset">重置密码</el-button></el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </PageContainer>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { authApi } from '../../api/modules'
import PageContainer from '../../components/PageContainer.vue'
import { successTip } from '../../utils'
const activeName = ref('change')
const demoCode = ref('')
const changeForm = reactive({ oldPassword: '', newPassword: '' })
const resetForm = reactive({ phone: '', code: '', newPassword: '' })
async function submitChange() { 
  await authApi.doctorPassword(changeForm); 
  successTip('密码修改成功'); 
  changeForm.oldPassword=''; 
  changeForm.newPassword='' 
}
async function getCode() { 
  const res = await authApi.doctorResetCode({ phone: resetForm.phone }); 
  demoCode.value = res.data?.code || ''; 
  successTip('验证码已生成') 
}
async function submitReset() { 
  await authApi.doctorResetPassword(resetForm); 
  successTip('密码重置成功'); 
  resetForm.phone=''; 
  resetForm.code=''; 
  resetForm.newPassword=''; 
  demoCode.value='' 
}
</script>
