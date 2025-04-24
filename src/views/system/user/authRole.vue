<template>
  <div class="app-container">
    <div class="info-card">
      <h4 class="form-header h4">基本信息</h4>
      <el-form :model="form" label-width="80px">
        <el-row>
          <el-col :span="8" :offset="2">
            <el-form-item label="用户昵称" prop="nickName">
              <el-input v-model="form.nickName" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="8" :offset="2">
            <el-form-item label="登录账号" prop="userName">
              <el-input v-model="form.userName" disabled />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </div>

    <div class="role-card">
      <h4 class="form-header h4">角色信息</h4>
      <art-table
        v-loading="loading"
        :data="roles.slice((pageNum - 1) * pageSize, pageNum * pageSize)"
        selection
        :total="total"
        :current-page="pageNum"
        :page-size="pageSize"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @selection-change="handleSelectionChange"
        row-key="roleId"
        class="role-table"
      >
        <el-table-column label="角色名称" prop="roleName" align="center" />
        <el-table-column label="角色描述" prop="roleDesc" align="center" />
        <el-table-column label="权限" prop="roleKey" align="center" />
        <el-table-column label="创建时间" prop="createTime" align="center" />
      </art-table>
    </div>
    <div class="button-container" style="display: flex; justify-content: center; margin-top: 20px">
      <el-button type="primary" class="gradient-btn" @click="submitForm">保存</el-button>
      <el-button class="outline-btn" @click="close">关闭</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { UserService } from '@/api/system/userApi'
  import { ElMessage } from 'element-plus'
  import { useRouter } from 'vue-router'
  import { ref, nextTick } from 'vue'
  import { RoleType } from '@/types/system/user'

  const router = useRouter()
  const route = useRoute()

  const loading = ref(true)
  const total = ref(0)
  const pageNum = ref(1)
  const pageSize = ref(10)
  const roleIds = ref([])
  const roles = ref<RoleType[]>([])
  const roleRef = ref()
  const form = ref({
    nickName: '',
    userName: '',
    userId: 0
  })

  /** 关闭按钮 */
  const close = () => {
    router.push({ path: '/system/user' })
  }

  /** 每页条数改变 */
  const handleSizeChange = (size: number) => {
    pageSize.value = size
  }

  /** 当前页改变 */
  const handleCurrentChange = (page: number) => {
    pageNum.value = page
  }

  // 多选框选中数据
  const handleSelectionChange = (selection: any) => {
    roleIds.value = selection.map((item: any) => item.roleId)
  }

  /** 提交按钮 */
  const submitForm = async () => {
    const userId = form.value.userId
    const rIds = roleIds.value.join(',')
    const res = await UserService.updateAuthRole({ userId: userId, roleIds: rIds })
    if (res.code === 200) {
      ElMessage.success(res.msg)
      close()
    }
  }

  ;(async () => {
    const userId = route.params && route.params.userId
    if (userId) {
      loading.value = true
      const res = await UserService.getAuthRole(userId)
      if (res.code === 200) {
        form.value = res.user
        roles.value = res.roles
        total.value = roles.value.length
        nextTick(() => {
          roles.value.forEach((row) => {
            if (row.flag) {
              roleRef.value.toggleRowSelection(row)
            }
          })
        })
        loading.value = false
      }
    }
  })()
</script>

<style scoped>
  .app-container {
    padding: 20px;
  }

  .info-card,
  .role-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 20px;
    margin-bottom: 20px;
    transition: all 0.3s ease;
  }

  .form-header {
    color: #303133;
    font-weight: 600;
    margin-bottom: 20px;
    position: relative;
    padding-left: 10px;
  }

  .form-header::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 16px;
    background: linear-gradient(to bottom, #409eff, #36d1dc);
    border-radius: 2px;
  }

  .role-table {
    margin-top: 10px;
  }

  .gradient-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  }

  .outline-btn {
    transition: all 0.3s ease;
  }
</style>
