import request from '@/utils/http'
import { GenTableModel, GenTableDbPageList } from '@/types/tool/generator'
import { BaseResult } from '@/types/axios'

// 代码生成
export class GeneratorApi {
  /**
   * 查询代码生成列表
   */
  static genList(data: any) {
    return request.get<GenTableDbPageList>({ url: '/tool/gen/list', params: data })
  }

  /**
   * 查询数据库列表
   */
  static dbList(data: any) {
    return request.get<GenTableDbPageList>({ url: '/tool/gen/db/list', params: data })
  }

  /**
   * 查询数据表字段列表
   */
  static columnList(tableId: number) {
    return request.get({ url: `/tool/gen/column/${tableId}` })
  }

  // 查询表详细信息
  static getGenTable(tableId: number) {
    return request.get({ url: `/tool/gen/${tableId}` })
  }

  // 修改代码生成信息
  static updateGenTable(data: any) {
    return request.put({ url: '/tool/gen', data })
  }

  /**
   * 导入表结构（保存）
   */
  static importTable(tables: string) {
    return request.post({ url: '/tool/gen/importTable', data: { tables } })
  }

  /**
   * 创建表结构（保存）
   */
  static createTable(data: any) {
    return request.post<BaseResult>({
      url: '/tool/gen/createTable',
      params: data
    })
  }

  /**
   * 修改保存代码生成业务
   */
  static editSave(data: GenTableModel) {
    return request.put({ url: '/tool/gen', data })
  }

  /**
   * 删除代码生成
   */
  static remove(tableIds: number[]) {
    return request.del({ url: `/tool/gen/${tableIds}` })
  }

  /**
   * 预览代码
   */
  static preview(tableId: number) {
    return request.get({ url: `/tool/gen/preview/${tableId}` })
  }

  /**
   * 生成代码（下载方式）
   */
  static download(tableName: string) {
    return request.get({ url: `/tool/gen/download/${tableName}`, responseType: 'blob' })
  }

  /**
   * 生成代码（自定义路径）
   */
  static genCode(tableName: string) {
    return request.get({ url: `/tool/gen/genCode/${tableName}` })
  }

  /**
   * 同步数据库
   */
  static synchDb(tableName: string) {
    return request.get({ url: `/tool/gen/synchDb/${tableName}` })
  }

  /**
   * 批量生成代码
   */
  static batchGenCode(tables: string) {
    return request.get({ url: '/tool/gen/batchGenCode', params: { tables }, responseType: 'blob' })
  }
}
