import { $t } from '@/language'
import { MenuListType, MenuBackendType } from '@/types/menu'
import { RoutesAlias } from '@/router/modules/routesAlias'
import { uuid } from '@/utils/utils'

// 创建递归函数处理嵌套路由
/**
 * 处理路由配置,转换为菜单数据结构
 * @param route 路由配置对象
 * @param parentPath 父级路径
 * @returns 处理后的菜单项
 */
export const processRoute = (route: MenuListType, parentPath = ''): MenuListType => {
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
    component: route.component,
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
  if (!title) {
    return ''
  }
  return title.startsWith('menus.') ? $t(title) : title
}

/**
 * 处理后端返回的菜单数据
 * @param menuList 后端返回的菜单数据
 * @returns 处理后的菜单数据
 */
export const processBackendMenu = (route: MenuBackendType, parentPath = ''): MenuListType => {
  // 直接菜单
  if (!route.name && !route.meta && route.children && route.children.length > 0) {
    return handleDirectMenu(route.children[0])
  }
  if (route.component.includes('ParentView')) {
    route.component = ''
  }
  route = backendMenuUtils(route)
  // 构建完整路径
  const currentPath = route.path
    ? route.meta?.isIframe
      ? route.path // backendMenuIsIframe 为 true 时直接使用原始路径
      : parentPath
        ? `${parentPath}/${route.path}`.replace(/\/+/g, '/') // 规范化路径,避免多余的斜杠
        : route.path
    : ''
  return {
    id: uuid(),
    name: route.name,
    path: currentPath,
    component: processComponent(route.component),
    meta: {
      title: formatMenuTitle(route.meta?.title),
      icon: route.meta?.icon,
      link: route.meta?.link,
      isHide: route.hidden,
      isIframe: route.meta?.isIframe,
      keepAlive: route.meta?.noCache
    },
    children: Array.isArray(route.children)
      ? route.children.map((child) => processBackendMenu(child, currentPath))
      : []
  }
}

export const backendMenuUtils = (route: MenuBackendType) => {
  if (route.name && !route.name.includes('Http')) {
    return route
  }
  if (route.name && route.name.includes('Http')) {
    route.path = ''
  }
  if (
    route.component.includes('InnerLink') &&
    (route.name.includes('localhost') || route.name.includes('127.0.0.1'))
  ) {
    route.component = RoutesAlias.OutsideIframe
    route.meta.link = import.meta.env.VITE_API_BASE_URL + '/' + extractUrlPath(route.name, true)
    route.path = `/outside/iframe/${extractUrlPath(route.name)}`
    route.name = extractUrlPath(route.name)
    route.meta.isIframe = true
  }
  return route
}

/**
 * 从URL中提取路径部分，支持HTTP和HTTPS
 * @param url URL字符串
 * @param path 是否返回完整路径，默认false只返回第一段
 * @returns 提取的路径部分
 */
export const extractUrlPath = (url: string, path = false): string => {
  // 首先获取端口号
  const portRegex = /(?:https?:\/\/)?[^:/\s]+:([0-9]+)/
  const portMatch = url.match(portRegex)
  const port = portMatch ? portMatch[1] : '8080'

  // 使用端口号提取路径部分
  let regexAfter = `(?<=:${port}/)`
  regexAfter = path ? regexAfter + '(.*)' : regexAfter + '([^/]+)'
  const match = url.match(new RegExp(regexAfter))
  return match ? match[0] : ''
}

/**
 * 处理直接菜单的情况
 * @param route 没有name和meta但有children的路由
 * @returns 处理后的菜单项
 */
const handleDirectMenu = (firstChild: MenuBackendType): MenuListType => {
  if (!firstChild.path.includes('/')) {
    firstChild.path = '/' + firstChild.path
  }
  return {
    id: uuid(),
    name: firstChild.name,
    path: firstChild.path,
    component: firstChild.component,
    meta: {
      title: formatMenuTitle(firstChild.meta?.title),
      icon: firstChild.meta?.icon,
      link: firstChild.meta?.link,
      isHide: firstChild.hidden,
      isIframe: firstChild.meta?.isIframe,
      keepAlive: firstChild.meta?.noCache,
      isInMainContainer: true
    }
  }
}
