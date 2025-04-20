import { DictDataService } from '@/api/system/dict/dataApi'

export interface DictType {
  label: string
  value: string
  elTagType?: string
  elTagClass?: string
}

/**
 * 字典工具函数
 * @param args 字典类型
 * @returns Promise
 *
 **/
export function useDict(...args: string[]): Promise<Record<string, DictType[]>> {
  const res = ref<Record<string, any>>({})
  const promises = args.map((dictType) => {
    return DictDataService.listData({ dictType }).then((resp) => {
      res.value[dictType] = resp.rows.map((p) => ({
        label: p.dictLabel,
        value: p.dictValue,
        elTagType: p.listClass,
        elTagClass: p.cssClass
      }))
    })
  })

  return Promise.all(promises).then(() => toRaw(res.value))
}
