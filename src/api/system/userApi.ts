import { EditProfileAvatarResult, ProfileResult } from '@/types/system/user'
import { BaseResult } from '@/types/axios'
import request from '@/utils/http'

// 用户
export class UserService {
  // 修改用户信息
  static editUserInfo(data: object) {
    return request.put<BaseResult>({
      url: '/system/user',
      data
    })
  }

  // 获取个人信息
  static getProfile() {
    return request.get<ProfileResult>({
      url: '/system/user/profile'
    })
  }

  // 修改个人信息
  static editProfile(data: object) {
    return request.put<BaseResult>({
      url: '/system/user/profile',
      headers: { 'Content-Type': 'application/json' },
      data
    })
  }

  // 修改个人信息密码
  static editProfilePwd(data: object) {
    return request.put<BaseResult>({
      url: '/system/user/profile/updatePwd',
      data
    })
  }

  // 修改个人信息头像
  static editProfileAvatar(data: object) {
    return request.post<EditProfileAvatarResult>({
      url: '/system/user/profile/avatar',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data
    })
  }
}
