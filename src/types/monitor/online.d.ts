import { BasePageResult } from '../axios'

export interface OnlineResult {
  tokenId: string
  deptName: string
  userName: string
  ipaddr: string
  loginLocation: string
  browser: string
  os: string
  loginTime: number
}

export type OnlineListPageResult = BasePageResult<OnlineResult>
