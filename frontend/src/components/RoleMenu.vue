<template>
  <div>
    <template v-for="group in menus" :key="group.key">
      <div class="menu-group-title">{{ group.title }}</div>
      <el-menu :default-active="activePath" :router="true" background-color="#ffffff" text-color="#3c4d67" active-text-color="#2f6bce">
        <el-menu-item v-for="tab in group.tabs" :key="tab.path" :index="tab.path"><span>{{ tab.label }}</span></el-menu-item>
      </el-menu>
    </template>
  </div>
</template>
<script setup>
defineProps({ menus: { type: Array, default: () => [] }, activePath: { type: String, default: '' } })
</script>
<style scoped>.el-menu { border-right: none; }</style>
