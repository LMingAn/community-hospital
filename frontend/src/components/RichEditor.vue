<template>
  <div class="rich-editor">
    <div class="rich-toolbar">
      <el-button size="small" @click="exec('bold')">加粗</el-button>
      <el-button size="small" @click="exec('italic')">斜体</el-button>
      <el-button size="small" @click="exec('underline')">下划线</el-button>
      <el-button size="small" @click="exec('insertUnorderedList')">列表</el-button>
      <el-button size="small" @click="exec('removeFormat')">清除格式</el-button>
    </div>
    <div ref="editorRef" class="rich-content" contenteditable="true" @input="emitValue" v-html="modelValue" />
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
const props = defineProps({ modelValue: { type: String, default: '' } })
const emit = defineEmits(['update:modelValue'])
const editorRef = ref(null)
function exec(command) { document.execCommand(command); emitValue() }
function emitValue() { emit('update:modelValue', editorRef.value?.innerHTML || '') }
watch(() => props.modelValue, (value) => { if (editorRef.value && editorRef.value.innerHTML !== value) editorRef.value.innerHTML = value || '' })
</script>
