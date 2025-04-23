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
              label="字典名称"
              prop="dictName"
              v-model="queryParams.dictName"
              @keyup.enter="handleQuery"
            />
            <form-input
              label="字典类型"
              prop="dictType"
              v-model="queryParams.dictType"
              @keyup.enter="handleQuery"
            />
            <form-select
              label="状态"
              prop="status"
              v-model="queryParams.status"
              :options="sysNormalDisable"
              @keyup.enter="handleQuery"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['system:type:add']" v-ripple>新增</el-button>
        <el-button
          @click="handleDelete"
          :disabled="multiple"
          v-auth="['system:type:remove']"
          v-ripple
          >删除
        </el-button>
        <el-button @click="handleExport" v-auth="['system:type:export']" v-ripple>导出</el-button>
        <el-button @click="handlerefreshCache" v-ripple>刷新缓存 </el-button>
      </template>
    </table-bar>

    <art-table
      v-loading="loading"
      :data="typeList"
      selection
      :total="total"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
      row-key="dictId"
    >
      <template #default>
        <el-table-column label="字典主键" align="center" prop="dictId" v-if="columns[0].show" />
        <el-table-column label="字典名称" align="center" prop="dictName" v-if="columns[1].show" />
        <el-table-column label="字典类型" align="center" prop="dictType" v-if="columns[2].show">
          <template #default="scope">
            <router-link :to="'/system/dict-data/index/' + scope.row.dictId" class="link-type">
              <span>{{ scope.row.dictType }}</span>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status" v-if="columns[3].show">
          <template #default="scope">
            <dict-tag :options="sysNormalDisable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" v-if="columns[4].show" />
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <button-table
              type="edit"
              v-auth="['system:type:edit']"
              @click="handleUpdate(scope.row)"
            />
            <button-table
              type="delete"
              v-auth="['system:type:remove']"
              @click="handleDelete(scope.row)"
            />
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 添加或修改字典类型对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="typeRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="form.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="dictType">
          <el-input v-model="form.dictType" placeholder="请输入字典类型" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sysNormalDisable" :key="dict.value" :value="dict.value">{{
              dict.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容"></el-input>
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
  import { DictTypeService } from '@/api/system/dict/typeApi'
  import { ref, reactive } from 'vue'
  import { resetForm } from '@/utils/utils'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { FormInstance } from 'element-plus'
  import { DictTypeResult } from '@/types/system/dict'
  import { useDict, DictType } from '@/utils/dict'
  const sysNormalDisable = ref<DictType[]>([])
  const typeList = ref<DictTypeResult[]>([])
  const open = ref(false)
  const loading = ref(true)
  const ids = ref([])
  const multiple = ref(true)
  const total = ref(0)
  const title = ref('')
  const queryRef = ref()
  const typeRef = ref<FormInstance>()
  // 定义初始表单状态
  const initialFormState = {
    dictId: null,
    dictName: null,
    dictType: null,
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
    dictName: '',
    dictType: '',
    status: ''
  })
  const rules = reactive({
    dictName: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
    dictType: [{ required: true, message: '字典类型不能为空', trigger: 'blur' }]
  })

  /** 查询字典类型列表 */
  const getList = async () => {
    loading.value = true
    const res = await DictTypeService.listType(queryParams)
    if (res.code === 200) {
      typeList.value = res.rows
      total.value = res.total
      loading.value = false
    }
  }

  const columns = reactive([
    { name: '字典主键', show: true },
    { name: '字典名称', show: true },
    { name: '字典类型', show: true },
    { name: '状态', show: true },
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
    ids.value = selection.map((item: any) => item.dictId)
    multiple.value = !selection.length
  }

  /** 新增按钮操作 */
  const handleAdd = () => {
    reset()
    open.value = true
    title.value = '添加字典类型'
  }

  /** 修改按钮操作 */
  const handleUpdate = async (row: any) => {
    reset()
    const _dictId = row.dictId || ids.value
    const res = await DictTypeService.getType(_dictId)
    if (res.code === 200) {
      Object.assign(form, res.data)
      open.value = true
      title.value = '修改字典类型'
    }
  }

  /** 提交按钮 */
  const submitForm = async () => {
    if (!typeRef.value) return
    await typeRef.value.validate(async (valid) => {
      if (valid) {
        if (form.dictId != null) {
          const res = await DictTypeService.updateType(form)
          if (res.code === 200) {
            ElMessage.success(res.msg)
            open.value = false
            getList()
          }
        } else {
          const res = await DictTypeService.addType(form)
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
    const _dictIds = row.dictId || ids.value
    const Tr = await ElMessageBox.confirm('是否确认删除字典类型编号为"' + _dictIds + '"的数据项？')
    if (Tr) {
      const res = await DictTypeService.deleteType(_dictIds)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    }
  }

  import { downloadExcel } from '@/utils/utils'

  /** 导出按钮操作 */
  const handleExport = () => {
    downloadExcel(DictTypeService.exportExcel(queryParams))
  }

  const getuseDict = async () => {
    const { sys_normal_disable } = await useDict('sys_normal_disable')
    sysNormalDisable.value = sys_normal_disable
  }

  const handlerefreshCache = async () => {
    const res = await DictTypeService.refreshCache()
    if (res.code === 200) {
      ElMessage.success(res.msg)
    }
  }

  // 初始化
  onMounted(async () => {
    getuseDict()
    getList()
  })
</script>
