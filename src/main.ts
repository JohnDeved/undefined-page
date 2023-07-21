import './style.css'

const canvas = document.querySelector("canvas")
if (!canvas) throw new Error("Canvas not found")

// get canvas context
const ctx = canvas.getContext("2d")
if (!ctx) throw new Error("Canvas context not found")

let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789$+-*/=%\"'`!?:;,.|&<>()[]{}^#_~@\\"
let frame = 0
let radius = 0
let thickness = 150
let speed = 1
const text = "undefined"

// initialized later
let canvasLongside: number = NaN
let radiusStepSize: number = NaN
let center = { x: 0, y: 0 }
let letters: ReturnType<typeof getLetters> = []


const getLetters = () => {
  // center text measurements
  ctx.fillStyle = "white"
  ctx.font = "70px 'monogram', monospace"
  ctx.shadowBlur = 50
  ctx.shadowColor = `rgba(60, 135, 255, 1)`
  ctx.textBaseline = "middle"
  ctx.textAlign = "center"
  const centerTextMeasure = ctx.measureText(text)
  const centerTextWidth = centerTextMeasure.width
  const centerTextHeight = centerTextMeasure.actualBoundingBoxAscent + centerTextMeasure.actualBoundingBoxDescent
  const centerTextPos = { x: center.x - centerTextWidth / 2, y: center.y - centerTextHeight / 2 }

  // letters measurements
  ctx.fillStyle = "white"
  ctx.font = "30px 'monogram', monospace"
  ctx.textBaseline = "top"
  ctx.textAlign = "left"
  const letterMeasure = ctx.measureText("A")
  const letterHeight = (letterMeasure.actualBoundingBoxAscent + letterMeasure.actualBoundingBoxDescent) * 1.5
  const letterWidth = letterMeasure.width
  const lettersPerRow = Math.ceil(canvas.width / letterWidth)
  const lettersPerCol = Math.ceil(canvas.height / letterHeight)

  const _letters = []

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
        continue
      }

      _letters.push({
        x, y, i, j,
        dist: Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2)
      })
    }
  }

  return _letters
}

// set runtime variables
const setVars = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  canvasLongside = Math.max(canvas.width, canvas.height)
  radiusStepSize = canvasLongside / 500 * speed
  center = { x: canvas.width / 2, y: canvas.height / 2 }
  letters = getLetters()
}
setVars()

// on window resize, reset runtime variables
window.addEventListener("resize", setVars)


// draw loop
const draw = () => {
  frame++

  // reset radius if inside of circle is outside of canvas
  if (radius - thickness > canvasLongside) {
    thickness = Math.random() * 200 + 100
    radius = 0
  }

  // increase radius
  radius += radiusStepSize

  // clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // draw center text
  ctx.fillStyle = "white"
  ctx.font = "70px 'monogram', monospace"
  ctx.shadowBlur = 50
  ctx.shadowColor = `rgba(60, 135, 255, 1)`
  ctx.textBaseline = "middle"
  ctx.textAlign = "center"
  ctx.fillText(text, center.x, center.y)

  // draw letters
  ctx.fillStyle = "white"
  ctx.font = "30px 'monogram', monospace"
  ctx.textBaseline = "top"
  ctx.textAlign = "left"

  for (let i = 0; i < letters.length; i++) {
    const letterData = letters[i]
    // const get random letter for this position, use sin to make it change over time

    const random = Math.sin(frame * .0001 + (letterData.i + letterData.j * 20))
    const random2 = Math.sin(frame * .0001 + (letterData.i + letterData.j * 20) * 130)

    const letter = chars[Math.abs(Math.floor(random * (chars.length - 1)))] ?? " "
    const isInside = letterData.dist < radius

    ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(random2 * .1, .01)})`
    ctx.shadowBlur = 0
    ctx.fillText(letter, letterData.x, letterData.y)

    if (isInside) {
      // create inner circle
      if (letterData.dist < radius - thickness && letterData.dist > radius - thickness * 1.5) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(random2 * .1, .01)})`
        ctx.fillText(letter, letterData.x, letterData.y)
        continue
      }

      // const opacity = 1 - Math.max((radius - dist) / thickness, 0)
      // non linear opacity quick falloff
      const opacity = 1 - Math.max((radius - letterData.dist) / thickness, 0)
      const r = Math.floor(255 * (random2 * .5))
      ctx.fillStyle = `rgba(${r}, 135, 245, ${opacity})`
      ctx.fillText(letter, letterData.x, letterData.y)

      if (letterData.dist > radius - 25) {
        for (let k = 0; k < 5; k++) {
          ctx.shadowBlur = 40
          ctx.shadowColor = `rgba(60, 135, 255, 1)`
          ctx.fillStyle = `rgba(255, 255, 255, 1)`
          ctx.fillText(letter, letterData.x, letterData.y)
        }
      }
    }
  }

  // request next frame
  requestAnimationFrame(draw)
}

// start draw loop
draw()
