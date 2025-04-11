import {
  RoleListResult,
  RoleInfoResult,
  RoleResult,
  roleDeptTreeselectResult,
  UserListResult
} from '@/types/system/role'
import { BasePageResult } from '@/types/axios'
import request from '@/utils/http'

// 角色
export class RoleService {
  // 查询角色列表
  static listRole(query: object) {
    return request.get<BasePageResult<RoleResult>>({
      url: '/system/role/list',
      params: query
    })
  }

  // 查询角色详细
  static getRole(roleId: number) {
    return request.get<RoleInfoResult>({
      url: '/system/role/' + roleId
    })
  }

  // 新增角色
  static addRole(data: object) {
    return request.post<RoleInfoResult>({
      url: '/system/role',
      data: data
    })
  }

  // 修改角色
  static updateRole(data: object) {
    return request.put<RoleInfoResult>({
      url: '/system/role',
      data: data
    })
  }

  // 角色数据权限
  static dataScope(data: object) {
    return request.put<RoleInfoResult>({
      url: '/system/role/dataScope',
      data: data
    })
  }

  // 角色状态修改
  static changeRoleStatus(data: object) {
    return request.put<RoleInfoResult>({
      url: '/system/role/changeStatus',
      data: data
    })
  }

  // 删除角色
  static delRole(roleId: number) {
    return request.del<RoleInfoResult>({
      url: '/system/role/' + roleId
    })
  }

  // 查询角色已授权用户列表
  static allocatedUserList(query: object) {
    return request.get<UserListResult>({
      url: '/system/role/authUser/allocatedList',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      params: query
    })
  }

  // 查询角色未授权用户列表
  static unallocatedUserList(query: object) {
    return request.get<UserListResult>({
      url: '/system/role/authUser/unallocatedList',
      params: query
    })
  }

  // 取消用户授权角色
  static authUserCancel(data: object) {
    return request.put<RoleInfoResult>({
      url: '/system/role/authUser/cancel',
      data: data
    })
  }

  // 批量取消用户授权角色
  static authUserCancelAll(roleId: any, userIds: string) {
    return request.put<RoleInfoResult>({
      url: '/system/role/authUser/cancelAll',
      params: {
        roleId,
        userIds
      }
    })
  }

  // 批量授权用户选择
  static authUserSelectAll(roleId: any, userIds: string) {
    return request.put<RoleInfoResult>({
      url: '/system/role/authUser/selectAll',
      params: {
        roleId,
        userIds
      }
    })
  }

  // 获取角色选择框列表
  static optionselect() {
    return request.get<RoleListResult>({
      url: '/system/role/optionselect'
    })
  }

  // 获取角色部门树列表
  static deptTree(roleId: number) {
    return request.get<roleDeptTreeselectResult>({
      url: '/system/role/deptTree/' + roleId
    })
  }

  // 导出角色
  static exportExcel(data: object) {
    return request.post<RoleInfoResult>({
      url: '/system/role/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data: data
    })
  }
}
