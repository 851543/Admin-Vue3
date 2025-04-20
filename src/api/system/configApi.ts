import request from '@/utils/http'
import { SysConfigInfoResult, SysConfigListPageResult } from '@/types/system/config'
import { CodeMsgResult } from '@/types/axios'

// 参数配置
export class SysConfigService {
  // 查询参数配置列表
  static listConfig(query: any) {
    return request.get<SysConfigListPageResult>({
      url: '/system/config/list',
      params: query
    })
  }

  // 查询参数配置详细
  static getConfig(configId: any) {
    return request.get<SysConfigInfoResult>({
      url: '/system/config/' + configId
    })
  }

  // 新增参数配置
  static addConfig(data: any) {
    return request.post<CodeMsgResult>({
      url: '/system/config',
      data: data
    })
  }

  // 修改参数配置
  static updateConfig(data: any) {
    return request.put<CodeMsgResult>({
      url: '/system/config',
      data: data
    })
  }

  // 删除参数配置
  static deleteConfig(configId: any) {
    return request.del<CodeMsgResult>({
      url: '/system/config/' + configId
    })
  }

  // 导出参数配置列表
  static exportExcel(data: any) {
    return request.post({
      url: 'system/config/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data: data
    })
  }

  // 刷新参数缓存
  static refreshCache() {
    return request.del<CodeMsgResult>({
      url: '/system/config/refreshCache'
    })
  }
}
