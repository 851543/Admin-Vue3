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
            <form-select
              label="状态"
              prop="status"
              v-model="queryParams.status"
              :options="sysJobStatus"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['system:job:add']" v-ripple>新增 </el-button>
        <el-button
          @click="handleDelete"
          :disabled="multiple"
          v-auth="['system:job:remove']"
          v-ripple
          >删除
        </el-button>
        <el-button @click="handleExport" v-auth="['system:job:export']" v-ripple>导出 </el-button>
        <el-button @click="handleJobLog" v-auth="['monitor:job:query']" v-ripple>日志</el-button>
      </template>
    </table-bar>

    <art-table
      v-loading="loading"
      :data="jobList"
      selection
      :total="total"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
      row-key="jobId"
    >
      <template #default>
        <el-table-column label="任务编号" align="center" prop="jobId" v-if="columns[0].show" />
        <el-table-column label="任务名称" align="center" prop="jobName" v-if="columns[1].show" />
        <el-table-column label="任务组名" align="center" prop="jobGroup" v-if="columns[2].show" />
        <el-table-column
          label="调用目标字符串"
          align="center"
          prop="invokeTarget"
          :show-overflow-tooltip="true"
          v-if="columns[3].show"
        />
        <el-table-column
          label="cron执行表达式"
          align="center"
          prop="cronExpression"
          v-if="columns[4].show"
        />
        <el-table-column
          label="计划执行错误策略"
          align="center"
          prop="misfirePolicy"
          v-if="columns[5].show"
        />
        <el-table-column
          label="是否并发执行"
          align="center"
          prop="concurrent"
          v-if="columns[6].show"
        />
        <el-table-column label="状态" align="center" prop="status" v-if="columns[7].show">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="'0'"
              :inactive-value="'1'"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="备注信息" align="center" prop="remark" v-if="columns[8].show" />
        <el-table-column label="操作" align="center" width="200px">
          <template #default="scope">
            <button-table
              type="edit"
              v-auth="['system:job:edit']"
              @click="handleUpdate(scope.row)"
            />
            <button-table
              type="delete"
              v-auth="['system:job:remove']"
              @click="handleDelete(scope.row)"
            />
            <button-more
              :list="[
                { key: 'run', label: '执行一次', auth: ['system:job:changeStatus'] },
                { key: 'view', label: '任务详细', auth: ['system:job:query'] },
                { key: 'jobLog', label: '调度日志', auth: ['monitor:job:query'] }
              ]"
              @click="buttonMoreClick($event, scope.row)"
            />
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 添加或修改定时任务对话框 -->
    <el-dialog :title="title" v-model="open" width="820px" append-to-body>
      <el-form ref="jobRef" :model="form" :rules="rules" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务名称" prop="jobName">
              <el-input v-model="form.jobName" placeholder="请输入任务名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组" prop="jobGroup">
              <el-select v-model="form.jobGroup" placeholder="请选择">
                <el-option
                  v-for="dict in sysJobGroup"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="invokeTarget">
              <template #label>
                <span>
                  调用方法
                  <el-tooltip placement="top">
                    <template #content>
                      <div>
                        Bean调用示例：ryTask.ryParams('ry')
                        <br />Class类调用示例：com.ruoyi.quartz.task.RyTask.ryParams('ry')
                        <br />参数说明：支持字符串，布尔类型，长整型，浮点型，整型
                      </div>
                    </template>
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                </span>
              </template>
              <el-input v-model="form.invokeTarget" placeholder="请输入调用目标字符串" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="cron表达式" prop="cronExpression">
              <el-input v-model="form.cronExpression" placeholder="请输入cron执行表达式">
                <template #append>
                  <el-button type="primary" @click="handleShowCron">
                    生成表达式
                    <i class="el-icon-time el-icon--right"></i>
                  </el-button>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24" v-if="form.jobId !== undefined">
            <el-form-item label="状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sysJobStatus" :key="dict.value" :value="dict.value">{{
                  dict.label
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="14">
            <el-form-item label="执行策略" prop="misfirePolicy">
              <el-radio-group v-model="form.misfirePolicy">
                <el-radio-button value="1">立即执行</el-radio-button>
                <el-radio-button value="2">执行一次</el-radio-button>
                <el-radio-button value="3">放弃执行</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="10">
            <el-form-item label="是否并发" prop="concurrent">
              <el-radio-group v-model="form.concurrent">
                <el-radio-button value="0">允许</el-radio-button>
                <el-radio-button value="1">禁止</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog title="Cron表达式生成器" v-model="openCron" append-to-body destroy-on-close>
      <crontab
        ref="crontabRef"
        @hide="openCron = false"
        @fill="crontabFill"
        :expression="expression"
      ></crontab>
    </el-dialog>

    <!-- 任务日志详细 -->
    <el-dialog title="任务详细" v-model="openView" width="700px" append-to-body>
      <el-form :model="form" label-width="120px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="任务编号：">{{ form.jobId }}</el-form-item>
            <el-form-item label="任务名称：">{{ form.jobName }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务分组：">{{ jobGroupFormat(form) }}</el-form-item>
            <el-form-item label="创建时间：">{{ form.createTime }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="cron表达式：">{{ form.cronExpression }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="下次执行时间：">{{ form.nextValidTime }}</el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="调用目标方法：">{{ form.invokeTarget }}</el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="任务状态：">
              <div v-if="form.status == '0'">正常</div>
              <div v-else-if="form.status == '1'">暂停</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否并发：">
              <div v-if="form.concurrent == 0">允许</div>
              <div v-else-if="form.concurrent == 1">禁止</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行策略：">
              <div v-if="form.misfirePolicy == 0">默认策略</div>
              <div v-else-if="form.misfirePolicy == 1">立即执行</div>
              <div v-else-if="form.misfirePolicy == 2">执行一次</div>
              <div v-else-if="form.misfirePolicy == 3">放弃执行</div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="openView = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { JobService } from '@/api/monitor/jobApi'
  import { ref, reactive } from 'vue'
  import { resetForm } from '@/utils/utils'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { FormInstance } from 'element-plus'
  import { JobResult } from '@/types/monitor/job'
  const jobList = ref<JobResult[]>([])
  const open = ref(false)
  const loading = ref(true)
  const ids = ref([])
  const multiple = ref(true)
  const total = ref(0)
  const title = ref('')
  const queryRef = ref()
  const jobRef = ref<FormInstance>()
  const openView = ref(false)
  // 定义初始表单状态
  const initialFormState = {
    jobId: null,
    jobName: null,
    jobGroup: '',
    invokeTarget: null,
    cronExpression: '',
    misfirePolicy: 1,
    concurrent: 0,
    status: '0',
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null,
    remark: null,
    nextValidTime: null
  }
  const form = reactive({ ...initialFormState })
  const queryParams = reactive({
    pageNum: 1,
    pageSize: 10,
    jobName: '',
    jobGroup: '',
    status: ''
  })
  const rules = reactive({
    invokeTarget: [
      {
        required: true,
        message: '调用目标字符串不能为空',
        trigger: 'blur'
      }
    ]
  })

  /** 查询定时任务调度列表 */
  const getList = async () => {
    loading.value = true
    const res = await JobService.listJob(queryParams)
    if (res.code === 200) {
      jobList.value = res.rows
      total.value = res.total
      loading.value = false
    }
  }

  const columns = reactive([
    { name: '任务ID', show: true },
    { name: '任务名称', show: true },
    { name: '任务组名', show: true },
    { name: '调用目标字符串', show: true },
    { name: 'cron执行表达式', show: true },
    { name: '计划执行错误策略', show: false },
    { name: '是否并发执行', show: false },
    { name: '状态', show: true },
    { name: '备注信息', show: false }
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
    ids.value = selection.map((item: any) => item.jobId)
    multiple.value = !selection.length
  }

  /** 新增按钮操作 */
  const handleAdd = () => {
    reset()
    open.value = true
    title.value = '添加定时任务调度'
  }

  /** 修改按钮操作 */
  const handleUpdate = async (row: any) => {
    reset()
    const _jobId = row.jobId || ids.value
    const res = await JobService.getJob(_jobId)
    if (res.code === 200) {
      Object.assign(form, res.data)
      open.value = true
      title.value = '修改定时任务调度'
    }
  }

  /** 提交按钮 */
  const submitForm = async () => {
    if (!jobRef.value) return
    await jobRef.value.validate(async (valid) => {
      if (valid) {
        if (form.jobId != null) {
          const res = await JobService.updateJob(form)
          if (res.code === 200) {
            ElMessage.success(res.msg)
            open.value = false
            getList()
          }
        } else {
          const res = await JobService.addJob(form)
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
    const _jobIds = row.jobId || ids.value
    const Tr = await ElMessageBox.confirm(
      '是否确认删除定时任务调度编号为"' + _jobIds + '"的数据项？'
    )
    if (Tr) {
      const res = await JobService.deleteJob(_jobIds)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    }
  }

  import { useRouter } from 'vue-router'
  const router = useRouter()
  /** 任务日志列表查询 */
  const handleJobLog = (row: any) => {
    const jobId = row.jobId || 0
    router.push('/monitor/job-log/index/' + jobId)
  }

  /** 修改状态 */
  const handleStatusChange = async (row: any) => {
    try {
      const res = await JobService.changeJobStatus(row.jobId, row.status)
      if (res.code === 200) {
        ElMessage.success(res.msg)
      }
    } catch {
      row.status = row.status === '0' ? '1' : '0'
    }
  }

  import { ButtonMoreItem } from '@/components/Form/ButtonMore.vue'
  // 更多按钮操作
  const buttonMoreClick = async (item: ButtonMoreItem, row: any) => {
    if (item.key === 'run') {
      const Tr = await ElMessageBox.confirm('确认要立即执行一次"' + row.jobName + '"任务吗?')
      if (Tr) {
        const res = await JobService.runJob(row.jobId, row.jobGroup)
        if (res.code === 200) {
          ElMessage.success(res.msg)
        }
      }
    } else if (item.key === 'view') {
      const res = await JobService.getJob(row.jobId)
      if (res.code === 200) {
        Object.assign(form, res.data)
        openView.value = true
      }
    } else if (item.key === 'jobLog') {
      const jobId = row.jobId || 0
      router.push('/monitor/job-log/index/' + jobId)
    }
  }

  const expression = ref('')
  const openCron = ref(false)

  /** cron表达式按钮操作 */
  const handleShowCron = () => {
    expression.value = form.cronExpression
    openCron.value = true
  }

  /** 确定后回传值 */
  const crontabFill = (value: any) => {
    form.cronExpression = value
  }

  import { downloadExcel } from '@/utils/utils'

  /** 导出按钮操作 */
  const handleExport = () => {
    downloadExcel(JobService.exportExcel(queryParams))
  }

  import { useDict, DictType } from '@/utils/dict'
  const sysJobGroup = ref<DictType[]>([]) // job任务组名字典数据
  const sysJobStatus = ref<DictType[]>([]) // job状态字典数据
  const getuseDict = async () => {
    const { sys_job_group } = await useDict('sys_job_group')
    sysJobGroup.value = sys_job_group
    const { sys_job_status } = await useDict('sys_job_status')
    sysJobStatus.value = sys_job_status
  }

  import { selectDictLabel } from '@/utils/utils'
  const jobGroupFormat = (row: any) => {
    return selectDictLabel(sysJobGroup.value, row.jobGroup)
  }

  // 初始化
  onMounted(() => {
    getuseDict()
    getList()
  })
</script>
<style lang="scss" scoped>
  :deep(.el-table) {
    .cell {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;

      .button-table,
      .button-more {
        margin: 0;
      }

      div {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }
</style>
