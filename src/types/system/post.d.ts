import { BaseArrayResult, BaseObjectResult, BasePageResult } from '../axios'

export interface PostResult {
  postId: string
  postCode: string
  postName: string
  postSort: string
  status: string
  createBy: string
  createTime: string
  updateBy: string
  updateTime: string
  remark: string
}

export type PostListPageResult = BasePageResult<PostResult>
export type PostListResult = BaseArrayResult<PostResult>
export type PostInfoResult = BaseObjectResult<PostResult>
