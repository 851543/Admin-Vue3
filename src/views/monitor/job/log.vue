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
              label="任务名称"
              prop="jobName"
              v-model="queryParams.jobName"
              @keyup.enter="handleQuery"
            />
            <form-input
              label="任务组名"
              prop="jobGroup"
              v-model="queryParams.jobGroup"
              @keyup.enter="handleQuery"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button
          @click="handleDelete"
          :disabled="multiple"
          v-auth="['system:log:remove']"
          v-ripple
          >删除
        </el-button>
        <el-button @click="handleClean" v-auth="['system:log:remove']" v-ripple>清空 </el-button>
        <el-button @click="handleExport" v-auth="['system:log:export']" v-ripple>导出 </el-button>
        <el-button @click="handleClose" v-ripple>关闭 </el-button>
      </template>
    </table-bar>

    <art-table
      v-loading="loading"
      :data="logList"
      selection
      :total="total"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
      row-key="jobLogId"
    >
      <template #default>
        <el-table-column
          label="任务日志编号"
          align="center"
          prop="jobLogId"
          v-if="columns[0].show"
        />
        <el-table-column label="任务名称" align="center" prop="jobName" v-if="columns[1].show" />
        <el-table-column label="任务组名" align="center" prop="jobGroup" v-if="columns[2].show" />
        <el-table-column
          label="调用目标字符串"
          align="center"
          prop="invokeTarget"
          v-if="columns[3].show"
        />
        <el-table-column
          label="日志信息"
          align="center"
          prop="jobMessage"
          :show-overflow-tooltip="true"
          v-if="columns[4].show"
        />
        <el-table-column label="执行状态" align="center" prop="status" v-if="columns[5].show" />
        <el-table-column
          label="异常信息"
          align="center"
          prop="exceptionInfo"
          v-if="columns[6].show"
        />
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <button-table
              type="delete"
              v-auth="['system:log:remove']"
              @click="handleDelete(scope.row)"
            />
          </template>
        </el-table-column>
      </template>
    </art-table>
  </div>
</template>

<script setup lang="ts">
  import { JobLogService } from '@/api/monitor/jobLogApi'
  import { ref, reactive } from 'vue'
  import { resetForm } from '@/utils/utils'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { JobLogResult } from '@/types/monitor/jobLog'
  const logList = ref<JobLogResult[]>([])
  const loading = ref(true)
  const ids = ref([])
  const multiple = ref(true)
  const total = ref(0)
  const queryRef = ref()
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    jobName: '',
    jobGroup: '',
    invokeTarget: '',
    jobMessage: '',
    status: '',
    exceptionInfo: ''
  })

  /** 查询定时任务调度日志列表 */
  const getList = async () => {
    loading.value = true
    const res = await JobLogService.listJobLog(queryParams)
    if (res.code === 200) {
      logList.value = res.rows
      total.value = res.total
      loading.value = false
    }
  }

  const columns = reactive([
    { name: '任务日志ID', show: true },
    { name: '任务名称', show: true },
    { name: '任务组名', show: true },
    { name: '调用目标字符串', show: true },
    { name: '日志信息', show: true },
    { name: '执行状态', show: true },
    { name: '异常信息', show: true }
  ])

  const changeColumn = (list: any) => {
    columns.values = list
  }

  /** 搜索按钮操作 */
  const handleQuery = () => {
    queryParams.pageNum = 1
    getList()
  }

  /** 每页条数改变 */
  const handleSizeChange = (size: number) => {
    queryParams.pageSize = size
    getList()
  }

  /** 当前页改变 */
  const handleCurrentChange = (page: number) => {
    queryParams.pageNum = page
    getList()
  }

  // 多选框选中数据
  const handleSelectionChange = (selection: any) => {
    ids.value = selection.map((item: any) => item.jobLogId)
    multiple.value = !selection.length
  }

  /** 清空按钮操作 */
  const handleClean = async () => {
    const Tr = await ElMessageBox.confirm('是否确认清空所有定时任务调度日志？')
    if (Tr) {
      const res = await JobLogService.cleanJobLog()
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    }
  }

  /** 删除按钮操作 */
  const handleDelete = async (row: any) => {
    const _jobLogIds = row.jobLogId || ids.value
    const Tr = await ElMessageBox.confirm(
      '是否确认删除定时任务调度日志编号为"' + _jobLogIds + '"的数据项？'
    )
    if (Tr) {
      const res = await JobLogService.delJobLog(_jobLogIds)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    }
  }

  import { useRouter } from 'vue-router'
  const router = useRouter()
  /** 关闭按钮操作 */
  const handleClose = () => {
    router.push({ path: '/monitor/job' })
  }

  import { downloadExcel } from '@/utils/utils'

  /** 导出按钮操作 */
  const handleExport = () => {
    downloadExcel(JobLogService.exportExcel(queryParams))
  }

  // 初始化
  onMounted(() => {
    getList()
  })
</script>
