import { BaseArrayResult, BaseObjectResult, CodeMsgResult } from '../axios'

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

export interface roleMenuTreeselectResult extends CodeMsgResult {
  menus: MenuOptionType[]
  checkedKeys: number[]
}

export interface MenuOptionType {
  id: number
  label: string
  children?: MenuOptionType[]
}

export type MenuOptionListResult = BaseArrayResult<MenuOptionType>
export type MenuListResult = BaseArrayResult<MenuResult>
export type MenuInfoResult = BaseObjectResult<MenuResult>
