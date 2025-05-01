<template>
  <div class="login">
    <div class="left-wrap">
      <left-view></left-view>
    </div>
    <div class="right-wrap">
      <div class="top-right-wrap">
        <div class="btn theme-btn" @click="toggleTheme">
          <i class="iconfont-sys">
            {{ isDark ? '&#xe6b5;' : '&#xe725;' }}
          </i>
        </div>
        <el-dropdown @command="changeLanguage" popper-class="langDropDownStyle">
          <div class="btn language-btn">
            <i class="iconfont-sys icon-language">&#xe611;</i>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <div v-for="lang in languageOptions" :key="lang.value" class="lang-btn-item">
                <el-dropdown-item
                  :command="lang.value"
                  :class="{ 'is-selected': locale === lang.value }"
                >
                  <span class="menu-txt">{{ lang.label }}</span>
                  <i v-if="locale === lang.value" class="iconfont-sys icon-check">&#xe621;</i>
                </el-dropdown-item>
              </div>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
      <div class="header">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#iconsys-zhaopian-copy"></use>
        </svg>
        <h1>{{ systemName }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">{{ $t('login.title') }}</h3>
          <p class="sub-title">{{ $t('login.subTitle') }}</p>
          <el-form
            ref="formRef"
            :model="formData"
            :rules="rules"
            @keyup.enter="handleSubmit"
            style="margin-top: 25px"
          >
            <el-form-item prop="username">
              <el-input
                :placeholder="$t('login.placeholder[0]')"
                size="large"
                v-model.trim="formData.username"
              />
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                :placeholder="$t('login.placeholder[1]')"
                size="large"
                v-model.trim="formData.password"
                type="password"
                radius="8px"
                autocomplete="off"
              />
            </el-form-item>
            <el-form-item prop="code" v-if="captchaEnabled">
              <el-input
                v-model="formData.code"
                size="large"
                auto-complete="off"
                :placeholder="$t('login.placeholder[3]')"
                style="width: 63%"
                @keyup.enter="null"
              >
              </el-input>
              <div
                class="login-code"
                style="
                  display: inline-block;
                  height: 46px;
                  vertical-align: bottom;
                  margin-left: 8px;
                "
              >
                <img
                  :src="codeUrl"
                  @click="getCode"
                  class="login-code-img"
                  style="height: 46px; width: 150px; cursor: pointer; border-radius: 8px"
                />
              </div>
            </el-form-item>
            <div class="drag-verify" v-if="sliderEnabled">
              <div class="drag-verify-content" :class="{ error: !isPassing && isClickPass }">
                <!-- :background="isDark ? '#181818' : '#eee'" -->
                <DragVerify
                  ref="dragVerify"
                  v-model:value="isPassing"
                  :width="width < 500 ? 328 : 438"
                  :text="$t('login.sliderText')"
                  textColor="var(--art-gray-800)"
                  :successText="$t('login.sliderSuccessText')"
                  :progressBarBg="getCssVariable('--el-color-primary')"
                  background="var(--art-gray-200)"
                  handlerBg="var(--art-main-bg-color)"
                  @pass="onPass"
                />
              </div>
              <p class="error-text" :class="{ 'show-error-text': !isPassing && isClickPass }">{{
                $t('login.placeholder[2]')
              }}</p>
            </div>

            <div class="forget-password">
              <el-checkbox v-model="formData.rememberPwd">{{
                $t('login.rememberPwd')
              }}</el-checkbox>
              <router-link to="/forget-password" v-if="forgetPwdEnabled">{{
                $t('login.forgetPwd')
              }}</router-link>
            </div>

            <div style="margin-top: 30px">
              <el-button
                class="login-btn"
                size="large"
                type="primary"
                @click="handleSubmit"
                :loading="loading"
                v-ripple
              >
                {{ $t('login.btnText') }}
              </el-button>
            </div>

            <div class="footer" v-if="registerUserEnabled">
              <p>
                {{ $t('login.noAccount') }}
                <router-link to="/register">{{ $t('login.register') }}</router-link>
              </p>
            </div>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import LeftView from '@/components/Pages/Login/LeftView.vue'
  import { ElMessage, ElNotification } from 'element-plus'
  import { useUserStore } from '@/store/modules/user'
  import { HOME_PAGE } from '@/router'
  import { ApiStatus } from '@/utils/http/status'
  import { getCssVariable } from '@/utils/colors'
  import { languageOptions } from '@/language'
  import { LanguageEnum, SystemThemeEnum } from '@/enums/appEnum'
  import { useI18n } from 'vue-i18n'
  import Cookies from 'js-cookie'

  const { t } = useI18n()
  import { useSettingStore } from '@/store/modules/setting'
  import type { FormInstance, FormRules } from 'element-plus'

  const userStore = useUserStore()
  const router = useRouter()
  const isPassing = ref(false)
  const isClickPass = ref(false)

  const formRef = ref<FormInstance>()
  const formData = reactive({
    username: '',
    password: '',
    rememberPwd: false,
    code: '',
    uuid: ''
  })

  const rules = computed<FormRules>(() => ({
    username: [
      { required: true, message: t('login.placeholder[0]'), trigger: 'blur' },
      {
        validator: (rule: any, value: string, callback: any) => {
          // 验证是否为邮箱格式
          const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
          // 验证是否为账号格式（允许3-12字符，允许字母数字下划线）
          const accountRegex = /^[a-zA-Z0-9_]{3,12}$/
          if (emailRegex.test(value) || accountRegex.test(value)) {
            callback()
          } else {
            callback(new Error(t('login.validation.accountFormat')))
          }
        },
        trigger: ['blur', 'change']
      }
    ],
    password: [{ required: true, message: t('login.placeholder[1]'), trigger: 'blur' }],
    code: [{ required: true, message: t('login.placeholder[3]'), trigger: 'blur' }]
  }))

  const loading = ref(false)
  const { width } = useWindowSize()

  const store = useSettingStore()
  const isDark = computed(() => store.isDark)

  const onPass = () => {}

  import CryptoJS from 'crypto-js'

  const handleSubmit = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
      if (valid) {
        if (sliderEnabled.value && !isPassing.value) {
          isClickPass.value = true
          return
        }

        loading.value = true

        if (formData.rememberPwd) {
          Cookies.set('username', formData.username, { expires: 30 })
          Cookies.set(
            'password',
            CryptoJS.AES.encrypt(
              formData.password,
              import.meta.env.VITE_PASSWORD_ENCRYPT_KEY
            ).toString(),
            { expires: 30 }
          )
          Cookies.set('rememberPwd', formData.rememberPwd.toString(), { expires: 30 })
        } else {
          Cookies.remove('username')
          Cookies.remove('password')
          Cookies.remove('rememberPwd')
        }

        // 延时辅助函数
        const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

        try {
          const res = await LoginService.login({
            username: formData.username,
            password: formData.password,
            code: formData.code,
            uuid: formData.uuid
          })
          if (res.code === ApiStatus.success) {
            // 设置 token
            userStore.setToken(res.token || '')

            // 获取用户信息
            const userRes = await LoginService.getInfo()
            if (userRes.code === ApiStatus.success) {
              userStore.setUserInfo({
                id: userRes.user.userId.toString(),
                name: userRes.user.userName,
                avatar: userRes.user.avatar,
                roles: userRes.roles,
                permissions: userRes.permissions
              })
            }

            // 设置登录状态
            userStore.setLoginStatus(true)
            // 延时辅助函数
            await delay(1000)
            // 登录成功提示
            showLoginSuccessNotice(userRes.user.nickName || userRes.user.userName)
            // 跳转首页
            router.push(HOME_PAGE)
          } else {
            ElMessage.error(res.msg)
          }
        } finally {
          await delay(1000)
          loading.value = false
        }
      }
    })
  }

  // 登录成功提示
  const showLoginSuccessNotice = (name: string) => {
    setTimeout(() => {
      ElNotification({
        title: t('login.success.title'),
        type: 'success',
        showClose: false,
        duration: 2500,
        zIndex: 10000,
        message: `${t('login.success.message')}, ${name}`
      })
    }, 300)
  }

  // 切换语言
  const { locale } = useI18n()

  const changeLanguage = (lang: LanguageEnum) => {
    if (locale.value === lang) return
    locale.value = lang
    userStore.setLanguage(lang)
  }

  // 切换主题
  import { useTheme } from '@/composables/useTheme'
  import { LoginService } from '@/api/loginApi'

  const toggleTheme = () => {
    let { LIGHT, DARK } = SystemThemeEnum
    useTheme().switchThemeStyles(useSettingStore().systemThemeType === LIGHT ? DARK : LIGHT)
  }

  // 获取验证码
  const codeUrl = ref('')
  // 是否开启验证码
  const captchaEnabled = ref(true)
  const getCode = async () => {
    const res = await LoginService.getCodeImg()
    captchaEnabled.value = res.captchaEnabled === undefined ? true : res.captchaEnabled
    if (captchaEnabled.value) {
      codeUrl.value = 'data:image/gif;base64,' + res.img
      formData.uuid = res.uuid
    }
  }

  // 获取滑块开关
  const sliderEnabled = ref(true)
  // 获取忘记密码开关
  const forgetPwdEnabled = ref(true)
  //注册用户开关
  const registerUserEnabled = ref(true)
  // 获取登录功能开关
  const getLoginFunctionEnabled = async () => {
    const res = await LoginService.getLoginFunctionEnabled()
    getCode()
    sliderEnabled.value = res.sliderEnabled === undefined ? true : res.sliderEnabled
    forgetPwdEnabled.value =
      res.forgetPasswordEnabled === undefined ? true : res.forgetPasswordEnabled
    registerUserEnabled.value =
      res.registerUserEnabled === undefined ? true : res.registerUserEnabled
  }

  // 获取Cookie
  const getCookie = () => {
    formData.username = Cookies.get('username') || ''
    const encryptedPassword = Cookies.get('password')
    if (encryptedPassword) {
      try {
        formData.password = CryptoJS.AES.decrypt(
          encryptedPassword,
          import.meta.env.VITE_PASSWORD_ENCRYPT_KEY
        ).toString(CryptoJS.enc.Utf8)
      } catch (error) {
        console.error(error)
        formData.password = ''
        Cookies.remove('password')
      }
    }
    formData.rememberPwd = Boolean(Cookies.get('rememberPwd'))
  }

  onMounted(() => {
    getLoginFunctionEnabled()
    getCookie()
  })

  import AppConfig from '@/config'
  const systemName = AppConfig.systemInfo.name
</script>

<style lang="scss" scoped>
  @use './index';
</style>
