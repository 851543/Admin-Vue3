<template>
  <div class="page-content">
    <el-form :model="queryParams" ref="searchFormRef" label-width="82px">
      <el-row type="flex" :gutter="20">
        <el-col :span="5">
          <el-form-item label="角色名称" prop="roleName" @keyup.enter="handleQuery">
            <el-input
              v-model="queryParams.roleName"
              placeholder="请输入角色名称"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="权限字符" prop="roleKey" @keyup.enter="handleQuery">
            <el-input
              v-model="queryParams.roleKey"
              placeholder="请输入权限字符"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="5">
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="请选择状态"
              clearable
              style="width: 100%"
            >
              <el-option
                v-for="dict in statusOptions"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="9">
          <el-form-item style="float: right">
            <el-button @click="handleQuery" v-ripple>搜索</el-button>
            <el-button @click="resetForm(searchFormRef)" v-ripple>重置</el-button>
            <el-button @click="exportExcel" v-ripple>导出</el-button>
            <el-button @click="showDialog('add')" v-ripple>新增角色</el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <art-table :data="roleList" v-loading="loading">
      <template #default>
        <el-table-column label="角色名称" prop="roleName" />
        <el-table-column label="权限字符" prop="roleKey" />
        <el-table-column label="描述" prop="remark" />
        <el-table-column label="状态" prop="status">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="'0'"
              :inactive-value="'1'"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" />
        <el-table-column fixed="right" label="操作" width="100px">
          <template #default="scope">
            <el-row>
              <button-more
                :list="[
                  { key: 'permission', label: '菜单权限' },
                  { key: 'edit', label: '编辑角色' },
                  { key: 'delete', label: '删除角色' }
                ]"
                @click="buttonMoreClick($event, scope.row)"
              />
            </el-row>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'add' ? '新增角色' : '编辑角色'"
      width="30%"
    >
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="权限字符" prop="roleKey">
          <el-input v-model="form.roleKey" placeholder="请输入权限字符" />
        </el-form-item>
        <el-form-item label="角色顺序" prop="roleSort">
          <el-input-number
            v-model="form.roleSort"
            controls-position="right"
            :min="0"
            placeholder="请输入角色顺序"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="录单权限">
          <div class="order-permissions">
            <el-checkbox v-model="form.expandCollapse">展开/折叠</el-checkbox>
            <el-checkbox v-model="form.selectAll">全选/全不选</el-checkbox>
            <el-checkbox v-model="form.parentChild">父子联动</el-checkbox>
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit(formRef)">提交</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="permissionDialog" title="菜单权限" width="30%">
      <div :style="{ maxHeight: '500px', overflowY: 'scroll' }">
        <el-tree
          ref="menuTreeRef"
          :data="menuOptions"
          show-checkbox
          node-key="id"
          empty-text="加载中，请稍候"
          :props="defaultProps"
        />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="handlePermissionSubmit">确 定</el-button>
          <el-button @click="permissionDialog = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/Form/ButtonMore.vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { formatMenuTitle } from '@/utils/menu'
  import { RoleService } from '@/api/system/roleApi'
  import { MenuService } from '@/api/system/menuApi'
  import type { RoleResult } from '@/types/system/role'
  import { resetForm } from '@/utils/utils'

  const loading = ref(false)
  const dialogVisible = ref(false)
  const permissionDialog = ref(false)
  const dialogType = ref('add')
  const roleList = ref<RoleResult[]>([])
  const menuOptions = ref([])
  const menuTreeRef = ref()

  const queryParams = reactive({
    roleName: '',
    roleKey: '',
    status: ''
  })

  const searchFormRef = ref<FormInstance>()

  const formRef = ref<FormInstance>()

  const rules = reactive<FormRules>({
    roleName: [
      { required: true, message: '角色名称不能为空', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }],
    roleSort: [{ required: true, message: '角色顺序不能为空', trigger: 'blur' }]
  })

  const form = reactive({
    roleId: undefined,
    roleName: '',
    roleKey: '',
    roleSort: 0,
    status: '0',
    menuIds: [],
    remark: '',
    expandCollapse: false,
    selectAll: false,
    parentChild: false
  })

  const statusOptions = ref([
    { label: '正常', value: '0' },
    { label: '停用', value: '1' }
  ])

  const defaultProps = {
    children: 'children',
    label: (data: any) => formatMenuTitle(data.meta?.title) || ''
  }

  // 查询角色列表
  const getList = async () => {
    const res = await RoleService.listRole(queryParams)
    roleList.value = res.rows
  }

  // 查询菜单树结构
  const getMenuTreeselect = async () => {
    try {
      const res = await MenuService.getMenuTreeSelect({})
      menuOptions.value = res.data
    } catch (error) {
      console.error('获取菜单树失败:', error)
    }
  }

  // 搜索按钮操作
  const handleQuery = () => {
    getList()
  }

  // 显示对话框
  const showDialog = async (type: string, row?: RoleResult) => {
    if (type === 'permission') {
      permissionDialog.value = true
      await getMenuTreeselect()
      if (row) {
        const res = await MenuService.getRoleMenuTreeSelect(row.roleId)
        menuTreeRef.value.setCheckedKeys(res.checkedKeys)
      }
      return
    }

    dialogVisible.value = true
    dialogType.value = type

    if (type === 'edit' && row) {
      form.roleId = row.roleId
      form.roleName = row.roleName
      form.roleKey = row.roleKey
      form.roleSort = row.roleSort
      form.status = row.status
      form.remark = row.remark || ''
      form.expandCollapse = row.expandCollapse
      form.selectAll = row.selectAll
      form.parentChild = row.parentChild
    } else {
      form.roleId = undefined
      form.roleName = ''
      form.roleKey = ''
      form.roleSort = 0
      form.status = '0'
      form.menuIds = []
      form.remark = ''
      form.expandCollapse = false
      form.selectAll = false
      form.parentChild = false
    }
  }

  // 提交按钮
  const handleSubmit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate(async (valid) => {
      if (valid) {
        try {
          if (dialogType.value === 'add') {
            await RoleService.addRole(form)
            ElMessage.success('新增成功')
          } else {
            await RoleService.updateRole(form)
            ElMessage.success('修改成功')
          }
          dialogVisible.value = false
          getList()
        } catch (error) {
          console.error('提交失败:', error)
        }
      }
    })
  }

  // 权限分配提交
  const handlePermissionSubmit = async () => {
    const checkedKeys = menuTreeRef.value.getCheckedKeys()
    const halfCheckedKeys = menuTreeRef.value.getHalfCheckedKeys()
    form.menuIds = [...checkedKeys, ...halfCheckedKeys]

    try {
      await RoleService.updateRole(form)
      ElMessage.success('权限分配成功')
      permissionDialog.value = false
    } catch (error) {
      console.error('权限分配失败:', error)
    }
  }

  // 删除按钮操作
  const deleteRole = async (row: RoleResult) => {
    try {
      await ElMessageBox.confirm('是否确认删除名称为"' + row.roleName + '"的数据项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await RoleService.delRole(row.roleId)
      ElMessage.success('删除成功')
      getList()
    } catch (error) {
      console.error('删除失败:', error)
    }
  }

  // 角色状态修改
  const handleStatusChange = async (row: RoleResult) => {
    try {
      const res = await RoleService.changeRoleStatus({
        roleId: row.roleId,
        status: row.status
      })
      if (res.code === 200) {
        ElMessage.success(res.msg)
      }
    } catch {
      row.status = row.status === '0' ? '1' : '0'
    }
  }

  // 更多按钮操作
  const buttonMoreClick = (item: ButtonMoreItem, row: RoleResult) => {
    if (item.key === 'permission') {
      showDialog('permission', row)
    } else if (item.key === 'edit') {
      showDialog('edit', row)
    } else if (item.key === 'delete') {
      deleteRole(row)
    }
  }

  import { download } from '@/utils/utils'
  // 导出按钮操作
  const exportExcel = () => {
    download(RoleService.exportExcel(queryParams))
  }

  // 初始化
  onMounted(() => {
    getList()
  })
</script>

<style lang="scss" scoped>
  .page-content {
    :deep(.el-form-item) {
      margin-bottom: 18px;
      .el-form-item__content {
        width: 100%;
      }
    }
    :deep(.el-input),
    :deep(.el-select) {
      width: 100%;
    }
    :deep(.el-form-item:last-child) {
      margin-bottom: 18px;
      text-align: right;
    }
    .svg-icon {
      width: 1.8em;
      height: 1.8em;
      overflow: hidden;
      vertical-align: -8px;
      fill: currentcolor;
    }
    .order-permissions {
      display: flex;
      gap: 20px;
      .el-checkbox {
        margin-right: 0;
      }
    }
  }
</style>
