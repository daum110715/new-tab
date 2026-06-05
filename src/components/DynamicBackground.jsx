import { useEffect, useRef } from 'react'

function DynamicBackground({ type = 'dynamic', theme }) {
  const canvasRef = useRef(null)
  const themeRef = useRef(theme)
  const typeRef = useRef(type)

  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  useEffect(() => {
    typeRef.current = type
  }, [type])

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

    // Track mouse coordinate
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

    // --- 1. State for Dynamic Blobs ---
    const blobs = Array.from({ length: 4 }).map((_, i) => {
      const radius = Math.min(canvas.width, canvas.height) * (0.28 + Math.random() * 0.15)
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1.0,
        vy: (Math.random() - 0.5) * 1.0,
        radius,
        tx: Math.random() * canvas.width,
        ty: Math.random() * canvas.height,
      }
    })

    const blobsDarkPalette = [
      '#3b82f6', // Fresh Sky Blue
      '#0d9488', // Clean Teal
      '#10b981', // Mint Green
      '#6366f1', // Soft Indigo
    ]

    const blobsLightPalette = [
      'rgba(56, 189, 248, 0.18)',  // Soft Sky Blue
      'rgba(45, 212, 191, 0.18)',  // Fresh Teal
      'rgba(52, 211, 153, 0.15)',  // Mint Green
      'rgba(129, 140, 248, 0.18)', // Soft Indigo
    ]

    // --- 2. State for Particles (Constellation) ---
    // Using 50 particles for a very fresh, clean, uncluttered layout
    const particles = Array.from({ length: 50 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.25, // Extremely slow drift
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 1.2 + 0.8, // Tiny dots
    }))

    // --- 3. State for Aurora Sine Waves ---
    const auroraWaves = [
      { freq: 0.0015, amp: 40, base: 0.70, speed: 0.001, colorDark: 'rgba(45, 212, 191, 0.06)', colorLight: 'rgba(45, 212, 191, 0.04)' },  // Teal
      { freq: 0.0022, amp: 30, base: 0.78, speed: -0.0008, colorDark: 'rgba(59, 130, 246, 0.05)', colorLight: 'rgba(59, 130, 246, 0.03)' }, // Blue
      { freq: 0.0010, amp: 50, base: 0.65, speed: 0.0005, colorDark: 'rgba(129, 140, 248, 0.04)', colorLight: 'rgba(129, 140, 248, 0.02)' }  // Indigo
    ]
    const auroraPhases = [0, 0, 0]

    // --- 4. State for Starfield (3D Warp) ---
    const maxDepth = 1000
    const stars = Array.from({ length: 120 }).map(() => {
      const x = (Math.random() - 0.5) * canvas.width * 2
      const y = (Math.random() - 0.5) * canvas.height * 2
      const z = Math.random() * maxDepth
      return {
        x,
        y,
        z,
        prevZ: z
      }
    })

    // Animation loop
    const animate = () => {
      const currentTheme = themeRef.current
      const currentType = typeRef.current

      // Clear screen with current theme background color
      ctx.fillStyle = currentTheme === 'light' ? '#f4f4f7' : '#080811'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Smooth mouse coordinate interpolation
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05

      if (currentType === 'dynamic') {
        // --- 1. RENDER ORGANIC BLOBS ---
        const activePalette = currentTheme === 'light' ? blobsLightPalette : blobsDarkPalette

        blobs.forEach((blob, index) => {
          if (Math.abs(blob.x - blob.tx) < 20 && Math.abs(blob.y - blob.ty) < 20) {
            blob.tx = Math.random() * canvas.width
            blob.ty = Math.random() * canvas.height
          }

          const ax = (blob.tx - blob.x) * 0.0003
          const ay = (blob.ty - blob.y) * 0.0003

          blob.vx += ax
          blob.vy += ay

          const speed = Math.sqrt(blob.vx * blob.vx + blob.vy * blob.vy)
          const maxSpeed = 1.2
          if (speed > maxSpeed) {
            blob.vx = (blob.vx / speed) * maxSpeed
            blob.vy = (blob.vy / speed) * maxSpeed
          }

          blob.x += blob.vx
          blob.y += blob.vy

          if (index === 0) {
            blob.x += (mouse.x - blob.x) * 0.008
            blob.y += (mouse.y - blob.y) * 0.008
          }

          const gradient = ctx.createRadialGradient(
            blob.x, blob.y, 0,
            blob.x, blob.y, blob.radius
          )
          const color = activePalette[index % activePalette.length]
          gradient.addColorStop(0, color)
          gradient.addColorStop(1, 'transparent')

          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2)
          ctx.fill()
        })

        // Ambient mouse highlight
        const mouseGradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 200
        )
        const highlightColor = currentTheme === 'light' 
          ? 'rgba(56, 189, 248, 0.08)' 
          : 'rgba(45, 212, 191, 0.15)'
        mouseGradient.addColorStop(0, highlightColor)
        mouseGradient.addColorStop(1, 'transparent')
        ctx.fillStyle = mouseGradient
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 200, 0, Math.PI * 2)
        ctx.fill()

      } else if (currentType === 'particles') {
        // --- 2. RENDER PARTICLES (CONSTELLATION NET) ---
        const dotColor = currentTheme === 'light' ? 'rgba(30, 41, 59, 0.2)' : 'rgba(147, 197, 253, 0.35)'
        const lineColor = currentTheme === 'light' ? '30, 41, 59' : '147, 197, 253'

        // Move and draw particles
        particles.forEach((p) => {
          p.x += p.vx
          p.y += p.vy

          // Bounce off boundary
          if (p.x < 0 || p.x > canvas.width) p.vx *= -1
          if (p.y < 0 || p.y > canvas.height) p.vy *= -1

          // Gentle mouse attraction
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist < 120) {
            p.x += dx * 0.003
            p.y += dy * 0.003
          }

          // Draw dot
          ctx.fillStyle = dotColor
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
          ctx.fill()
        })

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
          const p1 = particles[i]
          for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j]
            const dx = p1.x - p2.x
            const dy = p1.y - p2.y
            const dist = Math.sqrt(dx*dx + dy*dy)

            if (dist < 90) {
              const alpha = (1 - dist / 90) * (currentTheme === 'light' ? 0.05 : 0.12)
              ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`
              ctx.lineWidth = 0.5
              ctx.beginPath()
              ctx.moveTo(p1.x, p1.y)
              ctx.lineTo(p2.x, p2.y)
              ctx.stroke()
            }
          }

          // Draw connection to mouse
          const dx = p1.x - mouse.x
          const dy = p1.y - mouse.y
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist < 110) {
            const alpha = (1 - dist / 110) * (currentTheme === 'light' ? 0.08 : 0.16)
            ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.stroke()
          }
        }

      } else if (currentType === 'aurora') {
        // --- 3. RENDER SIRI/AURORA WAVES ---
        auroraWaves.forEach((wave, index) => {
          auroraPhases[index] += wave.speed

          ctx.beginPath()
          ctx.moveTo(0, canvas.height)

          for (let x = 0; x <= canvas.width; x += 15) {
            // Sine wave formula
            let y = Math.sin(x * wave.freq + auroraPhases[index]) * wave.amp
            // Subtle mouse vertical displacement
            const mouseFactor = (1 - mouse.y / canvas.height) * 16
            y += mouseFactor * Math.sin(x * 0.001)

            const yCoord = canvas.height * wave.base + y
            ctx.lineTo(x, yCoord)
          }

          ctx.lineTo(canvas.width, canvas.height)
          ctx.closePath()

          // Gradient fill
          const waveColor = currentTheme === 'light' ? wave.colorLight : wave.colorDark
          const gradient = ctx.createLinearGradient(0, canvas.height * wave.base - wave.amp, 0, canvas.height)
          gradient.addColorStop(0, waveColor)
          gradient.addColorStop(1, 'transparent')

          ctx.fillStyle = gradient
          ctx.fill()
        })

      } else if (currentType === 'starfield') {
        // --- 4. RENDER 3D SPACE FLIGHT (WARP SPEED) ---
        const fov = 280
        const centerX = canvas.width / 2 + (mouse.x - canvas.width / 2) * 0.06
        const centerY = canvas.height / 2 + (mouse.y - canvas.height / 2) * 0.06

        stars.forEach((star) => {
          // Move forward slowly (fresh, calm space flight)
          star.z -= 0.6

          // Reset when close to screen
          if (star.z <= 10) {
            star.z = maxDepth
            star.x = (Math.random() - 0.5) * canvas.width * 2
            star.y = (Math.random() - 0.5) * canvas.height * 2
            star.prevZ = star.z
          }

          // Projection to 2D
          const px = (star.x / star.z) * fov + centerX
          const py = (star.y / star.z) * fov + centerY

          const prevPx = (star.x / star.prevZ) * fov + centerX
          const prevPy = (star.y / star.prevZ) * fov + centerY

          star.prevZ = star.z

          // Only draw if inside viewport boundaries
          if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
            const alpha = (1 - star.z / maxDepth)

            // 1. Draw subtle motion trail
            const trailAlpha = alpha * (currentTheme === 'light' ? 0.04 : 0.08)
            ctx.strokeStyle = currentTheme === 'light' 
              ? `rgba(30, 41, 59, ${trailAlpha})` 
              : `rgba(147, 197, 253, ${trailAlpha})`
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(prevPx, prevPy)
            ctx.lineTo(px, py)
            ctx.stroke()

            // 2. Draw star dot
            const dotAlpha = alpha * (currentTheme === 'light' ? 0.4 : 0.75)
            ctx.fillStyle = currentTheme === 'light'
              ? `rgba(30, 41, 59, ${dotAlpha})`
              : `rgba(255, 255, 255, ${dotAlpha})`
            const radius = (1 - star.z / maxDepth) * 1.2
            ctx.beginPath()
            ctx.arc(px, py, radius, 0, Math.PI * 2)
            ctx.fill()
          }
        })
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [type]) // Depend on type to re-initialize canvas state cleanly when switched

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
        filter: type === 'dynamic' ? 'blur(110px) saturate(1.8)' : 'none', // Only blur organic blobs!
        opacity: type === 'dynamic' ? 0.9 : 0.8,
        pointerEvents: 'none',
        background: theme === 'light' ? '#f4f4f7' : '#080811',
        transition: 'background 0.6s ease',
      }}
    />
  )
}

export default DynamicBackground
