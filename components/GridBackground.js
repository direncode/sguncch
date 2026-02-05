import { useEffect, useRef } from 'react'

export default function GridBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationId
    let mouseX = 0
    let mouseY = 0
    let targetMouseX = 0
    let targetMouseY = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX
      targetMouseY = e.clientY
    }

    const drawGrid = () => {
      const { width, height } = canvas
      ctx.clearRect(0, 0, width, height)

      // Smooth mouse following
      mouseX += (targetMouseX - mouseX) * 0.05
      mouseY += (targetMouseY - mouseY) * 0.05

      const gridSize = 60
      const lineWidth = 1

      // Draw vertical lines
      ctx.beginPath()
      for (let x = 0; x <= width; x += gridSize) {
        const distFromMouse = Math.abs(x - mouseX)
        const intensity = Math.max(0, 1 - distFromMouse / 300)
        const alpha = 0.03 + intensity * 0.07

        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.lineWidth = lineWidth
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
      }
      ctx.stroke()

      // Draw horizontal lines
      ctx.beginPath()
      for (let y = 0; y <= height; y += gridSize) {
        const distFromMouse = Math.abs(y - mouseY)
        const intensity = Math.max(0, 1 - distFromMouse / 300)
        const alpha = 0.03 + intensity * 0.07

        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
        ctx.lineWidth = lineWidth
        ctx.moveTo(0, y)
        ctx.lineTo(width, y)
      }
      ctx.stroke()

      // Draw intersection points near mouse
      const startX = Math.floor((mouseX - 200) / gridSize) * gridSize
      const endX = Math.ceil((mouseX + 200) / gridSize) * gridSize
      const startY = Math.floor((mouseY - 200) / gridSize) * gridSize
      const endY = Math.ceil((mouseY + 200) / gridSize) * gridSize

      for (let x = startX; x <= endX; x += gridSize) {
        for (let y = startY; y <= endY; y += gridSize) {
          const dist = Math.sqrt(Math.pow(x - mouseX, 2) + Math.pow(y - mouseY, 2))
          if (dist < 200) {
            const alpha = (1 - dist / 200) * 0.3
            ctx.beginPath()
            ctx.arc(x, y, 2, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
            ctx.fill()
          }
        }
      }

      // Radial gradient from top
      const gradient = ctx.createRadialGradient(
        width / 2, -height * 0.2, 0,
        width / 2, -height * 0.2, height
      )
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.02)')
      gradient.addColorStop(1, 'transparent')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)

      animationId = requestAnimationFrame(drawGrid)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)
    drawGrid()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: '#000000' }}
    />
  )
}
