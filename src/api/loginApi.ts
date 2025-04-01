import request from '@/utils/http'
import { LoginModel } from './model/loginModel'
import { BaseResult, CaptchaResult, loginFunctionEnabledResult } from '@/types/axios'

// 登陆
export class LoginService {
  // 登录方法
  static login(data: LoginModel) {
    return request.post<BaseResult>({
      url: '/login',
      data
    })
  }
  // 获取登录功能开关
  static getLoginFunctionEnabled() {
    return request.get<loginFunctionEnabledResult>({
      url: '/loginFunctionEnabled'
    })
  }
  // 注册方法
  static register(data: LoginModel) {
    return request.post<BaseResult>({
      url: '/register',
      data
    })
  }
  // 获取用户信息
  static getInfo() {
    return request.get<BaseResult>({
      url: '/getInfo'
    })
  }
  // 退出方法
  static logout() {
    return request.post<BaseResult>({
      url: '/logout'
    })
  }
  // 获取验证码
  static getCodeImg() {
    return request.get<CaptchaResult>({
      url: '/captchaImage',
      headers: {
        isToken: false
      },
      timeout: 20000
    })
  }
}
