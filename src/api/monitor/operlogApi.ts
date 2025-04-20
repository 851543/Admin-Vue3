import request from '@/utils/http'
import { OperLogInfoResult, OperLogListPageResult } from '@/types/monitor/operlog'
import { CodeMsgResult } from '@/types/axios'

// 操作日志记录
export class OperLogService {
  // 查询操作日志记录列表
  static listOperlog(query: any) {
    return request.get<OperLogListPageResult>({
      url: '/monitor/operlog/list',
      params: query
    })
  }

  // 查询操作日志记录详细
  static getOperlog(operId: any) {
    return request.get<OperLogInfoResult>({
      url: '/monitor/operlog/' + operId
    })
  }

  // 新增操作日志记录
  static addOperlog(data: any) {
    return request.post<CodeMsgResult>({
      url: '/monitor/operlog',
      data: data
    })
  }

  // 修改操作日志记录
  static updateOperlog(data: any) {
    return request.put<CodeMsgResult>({
      url: '/monitor/operlog',
      data: data
    })
  }

  // 删除操作日志记录
  static deleteOperlog(operId: any) {
    return request.del<CodeMsgResult>({
      url: '/monitor/operlog/' + operId
    })
  }

  // 导出操作日志记录列表
  static exportExcel(data: any) {
    return request.post({
      url: 'monitor/operlog/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data: data
    })
  }
}
