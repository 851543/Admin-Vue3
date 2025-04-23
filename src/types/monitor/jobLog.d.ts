import { BaseArrayResult, BaseObjectResult, BasePageResult } from '../axios'

export interface JobLogResult {
  jobLogId: string
  jobName: string
  jobGroup: string
  invokeTarget: string
  jobMessage: string
  status: string
  exceptionInfo: string
  createTime: string
}

export type JobLogListPageResult = BasePageResult<JobLogResult>
export type JobLogListResult = BaseArrayResult<JobLogResult>
export type JobLogInfoResult = BaseObjectResult<JobLogResult>
