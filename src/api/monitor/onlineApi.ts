import request from '@/utils/http'
import { OnlineListPageResult } from '@/types/monitor/online'
import { CodeMsgResult } from '@/types/axios'

// 在线用户
export class OnlineApi {
  // 查询在线用户列表
  static list(query: any) {
    return request.get<OnlineListPageResult>({
      url: '/monitor/online/list',
      params: query
    })
  }

  // 强退用户
  static forceLogout(tokenId: any) {
    return request.del<CodeMsgResult>({
      url: '/monitor/online/' + tokenId
    })
  }
}
