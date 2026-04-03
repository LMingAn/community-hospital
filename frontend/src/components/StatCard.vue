<template>
    <div class="dashboard-item">
        <h4>{{ title }}</h4>
        <div class="num">{{ value }}</div>
        <div class="muted" v-if="desc" style="margin-top:10px;">{{ desc }}</div>
    </div>
</template>
<script setup>
defineProps({ title: String, value: [String, Number], desc: String })
</script>
