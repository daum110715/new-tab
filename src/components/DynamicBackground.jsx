import { useEffect, useRef } from 'react'

function DynamicBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animationFrameId
    
    // Set size dynamically
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Palette: Sleek, high-contrast digital neon colors
    const colors = [
      '#4f46e5', // Deep Indigo (Indigo 600)
      '#06b6d4', // Vibrant Cyan (Cyan 500)
      '#d946ef', // Neon Fuchsia (Fuchsia 500)
      '#8b5cf6', // Electric Purple (Purple 500)
    ]

    // Create organic moving blobs
    const blobs = colors.map((color, i) => {
      const radius = Math.min(canvas.width, canvas.height) * (0.28 + Math.random() * 0.15)
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.0,
        vy: (Math.random() - 0.5) * 1.0,
        radius,
        color,
        tx: Math.random() * canvas.width,
        ty: Math.random() * canvas.height,
      }
    })

    // Track mouse coordinate for subtle interactive parallax attraction
    const mouse = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      tx: canvas.width / 2,
      ty: canvas.height / 2,
    }

    const handleMouseMove = (e) => {
      mouse.tx = e.clientX
      mouse.ty = e.clientY
    }
    window.addEventListener('mousemove', handleMouseMove)

    // Animation loop
    const animate = () => {
      // Render deep cosmic backdrop
      ctx.fillStyle = '#080811'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Smooth mouse position interpolation
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05

      blobs.forEach((blob, index) => {
        // If near target, select a new target coordinate
        if (Math.abs(blob.x - blob.tx) < 20 && Math.abs(blob.y - blob.ty) < 20) {
          blob.tx = Math.random() * canvas.width
          blob.ty = Math.random() * canvas.height
        }

        // Apply acceleration towards target
        const ax = (blob.tx - blob.x) * 0.0003
        const ay = (blob.ty - blob.y) * 0.0003

        blob.vx += ax
        blob.vy += ay

        // Speed limit to ensure slow, organic floatiness
        const speed = Math.sqrt(blob.vx * blob.vx + blob.vy * blob.vy)
        const maxSpeed = 1.2
        if (speed > maxSpeed) {
          blob.vx = (blob.vx / speed) * maxSpeed
          blob.vy = (blob.vy / speed) * maxSpeed
        }

        blob.x += blob.vx
        blob.y += blob.vy

        // Pull the first blob gently towards the mouse to create interactive depth
        if (index === 0) {
          blob.x += (mouse.x - blob.x) * 0.008
          blob.y += (mouse.y - blob.y) * 0.008
        }

        // Draw radial gradient shape
        const gradient = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.radius
        )
        gradient.addColorStop(0, blob.color)
        gradient.addColorStop(1, 'transparent')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2)
        ctx.fill()
      })

      // Add a subtle white-blue ambient highlight following the mouse cursor
      const mouseGradient = ctx.createRadialGradient(
        mouse.x, mouse.y, 0,
        mouse.x, mouse.y, 200
      )
      mouseGradient.addColorStop(0, 'rgba(99, 102, 241, 0.15)') // Indigo highlights
      mouseGradient.addColorStop(1, 'transparent')
      ctx.fillStyle = mouseGradient
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, 200, 0, Math.PI * 2)
      ctx.fill()

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="dynamic-bg-canvas"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        filter: 'blur(110px) saturate(1.8)',
        opacity: 0.9,
        pointerEvents: 'none',
        background: '#080811',
      }}
    />
  )
}

export default DynamicBackground
