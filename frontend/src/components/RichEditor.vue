<template>
  <div class="rich-editor">
    <div class="rich-toolbar">
      <el-button size="small" @mousedown.prevent @click="exec('bold')">加粗</el-button>
      <el-button size="small" @mousedown.prevent @click="exec('italic')">斜体</el-button>
      <el-button size="small" @mousedown.prevent @click="exec('underline')">下划线</el-button>
      <el-button size="small" @mousedown.prevent @click="exec('insertUnorderedList')">列表</el-button>
      <el-button size="small" @mousedown.prevent @click="exec('removeFormat')">清除格式</el-button>
    </div>
    <div ref="editorRef" class="rich-content" contenteditable="true" @input="emitValue" />
  </div>
</template>
<script setup>
import { nextTick, ref, watch } from 'vue'
const props = defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])
const editorRef = ref(null)
let isSyncingFromOutside = false
function exec(command) {
  editorRef.value?.focus()
  document.execCommand(command)
  emitValue()
}
function emitValue() {
  if (isSyncingFromOutside) return
  emit('update:modelValue', editorRef.value?.innerHTML || '')
}
watch(
  () => props.modelValue,
  async (value) => {
    if (!editorRef.value) return
    const html = value || ''
    if (editorRef.value.innerHTML === html) return
    isSyncingFromOutside = true
    editorRef.value.innerHTML = html
    await nextTick()
    isSyncingFromOutside = false
  },
  { immediate: true }
)
</script>
