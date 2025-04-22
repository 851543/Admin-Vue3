<template>
  <div class="app-container">
    <el-row :gutter="10">
      <el-col :span="8">
        <el-card style="height: calc(100vh - 125px)">
          <template #header>
            <Collection style="width: 1em; height: 1em; vertical-align: middle" />
            <span style="vertical-align: middle">缓存列表</span>
            <el-button
              style="float: right; padding: 3px 0"
              link
              type="primary"
              icon="Refresh"
              @click="refreshCacheNames()"
            ></el-button>
          </template>
          <el-table
            v-loading="loading"
            :data="cacheNames"
            :height="tableHeight"
            highlight-current-row
            @row-click="getCacheKeys"
            style="width: 100%"
          >
            <el-table-column label="序号" width="60" type="index"></el-table-column>

            <el-table-column
              label="缓存名称"
              align="center"
              prop="cacheName"
              :show-overflow-tooltip="true"
              :formatter="nameFormatter"
            ></el-table-column>

            <el-table-column
              label="备注"
              align="center"
              prop="remark"
              :show-overflow-tooltip="true"
            />
            <el-table-column
              label="操作"
              width="60"
              align="center"
              class-name="small-padding fixed-width"
            >
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  icon="Delete"
                  @click="handleClearCacheName(scope.row)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card style="height: calc(100vh - 125px)">
          <template #header>
            <Key style="width: 1em; height: 1em; vertical-align: middle" />
            <span style="vertical-align: middle">键名列表</span>
            <el-button
              style="float: right; padding: 3px 0"
              link
              type="primary"
              icon="Refresh"
              @click="refreshCacheKeys()"
            ></el-button>
          </template>
          <el-table
            v-loading="subLoading"
            :data="cacheKeys"
            :height="tableHeight"
            highlight-current-row
            @row-click="handleCacheValue"
            style="width: 100%"
          >
            <el-table-column label="序号" width="60" type="index"></el-table-column>
            <el-table-column
              label="缓存键名"
              align="center"
              :show-overflow-tooltip="true"
              :formatter="keyFormatter"
            >
            </el-table-column>
            <el-table-column
              label="操作"
              width="60"
              align="center"
              class-name="small-padding fixed-width"
            >
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  icon="Delete"
                  @click="handleClearCacheKey(scope.row)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card :bordered="false" style="height: calc(100vh - 125px)">
          <template #header>
            <Document style="width: 1em; height: 1em; vertical-align: middle" />
            <span style="vertical-align: middle">缓存内容</span>
            <el-button
              style="float: right; padding: 3px 0"
              link
              type="primary"
              icon="Refresh"
              @click="handleClearCacheAll()"
              >清理全部</el-button
            >
          </template>
          <el-form :model="cacheForm">
            <el-row :gutter="32">
              <el-col :offset="1" :span="22">
                <el-form-item label="缓存名称:" prop="cacheName">
                  <el-input v-model="cacheForm.cacheName" :readOnly="true" />
                </el-form-item>
              </el-col>
              <el-col :offset="1" :span="22">
                <el-form-item label="缓存键名:" prop="cacheKey">
                  <el-input v-model="cacheForm.cacheKey" :readOnly="true" />
                </el-form-item>
              </el-col>
              <el-col :offset="1" :span="22">
                <el-form-item label="缓存内容:" prop="cacheValue">
                  <el-input
                    v-model="cacheForm.cacheValue"
                    type="textarea"
                    :rows="8"
                    :readOnly="true"
                  />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
  import { CacheApi } from '@/api/monitor/cacheApi'
  import { ElMessage } from 'element-plus'
  import { ref, onMounted } from 'vue'
  import { CacheNameResult } from '@/types/monitor/cache'

  const cacheNames = ref([])
  const cacheKeys = ref<string[]>()
  const cacheForm = ref<CacheNameResult>({
    cacheName: '',
    cacheKey: '',
    cacheValue: '',
    remark: ''
  })
  const loading = ref(true)
  const subLoading = ref(false)
  const nowCacheName = ref('')
  const tableHeight = ref(window.innerHeight - 200)

  /** 查询缓存名称列表 */
  const getCacheNames = async () => {
    loading.value = true
    const res = await CacheApi.getCacheName()
    if (res.code === 200) {
      cacheNames.value = res.data
      loading.value = false
    }
  }

  /** 刷新缓存名称列表 */
  const refreshCacheNames = () => {
    getCacheNames()
    ElMessage.success('刷新缓存列表成功')
  }

  /** 清理指定名称缓存 */
  const handleClearCacheName = async (row: any) => {
    const res = await CacheApi.clearCacheName(row.cacheName)
    if (res.code === 200) {
      ElMessage.success('清理缓存[' + row.cacheName + ']成功')
      getCacheNames()
    }
  }

  /** 查询缓存键名列表 */
  const getCacheKeys = async (row?: any) => {
    const cacheName = row !== undefined ? row.cacheName : nowCacheName.value
    if (cacheName === '') {
      return
    }
    subLoading.value = true
    const res = await CacheApi.listCacheKey(cacheName)
    if (res.code === 200) {
      cacheKeys.value = res.data
      nowCacheName.value = cacheName
      subLoading.value = false
    }
  }

  /** 刷新缓存键名列表 */
  const refreshCacheKeys = () => {
    getCacheKeys()
    ElMessage.success('刷新键名列表成功')
  }

  /** 清理指定键名缓存 */
  const handleClearCacheKey = async (cacheKey: any) => {
    const res = await CacheApi.clearCacheName(cacheKey)
    if (res.code === 200) {
      ElMessage.success('清理缓存[' + cacheKey + ']成功')
      getCacheKeys()
    }
  }

  /** 清理全部缓存 */
  const handleClearCacheAll = async () => {
    const res = await CacheApi.clearCacheAll()
    if (res.code === 200) {
      ElMessage.success('清理全部缓存成功')
      getCacheNames()
    }
  }

  /** 查看缓存内容详情 */
  const handleCacheValue = async (cacheKey: any) => {
    const res = await CacheApi.getCacheValue(nowCacheName.value, cacheKey)
    if (res.code === 200) {
      cacheForm.value = res.data
    }
  }

  /** 列表前缀去除 */
  const nameFormatter = (row: any) => {
    return row.cacheName.replace(':', '')
  }

  /** 键名前缀去除 */
  const keyFormatter = (row: any) => {
    return row.replace(nowCacheName.value, '')
  }

  onMounted(() => {
    getCacheNames()
  })
</script>
<style lang="scss" scoped>
  .app-container {
    margin: 10px 0px 0px 0px;
    span {
      margin-left: 10px;
    }
  }
</style>
