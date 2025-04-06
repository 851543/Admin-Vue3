import { MenuResult, BaseArrayResult, BaseObjectResult } from '@/types/menu'
import request from '@/utils/http'
// 菜单
export class MenuService {
  // 获取菜单列表
  static getMenuList(queryParams: object) {
    return request.get<BaseArrayResult<MenuResult>>({
      url: '/system/menu/list',
      params: queryParams
    })
  }

  // 根据菜单编号获取详细信息
  static getMenuInfo(menuId: number) {
    return request.get<BaseObjectResult<MenuResult>>({
      url: `/system/menu/${menuId}`
    })
  }

  // 获取菜单下拉树列表
  static getMenuTreeSelect(queryParams: object) {
    return request.get<BaseArrayResult<MenuResult>>({
      url: '/system/menu/treeselect',
      params: queryParams
    })
  }

  // 加载对应角色菜单列表树
  static getRoleMenuTreeSelect(roleId: number) {
    return request.get<BaseArrayResult<MenuResult>>({
      url: `/system/menu/roleMenuTreeselect/${roleId}`
    })
  }

  // 新增菜单
  static addMenu(data: object) {
    return request.post<BaseObjectResult<any>>({
      url: '/system/menu',
      data: data
    })
  }

  // 修改菜单
  static updateMenu(data: object) {
    return request.put<BaseObjectResult<any>>({
      url: '/system/menu',
      headers: {
        'Content-Type': 'application/json'
      },
      data: data
    })
  }

  // 删除菜单
  static deleteMenu(menuId: number) {
    return request.del<BaseObjectResult<any>>({
      url: `/system/menu/${menuId}`
    })
  }
}
