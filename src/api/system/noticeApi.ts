import request from '@/utils/http'
import { NoticeInfoResult, NoticeListPageResult } from '@/types/system/notice'
import { CodeMsgResult } from '@/types/axios'

// 通知公告
export class NoticeService {
  // 查询通知公告列表
  static listNotice(query: any) {
    return request.get<NoticeListPageResult>({
      url: '/system/notice/list',
      params: query
    })
  }

  // 查询通知公告详细
  static getNotice(noticeId: any) {
    return request.get<NoticeInfoResult>({
      url: '/system/notice/' + noticeId
    })
  }

  // 新增通知公告
  static addNotice(data: any) {
    return request.post<CodeMsgResult>({
      url: '/system/notice',
      data: data
    })
  }

  // 修改通知公告
  static updateNotice(data: any) {
    return request.put<CodeMsgResult>({
      url: '/system/notice',
      data: data
    })
  }

  // 删除通知公告
  static deleteNotice(noticeId: any) {
    return request.del<CodeMsgResult>({
      url: '/system/notice/' + noticeId
    })
  }

  // 导出通知公告列表
  static exportExcel(data: any) {
    return request.post({
      url: 'system/notice/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data: data
    })
  }
}
