import { NoticeListResult } from '@/types/system/notice'
import request from '@/utils/http'

// 通知
export class NoticeService {
  // 获取通知列表
  static getNoticeList(queryParams: object) {
    return request.get<NoticeListResult>({
      url: '/system/notice/list',
      params: queryParams
    })
  }
}
