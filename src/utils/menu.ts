import { $t } from '@/language'
import { MenuListType } from '@/types/menu'
import { MenuResult } from '@/types/system/menu'
import { RoutesAlias } from '@/router/modules/routesAlias'

// 创建递归函数处理嵌套路由
/**
 * 处理路由配置,转换为菜单数据结构
 * @param route 路由配置对象
 * @param parentPath 父级路径
 * @returns 处理后的菜单项
 */
export const processRoute = (route: MenuListType, parentPath = ''): MenuListType => {
  if (route.path.startsWith('http')) {
    route.path = ''
    route.component = RoutesAlias.Home
  }

  // 构建完整路径
  const currentPath = route.path
    ? route.meta?.isIframe
      ? route.path // isIframe 为 true 时直接使用原始路径
      : parentPath
        ? `${parentPath}/${route.path}`.replace(/\/+/g, '/') // 规范化路径,避免多余的斜杠
        : route.path
    : ''

  return {
    id: route.id ?? Math.random(), // 使用空值合并运算符
    name: route.name,
    path: currentPath,
    component: processComponent(route.component as string),
    meta: route.meta ?? {}, // 使用空值合并运算符
    children: Array.isArray(route.children)
      ? route.children.map((child) => processRoute(child, currentPath))
      : []
  }
}

/**
 *
 */
export const processComponent = (component: string): string => {
  // 如果组件为Layout则返回index组件
  if (component === 'Layout' || component === 'Index') {
    return RoutesAlias.Home
  }
  // 如果组件为空或以斜杠开头，则直接返回
  return component !== '' && !component?.startsWith('/') ? '/' + component : component
}

/**
 * 处理菜单数据，转换为前端所需的树形结构
 * @param menuList 原始菜单列表
 * @returns 处理后的菜单树
 * @throws {Error} 当输入数据格式不正确时抛出错误
 */
export const processMenu = (menuList: MenuResult[]): MenuListType[] => {
  if (!Array.isArray(menuList)) {
    throw new Error('菜单列表必须是数组类型')
  }
  // 使用 reduce 优化父子关系映射构建
  const { menuMap, rootMenus } = menuList.reduce<{
    menuMap: Map<number, MenuResult[]>
    rootMenus: MenuResult[]
  }>(
    (acc, menu) => {
      const { menuMap, rootMenus } = acc
      const parentId = menu.parentId

      // 先将所有菜单项添加到 Map 中
      if (!menuMap.has(menu.menuId)) {
        menuMap.set(menu.menuId, [])
      }

      // 如果有父级菜单，将当前菜单添加到父级的子菜单列表中
      if (menuList.some((item) => item.menuId === parentId)) {
        const children = menuMap.get(parentId) || []
        menuMap.set(parentId, [...children, menu])
      } else {
        // 如果找不到父级菜单，则作为根菜单
        rootMenus.push(menu)
      }

      return acc
    },
    { menuMap: new Map(), rootMenus: [] }
  )

  // 提取路径构建逻辑到独立函数
  const buildPath = (route: MenuResult, parentPath: string): string => {
    if (!route.path) return ''
    if (route.isFrame === '1') return route.path
    if (!parentPath) return route.path
    return `${parentPath}/${route.path}`.replace(/\/+/g, '/')
  }

  // 提取元数据构建逻辑到独立函数
  const buildMetaData = (route: MenuResult): MenuListType['meta'] => ({
    title: route.menuName,
    icon: route.icon,
    isIframe: route.isFrame === '1',
    keepAlive: route.isCache === '0',
    isHide: route.visible === '1',
    isHideTab: route.visible === '1',
    showBadge: false,
    showTextBadge: undefined,
    link: route.isFrame === '1' ? route.path : undefined,
    iframeSrc: route.isFrame === '1' ? route.path : undefined,
    authList: route.perms
      ? [
          {
            id: route.menuId,
            title: route.menuName,
            auth_mark: route.perms
          }
        ]
      : [],
    isInMainContainer: route.menuType === 'C',
    menuType: route.menuType,
    sort: route.orderNum,
    isEnable: route.status === '0',
    createTime: route.createTime,
    status: route.status
  })

  // 递归处理菜单树
  const processMenuItems = (items: MenuResult[], parentPath: string = ''): MenuListType[] => {
    return items.map((route): MenuListType => {
      const currentPath = buildPath(route, parentPath)
      const children = menuMap.get(route.menuId) || []

      return {
        id: route.menuId,
        name: route.routeName || route.menuName,
        path: currentPath,
        component: route.component,
        meta: buildMetaData(route),
        children: children.length > 0 ? processMenuItems(children, currentPath) : []
      }
    })
  }

  return processMenuItems(rootMenus)
}

/**
 * 保存 iframe 路由到 sessionStorage 中
 * @param list iframe 路由列表
 */
export const saveIframeRoutes = (list: MenuListType[]): void => {
  if (list.length > 0) {
    sessionStorage.setItem('iframeRoutes', JSON.stringify(list))
  }
}

// 获取 iframe 路由
export const getIframeRoutes = (): MenuListType[] => {
  return JSON.parse(sessionStorage.getItem('iframeRoutes') || '[]')
}

/**
 * 格式化菜单标题
 * @param title 菜单标题，可以是 i18n 的 key，也可以是字符串，比如：'用户列表'
 * @returns 格式化后的菜单标题
 */
export const formatMenuTitle = (title: string): string => {
  return title.startsWith('menus.') ? $t(title) : title
}
