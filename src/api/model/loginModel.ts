export interface LoginType {
  username: string
  password: string
  code?: string
  uuid?: string
}

export interface RegisterType extends LoginType {
  confirmPassword: string
  email: string
  verifyCode: string
}
