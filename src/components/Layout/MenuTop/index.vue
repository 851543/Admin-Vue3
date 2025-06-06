<template>
  <div class="menu-top">
    <el-menu
      :ellipsis="true"
      class="el-menu-popper-demo"
      mode="horizontal"
      :default-active="routerPath"
      text-color="var(--art-text-gray-700)"
      :popper-offset="16"
      :style="{ width: width + 'px' }"
      background-color="transparent"
    >
      <MenuTopSubmenu
        v-for="item in filteredMenuItems"
        :key="item.id"
        :item="item"
        :isMobile="false"
        :level="0"
      />
    </el-menu>
  </div>
</template>

<script setup lang="ts">
  import { MenuListType } from '@/types/menu'

  const route = useRoute()

  const props = defineProps({
    list: {
      type: [Array] as PropType<MenuListType[]>,
      default: () => []
    },
    width: {
      type: Number,
      default: 500
    }
  })

  const routerPath = computed(() => {
    return route.path
  })

  const filteredMenuItems  = computed(() => {
     return props.list.filter((item) => !item.meta.isHide)
   })
</script>

<style lang="scss" scoped>
  // :deep(.el-menu--horizontal > .el-sub-menu.is-active) {
  //   background-color: #eee;
  // }

  :deep(.el-menu--horizontal > .el-sub-menu.is-active .el-sub-menu__title) {
    border: 0 !important;
  }

  .menu-top {
    .el-menu {
      border: none;

      :deep(.el-sub-menu) {
        .el-sub-menu__title {
          padding: 0 20px;
        }
      }

      :deep(.el-menu-item) {
        padding: 0 20px;
      }
    }
  }

  @media only screen and (max-width: $device-notebook) {
    .menu-top {
      .el-menu {
        width: 28vw !important;
      }
    }
  }
</style>
