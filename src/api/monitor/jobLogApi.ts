import request from '@/utils/http'
import { JobLogListPageResult } from '@/types/monitor/jobLog'
import { CodeMsgResult } from '@/types/axios'

// 调度日志
export class JobLogService {
  // 查询调度日志列表
  static listJobLog(query: any) {
    return request.get<JobLogListPageResult>({
      url: '/monitor/jobLog/list',
      params: query
    })
  }

  // 删除调度日志
  static delJobLog(jobLogId: string) {
    return request.del<CodeMsgResult>({
      url: '/monitor/jobLog/' + jobLogId
    })
  }

  // 清空调度日志
  static cleanJobLog() {
    return request.del<CodeMsgResult>({
      url: '/monitor/jobLog/clean'
    })
  }

  // 导出调度日志
  static exportExcel(data: any) {
    return request.post({
      url: '/monitor/jobLog/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data: data
    })
  }
}
