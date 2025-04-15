import request from '@/utils/http'

// 字典类型
export class DictTypeApi {
  // 查询字典类型列表
  static listType(query: any) {
    return request.get({ url: '/system/dict/type/list', params: query })
  }

  // 查询字典类型详细
  static getType(dictId: number) {
    return request.get({ url: `/system/dict/type/${dictId}` })
  }

  // 新增字典类型
  static addType(data: any) {
    return request.post({ url: '/system/dict/type', data })
  }

  // 修改字典类型
  static updateType(data: any) {
    return request.put({ url: '/system/dict/type', data })
  }

  // 删除字典类型
  static delType(dictId: number) {
    return request.del({ url: `/system/dict/type/${dictId}` })
  }

  // 刷新字典缓存
  static refreshCache() {
    return request.del({ url: '/system/dict/type/refreshCache' })
  }

  // 获取字典选择框列表
  static optionselect() {
    return request.get({ url: '/system/dict/type/optionselect' })
  }
}
