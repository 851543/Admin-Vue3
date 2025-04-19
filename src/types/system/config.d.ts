import { BaseArrayResult, BaseObjectResult, BasePageResult } from '../axios'

export interface SysConfigResult {
  configId: string
  configName: string
  configKey: string
  configValue: string
  configType: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  remark: string
}

export type SysConfigListPageResult = BasePageResult<SysConfigResult>
export type SysConfigListResult = BaseArrayResult<SysConfigResult>
export type SysConfigInfoResult = BaseObjectResult<SysConfigResult>
