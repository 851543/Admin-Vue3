<template>
  <!-- 创建表 -->
  <el-dialog title="创建表" v-model="visible" width="800px" top="5vh" append-to-body>
    <span>创建表语句(支持多个建表语句)：</span>
    <el-input type="textarea" :rows="10" placeholder="请输入文本" v-model="content"></el-input>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleImportTable">确 定</el-button>
        <el-button @click="visible = false">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
  import { GeneratorApi } from '@/api/tool/generatorApi'

  const visible = ref(false)
  const content = ref('')
  const emit = defineEmits(['ok'])

  /** 显示弹框 */
  const show = () => {
    visible.value = true
  }

  /** 导入按钮操作 */
  const handleImportTable = async () => {
    if (content.value === '') {
      ElMessage.error('请输入建表语句')
      return
    }
    const res = await GeneratorApi.createTable({ sql: content.value })
    if (res.code === 200) {
      visible.value = false
      emit('ok')
    }
  }

  defineExpose({
    show
  })
</script>
