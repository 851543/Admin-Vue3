<template>
  <div class="page-content user">
    <div class="content">
      <div class="left-wrap">
        <div class="user-wrap box-style">
          <img class="bg" src="@imgs/avatar/bg.png" />
          <img class="avatar" :src="avatarUrl" @click="handleClickAvatar" />
          <h2 class="name">{{ userInfo.name }}</h2>

          <div class="outer-info">
            <div>
              <i class="iconfont-sys">&#xe608;</i>
              <span>{{ info.nickName }}</span>
            </div>
            <div v-if="info.email">
              <i class="iconfont-sys">&#xe72e;</i>
              <span>{{ info.email }}</span>
            </div>
            <div v-if="info.deptName && info.postGroup">
              <i class="iconfont-sys">&#xe811;</i>
              <span>{{ info.deptName }} - {{ info.postGroup }}</span>
            </div>
            <div v-if="info.roleGroup">
              <i class="iconfont-sys">&#xe724;</i>
              <span>{{ info.roleGroup }}</span>
            </div>
          </div>

          <div class="lables">
            <h3>{{ t('user.tags.title') }}</h3>
            <div>
              <div v-for="item in lableList" :key="item">
                {{ item }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="right-wrap">
        <div class="info box-style">
          <h1 class="title">{{ t('user.basicSettings') }}</h1>

          <el-form
            :model="form"
            class="form"
            ref="ruleFormRef"
            :rules="rules"
            label-width="86px"
            label-position="top"
          >
            <el-row>
              <el-form-item :label="t('user.nickname')" prop="nickName">
                <el-input v-model="form.nickName" :disabled="!isEdit" />
              </el-form-item>
              <el-form-item :label="t('user.gender')" prop="sex" class="right-input">
                <el-select v-model="form.sex" :placeholder="t('common.select')" :disabled="!isEdit">
                  <el-option
                    v-for="item in options"
                    :key="item.value"
                    :label="t(item.label)"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-row>

            <el-row>
              <el-form-item :label="t('user.phone')" prop="phonenumber">
                <el-input v-model="form.phonenumber" :disabled="!isEdit" />
              </el-form-item>
              <el-form-item :label="t('user.email')" prop="email" class="right-input">
                <el-input v-model="form.email" :disabled="!isEdit" />
              </el-form-item>
            </el-row>

            <div class="el-form-item-right">
              <el-button type="primary" style="width: 90px" v-ripple @click="edit">
                {{ isEdit ? t('common.save') : t('common.edit') }}
              </el-button>
            </div>
          </el-form>
        </div>

        <div class="info box-style" style="margin-top: 20px">
          <h1 class="title">{{ t('user.changePassword') }}</h1>

          <el-form
            :model="pwdForm"
            class="form"
            label-width="86px"
            label-position="top"
            :rules="pwdRules"
            ref="pwdFormRef"
          >
            <el-form-item :label="t('user.currentPassword')" prop="password">
              <el-input v-model="pwdForm.password" type="password" :disabled="!isEditPwd" />
            </el-form-item>

            <el-form-item :label="t('user.newPassword')" prop="newPassword">
              <el-input v-model="pwdForm.newPassword" type="password" :disabled="!isEditPwd" />
            </el-form-item>

            <el-form-item :label="t('user.confirmPassword')" prop="confirmPassword">
              <el-input v-model="pwdForm.confirmPassword" type="password" :disabled="!isEditPwd" />
            </el-form-item>

            <div class="el-form-item-right">
              <el-button type="primary" style="width: 90px" v-ripple @click="editPwd">
                {{ isEditPwd ? t('common.save') : t('common.edit') }}
              </el-button>
            </div>
          </el-form>
        </div>
      </div>
    </div>

    <!-- 头像上传弹窗 -->
    <el-dialog v-model="dialogVisible" width="800px" @close="handleDialogClose">
      <CutterImg
        v-model:imgUrl="avatarUrl"
        :boxWidth="500"
        :boxHeight="360"
        :cutWidth="200"
        :cutHeight="200"
        :quality="1"
        :tool="true"
        :showPreview="true"
        :originalGraph="false"
        @onSubmit="handleAvatarSuccess"
        :title="t('user.avatar.change')"
        :previewTitle="t('user.avatar.preview')"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
  import { useUserStore } from '@/store/modules/user'
  import { base64ToBlob } from '@/utils/utils'
  import { FormInstance, FormRules } from 'element-plus'
  import defaultAvatar from '@/assets/img/avatar/default-avatar.png'
  import { UserService } from '@/api/system/userApi'
  import { useI18n } from 'vue-i18n'
  import CutterImg from '@/components/Widgets/CutterImg.vue'
  import { ElMessage } from 'element-plus'

  const { t } = useI18n()
  const userStore = useUserStore()
  const userInfo = computed(() => userStore.getUserInfo)

  const isEdit = ref(false)
  const isEditPwd = ref(false)

  const info = reactive({
    nickName: '',
    email: '',
    deptName: '',
    postGroup: '',
    roleGroup: ''
  })

  const form = reactive({
    userName: '',
    nickName: '',
    email: '',
    phonenumber: '',
    sex: ''
  })

  const pwdForm = reactive({
    password: '123456',
    newPassword: '123456',
    confirmPassword: '123456'
  })

  const ruleFormRef = ref<FormInstance>()

  const rules = reactive<FormRules>({
    nickName: [
      {
        required: true,
        message: t('validation.required', { field: t('user.nickname') }),
        trigger: 'blur'
      },
      { min: 2, max: 50, message: t('validation.length', { min: 2, max: 30 }), trigger: 'blur' }
    ],
    email: [
      {
        required: true,
        message: t('validation.required', { field: t('user.email') }),
        trigger: 'blur'
      }
    ],
    phonenumber: [
      {
        required: true,
        message: t('validation.required', { field: t('user.phone') }),
        trigger: 'blur'
      }
    ],
    address: [
      {
        required: true,
        message: t('validation.required', { field: t('user.address') }),
        trigger: 'blur'
      }
    ],
    sex: [
      {
        required: true,
        message: t('validation.required', { field: t('user.gender') }),
        trigger: 'blur'
      }
    ]
  })

  const pwdRules = reactive<FormRules>({
    password: [
      {
        required: true,
        message: t('validation.required', { field: t('user.currentPassword') }),
        trigger: 'blur'
      }
    ],
    newPassword: [
      {
        required: true,
        message: t('validation.required', { field: t('user.newPassword') }),
        trigger: 'blur'
      }
    ],
    confirmPassword: [
      {
        required: true,
        message: t('validation.required', { field: t('user.confirmPassword') }),
        trigger: 'blur'
      },
      {
        validator: (rule: any, value: string, callback: (error?: Error) => void) => {
          if (value !== pwdForm.newPassword) {
            callback(new Error(t('validation.passwordMismatch')))
          } else {
            callback()
          }
        },
        trigger: 'blur'
      }
    ]
  })

  const GENDER_OPTIONS = {
    MALE: '0',
    FEMALE: '1'
  }

  const options = [
    {
      value: GENDER_OPTIONS.MALE,
      label: 'gender.male'
    },
    {
      value: GENDER_OPTIONS.FEMALE,
      label: 'gender.female'
    }
  ]

  const lableList: Array<string> = [
    t('user.tags.focused'),
    t('user.tags.creative'),
    t('user.tags.inclusive')
  ]

  onMounted(() => {
    getProfile()
  })

  const edit = async () => {
    if (!isEdit.value) {
      isEdit.value = true
      return
    }

    if (!ruleFormRef.value) return

    await ruleFormRef.value.validate(async (valid) => {
      if (valid) {
        const res = await UserService.editProfile(form)
        if (res.code === 200) {
          ElMessage.success(res.msg)
          getProfile()
          isEdit.value = false
        }
      }
    })
  }

  const pwdFormRef = ref<FormInstance>()
  const editPwd = async () => {
    if (!isEditPwd.value) {
      isEditPwd.value = true
      return
    }
    if (!pwdFormRef.value) return

    await pwdFormRef.value.validate(async (valid) => {
      if (valid) {
        const res = await UserService.editProfilePwd({
          oldPassword: pwdForm.password,
          newPassword: pwdForm.newPassword
        })
        if (res.code === 200) {
          ElMessage.success(res.msg)
          isEditPwd.value = false
        }
      }
    })
  }

  // 获取个人信息
  const getProfile = async () => {
    const res = await UserService.getProfile()
    if (res.code === 200) {
      info.nickName = res.data.nickName
      info.email = res.data.email
      info.deptName = res.data.dept.deptName
      info.postGroup = res.postGroup
      info.roleGroup = res.roleGroup

      form.userName = res.data.userName
      form.nickName = res.data.nickName
      form.email = res.data.email
      form.phonenumber = res.data.phonenumber
      form.sex = res.data.sex
    }
  }

  // 头像上传相关
  const dialogVisible = ref(false)

  const avatarUrl = ref(userInfo.value.avatar || defaultAvatar)

  const handleClickAvatar = () => {
    dialogVisible.value = true
    avatarUrl.value = userInfo.value.avatar || defaultAvatar
  }
  const handleAvatarSuccess = async (imageData: string) => {
    dialogVisible.value = false
    const blob = base64ToBlob(imageData)
    const data = new FormData()
    data.append('avatarfile', blob, 'avatar')
    const res = await UserService.editProfileAvatar(data)
    if (res.code === 200) {
      userStore.setAvatar(res.imgUrl)
      avatarUrl.value = userStore.info.avatar || defaultAvatar
      ElMessage.success(res.msg)
    }
  }

  const handleDialogClose = () => {
    dialogVisible.value = false
  }
</script>

<style lang="scss">
  .user {
    .icon {
      width: 1.4em;
      height: 1.4em;
      overflow: hidden;
      vertical-align: -0.15em;
      fill: currentcolor;
    }
  }
</style>

<style lang="scss" scoped>
  .page-content {
    width: 100%;
    height: 100%;
    padding: 0 !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;

    $box-radius: calc(var(--custom-radius) + 4px);

    .box-style {
      border: 1px solid var(--art-border-color);
    }

    .content {
      position: relative;
      display: flex;
      justify-content: space-between;
      margin-top: 10px;

      .left-wrap {
        width: 450px;
        margin-right: 25px;

        .user-wrap {
          position: relative;
          height: 600px;
          padding: 35px 40px;
          overflow: hidden;
          text-align: center;
          background: var(--art-main-bg-color);
          border-radius: $box-radius;

          .bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 200px;
            object-fit: cover;
          }

          .avatar {
            position: relative;
            z-index: 10;
            width: 80px;
            height: 80px;
            margin-top: 120px;
            object-fit: cover;
            border: 2px solid #fff;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.3s;

            &:hover {
              transform: scale(1.05);
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
            }
          }

          .name {
            margin-top: 20px;
            font-size: 22px;
            font-weight: 400;
          }

          .des {
            margin-top: 20px;
            font-size: 14px;
          }

          .outer-info {
            width: 300px;
            margin: auto;
            margin-top: 30px;
            text-align: left;

            > div {
              margin-top: 10px;

              span {
                margin-left: 8px;
                font-size: 14px;
              }
            }
          }

          .lables {
            margin-top: 40px;

            h3 {
              font-size: 15px;
              font-weight: 500;
            }

            > div {
              display: flex;
              flex-wrap: wrap;
              justify-content: center;
              margin-top: 15px;

              > div {
                padding: 3px 6px;
                margin: 0 10px 10px 0;
                font-size: 12px;
                background: var(--art-main-bg-color);
                border: 1px solid var(--art-border-color);
                border-radius: 2px;
              }
            }
          }
        }

        .gallery {
          margin-top: 25px;
          border-radius: 10px;

          .item {
            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }
        }
      }

      .right-wrap {
        flex: 1;
        overflow: hidden;
        border-radius: $box-radius;

        .info {
          background: var(--art-main-bg-color);
          border-radius: $box-radius;

          .title {
            padding: 15px 25px;
            font-size: 20px;
            font-weight: 400;
            color: var(--art-text-gray-800);
            border-bottom: 1px solid var(--art-border-color);
          }

          .form {
            box-sizing: border-box;
            padding: 30px 25px;

            > .el-row {
              .el-form-item {
                width: calc(50% - 10px);
              }

              .el-input,
              .el-select {
                width: 100%;
              }
            }

            .right-input {
              margin-left: 20px;
            }

            .el-form-item-right {
              display: flex;
              align-items: center;
              justify-content: end;

              .el-button {
                width: 110px !important;
              }
            }
          }
        }
      }
    }
  }

  @media only screen and (max-width: $device-ipad-vertical) {
    .page-content {
      .content {
        display: block;
        margin-top: 5px;

        .left-wrap {
          width: 100%;
        }

        .right-wrap {
          width: 100%;
          margin-top: 15px;
        }
      }
    }
  }
</style>
