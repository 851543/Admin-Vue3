import { BaseArrayResult, BaseObjectResult, DeptResult, BaseResult，CodeMsgResult } from '../axios'

export interface UserResult {
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

export type UserListResult = BaseArrayResult<UserResult>
export type UserInfoResult = BaseObjectResult<UserResult>
