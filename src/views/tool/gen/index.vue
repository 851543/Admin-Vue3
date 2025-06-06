<template>
  <div class="page-content">
    <!-- 代码生成 -->
    <table-bar
      :showTop="false"
      @search="search"
      @reset="resetForm(searchFormRef)"
      @changeColumn="changeColumn"
      :columns="columns"
    >
      <template #top>
        <el-form :model="searchForm" ref="searchFormRef" label-width="82px">
          <el-row :gutter="20">
            <form-input
              label="表名称"
              prop="tableName"
              @keyup.enter="search"
              v-model="searchForm.tableName"
            />
            <form-input
              label="表描述"
              prop="tableComment"
              @keyup.enter="search"
              v-model="searchForm.tableComment"
            />
            <el-form-item label="创建时间">
              <el-date-picker
                v-model="searchForm.createTime"
                value-format="YYYY-MM-DD"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
              ></el-date-picker>
            </el-form-item>
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button :disabled="multiple" @click="handleGenTable" v-ripple>生成</el-button>
        <el-button @click="openCreateTable" v-ripple>创建</el-button>
        <el-button @click="openImportTable" v-ripple>导入</el-button>
        <el-button :disabled="multiple" @click="handleDelete" v-ripple>删除</el-button>
      </template>
    </table-bar>

    <!-- 代码生成列表 -->
    <art-table
      :data="tableData"
      selection
      @selection-change="handleSelectionChange"
      :total="total"
      :current-page="searchForm.pageNum"
      :page-size="searchForm.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      row-key="tableId"
    >
      <template #default>
        <el-table-column label="表名称" prop="tableName" v-if="columns[0].show" />
        <el-table-column label="表描述" prop="tableComment" v-if="columns[1].show" />
        <el-table-column label="实体" prop="entityName" v-if="columns[2].show" />
        <el-table-column label="创建时间" sortable prop="createTime" v-if="columns[3].show" />
        <el-table-column label="更新时间" prop="updateTime" v-if="columns[4].show" />
        <el-table-column label="操作" prop="action" width="350px" align="center">
          <template #default="scope">
            <button-table icon="&#xe689;" type="add" @click="handlePreview(scope.row)" v-ripple />
            <button-table type="edit" @click="handleEditTable(scope.row)" v-ripple />
            <button-table type="delete" @click="handleDelete(scope.row)" v-ripple />
            <button-table icon="&#xe615;" type="add" @click="handleSynchDb(scope.row)" v-ripple />
            <button-table icon="&#xe89f;" type="add" @click="handleGenTable(scope.row)" v-ripple />
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 预览界面 -->
    <el-dialog
      :title="preview.title"
      v-model="preview.open"
      width="80%"
      top="5vh"
      append-to-body
      class="preview-dialog"
    >
      <el-tabs v-model="preview.activeName">
        <el-tab-pane
          v-for="(value, key) in preview.data"
          :label="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))"
          :name="key.substring(key.lastIndexOf('/') + 1, key.indexOf('.vm'))"
          :key="value"
        >
          <el-link
            :underline="false"
            icon="DocumentCopy"
            v-copyText="value"
            v-copyText:callback="copyTextSuccess"
            style="float: right"
            >&nbsp;复制</el-link
          >
          <pre>{{ value }}</pre>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
    <create-table ref="createTableRef" @ok="handleQuery" />
    <import-table ref="importTableRef" @ok="handleQuery" />
  </div>
</template>

<script setup lang="ts">
  import { FormInstance } from 'element-plus'
  import { resetForm } from '@/utils/utils'
  import createTable from './components/createTable.vue'
  import importTable from './components/importTable.vue'
  import { GeneratorApi } from '@/api/tool/generatorApi'
  import { GenTableModel } from '@/types/tool/generator'
  import { useRouter, useRoute } from 'vue-router'
  import { downloadZip } from '@/utils/utils'

  const router = useRouter()
  const route = useRoute()
  const total = ref(0)
  const tableData = ref<GenTableModel[]>([])

  const multiple = ref(true)

  const columns = reactive([
    { name: '表名称', show: true },
    { name: '表描述', show: true },
    { name: '实体', show: true },
    { name: '创建时间', show: true },
    { name: '更新时间', show: true }
  ])

  const searchFormRef = ref<FormInstance>()
  const searchForm = reactive({
    pageNum: 1,
    pageSize: 10,
    tableName: '',
    tableComment: '',
    createTime: []
  })

  const preview = reactive({
    title: '代码预览',
    open: false,
    activeName: 'domain.java',
    data: {} as Record<string, string>
  })
  const search = () => {}

  /** 每页条数改变 */
  const handleSizeChange = (size: number) => {
    searchForm.pageSize = size
    getList()
  }

  /** 当前页改变 */
  const handleCurrentChange = (page: number) => {
    searchForm.pageNum = page
    getList()
  }

  const changeColumn = (list: any) => {
    columns.values = list
  }

  const ids = ref<string[]>([])
  const tableNames = ref([])
  const handleSelectionChange = (selection: any) => {
    ids.value = selection.map((item: any) => item.tableId)
    tableNames.value = selection.map((item: any) => item.tableName)
    multiple.value = !selection.length
  }

  const createTableRef = ref<InstanceType<typeof createTable>>()
  const importTableRef = ref<InstanceType<typeof importTable>>()

  // 创建表
  const openCreateTable = () => {
    createTableRef.value.show()
  }

  // 导入表
  const openImportTable = () => {
    importTableRef.value.show()
  }

  const handleQuery = () => {
    searchForm.pageNum = 1
    getList()
  }

  const getList = async () => {
    // searchForm.pageNum = route.query.pageNum ? Number(route.query.pageNum) : searchForm.pageNum
    const res = await GeneratorApi.genList(searchForm)
    if (res.code === 200) {
      tableData.value = res.rows
      total.value = res.total
    }
  }

  /** 修改按钮操作 */
  const handleEditTable = (row: any) => {
    const tableId = row.tableId || ids.value[0]
    router.push({
      path: '/tool/gen-edit/index/' + tableId,
      query: { pageNum: searchForm.pageNum }
    })
  }

  const handlePreview = async (row: any) => {
    const res = await GeneratorApi.preview(row.tableId)
    if (res.code === 200) {
      preview.data = res.data
      preview.open = true
      preview.activeName = 'domain.java'
    }
  }

  /** 复制代码成功 */
  const copyTextSuccess = () => {
    ElMessage.success('复制成功')
  }

  /** 删除按钮操作 */
  const handleDelete = async (row: any) => {
    const tableIds = row.tableId || ids.value
    const _tableNames = row.tableName || tableNames.value.join(',')
    const Tr = await ElMessageBox.confirm('是否确认删除表名称为"' + _tableNames + '"的数据项？')
    if (Tr) {
      const res = await GeneratorApi.remove(tableIds)
      if (res.code === 200) {
        ElMessage.success(res.msg)
        getList()
      }
    }
  }

  /** 同步数据库操作 */
  const handleSynchDb = async (row: any) => {
    const tableName = row.tableName
    const Tr = await ElMessageBox.confirm('是否确认同步表编号为"' + tableName + '"的数据项？')
    if (Tr) {
      const res = await GeneratorApi.synchDb(tableName)
      if (res.code === 200) {
        ElMessage.success(res.msg)
      }
    }
  }

  /** 生成代码操作 */
  const handleGenTable = async (row: any) => {
    const tbNames = row.tableName || tableNames.value.join(',')
    if (tbNames == '') {
      ElMessage.error('请选择要生成的数据')
      return
    }
    if (row.genType === '1') {
      const res = await GeneratorApi.genCode(tbNames)
      if (res.code === 200) {
        ElMessage.success('成功生成到自定义路径：' + row.genPath)
      }
    } else {
      downloadZip(GeneratorApi.batchGenCode(tbNames))
    }
  }

  onMounted(() => {
    getList()
  })
</script>

<style lang="scss">
  .page-content {
    width: 100%;
    height: 100%;

    .user {
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 6px;
      }

      > div {
        margin-left: 10px;

        .user-name {
          font-weight: 500;
          color: var(--art-text-gray-800);
        }
      }
    }
  }

  .preview-dialog {
    overflow: auto;
    overflow-x: hidden;
    max-height: 70vh;
    padding: 10px 20px 0;

    :deep(pre) {
      margin: 0;
      padding: 16px;
      overflow: auto;
      font-size: 14px;
      line-height: 1.5;
      background-color: #f6f8fa;
      border-radius: 6px;
    }
  }
</style>
