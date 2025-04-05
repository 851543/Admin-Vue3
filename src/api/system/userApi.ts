import request from '@/utils/http'
import { BaseResult, ProfileResult } from '@/types/axios'

// 用户
export class UserService {
  // 修改用户信息
  static editUserInfo(data: any) {
    return request.put<BaseResult>({ url: '/system/user', data })
  }
  // 获取个人信息
  static getProfile() {
    return request.get<ProfileResult>({ url: '/system/user/profile' })
  }
  // 修改个人信息
  static editProfile(data: any) {
    return request.put<BaseResult>({ url: '/system/user/profile', data })
  }
  // 修改个人信息密码
  static editProfilePwd(data: any) {
    return request.put<BaseResult>({ url: '/system/user/profile/updatePwd', data })
  }
  //  修改个人信息头像
  static editProfileAvatar(data: any) {
    return request.post<any>({
      url: '/system/user/profile/avatar',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data
    })
  }
}
