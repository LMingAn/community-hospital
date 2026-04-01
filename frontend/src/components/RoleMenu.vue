<template>
  <el-menu
    :default-active="activePath"
    :default-openeds="defaultOpeneds"
    :router="true"
    unique-opened
    class="role-menu"
    background-color="#ffffff"
    text-color="#3c4d67"
    active-text-color="#2f6bce"
  >
    <el-sub-menu v-for="group in menus" :key="group.key" :index="group.key">
      <template #title>
        <span class="menu-title-wrap">
          <span class="material-symbols-outlined menu-icon">{{ group.icon || 'folder' }}</span>
          <span>{{ group.title }}</span>
        </span>
      </template>
      <el-menu-item v-for="tab in group.tabs" :key="tab.path" :index="tab.path">
        <span>{{ tab.label }}</span>
      </el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({ menus: { type: Array, default: () => [] }, activePath: { type: String, default: '' } })
const defaultOpeneds = computed(() => {
  const activeGroup = props.menus.find((item) => item.tabs.some((tab) => tab.path === props.activePath))
  return activeGroup ? [activeGroup.key] : []
})
</script>

<style scoped>
.role-menu {
  border-right: none;
  padding: 10px 8px 18px;
}
.menu-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}
.menu-icon {
  font-size: 18px;
}
</style>
