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
              label="字典排序"
              prop="dictSort"
              v-model="queryParams.dictSort"
              @keyup.enter="handleQuery"
            />
            <form-input
              label="字典标签"
              prop="dictLabel"
              v-model="queryParams.dictLabel"
              @keyup.enter="handleQuery"
            />
            <form-input
              label="字典键值"
              prop="dictValue"
              v-model="queryParams.dictValue"
              @keyup.enter="handleQuery"
            />
            <form-input
              label="样式属性"
              prop="cssClass"
              v-model="queryParams.cssClass"
              @keyup.enter="handleQuery"
            />
            <form-input
              label="表格回显样式"
              prop="listClass"
              v-model="queryParams.listClass"
              @keyup.enter="handleQuery"
            />
            <form-input
              label="是否默认"
              prop="isDefault"
              v-model="queryParams.isDefault"
              @keyup.enter="handleQuery"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['system:data:add']" v-ripple>新增</el-button>
        <el-button
          @click="handleDelete"
          :disabled="multiple"
          v-auth="['system:data:remove']"
          v-ripple
          >删除
        </el-button>
        <el-button @click="handleExport" v-auth="['system:data:export']" v-ripple>导出</el-button>
      </template>
    </table-bar>

    <art-table
      v-loading="loading"
      :data="dataList"
      selection
      :total="total"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      @pagination="getList"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @selection-change="handleSelectionChange"
      row-key="dictCode"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="字典编码" align="center" prop="dictCode" v-if="columns[0].show" />
      <el-table-column label="字典排序" align="center" prop="dictSort" v-if="columns[1].show" />
      <el-table-column label="字典标签" align="center" prop="dictLabel" v-if="columns[2].show" />
      <el-table-column label="字典键值" align="center" prop="dictValue" v-if="columns[3].show" />
      <el-table-column label="字典类型" align="center" prop="dictType" v-if="columns[4].show" />
      <el-table-column label="样式属性" align="center" prop="cssClass" v-if="columns[5].show" />
      <el-table-column
        label="表格回显样式"
        align="center"
        prop="listClass"
        v-if="columns[6].show"
      />
      <el-table-column label="是否默认" align="center" prop="isDefault" v-if="columns[7].show" />
      <el-table-column label="状态" align="center" prop="status" v-if="columns[8].show" />
      <el-table-column label="备注" align="center" prop="remark" v-if="columns[9].show" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <button-table
            type="edit"
            v-auth="['system:data:edit']"
            @click="handleUpdate(scope.row)"
          />
          <button-table
            type="delete"
            v-auth="['system:data:remove']"
            @click="handleDelete(scope.row)"
          />
        </template>
      </el-table-column>
    </art-table>

    <!-- 添加或修改字典数据对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="dataRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="字典排序" prop="dictSort">
          <el-input v-model="form.dictSort" placeholder="请输入字典排序" />
        </el-form-item>
        <el-form-item label="字典标签" prop="dictLabel">
          <el-input v-model="form.dictLabel" placeholder="请输入字典标签" />
        </el-form-item>
        <el-form-item label="字典键值" prop="dictValue">
          <el-input v-model="form.dictValue" placeholder="请输入字典键值" />
        </el-form-item>
        <el-form-item label="样式属性" prop="cssClass">
          <el-input v-model="form.cssClass" placeholder="请输入样式属性" />
        </el-form-item>
        <el-form-item label="表格回显样式" prop="listClass">
          <el-input v-model="form.listClass" placeholder="请输入表格回显样式" />
        </el-form-item>
        <el-form-item label="是否默认" prop="isDefault">
          <el-input v-model="form.isDefault" placeholder="请输入是否默认" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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
  import { DictDataService } from '@/api/system/dict/dataApi'
  import { ref, reactive } from 'vue'
  import { resetForm } from '@/utils/utils'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { FormInstance } from 'element-plus'
  import { DictDataResult } from '@/types/system/dict'
  const dataList = ref<DictDataResult[]>([])
  const open = ref(false)
  const loading = ref(true)
  const ids = ref([])
  const multiple = ref(true)
  const total = ref(0)
  const title = ref('')
  const queryRef = ref()
  const dataRef = ref<FormInstance>()
  // 定义初始表单状态
  const initialFormState = {
    dictCode: null,
    dictSort: null,
    dictLabel: null,
    dictValue: null,
    dictType: null,
    cssClass: null,
    listClass: null,
    isDefault: null,
    status: null,
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
    dictSort: '',
    dictLabel: '',
    dictValue: '',
    dictType: '',
    cssClass: '',
    listClass: '',
    isDefault: '',
    status: ''
  })
  const rules = reactive({})

  /** 查询字典数据列表 */
  const getList = async () => {
    loading.value = true
    const res = await DictDataService.listData(queryParams)
    if (res.code === 200) {
      dataList.value = res.rows
      total.value = res.total
      loading.value = false
    }
  }

  const columns = reactive([
    { name: '字典编码', show: true },
    { name: '字典排序', show: true },
    { name: '字典标签', show: true },
    { name: '字典键值', show: true },
    { name: '字典类型', show: true },
    { name: '样式属性', show: true },
    { name: '表格回显样式', show: true },
    { name: '是否默认', show: true },
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
    ids.value = selection.map((item: any) => item.dictCode)
    multiple.value = !selection.length
  }

  /** 新增按钮操作 */
  const handleAdd = () => {
    reset()
    open.value = true
    title.value = '添加字典数据'
  }

  /** 修改按钮操作 */
  const handleUpdate = async (row: any) => {
    reset()
    const _dictCode = row.dictCode || ids.value
    const res = await DictDataService.getData(_dictCode)
    if (res.code === 200) {
      Object.assign(form, res.data)
      open.value = true
      title.value = '修改字典数据'
    }
  }

  /** 提交按钮 */
  const submitForm = async () => {
    if (!dataRef.value) return
    await dataRef.value.validate(async (valid) => {
      if (valid) {
        if (form.dictCode != null) {
          const res = await DictDataService.updateData(form)
          if (res.code === 200) {
            ElMessage.success(res.msg)
            open.value = false
            getList()
          }
        } else {
          const res = await DictDataService.addData(form)
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
    const _dictCodes = row.dictCode || ids.value
    const Tr = await ElMessageBox.confirm(
      '是否确认删除字典数据编号为"' + _dictCodes + '"的数据项？'
    )
    if (Tr) {
      const res = await DictDataService.deleteData(_dictCodes)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    }
  }

  import { downloadExcel } from '@/utils/utils'

  /** 导出按钮操作 */
  const handleExport = () => {
    downloadExcel(DictDataService.exportExcel(queryParams))
  }

  // 初始化
  onMounted(() => {
    getList()
  })
</script>
