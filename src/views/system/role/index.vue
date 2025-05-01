<template>
  <div class="page-content">
    <!-- 角色管理 -->
    <table-bar
      :showTop="false"
      @search="search"
      @reset="resetForm(searchFormRef)"
      @changeColumn="changeColumn"
      :columns="columns"
    >
      <template #top>
        <el-form :model="queryParams" ref="searchFormRef" label-width="82px">
          <el-row :gutter="20">
            <form-input
              label="角色名称"
              prop="roleName"
              @keyup.enter="search"
              v-model="queryParams.roleName"
            />
            <form-input
              label="权限字符"
              prop="roleKey"
              @keyup.enter="search"
              v-model="queryParams.roleKey"
            />
            <form-select
              label="状态"
              prop="status"
              v-model="queryParams.status"
              :options="statusOptions"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="showDialog('add')" v-ripple>新增</el-button>
        <el-button @click="exportExcel" v-ripple>导出</el-button>
      </template>
    </table-bar>

    <!-- 角色列表 -->
    <art-table :data="roleList">
      <template #default>
        <el-table-column label="角色名称" prop="roleName" v-if="columns[0].show" />
        <el-table-column label="权限字符" prop="roleKey" v-if="columns[1].show" />
        <el-table-column label="描述" prop="remark" v-if="columns[2].show" />
        <el-table-column label="状态" prop="status" v-if="columns[3].show">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="'0'"
              :inactive-value="'1'"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" v-if="columns[4].show" />
        <el-table-column fixed="right" label="操作" width="200px">
          <template #default="scope">
            <div v-if="scope.row.roleId !== 1">
              <button-table
                type="edit"
                v-auth="['system:menu:edit']"
                @click="showDialog('edit', scope.row)"
              />
              <button-table
                type="delete"
                v-auth="['system:menu:remove']"
                @click="deleteRole(scope.row)"
              />
              <button-more
                :list="[
                  { key: 'dataScope', label: '数据权限' },
                  { key: 'allocation', label: '分配用户' }
                ]"
                @click="buttonMoreClick($event, scope.row)"
              />
            </div>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 新增/编辑/分配数据权限 -->
    <el-dialog
      v-model="dialogVisible"
      :title="
        dialogType === 'add' ? '新增角色' : dialogType === 'dataScope' ? '分配数据权限' : '编辑角色'
      "
      width="500px"
      append-to-body
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        v-if="dialogType !== 'dataScope'"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item prop="roleKey">
          <template #label>
            <span>
              <el-tooltip
                content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasRole('admin')`))"
                placement="top"
              >
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              权限字符
            </span>
          </template>
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
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in statusOptions" :key="dict.value" :value="dict.value">{{
              dict.label
            }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="菜单权限">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')"
            >展开/折叠</el-checkbox
          >
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')"
            >全选/全不选</el-checkbox
          >
          <el-checkbox
            v-model="form.menuCheckStrictly"
            @change="handleCheckedTreeConnect($event, 'menu')"
            >父子联动</el-checkbox
          >
          <el-tree
            class="tree-border"
            :data="menuOptions"
            show-checkbox
            ref="menuRef"
            node-key="id"
            :check-strictly="!form.menuCheckStrictly"
            empty-text="加载中，请稍候"
            :props="{ label: 'label', children: 'children' }"
          ></el-tree>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <el-form ref="dataScopeFormRef" :model="form" label-width="100px" v-else>
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" disabled />
        </el-form-item>
        <el-form-item label="权限字符" prop="roleKey">
          <el-input v-model="form.roleKey" disabled />
        </el-form-item>
        <el-form-item label="权限范围">
          <el-select v-model="form.dataScope" style="width: 100%">
            <el-option
              v-for="item in dataScopeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="数据权限" v-show="form.dataScope === '2'">
          <el-checkbox v-model="deptExpand" @change="handleCheckedTreeExpand($event, 'dept')"
            >展开/折叠</el-checkbox
          >
          <el-checkbox v-model="deptNodeAll" @change="handleCheckedTreeNodeAll($event, 'dept')"
            >全选/全不选</el-checkbox
          >
          <el-checkbox
            v-model="form.deptCheckStrictly"
            @change="handleCheckedTreeConnect($event, 'dept')"
            >父子联动</el-checkbox
          >
          <el-tree
            class="tree-border"
            :data="deptOptions"
            show-checkbox
            ref="deptRef"
            node-key="id"
            :check-strictly="!form.deptCheckStrictly"
            empty-text="加载中，请稍候"
            :props="{ label: 'label', children: 'children' }"
          ></el-tree>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="primary"
            @click="handleSubmit(dialogType === 'dataScope' ? dataScopeFormRef : formRef)"
            >提交</el-button
          >
          <el-button @click="dialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <allocation-user ref="allocationUserRef" />
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/Form/ButtonMore.vue'
  import AllocationUser from './components/AllocationUser.vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { QuestionFilled } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules, CheckboxValueType } from 'element-plus'
  import { RoleService } from '@/api/system/roleApi'
  import { MenuService } from '@/api/system/menuApi'
  import type { RoleResult, RoleOptionType } from '@/types/system/role'
  import { resetForm } from '@/utils/utils'
  import type { MenuOptionType } from '@/types/system/menu'

  const dialogVisible = ref(false)
  const dialogType = ref('add')
  const roleList = ref<RoleResult[]>([])
  const menuOptions = ref<MenuOptionType[]>([])
  const allocationUserRef = ref()

  const queryParams = reactive({
    roleName: '',
    roleKey: '',
    status: ''
  })

  const searchFormRef = ref<FormInstance>()

  const formRef = ref<FormInstance>()
  const dataScopeFormRef = ref<FormInstance>()

  const rules = reactive<FormRules>({
    roleName: [
      { required: true, message: '角色名称不能为空', trigger: 'blur' },
      { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    roleKey: [{ required: true, message: '权限字符不能为空', trigger: 'blur' }],
    roleSort: [{ required: true, message: '角色顺序不能为空', trigger: 'blur' }]
  })

  const initialFormState = {
    roleId: 0,
    roleName: '',
    roleKey: '',
    roleSort: 0,
    dataScope: '1',
    menuCheckStrictly: true,
    deptCheckStrictly: true,
    status: '0',
    delFlag: '0',
    remark: '',
    menuIds: [],
    deptIds: [],
    permissions: [],
    admin: false
  }

  const columns = reactive([
    { name: '角色名称', show: true },
    { name: '权限字符', show: true },
    { name: '描述', show: true },
    { name: '状态', show: true },
    { name: '创建时间', show: true }
  ])

  const changeColumn = (list: any) => {
    columns.values = list
  }

  const form = reactive({ ...initialFormState })

  const dataScopeOptions = ref([
    { label: '全部数据权限', value: '1' },
    { label: '自定数据权限', value: '2' },
    { label: '本部门数据权限', value: '3' },
    { label: '本部门及以下数据权限', value: '4' },
    { label: '仅本人数据权限', value: '5' }
  ])

  const statusOptions = ref([
    { label: '正常', value: '0' },
    { label: '停用', value: '1' }
  ])

  // 查询角色列表
  const getList = async () => {
    const res = await RoleService.listRole(queryParams)
    roleList.value = res.rows
  }

  // 查询菜单树结构
  const getMenuTreeselect = async () => {
    const res = await MenuService.getMenuTreeSelect({})
    if (res.code === 200) {
      menuOptions.value = res.data
    }
  }

  // 搜索按钮操作
  const search = () => {
    getList()
  }

  /** 根据角色ID查询菜单树结构 */
  const getRoleMenuTreeselect = async (roleId: any) => {
    const res = await MenuService.getRoleMenuTreeSelect(roleId)
    if (res.code === 200) {
      menuOptions.value = res.menus
    }
    return res
  }

  /** 根据角色ID查询部门树结构 */
  const getDeptTree = async (roleId: any) => {
    const res = await RoleService.deptTree(roleId)
    if (res.code === 200) {
      deptOptions.value = res.depts
    }
    return res
  }

  // 修改角色
  const handleUpdateRole = async (roleId: number) => {
    const roleMenu = getRoleMenuTreeselect(roleId)
    RoleService.getRole(roleId).then((response) => {
      Object.assign(form, response.data)
      nextTick(() => {
        roleMenu.then((res) => {
          let checkedKeys = res.checkedKeys
          checkedKeys.forEach((v) => {
            nextTick(() => {
              menuRef.value.setChecked(v, true, false)
            })
          })
        })
      })
    })
  }

  // 分配数据权限
  const handleDataScope = async (roleId: number) => {
    const deptTreeSelect = getDeptTree(roleId)
    RoleService.getRole(roleId).then((response) => {
      Object.assign(form, response.data)
      nextTick(() => {
        deptTreeSelect.then((res) => {
          let checkedKeys = res.checkedKeys
          checkedKeys.forEach((v) => {
            nextTick(() => {
              deptRef.value.setChecked(v, true, false)
            })
          })
        })
      })
    })
  }
  // 显示对话框
  const showDialog = async (type: string, row?: RoleResult) => {
    dialogType.value = type
    dialogVisible.value = true
    if (type === 'add') {
      // 重置表单
      Object.assign(form, initialFormState)
      return await getMenuTreeselect()
    }
    if (type === 'edit' && row) {
      return await handleUpdateRole(row.roleId)
    }
  }

  /** 所有菜单节点数据 */
  function getMenuAllCheckedKeys() {
    // 目前被选中的菜单节点
    let checkedKeys = menuRef.value.getCheckedKeys()
    // 半选中的菜单节点
    let halfCheckedKeys = menuRef.value.getHalfCheckedKeys()
    checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
    return checkedKeys
  }

  /** 所有部门节点数据 */
  function getDeptAllCheckedKeys() {
    // 目前被选中的部门节点
    let checkedKeys = deptRef.value.getCheckedKeys()
    // 半选中的部门节点
    let halfCheckedKeys = deptRef.value.getHalfCheckedKeys()
    checkedKeys.unshift.apply(checkedKeys, halfCheckedKeys)
    return checkedKeys
  }

  // 提交按钮
  const handleSubmit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate(async (valid) => {
      if (valid) {
        let res = null // 定义一个变量来存储请求的结果
        if (dialogType.value === 'add') {
          form.menuIds = getMenuAllCheckedKeys()
          res = await RoleService.addRole(form)
        } else if (dialogType.value === 'edit') {
          form.menuIds = getMenuAllCheckedKeys()
          res = await RoleService.updateRole(form)
        } else if (dialogType.value === 'dataScope') {
          form.deptIds = getDeptAllCheckedKeys()
          res = await RoleService.dataScope(form)
        }
        if (res) {
          ElMessage.success(res.msg)
          dialogVisible.value = false
          getList()
        }
      }
    })
  }

  // 删除按钮操作
  const deleteRole = async (row: RoleResult) => {
    await ElMessageBox.confirm('是否确认删除名称为"' + row.roleName + '"的数据项?', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await RoleService.delRole(row.roleId)
    if (res.code === 200) {
      ElMessage.success(res.msg)
    }
    getList()
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
  const buttonMoreClick = async (item: ButtonMoreItem, row: RoleResult) => {
    if (item.key === 'dataScope') {
      dialogVisible.value = true
      dialogType.value = item.key as string
      await handleDataScope(row.roleId)
    } else if (item.key === 'allocation') {
      allocationUserRef.value.show(row.roleId)
    }
  }

  import { downloadExcel } from '@/utils/utils'
  // 导出按钮操作
  const exportExcel = () => {
    downloadExcel(RoleService.exportExcel(queryParams))
  }

  // 初始化
  onMounted(() => {
    getList()
  })

  const menuExpand = ref(false)
  const menuNodeAll = ref(false)
  const menuRef = ref()

  const deptExpand = ref(false)
  const deptNodeAll = ref(false)
  const deptRef = ref()
  const deptOptions = ref<RoleOptionType[]>([])

  // 树形控件展开/折叠
  const handleCheckedTreeExpand = (value: CheckboxValueType, type: string) => {
    if (type == 'menu') {
      const treeList = menuOptions.value
      for (let i = 0; i < treeList.length; i++) {
        menuRef.value.store.nodesMap[treeList[i].id].expanded = value
      }
    } else if (type == 'dept') {
      const treeList: Array<MenuOptionType> = deptOptions.value
      for (let i = 0; i < treeList.length; i++) {
        deptRef.value.store.nodesMap[treeList[i].id].expanded = value
      }
    }
  }

  // 树形控件全选/全不选
  const handleCheckedTreeNodeAll = (value: CheckboxValueType, type: string) => {
    if (type === 'menu') {
      const treeList = getAllNodeIds(menuOptions.value)
      menuRef.value.setCheckedKeys(value ? treeList : [])
    } else {
      const treeList = getAllNodeIds(deptOptions.value)
      deptRef.value.setCheckedKeys(value ? treeList : [])
    }
  }

  // 获取所有节点ID
  const getAllNodeIds = (nodes: any[]): number[] => {
    const ids: number[] = []
    const traverse = (nodes: any[]) => {
      nodes.forEach((node) => {
        ids.push(node.id)
        if (node.children && node.children.length > 0) {
          traverse(node.children)
        }
      })
    }
    traverse(nodes)
    return ids
  }

  // 树形控件父子联动
  const handleCheckedTreeConnect = (value: CheckboxValueType, type: string) => {
    if (type === 'menu') {
      menuRef.value.setCheckStrictly(value === true)
    } else {
      deptRef.value.setCheckStrictly(value === true)
    }
  }
</script>

<style lang="scss" scoped>
  .page-content {
    .svg-icon {
      width: 1.8em;
      height: 1.8em;
      overflow: hidden;
      vertical-align: -8px;
      fill: currentcolor;
    }
  }
  .el-icon {
    margin-right: 4px;
    font-size: 14px;
    vertical-align: -2px;
  }
  .tree-border {
    margin-top: 5px;
    border: 1px solid #e5e6e7;
    background: #fff;
    border-radius: 4px;
    padding: 10px;
    width: 100%;
    max-height: 100px;
    overflow-y: auto;

    :deep(.el-tree-node) {
      padding: 4px 0;
    }

    :deep(.el-tree-node__content) {
      height: auto;
      padding: 4px 0;
    }
  }

  :deep(.el-table) {
    .cell {
      display: flex;
      align-items: center;
      justify-content: flex-start;
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
