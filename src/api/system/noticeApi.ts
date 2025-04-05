import { BasePageResult, NoticeResult } from '@/types/axios'
import request from '@/utils/http'
// 公告
export class NoticeService {
  // 获取通知公告列表
  static getNoticeList(params: any) {
    return request.get<BasePageResult<NoticeResult>>({ url: '/system/notice/list', params })
  }
}
