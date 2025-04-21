<template>
  <div class="table-bar">
    <div class="top-wrap" v-show="showSearchWrap">
      <slot name="top"> </slot>
      <div class="buttons" :style="{ bottom: topButtons + 'px' }">
        <el-button type="primary" @click="search" v-ripple>搜索</el-button>
        <el-button @click="reset" v-ripple>重置</el-button>
      </div>
    </div>
    <div class="bottom-wrap" v-if="showBottom">
      <div class="left-wrap">
        <slot name="bottom"></slot>
      </div>
      <div class="right-wrap">
        <el-button-group>
          <el-button
            :icon="Search"
            @click="isShowSearchWrap()"
            v-if="layout.indexOf('search') !== -1"
          />
          <el-button
            :icon="RefreshRight"
            @click="refresh()"
            v-if="layout.indexOf('refresh') !== -1"
          />

          <el-popover
            placement="bottom-end"
            width="100"
            trigger="hover"
            @show="showPopover"
            v-if="layout.indexOf('column') !== -1"
          >
            <el-checkbox-group v-model="colOptions" :min="1">
              <el-checkbox
                v-for="(item, index) in colSelect"
                :label="item"
                :key="item"
                @change="changeColumn($event, index)"
              />
            </el-checkbox-group>
            <template #reference>
              <el-button :icon="Operation"></el-button>
            </template>
          </el-popover>
        </el-button-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useCommon } from '@/composables/useCommon'
  import { Search, RefreshRight, Operation } from '@element-plus/icons-vue'

  const emit = defineEmits(['search', 'reset', 'changeColumn'])

  const props = defineProps({
    showTop: {
      type: Boolean,
      default: true
    },
    showBottom: {
      type: Boolean,
      default: true
    },
    columns: {
      type: Array,
      default: () => []
    },
    layout: {
      type: String,
      default: 'search, refresh, column'
    },
    topButtons: {
      type: Number,
      default: 20
    }
  })

  const showSearchWrap = ref(true)
  const colOptions = ref([])
  const colSelect = ref([])
  const columnChage = ref(false)

  onMounted(() => {
    showSearchWrap.value = props.showTop
  })

  // 刷新页面
  const refresh = () => {
    useCommon().refresh()
  }

  // 是否显示搜索区域
  const isShowSearchWrap = () => {
    showSearchWrap.value = !showSearchWrap.value
  }

  // 列显示隐藏
  const showPopover = () => {
    if (!columnChage.value) {
      let ops: any = []
      let sel: any = []
      props.columns.map((item: any) => {
        sel.push(item.name)
        if (item.show) {
          ops.push(item.name)
        }
      })
      colOptions.value = ops
      colSelect.value = sel
      columnChage.value = true
    }
  }

  // 选择列
  const changeColumn = (show: any, index: number) => {
    let columns = props.columns

    columns.map((item: any, i: number) => {
      if (index === i) {
        item.show = show
      }
    })

    emit('changeColumn', columns)
  }

  const search = () => {
    emit('search')
  }

  const reset = () => {
    emit('reset')
  }
</script>

<style lang="scss" scoped>
  .table-bar {
    padding: 0 0 20px;

    .top-wrap {
      position: relative;
      transition: height 0.3s;

      .buttons {
        position: absolute;
        right: 0;
      }
    }

    .bottom-wrap {
      display: flex;
      justify-content: space-between;
    }
  }

  .el-button-group {
    display: flex;
  }

  @media screen and (max-width: $device-phone) {
    .table-bar {
      .top-wrap {
        padding-bottom: 60px;
      }
    }

    .el-form {
      padding-bottom: 15px;
    }
  }
</style>
