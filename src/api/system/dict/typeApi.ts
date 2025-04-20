import request from '@/utils/http'
import { DictTypeInfoResult, DictTypeListPageResult } from '@/types/system/dict'
import { CodeMsgResult } from '@/types/axios'

// 字典类型
export class DictTypeService {
  // 查询字典类型列表
  static listType(query: any) {
    return request.get<DictTypeListPageResult>({
      url: '/system/dict/type/list',
      params: query
    })
  }

  // 查询字典类型详细
  static getType(dictId: any) {
    return request.get<DictTypeInfoResult>({
      url: '/system/dict/type/' + dictId
    })
  }

  // 新增字典类型
  static addType(data: any) {
    return request.post<CodeMsgResult>({
      url: '/system/dict/type',
      data: data
    })
  }

  // 修改字典类型
  static updateType(data: any) {
    return request.put<CodeMsgResult>({
      url: '/system/dict/type',
      data: data
    })
  }

  // 删除字典类型
  static deleteType(dictId: any) {
    return request.del<CodeMsgResult>({
      url: '/system/dict/type/' + dictId
    })
  }

  // 导出字典类型列表
  static exportExcel(data: any) {
    return request.post({
      url: 'system/dict/type/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data: data
    })
  }

  // 获取字典选择框列表
  static optionSelect() {
    return request.get<DictTypeInfoResult[]>({
      url: '/system/dict/type/optionselect'
    })
  }

  // 刷新字典缓存
  static refreshCache() {
    return request.del<CodeMsgResult>({
      url: '/system/dict/type/refreshCache'
    })
  }
}
