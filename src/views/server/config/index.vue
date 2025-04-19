<template>
  <div class="page-content">
    <table-bar
      :showTop="false"
      @search="handleQuery"
      @reset="resetForm(queryRef)"
      @changeColumn="changeColumn"
      :columns="columns"
    >
      <template #top>
        <el-form :model="queryParams" ref="queryRef" label-width="82px">
          <el-row :gutter="20">
            <form-input
              label="参数名称"
              prop="configName"
              v-model="queryParams.configName"
              @keyup.enter="handleQuery"
            />
            <form-input
              label="参数键名"
              prop="configKey"
              v-model="queryParams.configKey"
              @keyup.enter="handleQuery"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['system:config:add']" v-ripple
          >添加参数配置
        </el-button>
        <el-button
          @click="handleDelete"
          :disabled="multiple"
          v-auth="['system:config:remove']"
          v-ripple
          >删除
        </el-button>
        <el-button @click="handleExport" v-auth="['system:config:export']" v-ripple
          >导出
        </el-button>
      </template>
    </table-bar>

    <art-table
      v-loading="loading"
      :data="configList"
      selection
      :total="total"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @pagination="getList"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="参数主键" align="center" prop="configId" v-if="columns[0].show" />
      <el-table-column label="参数名称" align="center" prop="configName" v-if="columns[1].show" />
      <el-table-column label="参数键名" align="center" prop="configKey" v-if="columns[2].show" />
      <el-table-column label="参数键值" align="center" prop="configValue" v-if="columns[3].show" />
      <el-table-column label="系统内置" align="center" prop="configType" v-if="columns[4].show" />
      <el-table-column label="备注" align="center" prop="remark" v-if="columns[5].show" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <button-table
            type="edit"
            v-auth="['system:config:edit']"
            @click="handleUpdate(scope.row)"
          />
          <button-table
            type="delete"
            v-auth="['system:config:remove']"
            @click="handleDelete(scope.row)"
          />
        </template>
      </el-table-column>
    </art-table>

    <!-- 添加或修改参数配置对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="configRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="参数名称" prop="configName">
          <el-input v-model="form.configName" placeholder="请输入参数名称" />
        </el-form-item>
        <el-form-item label="参数键名" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入参数键名" />
        </el-form-item>
        <el-form-item label="参数键值" prop="configValue">
          <el-input v-model="form.configValue" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ConfigService } from '@/api/system/configApi'
  import { ref, reactive } from 'vue'
  import { resetForm } from '@/utils/utils'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { FormInstance } from 'element-plus'
  import { ConfigResult } from '@/types/system/config'
  const configList = ref<ConfigResult[]>([])
  const open = ref(false)
  const loading = ref(true)
  const ids = ref([])
  const single = ref(true)
  const multiple = ref(true)
  const total = ref(0)
  const title = ref('')
  const queryRef = ref()
  const configRef = ref<FormInstance>()
  // 定义初始表单状态
  const initialFormState = {
    configId: null,
    configName: null,
    configKey: null,
    configValue: null,
    configType: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null
  }
  const form = reactive({ ...initialFormState })
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    configName: '',
    configKey: '',
    configValue: '',
    configType: ''
  })
  const rules = reactive({})

  /** 查询参数配置列表 */
  const getList = async () => {
    loading.value = true
    const res = await ConfigService.listConfig(queryParams)
    if (res.code === 200) {
      configList.value = res.rows
      total.value = res.total
      loading.value = false
    }
  }

  const columns = reactive([
    { name: '参数主键', show: true },
    { name: '参数名称', show: true },
    { name: '参数键名', show: true },
    { name: '参数键值', show: true },
    { name: '系统内置', show: true },
    { name: '备注', show: true }
  ])

  const changeColumn = (list: any) => {
    columns.values = list
  }

  // 取消按钮
  const cancel = () => {
    open.value = false
    reset()
  }

  // 表单重置
  const reset = () => {
    // 重置表单数据到初始状态
    Object.assign(form, initialFormState)
    resetForm(configRef.value)
  }

  /** 搜索按钮操作 */
  const handleQuery = () => {
    queryParams.pageNum = 1
    getList()
  }

  // 多选框选中数据
  const handleSelectionChange = (selection: any) => {
    ids.value = selection.map((item: any) => item.configId)
    single.value = selection.length != 1
    multiple.value = !selection.length
  }

  /** 新增按钮操作 */
  const handleAdd = () => {
    reset()
    open.value = true
    title.value = '添加参数配置'
  }

  /** 修改按钮操作 */
  const handleUpdate = async (row: any) => {
    reset()
    const _configId = row.configId || ids.value
    const res = await ConfigService.getConfig(_configId)
    if (res.code === 200) {
      Object.assign(form, res.data)
      open.value = true
      title.value = '修改参数配置'
    }
  }

  /** 提交按钮 */
  const submitForm = async () => {
    if (!configRef.value) return
    await configRef.value.validate(async (valid) => {
      if (valid) {
        if (form.configId != null) {
          const res = await ConfigService.updateConfig(form)
          if (res.code === 200) {
            ElMessage.success(res.msg)
            open.value = false
            getList()
          }
        } else {
          const res = await ConfigService.addConfig(form)
          if (res.code === 200) {
            ElMessage.success(res.msg)
            open.value = false
            getList()
          }
        }
      }
    })
  }

  /** 删除按钮操作 */
  const handleDelete = async (row: any) => {
    const _configIds = row.configId || ids.value
    const Tr = await ElMessageBox.confirm(
      '是否确认删除参数配置编号为"' + _configIds + '"的数据项？'
    )
    if (Tr) {
      const res = await ConfigService.deleteConfig(_configIds)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    }
  }

  import { downloadExcel } from '@/utils/utils'

  /** 导出按钮操作 */
  const handleExport = () => {
    downloadExcel(ConfigService.exportExcel(queryParams))
  }

  // 初始化
  onMounted(() => {
    getList()
  })
</script>
