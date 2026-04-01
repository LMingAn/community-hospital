<template>
  <div class="page-card page-block">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:14px;">
      <div>
        <h2 class="section-title">{{ title }}</h2>
        <div class="muted" v-if="desc">{{ desc }}</div>
      </div>
      <slot name="extra" />
    </div>
    <slot />
  </div>
</template>
<script setup>
defineProps({ title: String, desc: String })
</script>
