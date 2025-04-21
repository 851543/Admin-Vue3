import { BaseArrayResult, BaseObjectResult, BasePageResult } from '../axios'

export interface DeptResult {
  deptId: string
  parentId: string
  ancestors: string
  deptName: string
  orderNum: string
  leader: string
  phone: string
  email: string
  status: string
  delFlag: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
}

export type DeptListPageResult = BasePageResult<DeptResult>
export type DeptListResult = BaseArrayResult<DeptResult>
export type DeptInfoResult = BaseObjectResult<DeptResult>
