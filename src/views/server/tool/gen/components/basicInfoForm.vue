<template>
  <el-form ref="basicInfoForm" :model="form" :rules="rules" label-width="150px">
    <el-row>
      <el-col :span="12">
        <el-form-item label="表名称" prop="tableName">
          <el-input placeholder="请输入仓库名称" v-model="form.tableName" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="表描述" prop="tableComment">
          <el-input placeholder="请输入" v-model="form.tableComment" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="实体类名称" prop="className">
          <el-input placeholder="请输入" v-model="form.className" />
        </el-form-item>
      </el-col>
      <el-col :span="12">
        <el-form-item label="作者" prop="functionAuthor">
          <el-input placeholder="请输入" v-model="form.functionAuthor" />
        </el-form-item>
      </el-col>
      <el-col :span="24">
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" :rows="3" v-model="form.remark"></el-input>
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>

<script setup>
  import { ref, watch } from 'vue'

  const props = defineProps({
    info: {
      type: Object,
      default: null
    }
  })

  const form = ref({ ...props.info })

  watch(
    () => props.info,
    (val) => {
      form.value = { ...val }
    },
    { deep: true }
  )

  // 表单校验
  const rules = ref({
    tableName: [{ required: true, message: '请输入表名称', trigger: 'blur' }],
    tableComment: [{ required: true, message: '请输入表描述', trigger: 'blur' }],
    className: [{ required: true, message: '请输入实体类名称', trigger: 'blur' }],
    functionAuthor: [{ required: true, message: '请输入作者', trigger: 'blur' }]
  })

  // 暴露方法给父组件
  defineExpose({
    getFormData: () => {
      return {
        tableName: form.value.tableName,
        tableComment: form.value.tableComment,
        className: form.value.className,
        functionAuthor: form.value.functionAuthor,
        remark: form.value.remark
      }
    }
  })
</script>
