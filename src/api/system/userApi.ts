import request from '@/utils/http'
import { BaseResult } from '@/types/axios'

// 用户
export class UserService {
  // 修改用户信息
  static editUserInfo(data: any) {
    return request.put<BaseResult>({ url: '/system/user', data })
  }
}
