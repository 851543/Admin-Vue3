<template>
  <div class="page-content">
    <table-bar
      :showTop="false"
      @search="handleQuery"
      @reset="(resetForm(queryRef), (dateRange = []))"
      @changeColumn="changeColumn"
      :columns="columns"
    >
      <template #top>
        <el-form :model="queryParams" ref="queryRef" label-width="82px">
          <el-row :gutter="20">
            <form-input
              label="用户账号"
              prop="userName"
              v-model="queryParams.userName"
              @keyup.enter="handleQuery"
            />
            <form-input
              label="登录地址"
              prop="ipaddr"
              v-model="queryParams.ipaddr"
              @keyup.enter="handleQuery"
            />
            <form-select
              label="状态"
              prop="status"
              v-model="queryParams.status"
              :options="sysCommonStatus"
            />
            <el-col :xs="24" :sm="12" :lg="6">
              <el-form-item label="登录时间">
                <el-date-picker
                  v-model="dateRange"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
                ></el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :lg="6">
              <el-form-item :label="`&nbsp;`" />
            </el-col>
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button
          @click="handleDelete"
          :disabled="multiple"
          v-auth="['monitor:logininfor:remove']"
          v-ripple
          >删除
        </el-button>
        <el-button @click="handleClean" v-auth="['monitor:logininfor:remove']" v-ripple
          >清空
        </el-button>
        <el-button
          @click="handleUnlock"
          :disabled="single"
          v-auth="['monitor:logininfor:unlock']"
          v-ripple
          >解锁</el-button
        >
        <el-button @click="handleExport" v-auth="['monitor:logininfor:export']" v-ripple
          >导出
        </el-button>
      </template>
    </table-bar>

    <art-table
      v-loading="loading"
      :data="logininforList"
      selection
      :total="total"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
      row-key="infoId"
    >
      <template #default>
        <el-table-column label="访问编号" align="center" prop="infoId" v-if="columns[0].show" />
        <el-table-column label="用户账号" align="center" prop="userName" v-if="columns[1].show" />
        <el-table-column label="登录地址" align="center" prop="ipaddr" v-if="columns[2].show" />
        <el-table-column
          label="登录地点"
          align="center"
          prop="loginLocation"
          v-if="columns[3].show"
        />
        <el-table-column label="浏览器类型" align="center" prop="browser" v-if="columns[4].show" />
        <el-table-column label="操作系统" align="center" prop="os" v-if="columns[5].show" />
        <el-table-column label="登录状态" align="center" prop="status" v-if="columns[6].show">
          <template #default="scope">
            <dict-tag :options="sysCommonStatus" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column
          label="提示消息"
          align="center"
          prop="msg"
          :show-overflow-tooltip="true"
          v-if="columns[7].show"
        />
        <el-table-column label="登陆时间" sortable align="center" prop="loginTime" width="180" />
      </template>
    </art-table>
  </div>
</template>

<script setup lang="ts">
  import { LogininforService } from '@/api/monitor/logininforApi'
  import { ref, reactive } from 'vue'
  import { resetForm } from '@/utils/utils'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { LogininforResult } from '@/types/monitor/logininfor'
  const logininforList = ref<LogininforResult[]>([])
  const single = ref(true)
  const loading = ref(true)
  const ids = ref([])
  const multiple = ref(true)
  const dateRange = ref([])
  const total = ref(0)
  const queryRef = ref()
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    userName: '',
    ipaddr: '',
    status: ''
  })

  import { addDateRange } from '@/utils/utils'
  /** 查询系统访问记录列表 */
  const getList = async () => {
    loading.value = true
    const res = await LogininforService.listLogininfor(addDateRange(queryParams, dateRange.value))
    if (res.code === 200) {
      logininforList.value = res.rows
      total.value = res.total
      loading.value = false
    }
  }

  const columns = reactive([
    { name: '访问ID', show: true },
    { name: '用户账号', show: true },
    { name: '登录IP地址', show: true },
    { name: '登录地点', show: true },
    { name: '浏览器类型', show: true },
    { name: '操作系统', show: true },
    { name: '登录状态', show: true },
    { name: '提示消息', show: true },
    { name: '访问时间', show: true }
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
    ids.value = selection.map((item: any) => item.infoId)
    multiple.value = !selection.length
    single.value = selection.length != 1
  }

  /** 删除按钮操作 */
  const handleDelete = async (row: any) => {
    const _infoIds = row.infoId || ids.value
    const Tr = await ElMessageBox.confirm(
      '是否确认删除系统访问记录编号为"' + _infoIds + '"的数据项？'
    )
    if (Tr) {
      const res = await LogininforService.deleteLogininfor(_infoIds)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    }
  }

  // 清空按钮操作
  const handleClean = async () => {
    const Tr = await ElMessageBox.confirm('是否确认清空所有登录日志数据项?')
    if (Tr) {
      const res = await LogininforService.cleanLogininfor()
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    }
  }

  // 解锁按钮操作
  const handleUnlock = async (row: any) => {
    const _infoId = row.infoId || ids.value
    const Tr = await ElMessageBox.confirm('是否确认解锁用户账号为"' + _infoId + '"的数据项？')
    if (Tr) {
      const res = await LogininforService.unlockLogininfor(_infoId)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    }
  }

  import { downloadExcel } from '@/utils/utils'

  /** 导出按钮操作 */
  const handleExport = () => {
    downloadExcel(LogininforService.exportExcel(queryParams))
  }

  import { useDict, DictType } from '@/utils/dict'
  const sysCommonStatus = ref<DictType[]>([]) // 系统字典数据
  const getuseDict = async () => {
    const { sys_common_status } = await useDict('sys_common_status')
    sysCommonStatus.value = sys_common_status
  }

  // 初始化
  onMounted(() => {
    getuseDict()
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
