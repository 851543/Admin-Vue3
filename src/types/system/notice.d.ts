import { BaseArrayResult, BaseObjectResult } from '../axios'

export interface NoticeResult {
  noticeId: number
  noticeTitle: string
  noticeType: string
  noticeContent: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  remark: string
  status: string
}

export type NoticeListResult = BaseArrayResult<NoticeResult>
export type NoticeInfoResult = BaseObjectResult<NoticeResult>
