<template>
  <div
    class="notice"
    v-show="visible"
    :style="{
      transform: show ? 'scaleY(1)' : 'scaleY(0.9)',
      opacity: show ? 1 : 0
    }"
    @click.stop=""
  >
    <div class="header">
      <span class="text">{{ $t('notice.title') }}</span>
      <span class="btn">{{ $t('notice.btnRead') }}</span>
    </div>
    <ul class="bar">
      <li
        v-for="(item, index) in barList"
        :key="index"
        :class="{ active: barActiveIndex === index }"
        @click="changeBar(index)"
      >
        {{ item.name }} ({{ item.num }})
      </li>
    </ul>
    <div class="content">
      <div class="scroll">
        <!-- 通知 -->
        <ul class="notice-list" v-show="barActiveIndex === 0">
          <li v-for="(item, index) in noticeList" :key="index">
            <div
              class="icon"
              :style="{
                background: getNoticeStyle(item.noticeType).backgroundColor + '!important'
              }"
            >
              <i
                class="iconfont-sys"
                :style="{ color: getNoticeStyle(item.noticeType).iconColor + '!important' }"
                v-html="getNoticeStyle(item.noticeType).icon"
              >
              </i>
            </div>
            <div class="text">
              <h4>{{ item.noticeTitle }}</h4>
              <p>{{ item.createTime }}</p>
            </div>
          </li>
        </ul>
        <!-- 消息 -->
        <ul class="user-list" v-show="barActiveIndex === 1">
          <li v-for="(item, index) in msgList" :key="index">
            <div class="avatar">
              <img :src="item.avatar" />
            </div>
            <div class="text">
              <h4>{{ item.title }}</h4>
              <p>{{ item.time }}</p>
            </div>
          </li>
        </ul>
        <!-- 待办 -->
        <ul class="base" v-show="barActiveIndex === 3">
          <li v-for="(item, index) in pendingList" :key="index">
            <h4>{{ item.title }}</h4>
            <p>{{ item.time }}</p>
          </li>
        </ul>

        <div class="empty-tips" v-show="barActiveIndex === 0 && noticeList.length === 0">
          <i class="iconfont-sys">&#xe8d7;</i>
          <p>{{ $t('notice.text[0]') }}{{ barList[barActiveIndex].name }}</p>
        </div>
        <div class="empty-tips" v-show="barActiveIndex === 1 && msgList.length === 0">
          <i class="iconfont-sys">&#xe8d7;</i>
          <p>{{ $t('notice.text[0]') }}{{ barList[barActiveIndex].name }}</p>
        </div>
        <div class="empty-tips" v-show="barActiveIndex === 2 && pendingList.length === 0">
          <i class="iconfont-sys">&#xe8d7;</i>
          <p>{{ $t('notice.text[0]') }}{{ barList[barActiveIndex].name }}</p>
        </div>
      </div>
      <div class="btn-wrapper">
        <el-button class="view-all" @click="handleViewAll" v-ripple>
          {{ $t('notice.viewAll') }}
        </el-button>
      </div>
    </div>

    <div style="height: 100px"></div>
  </div>
</template>

<script setup lang="ts">
  import avatar from '@/assets/img/avatar/default-avatar.png'
  import AppConfig from '@/config'
  import { useI18n } from 'vue-i18n'
  import type { NoticeResult } from '@/types/system/notice'

  const { t } = useI18n()

  const props = defineProps({
    value: {
      type: Boolean,
      default: false
    }
  })

  watch(
    () => props.value,
    () => {
      showNotice(props.value)
    }
  )

  const show = ref(false)
  const visible = ref(false)
  const barActiveIndex = ref(0)
  const pendingList: any = []

  const barList = ref([
    {
      name: computed(() => t('notice.bar[0]')),
      num: 1
    },
    {
      name: computed(() => t('notice.bar[1]')),
      num: 1
    },
    {
      name: computed(() => t('notice.bar[2]')),
      num: 0
    }
  ])

  const noticeList = ref<NoticeResult[]>([])

  import { NoticeService } from '@/api/system/noticeApi'
  // 获取通知公告列表
  const getNoticeList = async () => {
    const res = await NoticeService.listNotice({})
    noticeList.value = res.rows
  }

  onMounted(() => {
    getNoticeList()
  })

  const msgList: any = [
    {
      title: '阿俊 关注了你',
      time: '2021-2-26 23:50',
      avatar: avatar
    }
  ]

  const changeBar = (index: number) => {
    barActiveIndex.value = index
  }

  const getRandomColor = () => {
    const index = Math.floor(Math.random() * AppConfig.systemMainColor.length)
    return AppConfig.systemMainColor[index]
  }

  const noticeStyleMap = {
    email: {
      icon: '&#xe72e;',
      iconColor: 'rgb(var(--art-warning))',
      backgroundColor: 'rgb(var(--art-bg-warning))'
    },
    message: {
      icon: '&#xe747;',
      iconColor: 'rgb(var(--art-success))',
      backgroundColor: 'rgb(var(--art-bg-success))'
    },
    collection: {
      icon: '&#xe714;',
      iconColor: 'rgb(var(--art-danger))',
      backgroundColor: 'rgb(var(--art-bg-danger))'
    },
    user: {
      icon: '&#xe608;',
      iconColor: 'rgb(var(--art-info))',
      backgroundColor: 'rgb(var(--art-bg-info))'
    },
    notice: {
      icon: '&#xe6c2;',
      iconColor: 'rgb(var(--art-primary))',
      backgroundColor: 'rgb(var(--art-bg-primary))'
    }
  }

  const getNoticeStyle = (type: string) => {
    const defaultStyle = {
      icon: '&#xe747;',
      iconColor: '#FFFFFF',
      backgroundColor: getRandomColor()
    }

    const style = noticeStyleMap[type as keyof typeof noticeStyleMap] || defaultStyle

    return {
      ...style,
      backgroundColor: style.backgroundColor
    }
  }

  const showNotice = (open: boolean) => {
    if (open) {
      visible.value = open
      setTimeout(() => {
        show.value = open
      }, 5)
    } else {
      show.value = open
      setTimeout(() => {
        visible.value = open
      }, 350)
    }
  }

  // 查看全部
  const handleViewAll = () => {
    switch (barActiveIndex.value) {
      case 0:
        handleNoticeAll()
        break
      case 1:
        handleMsgAll()
        break
      case 2:
        handlePendingAll()
        break
    }
  }

  const handleNoticeAll = () => {}
  const handleMsgAll = () => {}
  const handlePendingAll = () => {}
</script>

<style lang="scss" scoped>
  @use './style';
</style>
