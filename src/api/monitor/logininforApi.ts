import request from '@/utils/http'
import { LogininforListPageResult } from '@/types/monitor/logininfor'
import { CodeMsgResult } from '@/types/axios'

// 系统访问
export class LogininforService {
  // 查询系统访问记录列表
  static listLogininfor(query: any) {
    return request.get<LogininforListPageResult>({
      url: '/monitor/logininfor/list',
      params: query
    })
  }

  // 删除系统访问记录
  static deleteLogininfor(infoId: any) {
    return request.del<CodeMsgResult>({
      url: '/monitor/logininfor/' + infoId
    })
  }

  // 解锁用户登录状态
  static unlockLogininfor(userName: any) {
    return request.get<CodeMsgResult>({
      url: '/monitor/logininfor/unlock/' + userName
    })
  }

  // 清空登陆日志
  static cleanLogininfor() {
    return request.del<CodeMsgResult>({
      url: '/monitor/logininfor/clean'
    })
  }

  // 导出系统访问记录列表
  static exportExcel(data: any) {
    return request.post({
      url: 'monitor/logininfor/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data: data
    })
  }
}
