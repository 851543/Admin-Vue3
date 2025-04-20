import { BaseArrayResult, BaseObjectResult, BasePageResult } from '../axios'

export interface OperLogResult {
  operId: string
  title: string
  businessType: string
  method: string
  requestMethod: string
  operatorType: string
  operName: string
  deptName: string
  operUrl: string
  operIp: string
  operLocation: string
  operParam: string
  jsonResult: string
  status: string
  errorMsg: string
  operTime: string
  costTime: string
}

export type OperLogListPageResult = BasePageResult<OperLogResult>
export type OperLogListResult = BaseArrayResult<OperLogResult>
export type OperLogInfoResult = BaseObjectResult<OperLogResult>
