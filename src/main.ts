import './style.css'

// Get the canvas and context elements, asserting they are not null
const canvas = document.querySelector('canvas')!
const ctx = canvas.getContext('2d')!
const blurEffect = document.querySelector('.blur-effect')!

// Function to resize the canvas to fill the window
const resizeCanvas = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
resizeCanvas()
window.addEventListener('resize', resizeCanvas)

// Character set used for drawing random characters on the canvas
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/=%"\'`!?:;,.|&<>()[]{}^#_~@\\'
let frame = 0
let radius = 0
let thickness = 150
let speed = 1

// Interface for mouse coordinates
interface Mouse {
  x: number
  y: number
}

// Mouse coordinates and radius for attraction effect
const mouse: Mouse = { x: 0, y: 0 }
const mouseRadius = 300 // Radius of attraction effect

// Update mouse coordinates and blur effect position on mouse move
window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX
  mouse.y = e.clientY
  ;(blurEffect as HTMLElement).style.left = `${mouse.x}px`
  ;(blurEffect as HTMLElement).style.top = `${mouse.y}px`
})

// Main draw function
const draw = (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => {
  frame++
  const canvasLongside = Math.max(canvas.width, canvas.height)
  if (radius - thickness > canvasLongside) {
    thickness = Math.random() * 200 + 100
    radius = 0
  }

  radius += canvasLongside / 500 * speed
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const center = { x: canvas.width / 2, y: canvas.height / 2 }
  ctx.fillStyle = 'white'
  ctx.font = "10vh 'monogram', monospace"
  ctx.shadowBlur = 50
  ctx.shadowColor = 'rgba(60, 135, 255, 255)'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  const text = 'undefined'
  ctx.fillText(text, center.x, center.y)

  // Measure the central text dimensions
  const centerTextMeasure = ctx.measureText(text)
  const centerTextWidth = centerTextMeasure.width
  const centerTextHeight = centerTextMeasure.actualBoundingBoxAscent + centerTextMeasure.actualBoundingBoxDescent
  const centerTextPos = { x: center.x - centerTextWidth / 2, y: center.y - centerTextHeight / 2 }

  ctx.font = "4vh 'monogram', monospace"
  ctx.textBaseline = 'top'
  ctx.textAlign = 'left'
  const letterMeasure = ctx.measureText('A')
  const letterHeight = (letterMeasure.actualBoundingBoxAscent + letterMeasure.actualBoundingBoxDescent) * 1.5
  const letterWidth = letterMeasure.width

  const lettersPerRow = Math.ceil(canvas.width / letterWidth)
  const lettersPerCol = Math.ceil(canvas.height / letterHeight)

  // Draw random characters on the canvas
  for (let i = 0; i < lettersPerRow; i++) {
    for (let j = 0; j < lettersPerCol; j++) {
      let x = i * letterWidth
      let y = j * letterHeight

      // Skip drawing characters that overlap with the central text
      if (x + letterWidth > centerTextPos.x && x < centerTextPos.x + centerTextWidth && y + letterHeight > centerTextPos.y && y < centerTextPos.y + centerTextHeight) continue

      const random = Math.sin(frame * 0.0001 + (i + j * 20))
      const random2 = Math.sin(frame * 0.0001 + (i + j * 20) * 130)
      const letter = chars[Math.abs(Math.floor(random * chars.length))] || ' '
      const dist = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2)
      const isInside = dist < radius

      // Apply attraction effect if within the mouse radius
      const mouseDist = Math.sqrt((x - mouse.x) ** 2 + (y - mouse.y) ** 2)
      if (mouseDist < mouseRadius) {
        const angle = Math.atan2(mouse.y - y, mouse.x - x)
        x += Math.cos(angle) * (mouseRadius - mouseDist) * 0.05 // Attraction effect with reduced impact
        y += Math.sin(angle) * (mouseRadius - mouseDist) * 0.05 // Attraction effect with reduced impact
      }

      // Apply wave distortion effect if within the radius and the thickness
      if (isInside && dist > radius - thickness) {
        const angle = Math.atan2(center.y - y, center.x - x)
        const waveFactor = Math.sin(((dist - (radius - thickness)) / thickness) * Math.PI) // Wave effect
        const distortion = waveFactor * 15 // Distortion factor
        x -= Math.cos(angle) * distortion // Adjust position with wave effect
        y -= Math.sin(angle) * distortion // Adjust position with wave effect
      }

      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(random2 * 0.15, 0.01)})`
      ctx.shadowBlur = 0
      ctx.fillText(letter, x, y)

      // Draw characters within the radius with different opacity and color
      if (isInside) {
        if (dist < radius - thickness && dist > radius - thickness * 1.5) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(random2 * 0.3, 0.01)})`
          ctx.fillText(letter, x, y)
          continue
        }
        const opacity = 1 - Math.max((radius - dist) / thickness, 0)
        const r = Math.floor(255 * (random2 * 0.5))
        ctx.fillStyle = `rgba(${r}, 135, 245, ${opacity})`
        ctx.fillText(letter, x, y)
        if (dist > radius - 25) {
          for (let k = 0; k < 3; k++) {
            ctx.shadowBlur = 40
            ctx.shadowColor = 'rgba(60, 135, 255, 255)'
            ctx.fillStyle = 'rgba(255, 255, 255, 1)'
            ctx.fillText(letter, x, y)
          }
        }
      }
    }
  }
  // Request the next frame
  requestAnimationFrame(draw.bind(null, canvas, ctx))
}

// Start the drawing loop
draw(canvas, ctx)
