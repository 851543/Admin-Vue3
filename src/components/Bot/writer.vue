<template>
    <span :class="['typewriter', { 'typing-complete': isComplete }]">{{ displayText }}</span>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
    text: string
    delay?: number
    startDelay?: number
}>()

const displayText = ref('')
const isComplete = ref(false)

const typeText = async () => {
    isComplete.value = false
    displayText.value = ''
    if (props.startDelay) {
        await new Promise(resolve => setTimeout(resolve, props.startDelay))
    }
    
    for (let i = 0; i <= props.text.length; i++) {
        displayText.value = props.text.slice(0, i)
        await new Promise(resolve => setTimeout(resolve, props.delay || 30))
    }
    
    // 打字完成后设置状态
    isComplete.value = true
}

watch(() => props.text, () => {
    typeText()
})

onMounted(() => {
    typeText()
})
</script>

<style scoped>
.typewriter {
    border-right: 2px solid transparent;
    animation: cursor 0.8s infinite;
    white-space: pre-wrap;
    word-break: break-word;
}

.typing-complete {
    border-right: none;
    animation: none;
}

@keyframes cursor {
    0%, 100% { border-color: transparent; }
    50% { border-color: currentColor; }
}
</style> 