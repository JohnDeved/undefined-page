import './style.css'

const canvas = document.querySelector("canvas")
if (!canvas) throw new Error("Canvas not found")

// resize canvas to fit window
// canvas.
// canvas.height = window.innerHeight

// get canvas context
const ctx = canvas.getContext("2d")
if (!ctx) throw new Error("Canvas context not found")

// set canvas size
canvas.width = window.innerWidth
canvas.height = window.innerHeight

// on window resize, resize canvas
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
})

let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/=%\"'`!?:;,.|&<>()[]{}^#_~@\\"
let frame = 0
let radius = 0
let thickness = 150
let speed = 1

// draw loop
function draw(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  frame++

  // reset radius if inside of circle is outside of canvas
  const canvasLongside = Math.max(canvas.width, canvas.height)
  if (radius - thickness > canvasLongside) {
    thickness = Math.random() * 200 + 100
    radius = 0
  }


  radius += canvasLongside / 500 * speed
  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const center = { x: canvas.width / 2, y: canvas.height / 2 }

  // draw center text
  ctx.fillStyle = "white"
  ctx.font = "10vh 'monogram', monospace"
  ctx.shadowBlur = 50
  ctx.shadowColor = `rgba(60, 135, 255, 255)`
  ctx.textBaseline = "middle"
  ctx.textAlign = "center"
  // outside line
  const text = "undefined"
  ctx.fillText(text, center.x, center.y)
  // get center text bounds
  const centerTextMeasure = ctx.measureText(text)
  const centerTextWidth = centerTextMeasure.width
  const centerTextHeight = centerTextMeasure.actualBoundingBoxAscent + centerTextMeasure.actualBoundingBoxDescent
  const centerTextPos = { x: center.x - centerTextWidth / 2, y: center.y - centerTextHeight / 2 }
  
  ctx.fillStyle = "white"
  ctx.font = "4vh 'monogram', monospace"
  ctx.textBaseline = "top"
  ctx.textAlign = "left"
  const letterMeasure = ctx.measureText("A")
  // console.log(letterMeasure)

  // how many letters fit on the screen
  const pad = 0
  const letterHeight = (letterMeasure.actualBoundingBoxAscent + letterMeasure.actualBoundingBoxDescent) * 1.5 + pad
  const letterWidth = letterMeasure.width + pad
  
  const lettersPerRow = Math.ceil(canvas.width / letterWidth)
  const lettersPerCol = Math.ceil(canvas.height / letterHeight)

  // draw letters
  for (let i = 0; i < lettersPerRow; i++) {
    for (let j = 0; j < lettersPerCol; j++) {
      const x = i * letterWidth
      const y = j * letterHeight

      // skip if letter bounds overlap with center text bounds
      if (
        x + letterWidth > centerTextPos.x &&
        x < centerTextPos.x + centerTextWidth &&
        y + letterHeight > centerTextPos.y &&
        y < centerTextPos.y + centerTextHeight
      ) {
        // // draw blue line around letter
        // ctx.strokeStyle = "blue"
        // ctx.lineWidth = 2
        // ctx.strokeRect(x, y, letterWidth, letterHeight)
        continue
      
      }

      // const get random letter for this position, use sin to make it change over time
      const random = Math.sin(frame * .0001 + (i + j * 20))
      const random2 = Math.sin(frame * .0001 + (i + j * 20) * 130)

      const letter = chars[Math.abs(Math.floor(random * chars.length))] ?? " "
      
      const center = { x: canvas.width / 2, y: canvas.height / 2 }
      const dist = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2)
      const isInside = dist < radius

      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(random2 * .1, .01)})`
      ctx.shadowBlur = 0
      ctx.fillText(letter, i * letterWidth, j * letterHeight)

      if (isInside) {
        // create inner circle
        if (dist < radius - thickness && dist > radius - thickness * 1.5) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(random2 * .1, .01)})`
          ctx.fillText(letter, i * letterWidth, j * letterHeight)
          continue
        }

        // const opacity = 1 - Math.max((radius - dist) / thickness, 0)
        // non linear opacity quick falloff
        const opacity = 1 - Math.max((radius - dist) / thickness, 0)
        const r = Math.floor(255 * (random2 * .5))
        ctx.fillStyle = `rgba(${r}, 135, 245, ${opacity})`
        ctx.fillText(letter, i * letterWidth, j * letterHeight)



        if (dist > radius - 25) {
          for (let k = 0; k < 3; k++) {
            ctx.shadowBlur = 40
            ctx.shadowColor = `rgba(60, 135, 255, 255)`
            ctx.fillStyle = `rgba(255, 255, 255, 1)`
            ctx.fillText(letter, i * letterWidth, j * letterHeight)

          }
        }

      } 
    }
  }
  // // draw line around center text
  // ctx.strokeStyle = "white"
  // ctx.lineWidth = 2
  // ctx.strokeRect(centerTextPos.x, centerTextPos.y, centerTextWidth, centerTextHeight)


  // // draw blue dot at center text position
  // ctx.fillStyle = "blue"
  // ctx.beginPath()
  // ctx.arc(centerTextPos.x, centerTextPos.y, 5, 0, Math.PI * 2)
  // ctx.fill()


  // request next frame
  requestAnimationFrame(draw.bind(null, canvas, ctx))
}

// start draw loop
draw(canvas, ctx)
