import { App, Directive, DirectiveBinding } from 'vue'
import { useUserStore } from '@/store/modules/user'
/**
 * 权限指令
 * 用法：
 * <el-button v-auth="['system:menu:add']">按钮</el-button>
 */
const authDirective: Directive = {
  mounted(el: HTMLElement, binding: DirectiveBinding) {
    const { value } = binding
    const all_permission = '*:*:*'
    const store = useUserStore()
    const permissions = store.getUserInfo.permissions || []

    if (value && value instanceof Array && value.length > 0) {
      const permissionFlag = value
      const hasPermissions = permissions.some((permission: string) => {
        return all_permission === permission || permissionFlag.includes(permission)
      })
      if (!hasPermissions && el.parentNode) {
        el.parentNode.removeChild(el)
      }
    } else {
      throw new Error('请设置操作权限标签值')
    }
  }
}

// const { value } = binding
// const all_permission = "*:*:*";
// const permissions = useUserStore().permissions

// if (value && value instanceof Array && value.length > 0) {
//   const permissionFlag = value

//   const hasPermissions = permissions.some(permission => {
//     return all_permission === permission || permissionFlag.includes(permission)
//   })

//   if (!hasPermissions) {
//     el.parentNode && el.parentNode.removeChild(el)
//   }
// } else {
//   throw new Error(`请设置操作权限标签值`)
// }

export function setupPermissionDirective(app: App) {
  app.directive('auth', authDirective)
}
