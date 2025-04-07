import { RoleListResult, RoleInfoResult } from '@/types/system/role'
import request from '@/utils/http'

// 角色服务
export class RoleService {
  // 查询角色列表
  static listRole(query: object) {
    return request.get<RoleListResult>({
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
    return request.get<RoleListResult>({
      url: '/system/role/authUser/allocatedList',
      params: query
    })
  }

  // 查询角色未授权用户列表
  static unallocatedUserList(query: object) {
    return request.get<RoleListResult>({
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
  static authUserCancelAll(roleId: number, userIds: number[]) {
    return request.put<RoleInfoResult>({
      url: '/system/role/authUser/cancelAll',
      params: {
        roleId,
        userIds: userIds.join(',')
      }
    })
  }

  // 授权用户选择
  static authUserSelectAll(roleId: number, userIds: number[]) {
    return request.put<RoleInfoResult>({
      url: '/system/role/authUser/selectAll',
      params: {
        roleId,
        userIds: userIds.join(',')
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
    return request.get<RoleInfoResult>({
      url: '/system/role/deptTree/' + roleId
    })
  }
}
