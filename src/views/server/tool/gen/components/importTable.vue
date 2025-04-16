<template>
  <el-dialog v-model="visible" title="导入表" width="1200px" append-to-body>
    <!-- 导入表 -->
    <el-form :model="queryParams" ref="queryRef">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :lg="6">
          <el-form-item label="表名称" prop="tableName">
            <el-input v-model="queryParams.tableName" placeholder="请输入表名称" clearable />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <el-form-item label="表描述" prop="tableComment">
            <el-input v-model="queryParams.tableComment" placeholder="请输入表描述" clearable />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="12">
          <el-button @click="handleQuery" v-ripple>搜索</el-button>
          <el-button @click="resetForm(queryRef)" v-ripple>重置</el-button>
        </el-col>
      </el-row>
    </el-form>

    <art-table
      :data="dbTableList"
      selection
      @selection-change="handleSelectionChange"
      @current-change="handleCurrentChange"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      :total="total"
      @size-change="handleSizeChange"
      row-key="tableName"
    >
      <template #default>
        <el-table-column label="表名称" prop="tableName" />
        <el-table-column label="表描述" prop="tableComment" />
        <el-table-column label="创建时间" prop="createTime" />
        <el-table-column label="更新时间" prop="updateTime" />
      </template>
    </art-table>
    <div style="text-align: right; margin-top: 20px">
      <el-button type="primary" @click="handleImportTable">确定</el-button>
      <el-button @click="visible = false">取消</el-button>
    </div>
  </el-dialog>
</template>

<script setup>
  import { GeneratorApi } from '@/api/tool/generatorApi'
  import { resetForm } from '@/utils/utils'

  const total = ref(0)
  const visible = ref(false)
  const tables = ref([])
  const dbTableList = ref([])
  const queryRef = ref(null)

  const queryParams = reactive({
    pageNum: 1,
    pageSize: 5,
    tableName: '',
    tableComment: ''
  })

  const emit = defineEmits(['ok'])

  /** 查询参数列表 */
  function show() {
    getList()
    visible.value = true
  }

  const handleCurrentChange = (page) => {
    queryParams.pageNum = page
    getList()
  }

  const handleSizeChange = (size) => {
    queryParams.pageSize = size
    getList()
  }

  /** 多选框选中数据 */
  function handleSelectionChange(selection) {
    tables.value = selection.map((item) => item.tableName)
  }

  /** 查询表数据 */
  const getList = async () => {
    const res = await GeneratorApi.dbList(queryParams)
    if (res.code === 200) {
      dbTableList.value = res.rows
      total.value = res.total
    }
  }

  /** 搜索按钮操作 */
  const handleQuery = () => {
    queryParams.pageNum = 1
    getList()
  }

  /** 导入按钮操作 */
  const handleImportTable = async () => {
    const tableNames = tables.value.join(',')
    if (tableNames == '') {
      ElMessage.error('请选择要导入的表')
      return
    }
    const res = await GeneratorApi.importTable({ tables: tableNames })
    if (res.code === 200) {
      visible.value = false
      ElMessage.success(res.msg)
      emit('ok')
    }
  }

  defineExpose({
    show
  })
</script>
