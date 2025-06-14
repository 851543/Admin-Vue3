<template>
    <transition name="slide-fade">
        <div v-if="visible" class="chat-window">
            <div class="chat-header">
                <div class="header-content">
                    <div class="title-section">
                        <div class="title">小机器人</div>
                    </div>
                    <div class="close-btn" @click="$emit('close')">×</div>
                </div>
            </div>
            <div class="chat-body">
                <div class="messages" ref="messagesContainer">
                    <template v-for="(message, index) in messages" :key="index">
                        <!-- 时间分割线 -->
                        <div v-if="shouldShowTime(index)" class="time-divider">
                            <span class="date">{{ message.date }}</span>
                            <span class="time">{{ message.time }}</span>
                        </div>
                        <div :class="['message-wrapper', message.type, 'animate-in']" 
                             :style="{ animationDelay: `${index * 0.1}s` }">
                            <div class="message-content">
                                <div v-if="message.text" class="text-content">
                                    <writer 
                                        :text="message.text"
                                        :delay="30"
                                        :start-delay="message.type === 'received' ? 500 : 0"
                                    />
                                </div>
                                <div v-if="message.image" class="image-content">
                                    <img :src="message.image" class="message-image" @click="previewImage(message.image)" />
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
            </div>
            <div class="chat-footer">
                <div class="preview-area" v-if="tempImage">
                    <div class="preview-image-container">
                        <img :src="tempImage" class="preview-image" />
                        <div class="remove-image" @click="removeTempImage">×</div>
                    </div>
                </div>
                <div class="input-wrapper">
                    <input 
                        v-model="inputMessage" 
                        @keyup.enter="sendMessage"
                        type="text" 
                        placeholder="输入消息..."
                    />
                    <label class="upload-btn">
                        <input 
                            type="file" 
                            accept="image/*" 
                            @change="handleImageUpload" 
                            class="hidden-input"
                        />
                        <i class="image-icon">📷</i>
                    </label>
                    <button @click="sendMessage" class="send-btn">发送</button>
                </div>
            </div>
        </div>
    </transition>
    
    <!-- 图片预览模态框 -->
    <div v-if="previewVisible" class="image-preview-modal" @click="closePreview">
        <img :src="previewImageUrl" class="preview-image" />
    </div>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, onMounted, onUnmounted } from 'vue'
import writer from './writer.vue'

interface ChatMessage {
    text?: string
    image?: string
    type: 'sent' | 'received'
    time: string
    date: string
}

const formatTime = () => {
    const now = new Date()
    const month = now.getMonth() + 1
    const date = now.getDate()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const period = hours < 12 ? '上午' : '下午'
    const displayHours = hours % 12 || 12
    return {
        date: `${month}月${date}日`,
        time: `${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`
    }
}

const props = defineProps({
    visible: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['close'])

const inputMessage = ref('')
const tempImage = ref<string | null>(null)
const messages = ref<ChatMessage[]>([
    { 
        text: '你好！我是你的助手，有什么可以帮你的吗？', 
        type: 'received',
        ...formatTime()
    }
])

// 添加点击事件处理函数
const handleClickOutside = (event: MouseEvent) => {
    const chatWindow = document.querySelector('.chat-window')
    const botContainer = document.querySelector('#bot-container')
    if (chatWindow && !chatWindow.contains(event.target as Node) && 
        botContainer && !botContainer.contains(event.target as Node)) {
        emit('close')
    }
}

// 添加和移除事件监听器
onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})

const shouldShowTime = (index: number): boolean => {
    if (index === 0) return true
    const currentMessage = messages.value[index]
    const prevMessage = messages.value[index - 1]
    return currentMessage.date !== prevMessage.date || 
           (currentMessage.date === prevMessage.date && currentMessage.time !== prevMessage.time)
}

const sendMessage = () => {
    if (!inputMessage.value.trim() && !tempImage.value) return
    
    const timeInfo = formatTime()
    const messageData: ChatMessage = {
        type: 'sent',
        ...timeInfo
    }

    if (inputMessage.value.trim()) {
        messageData.text = inputMessage.value
    }

    if (tempImage.value) {
        messageData.image = tempImage.value
    }
    
    messages.value.push(messageData)
    
    // 模拟回复
    setTimeout(() => {
        messages.value.push({
            text: '收到你的消息了！',
            type: 'received',
            ...formatTime()
        })
    }, 1000)
    
    // 清空输入
    inputMessage.value = ''
    tempImage.value = null
}

const previewVisible = ref(false)
const previewImageUrl = ref('')

const previewImage = (url: string) => {
    previewImageUrl.value = url
    previewVisible.value = true
}

const closePreview = () => {
    previewVisible.value = false
}

const removeTempImage = () => {
    tempImage.value = null
}

const handleImageUpload = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
            const result = e.target?.result
            if (typeof result === 'string') {
                tempImage.value = result
            }
        }
        reader.readAsDataURL(file)
    }
}
</script>

<style lang="scss" scoped>
.chat-window {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 450px;
    height: 680px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    display: flex;
    flex-direction: column;
    z-index: 999;
    overflow: hidden;
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    }
}

.chat-header {
    padding: 16px 20px;
    background: linear-gradient(130deg, #24c6dc, #5433ff 41.07%, #ff0099 76.05%);
    color: white;
    box-shadow: 0 2px 12px rgba(84, 51, 255, 0.15);
    animation: gradientFlow 10s ease infinite;
    background-size: 200% 200%;

    .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .title-section {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .title {
        font-size: 18px;
        font-weight: 600;
    }

    .pending-count {
        font-size: 13px;
        opacity: 0.9;
        display: flex;
        gap: 4px;
        align-items: center;

        .count {
            background: rgba(255, 255, 255, 0.2);
            padding: 0 6px;
            border-radius: 10px;
            font-size: 12px;
        }
    }

    .close-btn {
        cursor: pointer;
        font-size: 24px;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.3s;

        &:hover {
            background: rgba(255, 255, 255, 0.1);
        }
    }
}

.chat-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #f8f9fa;

    .time-divider {
        text-align: center;
        margin: 16px 0;
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        
        .date {
            font-size: 13px;
            color: #666;
            background: #f8f9fa;
            padding: 4px 12px;
            border-radius: 12px;
            margin-bottom: 4px;
            transform: translateY(0);
            transition: transform 0.3s ease;
            animation: fadeInDown 0.5s ease forwards;
            
            &:hover {
                transform: translateY(-2px);
            }
        }
        
        .time {
            font-size: 12px;
            color: #999;
            display: flex;
            align-items: center;
            gap: 8px;
            animation: fadeInUp 0.5s ease forwards;
            
            &::before,
            &::after {
                content: '';
                width: 24px;
                height: 1px;
                background: #e0e0e0;
            }
        }
    }

    .messages {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .message-wrapper {
        display: flex;
        flex-direction: column;
        gap: 4px;
        max-width: 85%;
        margin: 4px 0;
        transform-origin: left center;
        opacity: 0;
        transform: translateY(20px);

        &.animate-in {
            animation: messageIn 0.5s ease forwards;
        }

        &.sent {
            align-self: flex-end;
            transform-origin: right center;

            .message-content {
                background: linear-gradient(130deg, #24c6dc, #5433ff);
                color: white;
                border-radius: 18px 18px 4px 18px;
                box-shadow: 0 2px 8px rgba(84, 51, 255, 0.15);
                position: relative;
                overflow: hidden;

                &::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                    transform: translateX(-100%);
                    animation: shine 3s infinite;
                }
            }
        }

        &.received {
            align-self: flex-start;

            .message-content {
                background: white;
                color: #333;
                border-radius: 18px 18px 18px 4px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                position: relative;
                overflow: hidden;

                &::after {
                    content: '';
                    position: absolute;
                    left: 0;
                    bottom: 0;
                    width: 100%;
                    height: 2px;
                    background: linear-gradient(90deg, #24c6dc, #5433ff);
                    transform: scaleX(0);
                    transform-origin: left;
                    transition: transform 0.3s ease;
                }

                &:hover::after {
                    transform: scaleX(1);
                }
            }
        }
    }

    .message-content {
        padding: 12px 16px;
        font-size: 14px;
        line-height: 1.6;
        word-break: break-word;
        letter-spacing: 0.3px;

        .text-content {
            margin-bottom: 8px;
        }

        .image-content {
            .message-image {
                max-width: 200px;
                max-height: 200px;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                
                &:hover {
                    transform: scale(1.05) rotate(1deg);
                    filter: brightness(1.1);
                }
            }
        }
    }

    .message-time {
        font-size: 12px;
        color: #999;
        padding: 0 4px;
    }
}

.chat-footer {
    padding: 16px;
    background: white;
    border-top: 1px solid #eee;

    .preview-area {
        padding: 8px 16px;
        border-top: 1px solid #eee;

        .preview-image-container {
            position: relative;
            display: inline-block;
            margin: 4px;

            .preview-image {
                max-width: 100px;
                max-height: 100px;
                border-radius: 8px;
            }

            .remove-image {
                position: absolute;
                top: -8px;
                right: -8px;
                width: 20px;
                height: 20px;
                background: rgba(0, 0, 0, 0.5);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 14px;

                &:hover {
                    background: rgba(0, 0, 0, 0.7);
                }
            }
        }
    }

    .input-wrapper {
        display: flex;
        gap: 8px;
        background: #f8f9fa;
        padding: 8px;
        border-radius: 24px;

        .upload-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            cursor: pointer;
            border-radius: 50%;
            transition: background-color 0.3s;

            &:hover {
                background-color: rgba(0, 0, 0, 0.05);
            }

            .hidden-input {
                display: none;
            }

            .image-icon {
                font-size: 20px;
                transition: transform 0.3s ease;
            }
            
            &:hover .image-icon {
                transform: scale(1.2);
            }
        }
    }

    input {
        flex: 1;
        border: none;
        background: transparent;
        padding: 8px 12px;
        outline: none;
        font-size: 14px;

        &::placeholder {
            color: #999;
        }
    }

    .send-btn {
        padding: 8px 20px;
        background: linear-gradient(130deg, #24c6dc, #5433ff);
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        
        &::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 150%;
            height: 150%;
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 60%);
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
            transition: transform 0.5s ease, opacity 0.5s ease;
        }
        
        &:hover {
            transform: translateY(-2px);
            
            &::before {
                transform: translate(-50%, -50%) scale(1);
                opacity: 1;
            }
        }
    }
}

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
}

.image-preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999;

    .preview-image {
        max-width: 80%;
        max-height: 80%;
        object-fit: contain;
    }
}

@keyframes messageIn {
    0% {
        opacity: 0;
        transform: translateY(20px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes shine {
    0% { transform: translateX(-100%); }
    20% { transform: translateX(100%); }
    100% { transform: translateX(100%); }
}

@keyframes gradientFlow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

@keyframes fadeInDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style> 