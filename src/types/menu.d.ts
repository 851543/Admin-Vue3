export type MenuListType = {
  id: number
  path: string // 路由
  name: string // 组件名
  component?: string // 改为字符串类型，表示组件路径
  meta: {
    title: string // 菜单名称
    icon?: string // 菜单图标
    showBadge?: boolean // 是否显示徽标
    showTextBadge?: string // 是否显示新徽标
    isHide?: boolean // 是否在菜单中隐藏
    isHideTab?: boolean // 是否在标签页中隐藏
    link?: string // 链接
    iframeSrc?: string // iframe 外链地址
    isIframe?: boolean // 是否是 iframe
    keepAlive: boolean // 是否缓存
    authList?: Array // 可操作权限
    isInMainContainer?: boolean // 是否在主容器中
    menuType?: string // M-目录 C-菜单 F-按钮
    sort?: number // 排序
    isEnable?: boolean // 是否启用
    createTime?: string // 创建时间
    status?: string // 状态
  }
  children?: MenuListType[] // 子菜单
}

// export type MenuListType = {
//   id: number
//   path: string // 路由
//   name: string // 组件名
//   component?: string // 改为字符串类型，表示组件路径
//   meta: {
//     title: string // 菜单名称
//     icon?: string // 菜单图标
//     showBadge?: boolean // 是否显示徽标
//     showTextBadge?: string // 是否显示新徽标
//     isHide?: boolean // 是否在菜单中隐藏
//     isHideTab?: boolean // 是否在标签页中隐藏
//     link?: string // 链接
//     isIframe?: boolean // 是否是 iframe
//     keepAlive: boolean // 是否缓存
//     authList?: Array // 可操作权限
//     isInMainContainer?: boolean // 是否在主容器中
//   }
//   children?: MenuListType[] // 子菜单
// }
