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
              label="模块标题"
              prop="title"
              v-model="queryParams.title"
              @keyup.enter="handleQuery"
            />
            <form-input
              label="操作人员"
              prop="operName"
              v-model="queryParams.operName"
              @keyup.enter="handleQuery"
            />
            <form-select
              label="业务类型"
              prop="businessType"
              v-model="queryParams.businessType"
              :options="sysOperType"
            />
            <form-select
              label="操作状态"
              prop="status"
              v-model="queryParams.status"
              :options="sysCommonStatus"
            />
            <form-input
              label="主机地址"
              prop="operIp"
              v-model="queryParams.operIp"
              @keyup.enter="handleQuery"
            />
            <form-input
              label="操作地点"
              prop="operLocation"
              v-model="queryParams.operLocation"
              @keyup.enter="handleQuery"
            />
            <el-col :xs="24" :sm="12" :lg="6">
              <el-form-item label="操作时间">
                <el-date-picker
                  v-model="dateRange"
                  value-format="YYYY-MM-DD HH:mm:ss"
                  type="daterange"
                  range-separator="-"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
                >
                </el-date-picker>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button
          @click="handleDelete"
          :disabled="multiple"
          v-auth="['monitor:operlog:remove']"
          v-ripple
          >删除
        </el-button>
        <el-button @click="handleClean" v-auth="['monitor:operlog:remove']" v-ripple
          >清空
        </el-button>
        <el-button @click="handleExport" v-auth="['monitor:operlog:export']" v-ripple
          >导出
        </el-button>
      </template>
    </table-bar>

    <art-table
      v-loading="loading"
      :data="operlogList"
      selection
      :total="total"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
      row-key="operId"
    >
      <template #default>
        <el-table-column label="日志主键" align="center" prop="operId" v-if="columns[0].show" />
        <el-table-column label="模块标题" align="center" prop="title" v-if="columns[1].show" />
        <el-table-column label="业务类型" align="center" prop="businessType" v-if="columns[2].show">
          <template #default="scope">
            <dict-tag :options="sysOperType" :value="scope.row.businessType" />
          </template>
        </el-table-column>
        <el-table-column
          label="方法名称"
          align="center"
          prop="method"
          :show-overflow-tooltip="true"
          v-if="columns[3].show"
        />
        <el-table-column
          label="请求方式"
          align="center"
          prop="requestMethod"
          v-if="columns[4].show"
        />
        <el-table-column
          label="操作类别"
          align="center"
          prop="operatorType"
          v-if="columns[5].show"
        />
        <el-table-column
          label="操作人员"
          sortable
          align="center"
          prop="operName"
          v-if="columns[6].show"
        />
        <el-table-column label="部门名称" align="center" prop="deptName" v-if="columns[7].show" />
        <el-table-column label="请求URL" align="center" prop="operUrl" v-if="columns[8].show" />
        <el-table-column label="主机地址" align="center" prop="operIp" v-if="columns[9].show" />
        <el-table-column
          label="操作地点"
          align="center"
          prop="operLocation"
          v-if="columns[10].show"
        />
        <el-table-column
          label="请求参数"
          align="center"
          prop="operParam"
          :show-overflow-tooltip="true"
          v-if="columns[11].show"
        />
        <el-table-column
          label="返回参数"
          align="center"
          prop="jsonResult"
          :show-overflow-tooltip="true"
          v-if="columns[12].show"
        />
        <el-table-column label="操作状态" align="center" prop="status" v-if="columns[13].show">
          <template #default="scope">
            <dict-tag :options="sysCommonStatus" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="错误消息" align="center" prop="errorMsg" v-if="columns[14].show" />
        <el-table-column label="操作时间" sortable align="center" prop="operTime" width="180" />
        <el-table-column
          label="消耗时间"
          sortable
          align="center"
          prop="costTime"
          v-if="columns[16].show"
        />
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <button-table icon="&#xe689;" type="add" @click="handleView(scope.row)" v-ripple />
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 操作日志详细 -->
    <el-dialog title="操作日志详细" v-model="open" width="800px" append-to-body>
      <el-form :model="form" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="操作模块："
              >{{ form.title }} / {{ typeFormat(form) }}</el-form-item
            >
            <el-form-item label="登录信息："
              >{{ form.operName }} / {{ form.operIp }} / {{ form.operLocation }}</el-form-item
            >
          </el-col>
          <el-col :span="12">
            <el-form-item label="请求地址：">{{ form.operUrl }}</el-form-item>
            <el-form-item label="请求方式：">{{ form.requestMethod }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="操作方法：">{{ form.method }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求参数：">
              <div class="param-container">
                <pre class="param-content">{{ form.operParam }}</pre>
                <el-button class="copy-btn" type="primary" link @click="handleCopy(form.operParam)">
                  复制
                </el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="返回参数：">{{ form.jsonResult }}</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="操作状态：">
              <div v-if="form.status === 0">正常</div>
              <div v-else-if="form.status === 1">失败</div>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="消耗时间：">{{ form.costTime }}毫秒</el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="操作时间：">{{ form.operTime }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="异常信息：" v-if="form.status === 1">{{
              form.errorMsg
            }}</el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="open = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { useClipboard } from '@vueuse/core'
  const { copy } = useClipboard()

  const handleCopy = async (text: string) => {
    await copy(text)
    ElMessage.success('复制成功')
  }

  import { OperLogService } from '@/api/monitor/operlogApi'
  import { ref, reactive } from 'vue'
  import { addDateRange, resetForm } from '@/utils/utils'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { OperLogResult } from '@/types/monitor/operlog'
  /** 操作日志类型 */
  const operlogList = ref<OperLogResult[]>([])
  const open = ref(false)
  const loading = ref(true)
  const ids = ref([])
  const multiple = ref(true)
  const total = ref(0)
  const queryRef = ref()
  const dateRange = ref([])
  // 定义初始表单状态
  const initialFormState = {
    operId: null,
    title: null,
    businessType: null,
    method: null,
    requestMethod: null,
    operatorType: null,
    operName: null,
    deptName: null,
    operUrl: null,
    operIp: null,
    operLocation: null,
    operParam: '',
    jsonResult: null,
    status: null,
    errorMsg: null,
    operTime: '',
    costTime: null
  }
  const form = reactive({ ...initialFormState })
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    title: '',
    businessType: '',
    status: '',
    operName: '',
    operIp: '',
    operLocation: ''
  })

  /** 查询操作日志记录列表 */
  const getList = async () => {
    loading.value = true
    const res = await OperLogService.listOperlog(addDateRange(queryParams, dateRange.value))
    if (res.code === 200) {
      operlogList.value = res.rows
      total.value = res.total
      loading.value = false
    }
  }

  /** 详细按钮操作 */
  const handleView = (row: any) => {
    open.value = true
    Object.assign(form, row)
  }

  const columns = reactive([
    { name: '日志主键', show: true },
    { name: '模块标题', show: true },
    { name: '业务类型', show: true },
    { name: '方法名称', show: false },
    { name: '请求方式', show: false },
    { name: '操作类别', show: false },
    { name: '操作人员', show: true },
    { name: '部门名称', show: false },
    { name: '请求URL', show: false },
    { name: '主机地址', show: true },
    { name: '操作地点', show: true },
    { name: '请求参数', show: false },
    { name: '返回参数', show: false },
    { name: '操作状态', show: true },
    { name: '错误消息', show: false },
    { name: '操作时间', show: true },
    { name: '消耗时间', show: true }
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
    ids.value = selection.map((item: any) => item.operId)
    multiple.value = !selection.length
  }

  /** 删除按钮操作 */
  const handleDelete = async (row: any) => {
    const _operIds = row.operId || ids.value
    const Tr = await ElMessageBox.confirm(
      '是否确认删除操作日志记录编号为"' + _operIds + '"的数据项？'
    )
    if (Tr) {
      const res = await OperLogService.deleteOperlog(_operIds)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    }
  }

  /** 清空按钮操作 */
  const handleClean = async () => {
    const Tr = await ElMessageBox.confirm('是否确认清空所有操作日志记录？')
    if (Tr) {
      const res = await OperLogService.cleanOperlog()
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    }
  }

  import { downloadExcel } from '@/utils/utils'

  /** 导出按钮操作 */
  const handleExport = () => {
    downloadExcel(OperLogService.exportExcel(queryParams))
  }

  import { useDict, DictType } from '@/utils/dict'
  const sysCommonStatus = ref<DictType[]>([]) // 系统字典数据
  const sysOperType = ref<DictType[]>([]) // 操作字典数据
  const getuseDict = async () => {
    const { sys_common_status } = await useDict('sys_common_status')
    sysCommonStatus.value = sys_common_status
    const { sys_oper_type } = await useDict('sys_oper_type')
    sysOperType.value = sys_oper_type
  }

  import { selectDictLabel } from '@/utils/utils'
  /** 操作日志类型字典翻译 */
  const typeFormat = (row: any) => {
    return selectDictLabel(sysOperType.value, row.businessType)
  }

  // 初始化
  onMounted(() => {
    getuseDict()
    getList()
  })
</script>

<style scoped>
  .param-container {
    position: relative;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
    padding: 8px;
    max-height: 200px;
    overflow-y: auto;
  }

  .param-content {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
    font-family: monospace;
    font-size: 14px;
    line-height: 1.5;
  }

  .copy-btn {
    position: absolute;
    top: 8px;
    right: 8px;
  }
</style>
