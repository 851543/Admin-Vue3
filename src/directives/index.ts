import type { App } from 'vue'
import { setupPermissionDirective } from './permission'
import { setupHighlightDirective } from './highlight'
import { setupRippleDirective } from './ripple'
import { setupCopyTextDirective } from './copyText'

export function setupGlobDirectives(app: App) {
  setupPermissionDirective(app) // 权限指令
  setupHighlightDirective(app) // 高亮指令
  setupRippleDirective(app) // 水波纹指令
  setupCopyTextDirective(app) // 复制文本指令
}
