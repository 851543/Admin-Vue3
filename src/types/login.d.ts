import { BaseResult } from './axios'

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

export interface LoginFunctionEnabledResult {
  sliderEnabled: boolean
  forgetPasswordEnabled: boolean
  registerUserEnabled: boolean
}

export interface ProfileResult extends BaseResult {
  postGroup: string
  roleGroup: string
}
