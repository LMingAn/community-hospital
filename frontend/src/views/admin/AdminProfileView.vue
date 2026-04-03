<template>
    <PageContainer title="管理员信息" desc="查看当前管理员账号资料">
        <div class="info-grid">
            <div class="info-item" v-for="(value, key) in profileMap" :key="key">
                <label>{{ key }}</label>
                <div>{{ value || '-' }}</div>
            </div>
        </div>
    </PageContainer>
</template>
<script setup>
import { computed, onMounted, ref } from 'vue'; 
import { adminApi } from '../../api/modules'; 
import PageContainer from '../../components/PageContainer.vue'; 
const profile = ref({}); 
const profileMap = computed(() => ({ 
    管理员账号: profile.value.username, 
    管理员昵称: profile.value.nickname, 
    联系电话: profile.value.phone, 
    电子邮箱: profile.value.email 
}));
onMounted(async () => { const res = await adminApi.profile(); profile.value = res.data })
</script>
