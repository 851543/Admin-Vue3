import { BaseArrayResult, DeptResult, BaseResult, CodeMsgResult, BaseObjectResult } from '../axios'

export interface LoginUserResult {
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  remark: string
  params: {
    '@type': 'java.util.HashMap'
  }
  userId: number
  deptId: number
  userName: string
  nickName: string
  email: string
  phonenumber: string
  sex: string
  avatar: string
  password: string
  status: string
  delFlag: string
  loginIp: string
  loginDate: string
  dept: DeptResult
  roles: []
  roleIds: []
  postIds: []
  roleId: number
  admin: boolean
}

// 个人信息返回数据结构
export interface ProfileResult extends BaseResult {
  postGroup: string
  roleGroup: string
}

// 修改头像返回数据结构
export interface EditProfileAvatarResult extends CodeMsgResult {
  imgUrl: string
}

export interface UserResult {
  userId: string
  deptId: string
  userName: string
  nickName: string
  userType: string
  email: string
  phonenumber: string
  sex: string
  avatar: string
  password: string
  status: string
  delFlag: string
  loginIp: string
  loginDate: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  remark: string
}

export type UserListPageResult = BasePageResult<UserResult>
export type UserListResult = BaseArrayResult<UserResult>

export interface DeptOptionType {
  id: number
  label: string
  children?: DeptOptionType[]
}

export type DeptOptionListResult = BaseArrayResult<DeptOptionType>

export interface RoleType {
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
  createBy: string
  createTime: string
  updateBy: string
  admin: boolean
  remark: string
  updateTime: string
}

export interface PostType {
  postId: number
  postCode: string
  postName: string
  postSort: number
  status: string
  flag: boolean
  createBy: string
  createTime: string
  updateBy: string
  remark: string
  updateTime: string
}

export interface UserInfoResult extends BaseObjectResult<LoginUserResult> {
  roles: RoleType[]
  posts: PostType[]
  postIds: number[]
  roleIds: number[]
}

export interface AuthRolesResult extends CodeMsgResult {
  roles: RoleType[]
  user: LoginUserResult
}
