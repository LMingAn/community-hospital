<template>
  <div class="page-shell">
    <div class="auth-wrap" style="padding: 24px;">
      <div class="auth-card" style="grid-template-columns:1fr 1fr;">
        <section class="auth-cover">
          <h1>社区医院预约挂号系统</h1>
          <p>本系统基于 Vue 3 + Element Plus 重构前端，保留 Node.js + Express + MySQL 8.0 后端架构，适用于本科毕业设计展示。系统包含管理员、医生、患者三端，实现排班、挂号、叫号、就诊、住院和公告管理等功能。</p>
          <div class="page-card page-block" style="background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.25); color:#fff;">
            <div class="section-title" style="color:#fff;">系统亮点</div>
            <ul style="line-height:1.9; margin:0; padding-left:20px;">
              <li>三级角色端统一管理，支持路由权限控制</li>
              <li>多层菜单 + 二级标签布局，更适合医院业务场景</li>
              <li>号源挂号、医生叫号、就诊病历、住院登记业务链完整</li>
              <li>前后端分离开发，接口统一对接</li>
            </ul>
          </div>
        </section>
        <section class="auth-panel">
          <PageContainer title="快速入口" desc="请选择角色进入对应系统">
            <div class="doctor-card-grid">
              <div class="doctor-card" v-for="entry in entries" :key="entry.role">
                <div class="doctor-card-header">
                  <div>
                    <h3 style="margin:0 0 6px;">{{ entry.title }}</h3>
                    <div class="muted">{{ entry.desc }}</div>
                  </div>
                  <el-tag>{{ entry.tag }}</el-tag>
                </div>
                <div class="muted" style="min-height:48px; line-height:1.7;">{{ entry.features }}</div>
                <div style="margin-top: 16px; display:flex; gap:10px; flex-wrap:wrap;">
                  <el-button type="primary" @click="router.push(`/login/${entry.role}`)">进入{{ entry.title }}</el-button>
                  <el-button v-if="entry.canRegister" @click="router.push(`/register/${entry.role}`)">立即注册</el-button>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
import PageContainer from '../../components/PageContainer.vue'
const router = useRouter()
const entries = [
  { role: 'admin', title: '管理员端', tag: '管理后台', desc: '平台数据总览与业务管理', features: '负责公告发布、排班配置、患者与医生信息查看、挂号/就诊/住院总览。' },
  { role: 'doctor', title: '医生端', tag: '医生工作台', desc: '面向出诊医生的就诊处理界面', features: '查看排班和挂号患者，执行叫号、填写病历、生成住院登记。', canRegister: true },
  { role: 'patient', title: '患者端', tag: '在线服务', desc: '面向患者的预约挂号平台', features: '查看当天医生、在线挂号、我的就诊记录、住院信息和账户充值。', canRegister: true }
]
</script>
