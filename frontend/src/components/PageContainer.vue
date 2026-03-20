<template>
  <div class="page-card page-block">
    <div class="page-header">
      <h2 class="section-title">{{ title }}</h2>
      <div class="muted" v-if="desc">{{ desc }}</div>
    </div>
    <div class="page-extra" v-if="$slots.extra">
      <slot name="extra" />
    </div>
    <slot />
  </div>
</template>
<script setup>
defineProps({ title: String, desc: String })
</script>
