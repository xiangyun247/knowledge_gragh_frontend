<template>
  <div class="typing-indicator-container">
    <div class="typing-dots">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>
    <div class="typing-text">正在回复...</div>
  </div>
</template>

<script>
export default {
  name: 'TypingIndicator'
}
</script>

<style>
.typing-indicator-container {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  color: rgba(255, 255, 255, 0.7);
}

.typing-dots {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #00f5d4;
  animation: typingBounce 1.4s infinite ease-in-out both;
}

.typing-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typingBounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
    box-shadow: 0 0 8px rgba(0, 255, 255, 0.6);
  }
}

.typing-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}
</style>
