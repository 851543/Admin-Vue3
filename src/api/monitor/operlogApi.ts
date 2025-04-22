import request from '@/utils/http'
import { OperLogListPageResult } from '@/types/monitor/operlog'
import { CodeMsgResult } from '@/types/axios'

// 操作日志
export class OperLogService {
  // 查询操作日志记录列表
  static listOperlog(query: any) {
    return request.get<OperLogListPageResult>({
      url: '/monitor/operlog/list',
      params: query
    })
  }

  // 删除操作日志记录
  static deleteOperlog(operId: any) {
    return request.del<CodeMsgResult>({
      url: '/monitor/operlog/' + operId
    })
  }

  // 清空操作日志记录
  static cleanOperlog() {
    return request.del<CodeMsgResult>({
      url: '/monitor/operlog/clean'
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
