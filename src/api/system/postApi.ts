import request from '@/utils/http'
import { PostInfoResult, PostListPageResult } from '@/types/system/post'
import { CodeMsgResult } from '@/types/axios'

// 岗位信息
export class PostService {
  // 查询岗位信息列表
  static listPost(query: any) {
    return request.get<PostListPageResult>({
      url: '/system/post/list',
      params: query
    })
  }

  // 查询岗位信息详细
  static getPost(postId: any) {
    return request.get<PostInfoResult>({
      url: '/system/post/' + postId
    })
  }

  // 新增岗位信息
  static addPost(data: any) {
    return request.post<CodeMsgResult>({
      url: '/system/post',
      data: data
    })
  }

  // 修改岗位信息
  static updatePost(data: any) {
    return request.put<CodeMsgResult>({
      url: '/system/post',
      data: data
    })
  }

  // 删除岗位信息
  static deletePost(postId: any) {
    return request.del<CodeMsgResult>({
      url: '/system/post/' + postId
    })
  }

  // 导出岗位信息列表
  static exportExcel(data: any) {
    return request.post({
      url: 'system/post/export',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      responseType: 'blob',
      data: data
    })
  }
}
