<template>
  <div class="login register">
    <div class="left-wrap">
      <left-view></left-view>
    </div>
    <div class="right-wrap">
      <div class="header">
        <svg class="icon" aria-hidden="true">
          <use xlink:href="#iconsys-zhaopian-copy"></use>
        </svg>
        <h1>{{ systemName }}</h1>
      </div>
      <div class="login-wrap">
        <div class="form">
          <h3 class="title">{{ $t('forgetPassword.title') }}</h3>
          <p class="sub-title">{{ $t('forgetPassword.subTitle') }}</p>
          <el-form
            ref="formRef"
            :model="form"
            :rules="rules"
            label-position="top"
            style="margin-top: 25px"
          >
            <el-form-item prop="email">
              <el-input
                :placeholder="$t('forgetPassword.email')"
                size="large"
                v-model.trim="form.email"
              />
            </el-form-item>

            <el-form-item prop="verifyCode">
              <div style="display: flex; width: 100%">
                <el-input
                  :placeholder="$t('forgetPassword.verifyCode')"
                  size="large"
                  v-model.trim="form.verifyCode"
                  style="width: 65%"
                />
                <el-button
                  type="primary"
                  size="large"
                  style="width: 33%; margin-left: 2%; height: 44px"
                  @click="getVerifyCode"
                  :disabled="!form.email || cooldown > 0"
                >
                  {{ cooldown > 0 ? `${cooldown}s` : $t('forgetPassword.getVerifyCode') }}
                </el-button>
              </div>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                :placeholder="$t('forgetPassword.passwordP')"
                size="large"
                type="password"
                show-password
                v-model.trim="form.password"
              />
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input
                :placeholder="$t('forgetPassword.confirmPas')"
                size="large"
                type="password"
                show-password
                v-model.trim="form.confirmPassword"
              />
            </el-form-item>

            <el-form-item>
              <el-button
                class="login-btn"
                size="large"
                type="primary"
                @click="submitForm"
                :loading="loading"
                v-ripple
              >
                {{ $t('forgetPassword.submitBtnText') }}
              </el-button>
            </el-form-item>

            <el-form-item>
              <el-button style="width: 100%; height: 46px" size="large" plain @click="toLogin">
                {{ $t('forgetPassword.backBtnText') }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useI18n } from 'vue-i18n'
  import AppConfig from '@/config'
  import LeftView from '@/components/Pages/Login/LeftView.vue'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { LoginService } from '@/api/loginApi'
  const router = useRouter()
  const { t } = useI18n()
  const formRef = ref<FormInstance>()

  const systemName = AppConfig.systemInfo.name
  const form = reactive({
    email: '',
    verifyCode: '',
    password: '',
    confirmPassword: ''
  })

  const rules: FormRules = {
    email: [
      { required: true, message: t('forgetPassword.emailRequired'), trigger: 'blur' },
      { type: 'email', message: t('forgetPassword.emailInvalid'), trigger: ['blur', 'change'] }
    ],
    verifyCode: [
      { required: true, message: t('forgetPassword.verifyCodeRequired'), trigger: 'blur' }
    ],
    password: [
      { required: true, message: t('forgetPassword.passwordRequired'), trigger: 'blur' },
      { min: 6, message: t('forgetPassword.passwordMinLength'), trigger: 'blur' }
    ],
    confirmPassword: [
      { required: true, message: t('forgetPassword.confirmPasswordRequired'), trigger: 'blur' },
      {
        validator: (rule: any, value: string, callback: (error?: Error) => void) => {
          if (value !== form.password) {
            callback(new Error(t('forgetPassword.passwordMismatch')))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  }

  const loading = ref(false)
  const cooldown = ref(0)

  const startCooldown = () => {
    cooldown.value = 60
    const timer = setInterval(() => {
      cooldown.value--
      if (cooldown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  }

  const getVerifyCode = async () => {
    try {
      const res = await LoginService.sendEmailCode({ mailAddress: form.email })
      if (res.code === 200) {
        ElMessage.success(t('forgetPassword.codeSent'))
        startCooldown()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const submitForm = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      loading.value = true
      const res = await LoginService.forgetPwd({
        email: form.email,
        verifyCode: form.verifyCode,
        password: form.password
      })
      if (res.code === 200) {
        ElMessage.success(t('forgetPassword.resetSuccess'))
        router.push('/login')
      }
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  const toLogin = () => {
    router.push('/login')
  }
</script>

<style lang="scss" scoped>
  @use '../login/index';
</style>
