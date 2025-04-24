import type { FormInstance } from 'element-plus'
import { fourDotsSpinnerSvg } from '@/assets/svg/loading'
import { ElLoading } from 'element-plus'
import { saveAs } from 'file-saver'
import errorCode from '@/utils/errorCode'
import type { LoadingOptions } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'

/**
 * 常用 JavaScript 函数片段
 * author chen tao
 * date 2020-10-6
 */

/* 数组相关函数 */

// 数组去重
export function noRepeat<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

// 查找数组最大值
export function arrayMax(arr: number[]): number {
  if (!arr.length) throw new Error('Array is empty')
  return Math.max(...arr)
}

// 查找数组最小值
export function arrayMin(arr: number[]): number {
  if (!arr.length) throw new Error('Array is empty')
  return Math.min(...arr)
}

// 数组分割
export function chunk<T>(arr: T[], size: number = 1): T[][] {
  if (size <= 0) return [arr.slice()]
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  )
}

// 检查元素出现次数
export function countOccurrences<T>(arr: T[], value: T): number {
  return arr.reduce((count, current) => (current === value ? count + 1 : count), 0)
}

// 扁平化数组
export function flatten<T>(arr: any[], depth: number = Infinity): T[] {
  return arr.flat(depth)
}

// 返回两个数组的差集
export function difference<T>(arrA: T[], arrB: T[]): T[] {
  const setB = new Set(arrB)
  return arrA.filter((item) => !setB.has(item))
}

// 返回两个数组的交集
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2)
  return arr1.filter((item) => set2.has(item))
}

// 从右删除 n 个元素
export function dropRight<T>(arr: T[], n: number = 0): T[] {
  return arr.slice(0, Math.max(0, arr.length - n))
}

// 返回间隔 nth 的元素
export function everyNth<T>(arr: T[], nth: number): T[] {
  if (nth <= 0) return []
  return arr.filter((_, i) => i % nth === nth - 1)
}

// 返回第 n 个元素
export function nthElement<T>(arr: T[], n: number = 0): T | undefined {
  const index = n >= 0 ? n : arr.length + n
  return arr[index]
}

// 数组乱序
export function shuffle<T>(arr: T[]): T[] {
  const array = [...arr] // 创建新数组避免修改原数组
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

/* 浏览器对象 BOM */

// 当前网页地址
export function currentURL(): string {
  return window.location.href
}

// 获取滚动条位置
export function getScrollPosition(el: HTMLElement | Window = window): { x: number; y: number } {
  return el === window
    ? {
        x: window.scrollX || document.documentElement.scrollLeft,
        y: window.scrollY || document.documentElement.scrollTop
      }
    : {
        x: (el as HTMLElement).scrollLeft,
        y: (el as HTMLElement).scrollTop
      }
}

// 获取 URL 参数
export function getURLParameters(url: string): Record<string, string> {
  return Object.fromEntries(new URLSearchParams(url.split('?')[1]).entries())
}

// 复制文本
export function copy(str: string): boolean {
  try {
    navigator.clipboard.writeText(str)
    return true
  } catch (err) {
    console.error('Copy failed:', err)
    return false
  }
}

// 检测设备类型
export function detectDeviceType(): 'Mobile' | 'Desktop' {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    ? 'Mobile'
    : 'Desktop'
}

/* Cookie 操作 */

// 设置 Cookie
export function setCookie(key: string, value: string, expireDays: number): void {
  const date = new Date()
  date.setDate(date.getDate() + expireDays)
  document.cookie = `${key}=${encodeURIComponent(value)}${
    expireDays ? `;expires=${date.toUTCString()}` : ''
  }`
}

// 删除 Cookie
export function delCookie(name: string): void {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT`
}

// 获取 Cookie
export function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/* 日期相关 */

// 时间戳转时间
export function timestampToTime(timestamp: number = Date.now(), isMs: boolean = true): string {
  const date = new Date(isMs ? timestamp : timestamp * 1000)
  return date.toISOString().replace('T', ' ').slice(0, 19)
}

/* DOM 操作 */

let scrollTop = 0

export function preventScroll(): void {
  scrollTop = window.scrollY
  Object.assign(document.body.style, {
    position: 'fixed',
    width: '100%',
    top: `-${scrollTop}px`,
    overflowY: 'hidden'
  })
}

export function recoverScroll(): void {
  Object.assign(document.body.style, {
    position: '',
    width: '',
    top: '',
    overflowY: ''
  })
  window.scrollTo(0, scrollTop)
}

// 判断是否到达页面底部
export function bottomVisible(): boolean {
  return window.innerHeight + window.scrollY >= document.documentElement.scrollHeight
}

// 判断元素是否在可视区域
export function elementIsVisibleInViewport(
  el: HTMLElement,
  partiallyVisible: boolean = false
): boolean {
  const { top, left, bottom, right } = el.getBoundingClientRect()
  const { innerHeight, innerWidth } = window

  return partiallyVisible
    ? top + el.offsetHeight > 0 &&
        top < innerHeight &&
        left + el.offsetWidth > 0 &&
        left < innerWidth
    : top >= 0 && left >= 0 && bottom <= innerHeight && right <= innerWidth
}

// 获取元素样式
export function getStyle(el: HTMLElement, ruleName: string): string {
  return window.getComputedStyle(el)[ruleName as any]
}

/* 数字操作 */

export function commafy(num: number): string {
  return num.toLocaleString('en-US')
}

export function randomNum(min: number, max?: number): number {
  if (max === undefined) return Math.floor(Math.random() * min)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

/* 字符串操作 */

export function removeHtmlTags(str: string = ''): string {
  return str.replace(/<[^>]*>/g, '')
}

// 判断是不是iframe
export function isIframe(url: string) {
  return url.includes('/outside/iframe')
}

// 获取完整的路径
export function AvatarImga(url: string | undefined) {
  return url ? import.meta.env.VITE_API_BASE_URL + url : url
}

/**
 * 将 base64 格式的图片数据转换为 Blob 对象
 * @param base64Data base64 格式的图片数据
 * @param mimeType 文件类型，默认为 'image/png'
 * @returns Blob 对象
 */
export const base64ToBlob = (base64Data: string, mimeType: string = 'image/png'): Blob => {
  // 移除 base64 字符串中的 header（如果存在）
  const base64WithoutHeader = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data

  // 解码 base64
  const byteCharacters = atob(base64WithoutHeader)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

// 表单重置
export function resetForm(formRef: FormInstance | undefined) {
  if (formRef) {
    formRef.resetFields()
  }
}

// 验证是否为blob格式
export function blobValidate(data: any) {
  return data.type !== 'application/json'
}

// 获取当前时间
export function getCurrentTime() {
  return new Date().getTime()
}

// 通用Excel下载方法
export function downloadExcel(response: Promise<any>, fileName?: string) {
  //正在下载数据，请稍候
  const loading = loadingAction('正在下载数据，请稍候')
  return response
    .then(async (data) => {
      const isBlob = blobValidate(data)
      if (isBlob) {
        saveAs(data, fileName ? fileName : getCurrentTime() + '.xlsx')
      } else {
        const resText = await (data as unknown as Response).text()
        const rspObj: { code: keyof typeof errorCode; msg: string } = JSON.parse(resText)
        const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
        ElMessage.error(errMsg)
      }
      loading.close()
    })
    .catch((r) => {
      console.error(r)
      ElMessage.error('下载Excel文件出现错误，请联系管理员！')
      loading.close()
    })
}

// 通用Zip下载方法
export function downloadZip(response: Promise<any>, fileName: string = getCurrentTime() + '.zip') {
  const loading = loadingAction('正在下载数据，请稍候')
  return response
    .then(async (data) => {
      const isBlob = blobValidate(data)
      if (isBlob) {
        saveAs(data, fileName)
      } else {
        const resText = await (data as unknown as Response).text()
        const rspObj: { code: keyof typeof errorCode; msg: string } = JSON.parse(resText)
        const errMsg = errorCode[rspObj.code] || rspObj.msg || errorCode['default']
        ElMessage.error(errMsg)
      }
      loading.close()
    })
    .catch((r) => {
      console.error(r)
      ElMessage.error('下载zip文件出现错误，请联系管理员！')
      loading.close()
    })
}

// 时间格式化
export function parseTime(time: string, format: string = '{y}-{m}-{d} {h}:{i}:{s}'): string {
  const date = new Date(time)
  const formatObj: Record<string, number> = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay()
  }
  const timeStr = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key]
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value]
    }
    return value.toString().padStart(2, '0')
  })
  return timeStr
}

// 添加日期范围
export function addDateRange(params: any, dateRange: any, propName?: any) {
  const search = params
  search.params =
    typeof search.params === 'object' && search.params !== null && !Array.isArray(search.params)
      ? search.params
      : {}
  dateRange = Array.isArray(dateRange) ? dateRange : []
  if (typeof propName === 'undefined') {
    search.params['beginTime'] = dateRange[0]
    search.params['endTime'] = dateRange[1]
  } else {
    search.params['begin' + propName] = dateRange[0]
    search.params['end' + propName] = dateRange[1]
  }
  return search
}

/**
 * 参数处理
 * @param {*} params  参数
 */
export function tansParams(params: any) {
  let result = ''
  for (const propName of Object.keys(params)) {
    const value = params[propName]
    const part = encodeURIComponent(propName) + '='
    if (value !== null && value !== '' && typeof value !== 'undefined') {
      if (typeof value === 'object') {
        for (const key of Object.keys(value)) {
          if (value[key] !== null && value[key] !== '' && typeof value[key] !== 'undefined') {
            const params = propName + '[' + key + ']'
            const subPart = encodeURIComponent(params) + '='
            result += subPart + encodeURIComponent(value[key]) + '&'
          }
        }
      } else {
        result += part + encodeURIComponent(value) + '&'
      }
    }
  }
  return result
}

// 回显数据字典
export function selectDictLabel(datas: any, value: any) {
  if (value === undefined) {
    return ''
  }
  const actions = []
  Object.keys(datas).some((key) => {
    if (datas[key].value == '' + value) {
      actions.push(datas[key].label)
      return true
    }
  })
  if (actions.length === 0) {
    actions.push(value)
  }
  return actions.join('')
}

// 转换字符串，undefined,null等转化为""
export function parseStrEmpty(str: any) {
  if (!str || str == 'undefined' || str == 'null') {
    return ''
  }
  return str
}

/**
 * 构造树型结构数据
 * @param {*} data 数据源
 * @param {*} id id字段 默认 'id'
 * @param {*} parentId 父节点字段 默认 'parentId'
 * @param {*} children 孩子节点字段 默认 'children'
 */
export function handleTree(
  data: Record<string, any>[],
  id: string = 'id',
  parentId: string = 'parentId',
  children: string = 'children'
): Record<string, any>[] {
  const config = {
    id: id || 'id',
    parentId: parentId || 'parentId',
    childrenList: children || 'children'
  }

  const childrenListMap: Record<string, any[]> = {}
  const nodeIds: Record<string, any> = {}
  const tree: Record<string, any>[] = []

  for (const d of data) {
    const parentId = d[config.parentId]
    if (childrenListMap[parentId] == null) {
      childrenListMap[parentId] = []
    }
    nodeIds[d[config.id]] = d
    childrenListMap[parentId].push(d)
  }

  for (const d of data) {
    const parentId = d[config.parentId]
    if (nodeIds[parentId] == null) {
      tree.push(d)
    }
  }

  for (const t of tree) {
    adaptToChildrenList(t)
  }

  function adaptToChildrenList(o: any) {
    if (childrenListMap[o[config.id]] !== null) {
      o[config.childrenList] = childrenListMap[o[config.id]]
    }
    if (o[config.childrenList]) {
      for (const c of o[config.childrenList]) {
        adaptToChildrenList(c)
      }
    }
  }
  return tree
}

// 加载动画
export function loadingAction(text?: string) {
  const config: LoadingOptions = {
    lock: true,
    background: 'rgba(0, 0, 0, 0)',
    svg: fourDotsSpinnerSvg,
    svgViewBox: '0 0 40 40'
  }
  if (text) {
    config.text = text
  }
  return ElLoading.service(config)
}

// UUID
export function uuid() {
  const uuidString = uuidv4()
  const hash = uuidString.split('-').reduce((acc, part) => acc + parseInt(part, 16), 0)
  return hash
}
