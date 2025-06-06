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
              label="公告标题"
              prop="noticeTitle"
              v-model="queryParams.noticeTitle"
              @keyup.enter="handleQuery"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['system:notice:add']" v-ripple>新增 </el-button>
        <el-button
          @click="handleDelete"
          :disabled="multiple"
          v-auth="['system:notice:remove']"
          v-ripple
          >删除
        </el-button>
      </template>
    </table-bar>

    <art-table
      v-loading="loading"
      :data="noticeList"
      selection
      :total="total"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
      row-key="noticeId"
    >
      <template #default>
        <el-table-column label="公告编号" align="center" prop="noticeId" v-if="columns[0].show" />
        <el-table-column
          label="公告标题"
          align="center"
          prop="noticeTitle"
          :show-overflow-tooltip="true"
          v-if="columns[1].show"
        />
        <el-table-column label="公告类型" align="center" prop="noticeType" v-if="columns[2].show">
          <template #default="scope">
            <dict-tag :options="sysNoticeType" :value="scope.row.noticeType" />
          </template>
        </el-table-column>
        <el-table-column
          label="公告内容"
          align="center"
          prop="noticeContent"
          :show-overflow-tooltip="true"
          v-if="columns[3].show"
        />
        <el-table-column label="状态" align="center" prop="status" v-if="columns[4].show">
          <template #default="scope">
            <dict-tag :options="sysNormalDisable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" v-if="columns[5].show" />
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <button-table
              type="edit"
              v-auth="['system:notice:edit']"
              @click="handleUpdate(scope.row)"
            />
            <button-table
              type="delete"
              v-auth="['system:notice:remove']"
              @click="handleDelete(scope.row)"
            />
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 添加或修改通知公告对话框 -->
    <el-dialog :title="title" v-model="open" width="1200px" append-to-body>
      <el-form ref="noticeRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="公告标题" prop="noticeTitle">
              <el-input v-model="form.noticeTitle" placeholder="请输入公告标题" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="公告类型" prop="noticeType">
              <el-select v-model="form.noticeType" placeholder="请选择">
                <el-option
                  v-for="dict in sysNoticeType"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sysNormalDisable" :key="dict.value" :value="dict.value">{{
                  dict.label
                }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="公告内容">
          <editor v-model="form.noticeContent" :min-height="192" />
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
  import { NoticeService } from '@/api/system/noticeApi'
  import { ref, reactive } from 'vue'
  import { resetForm } from '@/utils/utils'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { FormInstance } from 'element-plus'
  import { NoticeResult } from '@/types/system/notice'
  const noticeList = ref<NoticeResult[]>([])
  const open = ref(false)
  const loading = ref(true)
  const ids = ref([])
  const titles = ref([])
  const multiple = ref(true)
  const total = ref(0)
  const title = ref('')
  const queryRef = ref()
  const noticeRef = ref<FormInstance>()
  // 定义初始表单状态
  const initialFormState = {
    noticeId: null,
    noticeTitle: null,
    noticeType: '1',
    noticeContent: '',
    status: '0',
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
    noticeTitle: '',
    noticeType: '',
    noticeContent: '',
    status: ''
  })
  const rules = reactive({
    noticeTitle: [
      {
        required: true,
        message: '公告标题不能为空',
        trigger: 'blur'
      }
    ],
    noticeType: [
      {
        required: true,
        message: '公告类型不能为空',
        trigger: 'change'
      }
    ]
  })

  /** 查询通知公告列表 */
  const getList = async () => {
    loading.value = true
    const res = await NoticeService.listNotice(queryParams)
    if (res.code === 200) {
      noticeList.value = res.rows
      total.value = res.total
      loading.value = false
    }
  }

  const columns = reactive([
    { name: '公告ID', show: true },
    { name: '公告标题', show: true },
    { name: '公告类型', show: true },
    { name: '公告内容', show: true },
    { name: '公告状态', show: true },
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
    ids.value = selection.map((item: any) => item.noticeId)
    titles.value = selection.map((item: any) => item.noticeTitle)
    multiple.value = !selection.length
  }

  /** 新增按钮操作 */
  const handleAdd = () => {
    reset()
    open.value = true
    title.value = '添加通知公告'
  }

  /** 修改按钮操作 */
  const handleUpdate = async (row: any) => {
    reset()
    const _noticeId = row.noticeId || ids.value
    const res = await NoticeService.getNotice(_noticeId)
    if (res.code === 200) {
      Object.assign(form, res.data)
      open.value = true
      title.value = '修改通知公告'
    }
  }

  /** 提交按钮 */
  const submitForm = async () => {
    if (!noticeRef.value) return
    await noticeRef.value.validate(async (valid) => {
      if (valid) {
        if (form.noticeId != null) {
          const res = await NoticeService.updateNotice(form)
          if (res.code === 200) {
            ElMessage.success(res.msg)
            open.value = false
            getList()
          }
        } else {
          const res = await NoticeService.addNotice(form)
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
    const _noticeIds = row.noticeId || ids.value
    const _titels = row.noticeTitle || titles.value
    const Tr = await ElMessageBox.confirm(
      '是否确认删除通知公告标题为"' + _titels + '"的数据项？'
    )
    if (Tr) {
      const res = await NoticeService.deleteNotice(_noticeIds)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    }
  }

  // 状态
  import { useDict, DictType } from '@/utils/dict'
  const sysNormalDisable = ref<DictType[]>([]) // 状态字典数据
  const sysNoticeType = ref<DictType[]>([]) // 状态字典数据
  const getuseDict = async () => {
    const { sys_normal_disable } = await useDict('sys_normal_disable')
    sysNormalDisable.value = sys_normal_disable
    const { sys_notice_type } = await useDict('sys_notice_type')
    sysNoticeType.value = sys_notice_type
  }

  // 初始化
  onMounted(() => {
    getuseDict()
    getList()
  })
</script>
<style lang="scss" scoped>
  .editor-wrapper {
    height: 450px;
  }
</style>
