import { RoutesAlias } from './routesAlias'
import { MenuListType } from '@/types/menu'
import { uuid } from '@/utils/utils'

/**
 * 菜单列表、异步路由
 *
 * 支持两种模式:
 * 1. 前端静态配置 - 直接使用本文件中定义的路由配置
 * 2. 后端动态配置 - 后端返回菜单数据，前端解析生成路由
 *
 * 菜单标题（title）:
 * 可以是 i18n 的 key，也可以是字符串，比如：'用户列表'
 */
export const asyncRoutes: MenuListType[] = [
  {
    id: uuid(),
    name: 'Dashboard',
    path: '/dashboard',
    component: RoutesAlias.Home,
    meta: {
      title: 'menus.dashboard.title',
      icon: '&#xe721;',
      keepAlive: false
    },
    children: [
      {
        id: uuid(),
        path: 'console',
        name: 'Console',
        component: RoutesAlias.Dashboard,
        meta: {
          title: 'menus.dashboard.console',
          keepAlive: true
        }
      },
      {
        id: uuid(),
        path: 'analysis',
        name: 'Analysis',
        component: RoutesAlias.Analysis,
        meta: {
          title: 'menus.dashboard.analysis',
          keepAlive: true
        }
      },
      {
        id: uuid(),
        path: 'ecommerce',
        name: 'Ecommerce',
        component: RoutesAlias.Ecommerce,
        meta: {
          title: 'menus.dashboard.ecommerce',
          keepAlive: true,
          showTextBadge: 'new'
        }
      }
    ]
  },
  {
    id: uuid(),
    path: '/tool/gen-edit',
    name: 'GenEdit',
    component: RoutesAlias.Home,
    meta: {
      title: '修改生成配置',
      keepAlive: false,
      isHide: true
    },
    children: [
      {
        id: uuid(),
        path: 'index/:tableId(\\d+)',
        component: RoutesAlias.GenEdit,
        name: 'GenEditIndex',
        meta: { title: '修改生成配置', keepAlive: false }
      }
    ]
  },
  {
    id: uuid(),
    path: '/system/dict-data',
    name: 'DictData',
    component: RoutesAlias.Home,
    meta: {
      title: '字典数据',
      keepAlive: false,
      isHide: true
    },
    children: [
      {
        id: uuid(),
        path: 'index/:dictId(\\d+)',
        component: RoutesAlias.DictData,
        name: 'DictDataIndex',
        meta: { title: '字典数据', keepAlive: false }
      }
    ]
  },
  {
    id: uuid(),
    path: '/system/user-auth',
    name: 'UserAuth',
    component: RoutesAlias.Home,
    meta: {
      title: '分配角色',
      keepAlive: false,
      isHide: true
    },
    children: [
      {
        id: uuid(),
        path: 'role/:userId(\\d+)',
        component: RoutesAlias.AuthRole,
        name: 'AuthRole',
        meta: { title: '分配角色', keepAlive: false }
      }
    ]
  }
]
