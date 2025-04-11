<template>
  <!-- 分配用户弹窗 -->
  <el-dialog
    v-model="allocationDialogVisible"
    :title="`分配用户_${!isAuthorized ? '取消授权' : '授权'}`"
    width="1200px"
    append-to-body
  >
    <el-form :model="queryParams" ref="allocatedSearchFormRef">
      <el-row :gutter="20">
        <el-col :xs="24" :sm="12" :lg="6">
          <el-form-item label="用户名称" prop="userName">
            <el-input v-model="queryParams.userName" placeholder="请输入用户名称" clearable />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="6">
          <el-form-item label="手机号码" prop="phonenumber">
            <el-input v-model="queryParams.phonenumber" placeholder="请输入手机号码" clearable />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="12" :lg="12">
          <el-button @click="handleQuery" v-ripple>搜索</el-button>
          <el-button @click="resetForm(allocatedSearchFormRef)" v-ripple>重置</el-button>
          <el-button @click="handleAuthorize" v-ripple>{{
            isAuthorized ? '取消授权' : '授权'
          }}</el-button>
        </el-col>
      </el-row>
    </el-form>

    <art-table
      ref="refTable"
      :data="userList"
      selection
      @selection-change="handleSelectionChange"
      @current-change="handleCurrentChange"
      :current-page="queryParams.pageNum"
      :page-size="queryParams.pageSize"
      :total="total"
      @size-change="handleSizeChange"
      :row-key="(row: UserType) => String(row.userId)"
    >
      <template #default>
        <el-table-column type="selection" width="55" />
        <el-table-column label="用户名称" prop="userName" />
        <el-table-column label="用户昵称" prop="nickName" />
        <el-table-column label="邮箱" prop="email" />
        <el-table-column label="手机" prop="phonenumber" />
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">
              {{ scope.row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button
              type="text"
              :icon="!isAuthorized ? 'CircleClose' : 'CircleCheck'"
              @click="handleSelectUser(scope.row)"
              >{{ isAuthorized ? '授权' : '取消授权' }}</el-button
            >
          </template>
        </el-table-column>
      </template>
    </art-table>
    <div style="text-align: right; margin-top: 20px">
      <el-button @click="allocationDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="handleConfirm">确定</el-button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { RoleService } from '@/api/system/roleApi'
  import type { FormInstance } from 'element-plus'
  import type { UserType } from '@/types/system/role'
  import { ElMessage } from 'element-plus'
  import { resetForm } from '@/utils/utils'

  const props = defineProps({
    roleId: {
      type: [Number, String]
    }
  })

  const allocationDialogVisible = ref(false)
  const userList = ref<UserType[]>([])
  const total = ref(0)
  const refTable = ref()
  const allocatedSearchFormRef = ref<FormInstance>()

  const queryParams = reactive({
    roleId: props.roleId,
    userName: '',
    phonenumber: '',
    pageNum: 1,
    pageSize: 5
  })

  // 保存已选用户ID
  const selectedUserIds = ref<number[]>([])
  const isAuthorized = ref(false)

  // 统一处理列表获取逻辑
  const getTableData = async () => {
    const service = isAuthorized.value
      ? RoleService.unallocatedUserList
      : RoleService.allocatedUserList
    const res = await service({
      ...queryParams,
      roleId: props.roleId
    })
    if (res.code === 200) {
      userList.value = res.rows
      total.value = res.total
    }
  }

  // 统一处理分页和搜索
  const handleQuery = () => {
    queryParams.pageNum = 1
    getTableData()
  }

  const handleCurrentChange = (page: number) => {
    queryParams.pageNum = page
    getTableData()
  }

  const handleSizeChange = (size: number) => {
    queryParams.pageSize = size
    getTableData()
  }

  // 统一处理授权操作
  const handleAuthorize = async () => {
    userList.value = []
    total.value = 0
    isAuthorized.value = !isAuthorized.value
    await getTableData()
  }

  // 统一处理用户授权
  const handleUserAuthorization = async (userIds: number[]) => {
    const userIdsStr = userIds.join(',')
    const res = isAuthorized.value
      ? await RoleService.authUserSelectAll(props.roleId, userIdsStr)
      : await RoleService.authUserCancelAll(props.roleId, userIdsStr)

    if (res.code === 200) {
      ElMessage.success(res.msg)
      await getTableData()
    }
  }

  const handleConfirm = () => handleUserAuthorization(selectedUserIds.value)
  const handleSelectUser = (row: UserType) => handleUserAuthorization([row.userId])

  // 显示弹框
  const show = () => {
    allocationDialogVisible.value = true
    getTableData()
  }

  // 多选框选中数据
  const handleSelectionChange = (selection: UserType[]) => {
    selectedUserIds.value = selection.map((item) => item.userId)
  }

  defineExpose({
    show
  })
</script>
