import { BaseArrayResult, BaseObjectResult } from '../axios'

export interface MenuResult {
  createBy: string | null
  createTime: string
  updateBy: string | null
  updateTime: string | null
  remark: string | null
  menuId: number
  menuName: string
  parentName: string | null
  parentId: number
  orderNum: number
  path: string
  component: string
  query: string
  routeName: string
  isFrame: string
  isCache: string
  menuType: string
  visible: string
  status: string
  perms: string
  icon: string
  children: MenuResult[]
}

export type MenuListResult = BaseArrayResult<MenuResult>
export type MenuInfoResult = BaseObjectResult<MenuResult>

export interface MenuOptionType {
  menuId: number
  menuName: string
  children?: MenuOptionType[]
}
