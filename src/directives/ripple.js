export default {
  bind(el) {
    // 确保父元素可以正确裁剪波纹
    const computedPosition = window.getComputedStyle(el).position
    if (computedPosition === 'static' || !computedPosition) {
      el.style.position = 'relative'
    }
    el.style.overflow = el.style.overflow === 'visible' || !el.style.overflow ? 'hidden' : el.style.overflow

    el.addEventListener('click', function (e) {
      const rect = el.getBoundingClientRect()
      const ripple = document.createElement('span')
      const size = Math.max(rect.width, rect.height)

      ripple.className = 'neo-ripple'
      ripple.style.width = ripple.style.height = size + 'px'
      ripple.style.left = e.clientX - rect.left - size / 2 + 'px'
      ripple.style.top = e.clientY - rect.top - size / 2 + 'px'

      el.appendChild(ripple)

      ripple.addEventListener('animationend', () => {
        ripple.remove()
      })
    })
  }
}







