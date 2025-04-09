import { BaseArrayResult, BaseObjectResult, CodeMsgResult } from '../axios'

export interface RoleResult {
  createBy: string | null
  createTime: string
  updateBy: string | null
  updateTime: string | null
  remark: string | null
  roleId: number
  roleName: string
  roleKey: string
  roleSort: number
  dataScope: string
  menuCheckStrictly: boolean
  deptCheckStrictly: boolean
  status: string
  delFlag: string
  flag: boolean
  menuIds: number[]
  deptIds: number[]
  permissions: string[]
  admin: boolean
}

export interface roleDeptTreeselectResult extends CodeMsgResult {
  depts: RoleOptionType[]
  checkedKeys: number[]
}

export interface RoleOptionType {
  id: number
  label: string
  children?: RoleOptionType[]
}

export type RoleListResult = BaseArrayResult<RoleResult>
export type RoleInfoResult = BaseObjectResult<RoleResult>
