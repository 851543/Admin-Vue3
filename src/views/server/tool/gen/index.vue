<template>
  <div class="page-content">
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

    <art-table :data="tableData" selection :currentPage="1" :pageSize="10" :total="50">
      <template #default>
        <el-table-column label="序号" prop="id" />
        <el-table-column label="表名称" prop="tableName" />
        <el-table-column label="表描述" prop="tableComment" />
        <el-table-column label="实体" prop="entityName" />
        <el-table-column label="创建时间" sortable prop="createTime" />
        <el-table-column label="更新时间" prop="updateTime" />
        <el-table-column label="操作" prop="action">
          <template #default="scope">
            <el-button type="primary" plain icon="Edit" v-ripple>修改</el-button>
            <el-button type="danger" plain icon="Delete" v-ripple>删除</el-button>
          </template>
        </el-table-column>
      </template>
    </art-table>
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
  import { GenTableModel } from '@/types/generator'

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

  const search = () => {}

  const changeColumn = (list: any) => {
    columns.values = list
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
      tableData.value = res.data
    }
  }

  onMounted(() => {
    getList()
  })
</script>

<style lang="scss" scoped>
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
</style>
