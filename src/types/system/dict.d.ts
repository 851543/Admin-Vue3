import { BaseArrayResult, BaseObjectResult, BasePageResult } from '../axios'

export interface DictDataResult {
  dictCode: string
  dictSort: string
  dictLabel: string
  dictValue: string
  dictType: string
  cssClass: string
  listClass: string
  isDefault: string
  status: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  remark: string
}

export type DictDataListPageResult = BasePageResult<DictDataResult>
export type DictDataListResult = BaseArrayResult<DictDataResult>
export type DictDataInfoResult = BaseObjectResult<DictDataResult>

import { BaseArrayResult, BaseObjectResult, BasePageResult } from '../axios'

export interface DictTypeResult {
  dictId: string
  dictName: string
  dictType: string
  status: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  remark: string
}

export type DictTypeListPageResult = BasePageResult<DictTypeResult>
export type DictTypeListResult = BaseArrayResult<DictTypeResult>
export type DictTypeInfoResult = BaseObjectResult<DictTypeResult>
