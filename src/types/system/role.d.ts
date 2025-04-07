import { BaseArrayResult, BaseObjectResult } from '../axios'

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

export type RoleListResult = BaseArrayResult<RoleResult>
export type RoleInfoResult = BaseObjectResult<RoleResult>
