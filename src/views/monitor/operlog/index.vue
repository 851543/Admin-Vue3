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
              label="模块标题"
              prop="title"
              v-model="queryParams.title"
              @keyup.enter="handleQuery"
            />
            <form-input
              label="方法名称"
              prop="method"
              v-model="queryParams.method"
              @keyup.enter="handleQuery"
            />
            <form-input
              label="请求方式"
              prop="requestMethod"
              v-model="queryParams.requestMethod"
              @keyup.enter="handleQuery"
            />
            <form-input
              label="操作人员"
              prop="operName"
              v-model="queryParams.operName"
              @keyup.enter="handleQuery"
            />
            <form-input
              label="部门名称"
              prop="deptName"
              v-model="queryParams.deptName"
              @keyup.enter="handleQuery"
            />
            <form-input
              label="请求URL"
              prop="operUrl"
              v-model="queryParams.operUrl"
              @keyup.enter="handleQuery"
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
            <el-form-item label="操作时间" prop="operTime">
              <el-date-picker
                clearable
                v-model="queryParams.operTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择操作时间"
              >
              </el-date-picker>
            </el-form-item>
            <form-input
              label="消耗时间"
              prop="costTime"
              v-model="queryParams.costTime"
              @keyup.enter="handleQuery"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['monitor:operlog:add']" v-ripple>新增 </el-button>
        <el-button
          @click="handleDelete"
          :disabled="multiple"
          v-auth="['monitor:operlog:remove']"
          v-ripple
          >删除
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
      @pagination="getList"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
      row-key="operId"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="日志主键" align="center" prop="operId" v-if="columns[0].show" />
      <el-table-column label="模块标题" align="center" prop="title" v-if="columns[1].show" />
      <el-table-column label="业务类型" align="center" prop="businessType" v-if="columns[2].show" />
      <el-table-column label="方法名称" align="center" prop="method" v-if="columns[3].show" />
      <el-table-column
        label="请求方式"
        align="center"
        prop="requestMethod"
        v-if="columns[4].show"
      />
      <el-table-column label="操作类别" align="center" prop="operatorType" v-if="columns[5].show" />
      <el-table-column label="操作人员" align="center" prop="operName" v-if="columns[6].show" />
      <el-table-column label="部门名称" align="center" prop="deptName" v-if="columns[7].show" />
      <el-table-column label="请求URL" align="center" prop="operUrl" v-if="columns[8].show" />
      <el-table-column label="主机地址" align="center" prop="operIp" v-if="columns[9].show" />
      <el-table-column
        label="操作地点"
        align="center"
        prop="operLocation"
        v-if="columns[10].show"
      />
      <el-table-column label="请求参数" align="center" prop="operParam" v-if="columns[11].show" />
      <el-table-column label="返回参数" align="center" prop="jsonResult" v-if="columns[12].show" />
      <el-table-column label="操作状态" align="center" prop="status" v-if="columns[13].show" />
      <el-table-column label="错误消息" align="center" prop="errorMsg" v-if="columns[14].show" />
      <el-table-column label="操作时间" align="center" prop="operTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.operTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="消耗时间" align="center" prop="costTime" v-if="columns[16].show" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <button-table
            type="edit"
            v-auth="['monitor:operlog:edit']"
            @click="handleUpdate(scope.row)"
          />
          <button-table
            type="delete"
            v-auth="['monitor:operlog:remove']"
            @click="handleDelete(scope.row)"
          />
        </template>
      </el-table-column>
    </art-table>

    <!-- 添加或修改操作日志记录对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="operlogRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="模块标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入模块标题" />
        </el-form-item>
        <el-form-item label="方法名称" prop="method">
          <el-input v-model="form.method" placeholder="请输入方法名称" />
        </el-form-item>
        <el-form-item label="请求方式" prop="requestMethod">
          <el-input v-model="form.requestMethod" placeholder="请输入请求方式" />
        </el-form-item>
        <el-form-item label="操作人员" prop="operName">
          <el-input v-model="form.operName" placeholder="请输入操作人员" />
        </el-form-item>
        <el-form-item label="部门名称" prop="deptName">
          <el-input v-model="form.deptName" placeholder="请输入部门名称" />
        </el-form-item>
        <el-form-item label="请求URL" prop="operUrl">
          <el-input v-model="form.operUrl" placeholder="请输入请求URL" />
        </el-form-item>
        <el-form-item label="主机地址" prop="operIp">
          <el-input v-model="form.operIp" placeholder="请输入主机地址" />
        </el-form-item>
        <el-form-item label="操作地点" prop="operLocation">
          <el-input v-model="form.operLocation" placeholder="请输入操作地点" />
        </el-form-item>
        <el-form-item label="请求参数" prop="operParam">
          <el-input v-model="form.operParam" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="返回参数" prop="jsonResult">
          <el-input v-model="form.jsonResult" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="错误消息" prop="errorMsg">
          <el-input v-model="form.errorMsg" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="操作时间" prop="operTime">
          <el-date-picker
            clearable
            v-model="form.operTime"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择操作时间"
          >
          </el-date-picker>
        </el-form-item>
        <el-form-item label="消耗时间" prop="costTime">
          <el-input v-model="form.costTime" placeholder="请输入消耗时间" />
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
  import { OperLogService } from '@/api/monitor/operlogApi'
  import { ref, reactive } from 'vue'
  import { resetForm } from '@/utils/utils'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { FormInstance } from 'element-plus'
  import { OperLogResult } from '@/types/monitor/operlog'
  import { parseTime } from '@/utils/utils'
  const operlogList = ref<OperLogResult[]>([])
  const open = ref(false)
  const loading = ref(true)
  const ids = ref([])
  const multiple = ref(true)
  const total = ref(0)
  const title = ref('')
  const queryRef = ref()
  const operlogRef = ref<FormInstance>()
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
    operParam: null,
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
    method: '',
    requestMethod: '',
    operatorType: '',
    operName: '',
    deptName: '',
    operUrl: '',
    operIp: '',
    operLocation: '',
    operParam: '',
    jsonResult: '',
    status: '',
    errorMsg: '',
    operTime: '',
    costTime: ''
  })
  const rules = reactive({})

  /** 查询操作日志记录列表 */
  const getList = async () => {
    loading.value = true
    const res = await OperLogService.listOperlog(queryParams)
    if (res.code === 200) {
      operlogList.value = res.rows
      total.value = res.total
      loading.value = false
    }
  }

  const columns = reactive([
    { name: '日志主键', show: true },
    { name: '模块标题', show: true },
    { name: '业务类型', show: true },
    { name: '方法名称', show: true },
    { name: '请求方式', show: true },
    { name: '操作类别', show: true },
    { name: '操作人员', show: true },
    { name: '部门名称', show: true },
    { name: '请求URL', show: true },
    { name: '主机地址', show: true },
    { name: '操作地点', show: true },
    { name: '请求参数', show: true },
    { name: '返回参数', show: true },
    { name: '操作状态', show: true },
    { name: '错误消息', show: true },
    { name: '操作时间', show: true },
    { name: '消耗时间', show: true }
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
    ids.value = selection.map((item: any) => item.operId)
    multiple.value = !selection.length
  }

  /** 新增按钮操作 */
  const handleAdd = () => {
    reset()
    open.value = true
    title.value = '添加操作日志记录'
  }

  /** 修改按钮操作 */
  const handleUpdate = async (row: any) => {
    reset()
    const _operId = row.operId || ids.value
    const res = await OperLogService.getOperlog(_operId)
    if (res.code === 200) {
      Object.assign(form, res.data)
      open.value = true
      title.value = '修改操作日志记录'
    }
  }

  /** 提交按钮 */
  const submitForm = async () => {
    if (!operlogRef.value) return
    await operlogRef.value.validate(async (valid) => {
      if (valid) {
        if (form.operId != null) {
          const res = await OperLogService.updateOperlog(form)
          if (res.code === 200) {
            ElMessage.success(res.msg)
            open.value = false
            getList()
          }
        } else {
          const res = await OperLogService.addOperlog(form)
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

  import { downloadExcel } from '@/utils/utils'

  /** 导出按钮操作 */
  const handleExport = () => {
    downloadExcel(OperLogService.exportExcel(queryParams))
  }

  // 初始化
  onMounted(() => {
    getList()
  })
</script>
