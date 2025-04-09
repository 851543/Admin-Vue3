import {
  MenuListResult,
  MenuInfoResult,
  roleMenuTreeselectResult,
  MenuOptionListResult
} from '@/types/system/menu'
import request from '@/utils/http'
// 菜单
export class MenuService {
  // 获取菜单列表
  static getMenuList(queryParams: object) {
    return request.get<MenuListResult>({
      url: '/system/menu/list',
      params: queryParams
    })
  }

  // 根据菜单编号获取详细信息
  static getMenuInfo(menuId: number) {
    return request.get<MenuInfoResult>({
      url: `/system/menu/${menuId}`
    })
  }

  // 获取菜单下拉树列表
  static getMenuTreeSelect(queryParams: object) {
    return request.get<MenuOptionListResult>({
      url: '/system/menu/treeselect',
      params: queryParams
    })
  }

  // 加载对应角色菜单列表树
  static getRoleMenuTreeSelect(roleId: number) {
    return request.get<roleMenuTreeselectResult>({
      url: `/system/menu/roleMenuTreeselect/${roleId}`
    })
  }

  // 新增菜单
  static addMenu(data: object) {
    return request.post<MenuInfoResult>({
      url: '/system/menu',
      data: data
    })
  }

  // 修改菜单
  static updateMenu(data: object) {
    return request.put<MenuInfoResult>({
      url: '/system/menu',
      data: data
    })
  }

  // 删除菜单
  static deleteMenu(menuId: number) {
    return request.del<MenuInfoResult>({
      url: `/system/menu/${menuId}`
    })
  }
}
