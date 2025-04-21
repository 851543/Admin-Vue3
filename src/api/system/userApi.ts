import {
  EditProfileAvatarResult,
  ProfileResult,
  UserInfoResult,
  UserListPageResult,
  DeptOptionListResult,
  AuthRolesResult
} from '@/types/system/user'
import { BaseResult, CodeMsgResult } from '@/types/axios'
import request from '@/utils/http'
import { parseStrEmpty } from '@/utils/utils'

// 用户
export class UserService {
  // 查询用户信息列表
  static listUser(query: any) {
    return request.get<UserListPageResult>({
      url: '/system/user/list',
      params: query
    })
  }

  // 查询用户信息详细
  static getUser(userId: any) {
    return request.get<UserInfoResult>({
      url: '/system/user/' + parseStrEmpty(userId)
    })
  }

  // 新增用户信息
  static addUser(data: any) {
    return request.post<CodeMsgResult>({
      url: '/system/user',
      data: data
    })
  }

  // 修改用户信息
  static updateUser(data: any) {
    return request.put<CodeMsgResult>({
      url: '/system/user',
      data: data
    })
  }

  // 删除用户信息
  static deleteUser(userId: any) {
    return request.del<CodeMsgResult>({
      url: '/system/user/' + userId
    })
  }

  // 用户状态修改
  static changeUserStatus(data: any) {
    return request.put<CodeMsgResult>({
      url: '/system/user/changeStatus',
      data: data
    })
  }

  // 重置用户密码
  static resetUserPwd(data: any) {
    return request.put<CodeMsgResult>({
      url: '/system/user/resetPwd',
      data: data
    })
  }

  // 导出用户信息列表
  static exportExcel(data: any) {
    return request.post({
      url: 'system/user/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data: data
    })
  }

  // 修改用户信息
  static editUserInfo(data: object) {
    return request.put<BaseResult>({
      url: '/system/user',
      data
    })
  }

  // 获取个人信息
  static getProfile() {
    return request.get<ProfileResult>({
      url: '/system/user/profile'
    })
  }

  // 修改个人信息
  static editProfile(data: object) {
    return request.put<BaseResult>({
      url: '/system/user/profile',
      data
    })
  }

  // 修改个人信息密码
  static editProfilePwd(data: object) {
    return request.put<BaseResult>({
      url: '/system/user/profile/updatePwd',
      data
    })
  }

  // 修改个人信息头像
  static editProfileAvatar(data: object) {
    return request.post<EditProfileAvatarResult>({
      url: '/system/user/profile/avatar',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data
    })
  }

  // 查询授权角色
  static getAuthRole(userId: any) {
    return request.get<AuthRolesResult>({
      url: '/system/user/authRole/' + userId
    })
  }

  // 保存授权角色
  static updateAuthRole(data: any) {
    return request.put<CodeMsgResult>({
      url: '/system/user/authRole',
      params: data
    })
  }

  // 查询部门下拉树结构
  static deptTreeSelect() {
    return request.get<DeptOptionListResult>({
      url: '/system/user/deptTree'
    })
  }

  // 下载Excel模板
  static importTemplate() {
    return request.post({
      url: '/system/user/importTemplate',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'blob'
    })
  }
}
