<template>
  <el-card>
    <el-tabs v-model="activeName">
      <el-tab-pane label="基本信息" name="basic">
        <basic-info-form ref="basicInfo" v-model:info="info" />
      </el-tab-pane>
      <el-tab-pane label="字段信息" name="columnInfo">
        <el-table ref="dragTable" :data="columns" row-key="columnId" :max-height="tableHeight">
          <el-table-column label="序号" type="index" min-width="5%" />
          <el-table-column
            label="字段列名"
            prop="columnName"
            min-width="10%"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="字段描述" min-width="10%">
            <template #default="scope">
              <el-input v-model="scope.row.columnComment"></el-input>
            </template>
          </el-table-column>
          <el-table-column
            label="物理类型"
            prop="columnType"
            min-width="10%"
            :show-overflow-tooltip="true"
          />
          <el-table-column label="Java类型" min-width="11%">
            <template #default="scope">
              <el-select v-model="scope.row.javaType">
                <el-option label="Long" value="Long" />
                <el-option label="String" value="String" />
                <el-option label="Integer" value="Integer" />
                <el-option label="Double" value="Double" />
                <el-option label="BigDecimal" value="BigDecimal" />
                <el-option label="Date" value="Date" />
                <el-option label="Boolean" value="Boolean" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="java属性" min-width="10%">
            <template #default="scope">
              <el-input v-model="scope.row.javaField"></el-input>
            </template>
          </el-table-column>

          <el-table-column label="插入" min-width="5%">
            <template #default="scope">
              <el-checkbox :value="scope.row.isInsert" v-model="scope.row.isInsert"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="编辑" min-width="5%">
            <template #default="scope">
              <el-checkbox :value="scope.row.isEdit" v-model="scope.row.isEdit"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="列表" min-width="5%">
            <template #default="scope">
              <el-checkbox :value="scope.row.isList" v-model="scope.row.isList"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="查询" min-width="5%">
            <template #default="scope">
              <el-checkbox :value="scope.row.isQuery" v-model="scope.row.isQuery"></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="查询方式" min-width="10%">
            <template #default="scope">
              <el-select v-model="scope.row.queryType">
                <el-option label="=" value="EQ" />
                <el-option label="!=" value="NE" />
                <el-option label=">" value="GT" />
                <el-option label=">=" value="GTE" />
                <el-option label="<" value="LT" />
                <el-option label="<=" value="LTE" />
                <el-option label="LIKE" value="LIKE" />
                <el-option label="BETWEEN" value="BETWEEN" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="必填" min-width="5%">
            <template #default="scope">
              <el-checkbox
                :value="scope.row.isRequired"
                v-model="scope.row.isRequired"
              ></el-checkbox>
            </template>
          </el-table-column>
          <el-table-column label="显示类型" min-width="12%">
            <template #default="scope">
              <el-select v-model="scope.row.htmlType">
                <el-option label="文本框" value="input" />
                <el-option label="文本域" value="textarea" />
                <el-option label="下拉框" value="select" />
                <el-option label="单选框" value="radio" />
                <el-option label="复选框" value="checkbox" />
                <el-option label="日期控件" value="datetime" />
                <el-option label="图片上传" value="imageUpload" />
                <el-option label="文件上传" value="fileUpload" />
                <el-option label="富文本控件" value="editor" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="字典类型" min-width="12%">
            <template #default="scope">
              <el-select v-model="scope.row.dictType" clearable filterable placeholder="请选择">
                <el-option
                  v-for="dict in dictOptions"
                  :key="dict.dictType"
                  :label="dict.dictName"
                  :value="dict.dictType"
                >
                  <span style="float: left">{{ dict.dictName }}</span>
                  <span style="float: right; color: #8492a6; font-size: 13px">{{
                    dict.dictType
                  }}</span>
                </el-option>
              </el-select>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="生成信息" name="genInfo">
        <gen-info-form ref="genInfo" v-model:info="info" :tables="tables" />
      </el-tab-pane>
    </el-tabs>
    <el-form label-width="100px">
      <div style="text-align: center; margin-left: -100px; margin-top: 10px">
        <el-button type="primary" @click="submitForm()">提交</el-button>
        <el-button @click="close()">返回</el-button>
      </div>
    </el-form>
  </el-card>
</template>

<script setup name="GenEdit">
  import { GeneratorApi } from '@/api/tool/generatorApi'
  import { DictTypeService } from '@/api/system/dict/typeApi'
  import { useRoute, useRouter } from 'vue-router'
  import { ref, getCurrentInstance } from 'vue'
  import basicInfoForm from './components/basicInfoForm.vue'
  import genInfoForm from './components/genInfoForm.vue'

  const { proxy } = getCurrentInstance()
  const route = useRoute()
  const router = useRouter()

  const activeName = ref('columnInfo')
  const tableHeight = ref(document.documentElement.scrollHeight - 245 + 'px')
  const tables = ref([])
  const columns = ref([])
  const dictOptions = ref([])
  const info = ref({})

  /** 提交按钮 */
  async function submitForm() {
    const basicForm = proxy.$refs.basicInfo.$refs.basicInfoForm
    const genForm = proxy.$refs.genInfo.$refs.genInfoForm

    try {
      const [basicValid, genValid] = await Promise.all([
        new Promise((resolve) => basicForm.validate(resolve)),
        new Promise((resolve) => genForm.validate(resolve))
      ])

      if (basicValid && genValid) {
        // 获取表单数据
        const basicData = proxy.$refs.basicInfo.getFormData()
        const genData = proxy.$refs.genInfo.getFormData()
        // basicData genData的解构顺序不能颠倒
        const genTable = {
          ...genData,
          ...basicData,
          columns: columns.value,
          params: {
            treeCode: genData.treeCode,
            treeName: genData.treeName,
            treeParentCode: genData.treeParentCode,
            parentMenuId: genData.parentMenuId
          }
        }
        const res = await GeneratorApi.updateGenTable(genTable)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          close()
        }
      } else {
        ElMessage.error('表单校验未通过，请重新检查提交内容')
      }
    } catch (error) {
      console.error('表单提交错误:', error)
      ElMessage.error('表单提交失败，请重试')
    }
  }

  function close() {
    router.push({ path: '/tool/gen', query: { t: Date.now(), pageNum: route.query.pageNum } })
  }

  ;(async () => {
    const tableId = route.params && route.params.tableId
    if (tableId) {
      // 获取表详细信息
      const res = await GeneratorApi.getGenTable(tableId)
      if (res.code === 200) {
        columns.value = res.data.rows
        info.value = res.data.info
        tables.value = res.data.tables
      }
      /** 查询字典下拉列表 */
      const dictRes = await DictTypeService.optionSelect()
      if (dictRes.code === 200) {
        dictOptions.value = dictRes.data
      }
    }
  })()
</script>
