<template>
  <div class="page-content">
    <el-form :model="queryParams" ref="searchFormRef">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :lg="6">
          <el-form-item label="角色名称" prop="roleName" @keyup.enter="handleQuery">
            <el-input
              v-model="queryParams.roleName"
              placeholder="请输入角色名称"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <el-form-item label="权限字符" prop="roleKey" @keyup.enter="handleQuery">
            <el-input
              v-model="queryParams.roleKey"
              placeholder="请输入权限字符"
              clearable
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <el-form-item label="状态" prop="status">
            <el-select
              v-model="queryParams.status"
              placeholder="请选择"
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
        <el-col :xs="24" :sm="12" :lg="6">
          <el-button @click="handleQuery" v-ripple>搜索</el-button>
          <el-button @click="resetForm(searchFormRef)" v-ripple>重置</el-button>
          <el-button @click="exportExcel" v-ripple>导出</el-button>
          <el-button @click="showDialog('add')" v-ripple>新增角色</el-button>
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
                  { key: 'permission', label: '数据权限' },
                  { key: 'edit', label: '分配用户' }
                ]"
                @click="buttonMoreClick($event, scope.row)"
              />
            </div>
          </template>
        </el-table-column>
      </template>
    </art-table>

    <el-dialog
      v-model="dialogVisible"
      :title="
        dialogType === 'add'
          ? '新增角色'
          : dialogType === 'permission'
            ? '分配数据权限'
            : '编辑角色'
      "
      width="500px"
      append-to-body
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        v-if="dialogType !== 'permission'"
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
        <el-form-item label="状态">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in statusOptions" :key="dict.value" :label="dict.value">{{
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
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <el-form ref="permissionFormRef" :model="form" label-width="100px" v-else>
        <el-form-item label="角色名称">
          <el-input v-model="form.roleName" disabled />
        </el-form-item>
        <el-form-item label="权限字符">
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
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit(formRef)">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ButtonMoreItem } from '@/components/Form/ButtonMore.vue'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { QuestionFilled } from '@element-plus/icons-vue'
  import type { FormInstance, FormRules, CheckboxValueType } from 'element-plus'
  import { RoleService } from '@/api/system/roleApi'
  import { MenuService } from '@/api/system/menuApi'
  import type { RoleResult } from '@/types/system/role'
  import { resetForm } from '@/utils/utils'
  import type { MenuOptionType } from '@/types/system/menu'

  const loading = ref(false)
  const dialogVisible = ref(false)
  const dialogType = ref('add')
  const roleList = ref<RoleResult[]>([])
  const menuOptions = ref<MenuOptionType[]>([])

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
  })

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
  const handleQuery = () => {
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

  // 修改角色
  const updateRole = async (roleId: number) => {
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

  // 显示对话框
  const showDialog = async (type: string, row?: RoleResult) => {
    dialogType.value = type
    dialogVisible.value = true
    if (type === 'add') {
      return await getMenuTreeselect()
    }
    if (type === 'edit' && row) {
      return await updateRole(row.roleId)
    }
    if (type === 'permission' && row) {
      return await updateRole(row.roleId)
    }
  }

  // 提交按钮
  const handleSubmit = async (formEl: FormInstance | undefined) => {
    if (!formEl) return

    await formEl.validate(async (valid) => {
      if (valid) {
        let res = null
        if (dialogType.value === 'add') {
          res = await RoleService.addRole(form)
        } else if (dialogType.value === 'permission') {
          res = await RoleService.dataScope(form)
        } else {
          res = await RoleService.updateRole(form)
        }
        ElMessage.success(res.msg)
        dialogVisible.value = false
        getList()
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
    if (item.key === 'permission') {
      dialogType.value = 'permission'
      dialogVisible.value = true
      const res = await RoleService.getRole(row.roleId)
      Object.assign(form, res.data)
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

  const menuExpand = ref(false)
  const menuNodeAll = ref(false)
  const menuRef = ref()

  const deptExpand = ref(false)
  const deptNodeAll = ref(false)
  const deptRef = ref()
  const deptOptions = ref([])

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
