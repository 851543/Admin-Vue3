import { BaseArrayResult, BaseObjectResult, BasePageResult } from '../axios'

export interface ConfigResult {
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

export type ConfigListPageResult = BasePageResult<ConfigResult>
export type ConfigListResult = BaseArrayResult<ConfigResult>
export type ConfigInfoResult = BaseObjectResult<ConfigResult>
