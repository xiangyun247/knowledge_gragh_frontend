<template>
  <div class="animated-background"></div>
</template>

<script>
export default {
  name: 'AnimatedBackground'
}
</script>

<style>
.animated-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0a0e27 0%, #1c1f3a 50%, #0a0e27 100%);
  z-index: -1;
  overflow: hidden;
}

.animated-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(76, 201, 240, 0.1) 0%, rgba(255, 45, 149, 0.1) 50%, transparent 100%);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg) translateX(-50%);
  }
  to {
    transform: rotate(360deg) translateX(-50%);
  }
}
</style>