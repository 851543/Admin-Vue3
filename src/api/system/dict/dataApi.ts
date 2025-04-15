import request from '@/utils/http'

// 字典数据
export class DictDataApi {
  // 查询字典数据列表
  static listData(query: any) {
    return request.get({ url: '/system/dict/data/list', params: query })
  }

  // 查询字典数据详细
  static getData(dictCode: number) {
    return request.get({ url: `/system/dict/data/${dictCode}` })
  }

  // 根据字典类型查询字典数据信息
  static getDicts(dictType: string) {
    return request.get({ url: `/system/dict/data/type/${dictType}` })
  }

  // 新增字典数据
  static addData(data: any) {
    return request.post({ url: '/system/dict/data', data })
  }

  // 修改字典数据
  static updateData(data: any) {
    return request.put({ url: '/system/dict/data', data })
  }

  // 删除字典数据
  static delData(dictCode: number) {
    return request.del({ url: `/system/dict/data/${dictCode}` })
  }
}
