import { BaseArrayResult, BaseObjectResult, CodeMsgResult, BasePageResult } from '../axios'

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

export interface UserType {
  createBy: string | null
  createTime: string
  updateBy: string | null
  updateTime: string | null
  remark: string | null
  userId: number
  deptId: number
  userName: string
  nickName: string
  email: string
  phonenumber: string
  sex: string | null
  avatar: string | null
  password: string | null
  status: string
  delFlag: string | null
  loginIp: string | null
  loginDate: string | null
  dept: DeptType
  roles: RoleResult[]
  roleIds: number[]
  postIds: number[]
  roleId: number | null
  admin: boolean
}

export interface DeptType {
  createBy: string | null
  createTime: string | null
  updateBy: string | null
  updateTime: string | null
  remark: string | null
  deptId: number
  parentId: number | null
  ancestors: string | null
  deptName: string
  orderNum: number | null
  leader: string | null
  phone: string | null
  email: string | null
  status: string | null
  delFlag: string | null
  parentName: string | null
  children: any[]
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

export type UserListResult = BasePageResult<UserType>
export type RoleListResult = BaseArrayResult<RoleResult>
export type RoleInfoResult = BaseObjectResult<RoleResult>
