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
              label="部门名称"
              prop="deptName"
              v-model="queryParams.deptName"
              @keyup.enter="handleQuery"
            />
            <form-select
              label="状态"
              prop="status"
              v-model="queryParams.status"
              :options="sysNormalDisable"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="handleAdd" v-auth="['system:dept:add']" v-ripple>新增 </el-button>
        <el-button @click="toggleExpand" v-ripple>
          {{ isExpandAll ? '折叠' : '展开' }}
        </el-button>
      </template>
    </table-bar>

    <art-table :data="deptList" ref="tableRef" row-key="deptId">
      <template #default>
        <el-table-column label="部门id" align="center" prop="deptId" v-if="columns[0].show" />
        <el-table-column label="父部门id" align="center" prop="parentId" v-if="columns[1].show" />
        <el-table-column label="祖级列表" align="center" prop="ancestors" v-if="columns[2].show" />
        <el-table-column label="部门名称" prop="deptName" v-if="columns[3].show" />
        <el-table-column label="显示顺序" align="center" prop="orderNum" v-if="columns[4].show" />
        <el-table-column label="负责人" align="center" prop="leader" v-if="columns[5].show" />
        <el-table-column label="联系电话" align="center" prop="phone" v-if="columns[6].show" />
        <el-table-column label="邮箱" align="center" prop="email" v-if="columns[7].show" />
        <el-table-column label="部门状态" align="center" prop="status" v-if="columns[8].show">
          <template #default="scope">
            <dict-tag :options="sysNormalDisable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" v-if="columns[9].show" />
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <button-table type="add" v-auth="['system:dept:add']" @click="handleAdd(scope.row)" />
            <button-table
              type="edit"
              v-auth="['system:dept:edit']"
              @click="handleUpdate(scope.row)"
            />
            <button-table
              v-if="scope.row.parentId != 0"
              type="delete"
              v-auth="['system:dept:remove']"
              @click="handleDelete(scope.row)"
            />
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 添加或修改部门对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="deptRef" :model="form" :rules="rules" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="24" v-if="form.parentId !== 0">
            <el-form-item label="上级部门" prop="parentId">
              <el-tree-select
                v-model="form.parentId"
                :data="deptOptions"
                :props="{ value: 'deptId', label: 'deptName', children: 'children' }"
                value-key="deptId"
                placeholder="选择上级部门"
                check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门名称" prop="deptName">
              <el-input v-model="form.deptName" placeholder="请输入部门名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number v-model="form.orderNum" controls-position="right" :min="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="leader">
              <el-input v-model="form.leader" placeholder="请输入负责人" maxlength="20" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" maxlength="11" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入邮箱" maxlength="50" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="部门状态">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sysNormalDisable" :key="dict.value" :value="dict.value">{{
                  dict.label
                }}</el-radio>
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
  </div>
</template>

<script setup lang="ts">
  import { DeptService } from '@/api/system/deptApi'
  import { ref, reactive } from 'vue'
  import { resetForm } from '@/utils/utils'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { FormInstance } from 'element-plus'
  import { DeptResult } from '@/types/system/dept'
  const deptList = ref<Record<string, DeptResult>[]>([])
  const open = ref(false)
  const loading = ref(true)
  const title = ref('')
  const queryRef = ref()
  const deptRef = ref<FormInstance>()
  const deptOptions = ref<Record<string, DeptResult>[]>([])
  // 定义初始表单状态
  const initialFormState = {
    deptId: null,
    parentId: null,
    ancestors: null,
    deptName: null,
    orderNum: 0,
    leader: null,
    phone: null,
    email: null,
    status: '0',
    delFlag: null,
    createBy: null,
    createTime: null,
    updateBy: null,
    updateTime: null
  }
  const form = reactive({ ...initialFormState })
  const queryParams = reactive({
    deptName: '',
    status: ''
  })
  const rules = reactive({
    parentId: [{ required: true, message: '上级部门不能为空', trigger: 'blur' }],
    deptName: [{ required: true, message: '部门名称不能为空', trigger: 'blur' }],
    orderNum: [{ required: true, message: '显示排序不能为空', trigger: 'blur' }],
    email: [
      { type: 'email' as const, message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }
    ],
    phone: [
      { pattern: /^1[3|4|5|6|7|8|9][0-9]\d{8}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ]
  })

  import { handleTree } from '@/utils/utils'
  /** 查询部门列表 */
  const getList = async () => {
    loading.value = true
    const res = await DeptService.listDept(queryParams)
    if (res.code === 200) {
      deptList.value = handleTree(res.data, 'deptId')
    }
  }

  const columns = reactive([
    { name: '部门id', show: false },
    { name: '父部门id', show: false },
    { name: '祖级列表', show: false },
    { name: '部门名称', show: true },
    { name: '显示顺序', show: true },
    { name: '负责人', show: true },
    { name: '联系电话', show: true },
    { name: '邮箱', show: true },
    { name: '部门状态', show: true },
    { name: '创建时间', show: true }
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
    getList()
  }

  /** 新增按钮操作 */
  const handleAdd = async (row: any) => {
    reset()
    const res = await DeptService.listDept(null)
    if (res.code === 200) {
      deptOptions.value = handleTree(res.data, 'deptId')
    }
    if (row != undefined) {
      form.parentId = row.deptId
    }
    open.value = true
    title.value = '添加部门'
  }

  /** 修改按钮操作 */
  const handleUpdate = async (row: any) => {
    reset()
    const _deptId = row.deptId
    const newRes = await DeptService.listDeptExcludeChild(_deptId)
    if (newRes.code === 200) {
      deptOptions.value = handleTree(newRes.data, 'deptId')
    }
    const res = await DeptService.getDept(_deptId)
    if (res.code === 200) {
      Object.assign(form, res.data)
      open.value = true
      title.value = '修改部门'
    }
  }

  /** 提交按钮 */
  const submitForm = async () => {
    if (!deptRef.value) return
    await deptRef.value.validate(async (valid) => {
      if (valid) {
        if (form.deptId != null) {
          const res = await DeptService.updateDept(form)
          if (res.code === 200) {
            ElMessage.success(res.msg)
            open.value = false
            getList()
          }
        } else {
          const res = await DeptService.addDept(form)
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
    const _deptIds = row.deptId
    const Tr = await ElMessageBox.confirm('是否确认删除部门编号为"' + _deptIds + '"的数据项？')
    if (Tr) {
      const res = await DeptService.deleteDept(_deptIds)
      if (res.code === 200) {
        getList()
        ElMessage.success(res.msg)
      }
    }
  }

  const tableRef = ref()
  const isExpandAll = ref(false)
  const toggleExpand = () => {
    isExpandAll.value = !isExpandAll.value
    if (tableRef.value) {
      const table = tableRef.value.$el.querySelector('.el-table__body-wrapper')
      const rows = table.querySelectorAll('.el-table__row')
      rows.forEach((row: HTMLElement) => {
        const expandBtn = row.querySelector('.el-table__expand-icon') as HTMLElement
        if (
          expandBtn &&
          expandBtn.classList.contains('el-table__expand-icon--expanded') !== isExpandAll.value
        ) {
          expandBtn.click()
        }
      })
    }
  }

  import { useDict, DictType } from '@/utils/dict'
  const sysNormalDisable = ref<DictType[]>([]) // 系统字典数据
  const getuseDict = async () => {
    const { sys_normal_disable } = await useDict('sys_normal_disable')
    sysNormalDisable.value = sys_normal_disable
  }

  // 初始化
  onMounted(() => {
    getuseDict()
    getList()
  })
</script>
