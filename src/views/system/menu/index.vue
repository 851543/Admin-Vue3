<template>
  <div class="page-content">
    <!-- 菜单管理 -->
    <table-bar
      :showTop="false"
      @search="search"
      @reset="resetForm(searchFormRef)"
      @changeColumn="changeColumn"
      :columns="columns"
    >
      <template #top>
        <el-form :model="searchForm" ref="searchFormRef" label-width="82px">
          <el-row :gutter="20">
            <form-input
              label="菜单名称"
              prop="menuName"
              v-model="searchForm.menuName"
              @keyup.enter="search"
            />
            <form-select
              label="状态"
              prop="status"
              v-model="searchForm.status"
              :options="statusOptions"
            />
          </el-row>
        </el-form>
      </template>
      <template #bottom>
        <el-button @click="showModel('add')" v-ripple>新增</el-button>
        <el-button @click="toggleExpand" v-ripple>
          {{ isExpandAll ? '折叠' : '展开' }}
        </el-button>
      </template>
    </table-bar>

    <!-- 菜单列表 -->
    <art-table :data="tableData" ref="tableRef" row-key="menuId">
      <template #default>
        <el-table-column label="菜单名称" prop="menuName" v-if="columns[0].show">
          <template #default="scope">
            {{ formatMenuTitle(scope.row.menuName) }}
          </template>
        </el-table-column>
        <el-table-column label="图标" prop="icon" v-if="columns[1].show">
          <template #default="scope">
            <i class="iconfont-sys" v-html="scope.row.icon" />
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="orderNum" v-if="columns[2].show">
          <template #default="scope">
            {{ scope.row.orderNum }}
          </template>
        </el-table-column>
        <el-table-column label="权限标识" v-if="columns[3].show">
          <template #default="scope">
            <template v-if="scope.row.authList && scope.row.meta.authList.length > 0">
              <div v-for="(auth, index) in scope.row.meta.authList" :key="index">{{
                auth.auth_mark
              }}</div>
            </template>
          </template>
        </el-table-column>
        <el-table-column label="组件路径" prop="component" v-if="columns[4].show" />
        <el-table-column label="状态" prop="status" v-if="columns[5].show">
          <template #default="scope">
            <dict-tag :options="sysNormalDisable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" prop="createTime" v-if="columns[6].show">
          <template #default="scope">
            {{ scope.row.createTime }}
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="180px">
          <template #default="scope">
            <button-table
              type="add"
              v-auth="['system:menu:add']"
              @click="showModel('add', scope.row)"
            />
            <button-table
              type="edit"
              v-auth="['system:menu:edit']"
              @click="showModel('edit', scope.row)"
            />
            <button-table
              type="delete"
              v-auth="['system:menu:remove']"
              @click="deleteMenu(scope.row)"
            />
          </template>
        </el-table-column>
      </template>
    </art-table>

    <!-- 新增/编辑菜单 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="700px" align-center>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="菜单类型">
          <el-radio-group v-model="form.menuType" :disabled="disableMenuType">
            <el-radio-button value="M">目录</el-radio-button>
            <el-radio-button value="C">菜单</el-radio-button>
            <el-radio-button value="F">按钮</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="上级菜单">
          <el-tree-select
            v-model="form.parentId"
            :data="menuOptions"
            :props="{ value: 'id', label: 'label', children: 'children' }"
            value-key="id"
            placeholder="选择上级菜单"
            check-strictly
          />
        </el-form-item>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="显示排序" prop="orderNum">
              <el-input-number
                v-model="form.orderNum"
                controls-position="right"
                :min="0"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 目录和菜单共有属性 -->
        <template v-if="form.menuType !== 'F'">
          <el-divider content-position="left">路由配置</el-divider>
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="菜单图标">
                <icon-selector
                  :iconType="iconType"
                  @getIcon="(icon) => (form.icon = icon)"
                  :defaultIcon="form.icon"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item>
                <template #label>
                  <span>
                    <el-tooltip
                      content="默认不填则和路由地址相同：如地址为：`user`，则名称为`User`（注意：因为router会删除名称相同路由，为避免名字的冲突，特殊情况下请自定义，保证唯一性）"
                      placement="top"
                    >
                      <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    路由名称
                  </span>
                </template>
                <el-input v-model="form.routeName" placeholder="请输入路由名称" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item>
                <template #label>
                  <span>
                    <el-tooltip
                      content="访问的路由地址，如：`user`，如外网地址需内链访问则以`http(s)://`开头"
                      placement="top"
                    >
                      <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    路由地址
                  </span>
                </template>
                <el-input v-model="form.path" placeholder="请输入路由地址" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item>
                <template #label>
                  <span>
                    <el-tooltip
                      content="选择是外链则路由地址需要以`http(s)://`开头"
                      placement="top"
                    >
                      <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    是否外链
                  </span>
                </template>
                <el-radio-group v-model="form.isFrame">
                  <el-radio value="0">是</el-radio>
                  <el-radio value="1">否</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <!-- 菜单特有属性 -->
          <template v-if="form.menuType === 'C'">
            <el-row :gutter="24">
              <el-col :span="24">
                <el-form-item>
                  <template #label>
                    <span>
                      <el-tooltip
                        content="访问的组件路径，如：`system/user/index`，默认在`views`目录下"
                        placement="top"
                      >
                        <el-icon><question-filled /></el-icon>
                      </el-tooltip>
                      组件路径
                    </span>
                  </template>
                  <el-input v-model="form.component" placeholder="请输入组件路径" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-divider content-position="left">功能配置</el-divider>
            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item>
                  <template #label>
                    <span>
                      <el-tooltip
                        content='访问路由的默认传递参数，如：`{"id": 1, "name": "ry"}`'
                        placement="top"
                      >
                        <el-icon><question-filled /></el-icon>
                      </el-tooltip>
                      路由参数
                    </span>
                  </template>
                  <el-input v-model="form.query" placeholder="请输入路由参数" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item>
                  <template #label>
                    <span>
                      <el-tooltip
                        content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)"
                        placement="top"
                      >
                        <el-icon><question-filled /></el-icon>
                      </el-tooltip>
                      权限标识
                    </span>
                  </template>
                  <el-input v-model="form.perms" placeholder="请输入权限标识" />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="24">
              <el-col :span="12">
                <el-form-item>
                  <template #label>
                    <span>
                      <el-tooltip
                        content="选择是则会被`keep-alive`缓存，需要匹配组件的`name`和地址保持一致"
                        placement="top"
                      >
                        <el-icon><question-filled /></el-icon>
                      </el-tooltip>
                      是否缓存
                    </span>
                  </template>
                  <el-radio-group v-model="form.isCache">
                    <el-radio value="0">缓存</el-radio>
                    <el-radio value="1">不缓存</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
          </template>
        </template>

        <!-- 按钮特有属性 -->
        <template v-if="form.menuType === 'F'">
          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item>
                <template #label>
                  <span>
                    <el-tooltip
                      content="控制器中定义的权限字符，如：@PreAuthorize(`@ss.hasPermi('system:user:list')`)"
                      placement="top"
                    >
                      <el-icon><question-filled /></el-icon>
                    </el-tooltip>
                    权限标识
                  </span>
                </template>
                <el-input v-model="form.perms" placeholder="请输入权限标识" />
              </el-form-item>
            </el-col>
          </el-row>
        </template>

        <!-- 所有类型共有的状态设置 -->
        <el-divider content-position="left">显示设置</el-divider>
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item v-if="form.menuType !== 'F'">
              <template #label>
                <span>
                  <el-tooltip
                    content="选择隐藏则路由将不会出现在侧边栏，但仍然可以访问"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  显示状态
                </span>
              </template>
              <el-radio-group v-model="form.visible">
                <el-radio value="0">显示</el-radio>
                <el-radio value="1">隐藏</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item>
              <template #label>
                <span>
                  <el-tooltip
                    content="选择停用则路由将不会出现在侧边栏，也不能被访问"
                    placement="top"
                  >
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  菜单状态
                </span>
              </template>
              <el-radio-group v-model="form.status">
                <el-radio value="0">正常</el-radio>
                <el-radio value="1">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="submitForm()">确 定</el-button>
          <el-button @click="dialogVisible = false">取 消</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import type { FormInstance, FormRules } from 'element-plus'
  import { ElMessage, ElMessageBox } from 'element-plus'
  import { IconTypeEnum } from '@/enums/appEnum'
  import { formatMenuTitle } from '@/utils/menu'
  import { MenuService } from '@/api/system/menuApi'
  import type { MenuListType } from '@/types/menu'
  import type { MenuOptionType } from '@/types/system/menu'
  import { vRipple } from '@/directives/ripple'
  import { QuestionFilled } from '@element-plus/icons-vue'
  import { resetForm } from '@/utils/utils'
  const dialogVisible = ref(false)
  const searchFormRef = ref<FormInstance>()

  // 定义初始表单状态
  const initialFormState = {
    menuId: '' as string | number,
    menuName: '',
    parentName: '' as string | null,
    parentId: '' as string | number,
    orderNum: 0,
    path: '',
    component: '',
    query: '',
    routeName: '',
    perms: '',
    menuType: 'M',
    icon: '',
    isFrame: '1',
    isCache: '0',
    visible: '0',
    status: '0',
    remark: ''
  }

  const form = reactive({ ...initialFormState })

  const iconType = ref(IconTypeEnum.UNICODE)

  const rules = reactive<FormRules>({
    menuName: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
    orderNum: [{ required: true, message: '显示顺序不能为空', trigger: 'blur' }],
    path: [
      {
        required: true,
        message: '路由地址不能为空',
        trigger: 'blur',
        validator: (rule, value, callback) => {
          if (form.menuType !== 'F' && !value) {
            callback(new Error('路由地址不能为空'))
          } else {
            callback()
          }
        }
      }
    ]
  })

  const tableData = ref<any[]>([])
  const menuOptions = ref<MenuOptionType[]>([])

  import { handleTree } from '@/utils/utils'
  const getMenuList = async () => {
    const res = await MenuService.getMenuList(searchForm)
    if (res.code === 200) {
      tableData.value = handleTree(res.data, 'menuId')
    }
  }
  const isEdit = ref(false)
  const formRef = ref<FormInstance>()
  const dialogTitle = computed(() => {
    return isEdit.value ? `编辑菜单` : `新建菜单`
  })

  const submitForm = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        let res = null
        if (isEdit.value) {
          res = await MenuService.updateMenu(form)
        } else {
          res = await MenuService.addMenu(form)
        }
        ElMessage.success(res.msg)
        dialogVisible.value = false
        getMenuList()
        getMenuTreeselect()
      }
    })
  }

  const showModel = async (type: string, row?: any) => {
    dialogVisible.value = true
    isEdit.value = type === 'edit'

    // 重置表单数据到初始状态
    Object.assign(form, initialFormState)

    form.parentId = row.menuId
    if (type === 'edit' && row) {
      const res = await getMenuInfo(row.menuId)
      if (res) {
        form.menuId = res.menuId
        form.menuName = res.menuName
        form.parentName = res.parentName
        form.parentId = res.parentId
        form.orderNum = res.orderNum
        form.path = res.path
        form.component = res.component
        form.query = res.query
        form.routeName = res.routeName
        form.isFrame = res.isFrame
        form.isCache = res.isCache
        form.menuType = res.menuType
        form.visible = res.visible
        form.status = res.status
        form.perms = res.perms
        form.icon = res.icon
      }
    }
  }

  const deleteMenu = async (row: any) => {
    try {
      await ElMessageBox.confirm('是否确认删除名称为"' + row.menuName + '"的菜单项?', '警告', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })

      const res = await MenuService.deleteMenu(row.menuId)
      ElMessage.success(res.msg)
      getMenuList()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除菜单失败:', error)
      }
    }
  }

  const search = () => {
    getMenuList()
  }

  const searchForm = reactive({
    menuName: '',
    status: ''
  })

  const columns = reactive([
    { name: '菜单名称', show: true },
    { name: '图标', show: true },
    { name: '排序', show: true },
    { name: '权限标识', show: true },
    { name: '组件路径', show: true },
    { name: '状态', show: true },
    { name: '创建时间', show: true }
  ])

  const changeColumn = (list: any) => {
    columns.values = list
  }

  // 修改计算属性，移除所有限制
  const disableMenuType = computed(() => {
    return false // 始终返回 false，表示菜单类型可以随时修改
  })

  const statusOptions = ref([
    { label: '正常', value: '0' },
    { label: '停用', value: '1' }
  ])

  // 获取菜单下拉树列表
  const getMenuTreeselect = async () => {
    const res = await MenuService.getMenuTreeSelect({})
    if (res.code === 200) {
      const menu = { id: 0, label: '主类目', children: [] as MenuOptionType[] }
      menu.children = res.data
      menuOptions.value = []
      menuOptions.value.push(menu)
    }
  }

  const getMenuInfo = async (id: number) => {
    const res = await MenuService.getMenuInfo(id)
    if (res.code === 200) {
      return res.data
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
  const sysNormalDisable = ref<DictType[]>([]) // 状态字典数据
  const getuseDict = async () => {
    const { sys_normal_disable } = await useDict('sys_normal_disable')
    sysNormalDisable.value = sys_normal_disable
  }

  onMounted(() => {
    getuseDict()
    getMenuList()
    getMenuTreeselect()
  })
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

    :deep(.small-btn) {
      height: 30px !important;
      padding: 0 10px !important;
      font-size: 12px !important;
    }

    :deep(.el-form) {
      .el-form-item {
        margin-bottom: 12px; // 减小表单项之间的间距
      }
    }

    :deep(.el-dialog) {
      .el-form {
        .el-form-item {
          margin-bottom: 12px;
        }
      }

      .el-divider {
        margin: 12px 0; // 减小分割线的上下间距
      }

      .el-row {
        margin-bottom: 0; // 移除行之间的额外间距
      }
    }

    :deep(.el-table) {
      .el-table__row {
        height: 40px; // 减小表格行高
      }
    }
  }
</style>
