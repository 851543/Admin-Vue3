export type ErrorMessageMode = 'none' | 'modal' | 'message' | undefined

export interface RequestOptions {
  joinParamsToUrl?: boolean
  formatDate?: boolean
  isTransformResponse?: boolean
  isReturnNativeResponse?: boolean
  joinPrefix?: boolean
  apiUrl?: string
  errorMessageMode?: ErrorMessageMode
  joinTime?: boolean
  ignoreCancelToken?: boolean
  withToken?: boolean
}

// 基础接口返回的数据结构
export interface BaseResult<T = any> {
  code: number // 状态码
  msg: string // 消息
  data: T // 数据
  token?: string // 可选字段，用于返回 token
}

// 分页数据结构，继承基础结果结构
export interface PaginationResult<T> extends BaseResult {
  currentPage: number // 当前页
  pageSize: number // 每页条数
  lastPage: number // 总页数
  total: number // 总条数
  data: T
}

// 验证码返回数据结构
export interface CaptchaResult {
  captchaEnabled: boolean
  uuid: string
  img: string
}

// 登录功能开关返回数据结构
export interface loginFunctionEnabledResult {
  sliderEnabled: boolean
  forgetPasswordEnabled: boolean
  registerUserEnabled: boolean
}

// 登录返回数据结构
export interface LoginResult<T> {
  msg: string
  code: number
  permissions: string[]
  roles: string[]
  user: T
}

// 用户信息返回数据结构
export interface UserInfoResult {
  userId: number
  deptId: any
  userName: string
  nickName: string
  email: string
  phonenumber: any
  sex: string
  avatar: any
  password: string
  status: string
  delFlag: string
  loginIp: string
  loginDate: string
  dept: any
  roles: []
  roleIds: any
  postIds: any
  roleId: any
  admin: boolean
}
