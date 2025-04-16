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
            <form-input label="表名称" prop="tableName" v-model="searchForm.tableName" />
            <form-input label="表描述" prop="tableComment" v-model="searchForm.tableComment" />
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
        <el-button :disabled="multiple" v-ripple>生成</el-button>
        <el-button @click="openCreateTable" v-ripple>创建</el-button>
        <el-button @click="openImportTable" v-ripple>导入</el-button>
        <el-button :disabled="multiple" v-ripple>删除</el-button>
      </template>
    </table-bar>

    <!-- 代码生成列表 -->
    <art-table :data="tableData" selection @selection-change="handleSelectionChange">
      <template #default>
        <el-table-column label="表名称" prop="tableName" />
        <el-table-column label="表描述" prop="tableComment" />
        <el-table-column label="实体" prop="entityName" />
        <el-table-column label="创建时间" sortable prop="createTime" />
        <el-table-column label="更新时间" prop="updateTime" />
        <el-table-column label="操作" prop="action" width="350px">
          <template #default="scope">
            <button-table text="预览" @click="handlePreview(scope.row)" v-ripple />
            <button-table type="edit" @click="handleEditTable(scope.row)" v-ripple />
            <button-table type="delete" v-ripple />
            <button-table text="同步" v-ripple />
            <button-table text="生成代码" v-ripple />
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 预览界面 -->
    <el-dialog
      :title="preview.title"
      v-model="preview.open"
      width="80%"
      append-to-body
      class="preview-dialog"
    >
      <el-tabs v-model="preview.activeName" class="preview-tabs">
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
          <div class="code-wrapper">
            <pre class="preview-code">{{ value }}</pre>
          </div>
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
  import { useRouter } from 'vue-router'

  const router = useRouter()
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

  const changeColumn = (list: any) => {
    columns.values = list
  }

  const ids = ref<string[]>([])
  const handleSelectionChange = (selection: any) => {
    ids.value = selection.map((item: any) => item.tableId)
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

  onMounted(() => {
    getList()
  })
</script>

<style lang="scss" scoped>
  .page-content {
    width: 100%;
    height: 100%;

    :deep(.preview-dialog) {
      .el-dialog {
        height: 90vh;
        margin-top: 5vh !important;
        display: flex;
        flex-direction: column;

        .el-dialog__body {
          flex: 1;
          overflow: hidden;
          padding: 0;
        }

        .preview-tabs {
          height: 100%;
          display: flex;
          flex-direction: column;

          .el-tabs__content {
            flex: 1;
            overflow: hidden;
            padding: 10px;

            .el-tab-pane {
              height: 100%;
            }
          }
        }

        .code-wrapper {
          height: calc(100% - 30px);
          margin-top: 10px;
          overflow: hidden;
        }

        .preview-code {
          height: 100%;
          overflow: auto;
          margin: 0;
          padding: 15px;
          background-color: #f5f7fa;
          border-radius: 4px;
          font-family: Consolas, Monaco, 'Andale Mono', monospace;
          white-space: pre;
          word-break: normal;
          word-wrap: normal;
        }
      }
    }

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
</style>
