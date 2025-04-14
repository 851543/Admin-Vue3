import { GenTableColumn } from './system/genTableColumn'
import { GenTable } from './system/genTable'
import { BaseArrayResult } from '../axios'
/** 代码生成业务字段 */
export interface GenTableModel {
  /** 编号 */
  tableId: number

  /** 表名称 */
  tableName: string

  /** 表描述 */
  tableComment: string

  /** 关联父表的表名 */
  subTableName?: string

  /** 本表关联父表的外键名 */
  subTableFkName?: string

  /** 实体类名称(首字母大写) */
  className: string

  /** 使用的模板（crud单表操作 tree树表操作 sub主子表操作） */
  tplCategory?: string

  /** 前端类型（element-ui模版 element-plus模版） */
  tplWebType?: string

  /** 生成包路径 */
  packageName: string

  /** 生成模块名 */
  moduleName: string

  /** 生成业务名 */
  businessName: string

  /** 生成功能名 */
  functionName: string

  /** 生成作者 */
  functionAuthor: string

  /** 生成代码方式（0zip压缩包 1自定义路径） */
  genType?: string

  /** 生成路径（不填默认项目路径） */
  genPath?: string

  /** 主键信息 */
  pkColumn?: GenTableColumn

  /** 子表信息 */
  subTable?: GenTable

  /** 表列信息 */
  columns: GenTableColumn[]

  /** 其它生成选项 */
  options?: string

  /** 树编码字段 */
  treeCode?: string

  /** 树父编码字段 */
  treeParentCode?: string

  /** 树名称字段 */
  treeName?: string

  /** 上级菜单ID字段 */
  parentMenuId?: number

  /** 上级菜单名称字段 */
  parentMenuName?: string
}

export type GenTableModelList = BaseArrayResult<GenTableModel>
export type GenTableDbPageList = BasePageResult<GenTableDb>
