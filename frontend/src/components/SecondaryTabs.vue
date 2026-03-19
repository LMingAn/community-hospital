<template>
  <div class="tabs-wrap">
    <router-link v-for="item in tabs" :key="item.path" :to="item.path" class="tab-chip" :class="{ active: item.path === activePath }">{{ item.label }}</router-link>
  </div>
</template>
<script setup>
defineProps({ tabs: { type: Array, default: () => [] }, activePath: { type: String, default: '' } })
</script>
