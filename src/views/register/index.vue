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
          <h3 class="title">{{ $t('register.title') }}</h3>
          <p class="sub-title">{{ $t('register.subTitle') }}</p>
          <el-form ref="formRef" :model="formData" :rules="rules" label-position="top">
            <el-form-item prop="username">
              <el-input
                v-model.trim="formData.username"
                :placeholder="$t('register.placeholder[0]')"
                size="large"
              />
            </el-form-item>

            <el-form-item prop="email">
              <el-input
                v-model.trim="formData.email"
                :placeholder="$t('forgetPassword.email')"
                size="large"
              />
            </el-form-item>

            <el-form-item prop="verifyCode">
              <div style="display: flex; width: 100%">
                <el-input
                  v-model.trim="formData.verifyCode"
                  :placeholder="$t('forgetPassword.verifyCode')"
                  size="large"
                  style="width: 65%"
                />
                <el-button
                  type="primary"
                  size="large"
                  style="width: 33%; margin-left: 2%; height: 44px"
                  @click="getVerifyCode"
                  :disabled="!formData.email || cooldown > 0"
                >
                  {{ cooldown > 0 ? `${cooldown}s` : $t('forgetPassword.getVerifyCode') }}
                </el-button>
              </div>
            </el-form-item>

            <el-form-item prop="password">
              <el-input
                v-model.trim="formData.password"
                :placeholder="$t('register.placeholder[1]')"
                size="large"
                type="password"
                autocomplete="off"
              />
            </el-form-item>

            <el-form-item prop="confirmPassword">
              <el-input
                v-model.trim="formData.confirmPassword"
                :placeholder="$t('register.placeholder[2]')"
                size="large"
                type="password"
                autocomplete="off"
                @keyup.enter="register"
              />
            </el-form-item>

            <el-form-item prop="agreement">
              <el-checkbox v-model="formData.agreement">
                {{ $t('register.agreeText') }}
                <router-link
                  style="color: var(--main-color); text-decoration: none"
                  to="/privacy-policy"
                  >{{ $t('register.privacyPolicy') }}</router-link
                >
              </el-checkbox>
            </el-form-item>

            <div style="margin-top: 15px">
              <el-button
                class="register-btn"
                size="large"
                type="primary"
                @click="register"
                :loading="loading"
                v-ripple
              >
                {{ $t('register.submitBtnText') }}
              </el-button>
            </div>

            <div class="footer">
              <p>
                {{ $t('register.hasAccount') }}
                <router-link to="/login">{{ $t('register.toLogin') }}</router-link>
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
  import AppConfig from '@/config'
  import { ElMessage } from 'element-plus'
  import type { FormInstance, FormRules } from 'element-plus'
  import { useI18n } from 'vue-i18n'
  import { LoginService } from '@/api/loginApi'

  const { t } = useI18n()

  const router = useRouter()
  const formRef = ref<FormInstance>()

  const systemName = AppConfig.systemInfo.name
  const loading = ref(false)

  const formData = reactive({
    username: '',
    email: '',
    verifyCode: '',
    password: '',
    confirmPassword: '',
    agreement: false
  })

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
      const res = await LoginService.sendEmailCode({ mailAddress: formData.email })
      if (res.code === 200) {
        ElMessage.success(t('register.verifyCodeSent'))
        startCooldown()
      }
    } catch (error) {
      console.error(error)
    }
  }

  const validatePass = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error(t('register.placeholder[1]')))
    } else {
      if (formData.confirmPassword !== '') {
        formRef.value?.validateField('confirmPassword')
      }
      callback()
    }
  }

  const validatePass2 = (rule: any, value: string, callback: any) => {
    if (value === '') {
      callback(new Error(t('register.rule[0]')))
    } else if (value !== formData.password) {
      callback(new Error(t('register.rule[1]')))
    } else {
      callback()
    }
  }

  const rules = reactive<FormRules>({
    username: [
      { required: true, message: t('register.placeholder[0]'), trigger: 'blur' },
      { min: 3, max: 20, message: t('register.rule[2]'), trigger: 'blur' }
    ],
    email: [
      { required: true, message: t('forgetPassword.email'), trigger: 'blur' },
      { type: 'email', message: t('register.invalidEmail'), trigger: ['blur', 'change'] }
    ],
    verifyCode: [{ required: true, message: t('forgetPassword.verifyCode'), trigger: 'blur' }],
    password: [
      { required: true, validator: validatePass, trigger: 'blur' },
      { min: 6, message: t('register.rule[3]'), trigger: 'blur' }
    ],
    confirmPassword: [{ required: true, validator: validatePass2, trigger: 'blur' }],
    agreement: [
      {
        validator: (rule: any, value: boolean, callback: any) => {
          if (!value) {
            callback(new Error(t('register.rule[4]')))
          } else {
            callback()
          }
        },
        trigger: 'change'
      }
    ]
  })

  const register = async () => {
    if (!formRef.value) return

    try {
      await formRef.value.validate()
      loading.value = true
      const res = await LoginService.register({
        username: formData.username,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        email: formData.email,
        verifyCode: formData.verifyCode
      })
      if (res.code === 200) {
        ElMessage.success(t('register.registerSuccess'))
        toLogin()
      }
    } catch (error) {
      loading.value = false
      console.log(t('register.validationFailed'), error)
    }
  }

  const toLogin = () => {
    setTimeout(() => {
      router.push('/login')
    }, 1000)
  }
</script>

<style lang="scss" scoped>
  @use '../login/index' as login;
  @use './index' as register;
  .login {
    .right-wrap {
      .login-wrap {
        position: absolute;
        inset: 0;
        width: 440px;
        height: 800px;
        padding: 0 5px;
        margin: auto;
        overflow: hidden;
        background-size: cover;
        border-radius: 5px;
      }
    }
  }
</style>
