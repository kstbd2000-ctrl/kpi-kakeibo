import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'

function generateIcon(size) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  const s = size / 64  // scale factor

  // Rounded rect background
  const r = size * 0.2
  const bg = ctx.createLinearGradient(0, 0, size, size)
  bg.addColorStop(0, '#fdf3d0')
  bg.addColorStop(1, '#e8c050')
  ctx.fillStyle = bg
  ctx.beginPath()
  ctx.moveTo(r, 0)
  ctx.lineTo(size - r, 0)
  ctx.quadraticCurveTo(size, 0, size, r)
  ctx.lineTo(size, size - r)
  ctx.quadraticCurveTo(size, size, size - r, size)
  ctx.lineTo(r, size)
  ctx.quadraticCurveTo(0, size, 0, size - r)
  ctx.lineTo(0, r)
  ctx.quadraticCurveTo(0, 0, r, 0)
  ctx.closePath()
  ctx.fill()

  // Helper: draw ellipse
  const ellipse = (x, y, rx, ry, color, alpha = 1) => {
    ctx.globalAlpha = alpha
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.ellipse(x * s, y * s, rx * s, ry * s, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }

  // Body
  const bodyGrad = ctx.createLinearGradient(10 * s, 22 * s, 50 * s, 55 * s)
  bodyGrad.addColorStop(0, '#f5d060')
  bodyGrad.addColorStop(0.5, '#d4a028')
  bodyGrad.addColorStop(1, '#b07a10')

  ctx.fillStyle = bodyGrad
  ctx.shadowColor = 'rgba(80,40,0,0.35)'
  ctx.shadowBlur = 3 * s
  ctx.shadowOffsetY = 2 * s
  ctx.beginPath()
  ctx.ellipse(30 * s, 38 * s, 20 * s, 16 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0

  // Head
  ctx.fillStyle = bodyGrad
  ctx.shadowColor = 'rgba(80,40,0,0.3)'
  ctx.shadowBlur = 3 * s; ctx.shadowOffsetY = 2 * s
  ctx.beginPath()
  ctx.arc(48 * s, 30 * s, 11 * s, 0, Math.PI * 2)
  ctx.fill()
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0

  // Belly highlight
  ellipse(29, 40, 11, 8.5, '#fae080', 0.5)

  // Ear
  ctx.save()
  ctx.translate(43.5 * s, 19.5 * s)
  ctx.rotate(-18 * Math.PI / 180)
  ctx.fillStyle = '#c08010'
  ctx.beginPath()
  ctx.ellipse(0, 0, 3.8 * s, 5.2 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#e8a828'
  ctx.beginPath()
  ctx.ellipse(0, 0.3 * s, 2 * s, 3 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  // Snout
  ellipse(56, 33, 6, 5, '#c98818')
  ellipse(54.4, 33, 1.4, 1.4, '#8a5808')
  ellipse(57.6, 33, 1.4, 1.4, '#8a5808')

  // Eye
  ellipse(50.5, 26, 2.4, 2.4, '#ffffff')
  ellipse(51, 26, 1.3, 1.3, '#2a1400')
  ellipse(51.6, 25.2, 0.55, 0.55, '#ffffff')

  // Coin slot
  ctx.fillStyle = 'rgba(100,60,5,0.7)'
  ctx.beginPath()
  ctx.roundRect(26 * s, 22 * s, 10 * s, 2.8 * s, 1.4 * s)
  ctx.fill()

  // Coin
  const coinGrad = ctx.createLinearGradient(26 * s, 20 * s, 36 * s, 23 * s)
  coinGrad.addColorStop(0, '#ffe88a')
  coinGrad.addColorStop(1, '#c9a028')
  ellipse(31, 21.5, 4.5, 2, '#c9a028')
  ctx.fillStyle = coinGrad
  ctx.beginPath()
  ctx.ellipse(31 * s, 21.5 * s, 4.2 * s, 1.7 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#7a4c06'
  ctx.font = `bold ${3.8 * s}px serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('¥', 31 * s, 22.2 * s)

  // Legs
  const legColor = '#c08010'
  ;[[15, 51, 6.5, 8], [24, 52, 6.5, 7], [33, 52, 6.5, 7], [42, 51, 6.5, 8]].forEach(([x, y, w, h]) => {
    ctx.fillStyle = legColor
    ctx.beginPath()
    ctx.roundRect(x * s, y * s, w * s, h * s, 3.2 * s)
    ctx.fill()
  })

  // Tail
  ctx.strokeStyle = '#c08010'
  ctx.lineWidth = 2.6 * s
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(11 * s, 36 * s)
  ctx.bezierCurveTo(5 * s, 34 * s, 7 * s, 23 * s, 13.5 * s, 26 * s)
  ctx.bezierCurveTo(16 * s, 28.5 * s, 13 * s, 30.5 * s, 13 * s, 30.5 * s)
  ctx.stroke()

  // Shine
  ctx.save()
  ctx.translate(21 * s, 30 * s)
  ctx.rotate(-30 * Math.PI / 180)
  ctx.fillStyle = 'rgba(255,255,255,0.22)'
  ctx.beginPath()
  ctx.ellipse(0, 0, 5 * s, 2.8 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()

  return canvas.toBuffer('image/png')
}

writeFileSync('public/icon-192.png', generateIcon(192))
writeFileSync('public/icon-512.png', generateIcon(512))
console.log('Piggy bank icons generated.')
