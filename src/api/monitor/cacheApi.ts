import request from '@/utils/http'
import { CacheInfoResult, CacheNameListResult, CacheNameInfoResult } from '@/types/monitor/cache'
import { CodeMsgResult, BaseArrayResult } from '@/types/axios'

// cache缓存
export class CacheApi {
  // 查询缓存
  static getCache() {
    return request.get<CacheInfoResult>({
      url: '/monitor/cache'
    })
  }

  // 查询缓存键名列表
  static getCacheName() {
    return request.get<CacheNameListResult>({
      url: '/monitor/cache/getNames'
    })
  }

  // 查询缓存键名列表
  static listCacheKey(cacheName: any) {
    return request.get<BaseArrayResult>({
      url: '/monitor/cache/getKeys/' + cacheName
    })
  }

  // 查询缓存内容
  static getCacheValue(cacheName: any, cacheKey: any) {
    return request.get<CacheNameInfoResult>({
      url: '/monitor/cache/getValue/' + cacheName + '/' + cacheKey
    })
  }

  // 删除指定缓存
  static deleteCache(cacheName: any, cacheKey: any) {
    return request.del<CodeMsgResult>({
      url: '/monitor/cache/' + cacheName + '/' + cacheKey
    })
  }

  // 清理指定名称缓存
  static clearCacheName(cacheName: any) {
    return request.del<CodeMsgResult>({
      url: '/monitor/cache/clearCacheName/' + cacheName
    })
  }

  // 清理全部缓存
  static clearCacheAll() {
    return request.del<CodeMsgResult>({
      url: '/monitor/cache/clearCacheAll'
    })
  }
}
