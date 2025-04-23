import request from '@/utils/http'
import { JobListPageResult, JobInfoResult } from '@/types/monitor/job'
import { CodeMsgResult } from '@/types/axios'

// 调度任务
export class JobService {
  // 查询定时任务调度列表
  static listJob(query: any) {
    return request.get<JobListPageResult>({
      url: '/monitor/job/list',
      params: query
    })
  }

  // 查询定时任务调度详细
  static getJob(jobId: string) {
    return request.get<JobInfoResult>({
      url: '/monitor/job/' + jobId
    })
  }

  // 新增定时任务调度
  static addJob(data: any) {
    return request.post<CodeMsgResult>({
      url: '/monitor/job',
      data
    })
  }

  // 修改定时任务调度
  static updateJob(data: any) {
    return request.put<CodeMsgResult>({
      url: '/monitor/job',
      data
    })
  }

  // 删除定时任务调度
  static deleteJob(jobId: string) {
    return request.del<CodeMsgResult>({
      url: '/monitor/job/' + jobId
    })
  }

  // 任务状态修改
  static changeJobStatus(jobId: string, status: string) {
    const data = {
      jobId,
      status
    }
    return request.put<CodeMsgResult>({
      url: '/monitor/job/changeStatus',
      data
    })
  }

  // 定时任务立即执行一次
  static runJob(jobId: string, jobGroup: string) {
    const data = {
      jobId,
      jobGroup
    }
    return request.put<CodeMsgResult>({
      url: '/monitor/job/run',
      data
    })
  }

  // 导出定时任务调度
  static exportExcel(data: any) {
    return request.post({
      url: '/monitor/job/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data: data
    })
  }
}
