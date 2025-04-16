import type { App, Directive, DirectiveBinding } from 'vue'

/**
 * v-copyText 复制文本内容指令
 * 用法：
 * <!-- 基础用法 -->
 * <el-button v-copyText="'要复制的文本'">点击复制</el-button>
 *
 * <!-- 带回调函数 -->
 * <el-button v-copyText="'要复制的文本'" v-copyText:callback="handleCopy">
 *   点击复制(带回调)
 * </el-button>
 */

interface ExtendedHTMLElement extends HTMLElement {
  $copyValue?: string
  $copyCallback?: (value: string) => void
  $destroyCopy?: () => void
}

interface CopyTextOptions {
  target?: HTMLElement
}

const copyTextDirective: Directive = {
  beforeMount(el: ExtendedHTMLElement, binding: DirectiveBinding) {
    if (binding.arg === 'callback') {
      el.$copyCallback = binding.value
    } else {
      el.$copyValue = binding.value
      const handler = () => {
        if (el.$copyValue) {
          copyTextToClipboard(el.$copyValue)
          if (el.$copyCallback) {
            el.$copyCallback(el.$copyValue)
          }
        }
      }
      el.addEventListener('click', handler)
      el.$destroyCopy = () => el.removeEventListener('click', handler)
    }
  },
  beforeUnmount(el: ExtendedHTMLElement) {
    if (el.$destroyCopy) {
      el.$destroyCopy()
    }
  }
}

function copyTextToClipboard(
  input: string,
  { target = document.body }: CopyTextOptions = {}
): boolean {
  const element = document.createElement('textarea')
  const previouslyFocusedElement = document.activeElement as HTMLElement

  element.value = input

  // Prevent keyboard from showing on mobile
  element.setAttribute('readonly', '')

  element.style.contain = 'strict'
  element.style.position = 'absolute'
  element.style.left = '-9999px'
  element.style.fontSize = '12pt' // Prevent zooming on iOS

  const selection = document.getSelection()
  let originalRange: Range | null = null

  if (selection) {
    originalRange = selection.rangeCount > 0 ? selection.getRangeAt(0) : null
  }

  target.append(element)
  element.select()

  // Explicit selection workaround for iOS
  element.selectionStart = 0
  element.selectionEnd = input.length

  let isSuccess = false
  try {
    isSuccess = document.execCommand('copy')
  } catch (err) {
    console.error('Failed to copy text:', err)
  }

  element.remove()

  if (selection && originalRange) {
    selection.removeAllRanges()
    selection.addRange(originalRange)
  }

  // Get the focus back on the previously focused element, if any
  if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
    previouslyFocusedElement.focus()
  }

  return isSuccess
}

export function setupCopyTextDirective(app: App) {
  app.directive('copyText', copyTextDirective)
}
