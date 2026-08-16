import React, { useEffect, useRef } from 'react'

export default function AsciiCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const charset = ['.', ':', '+', '*', '#', '@']
    const colors = ['#1d4ed8', '#2563ff', '#3b82f6', '#60a5fa', '#38bdf8', '#7dd3fc', '#eaf1ff']

    let cellW = 7
    let cellH = 12
    let fontSize = 10
    let cols = 0
    let rows = 0
    let dpr = Math.min(window.devicePixelRatio || 1, 2)
    let running = false
    let rafId = null

    let cellsBuf = []
    let zBuf = new Float32Array(0)

    function ensureBuffers() {
      const n = Math.max(1, cols * rows)
      cellsBuf = new Array(n)
      zBuf = new Float32Array(n)
    }

    function resize() {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w === 0 || h === 0) return
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      fontSize = Math.max(8, Math.min(11, Math.floor(w / 26)))
      ctx.font = `${fontSize}px "JetBrains Mono", monospace`
      const m = ctx.measureText('#')
      cellW = m.width
      cellH = fontSize * 1.3
      cols = Math.floor(w / cellW)
      rows = Math.floor(h / cellH)
      ensureBuffers()
    }

    function vAdd(a, b) {
      return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
    }
    function vScale(a, s) {
      return { x: a.x * s, y: a.y * s, z: a.z * s }
    }
    function vNorm(a) {
      const l = Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z) || 1
      return { x: a.x / l, y: a.y / l, z: a.z / l }
    }

    function boxPoints(halfL, halfW, halfT, Lhat, What, That, stepsL, stepsW, stepsT) {
      const pts = []
      for (let i = 0; i <= stepsL; i++) {
        const u = -1 + (2 * i) / stepsL
        for (let j = 0; j <= stepsW; j++) {
          const v = -1 + (2 * j) / stepsW
          for (let sIdx = 0; sIdx < 2; sIdx++) {
            const s = sIdx === 0 ? 1 : -1
            const pos = vAdd(vAdd(vScale(Lhat, u * halfL), vScale(What, v * halfW)), vScale(That, s * halfT))
            const normal = vScale(That, s)
            pts.push({ pos, n: normal })
          }
        }
      }
      for (let i = 0; i <= stepsL; i++) {
        const u = -1 + (2 * i) / stepsL
        for (let k = 0; k <= stepsT; k++) {
          const w = -1 + (2 * k) / stepsT
          for (let sIdx = 0; sIdx < 2; sIdx++) {
            const s = sIdx === 0 ? 1 : -1
            const pos = vAdd(vAdd(vScale(Lhat, u * halfL), vScale(What, s * halfW)), vScale(That, w * halfT))
            const normal = vScale(What, s)
            pts.push({ pos, n: normal })
          }
        }
      }
      return pts
    }

    const diag = 1 / Math.SQRT2
    const LhatA = { x: diag, y: diag, z: 0 }
    const WhatA = { x: -diag, y: diag, z: 0 }
    const LhatB = { x: diag, y: -diag, z: 0 }
    const WhatB = { x: diag, y: diag, z: 0 }
    const That = { x: 0, y: 0, z: 1 }
    const halfL = 1.3
    const halfW = 0.16
    const halfT = 0.08

    const basePoints = [
      ...boxPoints(halfL, halfW, halfT, LhatA, WhatA, That, 34, 4, 2),
      ...boxPoints(halfL, halfW, halfT, LhatB, WhatB, That, 34, 4, 2)
    ]
    const lightDir = vNorm({ x: 0.45, y: 0.55, z: 1 })
    let angleY = 0.6
    let angleX = 0.55
    let manualYaw = 0
    let manualPitch = 0
    let parX = 0
    let parY = 0
    let targetParX = 0
    let targetParY = 0
    let dragging = false
    let lastPX = 0
    let lastPY = 0

    function rotateY(p, a) {
      const c = Math.cos(a)
      const s = Math.sin(a)
      return { x: p.x * c + p.z * s, y: p.y, z: -p.x * s + p.z * c }
    }
    function rotateX(p, a) {
      const c = Math.cos(a)
      const s = Math.sin(a)
      return { x: p.x, y: p.y * c - p.z * s, z: p.y * s + p.z * c }
    }

    function drawFrame() {
      if (cols <= 0 || rows <= 0) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      for (let idx = 0; idx < zBuf.length; idx++) {
        zBuf[idx] = -1e9
        cellsBuf[idx] = null
      }

      const camDist = 4.2
      const scaleUnit = Math.min(w, h) * 0.42
      const colCenter = w / 2
      const rowCenter = h / 2

      for (let p = 0; p < basePoints.length; p++) {
        const bp = basePoints[p]
        const totalYaw = angleY + manualYaw + parX * 0.3
        const totalPitch = angleX + manualPitch + parY * 0.25
        const rp = rotateX(rotateY(bp.pos, totalYaw), totalPitch)
        const rn = rotateX(rotateY(bp.n, totalYaw), totalPitch)

        const persp = camDist / (camDist + rp.z)
        const sx = colCenter + rp.x * scaleUnit * persp * 0.76
        const sy = rowCenter - rp.y * scaleUnit * persp * 1.05

        const col = Math.floor(sx / cellW)
        const row = Math.floor(sy / cellH)
        if (col < 0 || col >= cols || row < 0 || row >= rows) continue

        const zKey = 1 / (camDist + rp.z)
        const flat = row * cols + col
        if (zKey > zBuf[flat]) {
          zBuf[flat] = zKey
          let lum = (rn.x * lightDir.x + rn.y * lightDir.y + rn.z * lightDir.z + 1) / 2
          lum = Math.pow(Math.max(0, Math.min(1, lum)), 0.85)
          cellsBuf[flat] = lum
        }
      }

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const f = r * cols + c
          const lum2 = cellsBuf[f]
          if (lum2 === null || lum2 === undefined) continue
          const chIdx = Math.min(charset.length - 1, Math.floor(lum2 * charset.length))
          const colIdx = Math.min(colors.length - 1, Math.floor(lum2 * colors.length))
          ctx.fillStyle = colors[colIdx]
          ctx.fillText(charset[chIdx], c * cellW, r * cellH + fontSize)
        }
      }
    }

    let lastT = 0
    function loop(ts) {
      if (!running) return
      const dt = Math.min(0.05, (ts - lastT) / 1000 || 0)
      lastT = ts
      if (!dragging) {
        angleY += dt * 0.55
      }
      parX += (targetParX - parX) * 0.08
      parY += (targetParY - parY) * 0.08
      drawFrame()
      rafId = requestAnimationFrame(loop)
    }

    function pointerPos(e) {
      const rect = canvas.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        w: rect.width,
        h: rect.height
      }
    }

    function onPointerMove(e) {
      const p = pointerPos(e)
      if (dragging) {
        const dx = p.x - lastPX
        const dy = p.y - lastPY
        manualYaw += dx * 0.012
        manualPitch += dy * 0.012
        manualPitch = Math.max(-1.3, Math.min(1.3, manualPitch))
        lastPX = p.x
        lastPY = p.y
        if (reduced) drawFrame()
      } else {
        targetParX = (p.x / p.w) * 2 - 1
        targetParY = (p.y / p.h) * 2 - 1
        if (reduced) {
          parX = targetParX
          parY = targetParY
          drawFrame()
        }
      }
    }

    function onPointerDown(e) {
      dragging = true
      if (canvas.setPointerCapture) {
        try {
          canvas.setPointerCapture(e.pointerId)
        } catch (_) {}
      }
      const p = pointerPos(e)
      lastPX = p.x
      lastPY = p.y
      canvas.style.cursor = 'grabbing'
    }

    function onPointerUp() {
      dragging = false
      canvas.style.cursor = 'grab'
    }

    function onPointerLeave() {
      targetParX = 0
      targetParY = 0
    }

    canvas.style.cursor = 'grab'
    canvas.style.touchAction = 'none'
    canvas.addEventListener('pointermove', onPointerMove)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointercancel', onPointerUp)
    canvas.addEventListener('pointerleave', onPointerLeave)

    function handleResize() {
      resize()
      if (reduced) drawFrame()
    }
    window.addEventListener('resize', handleResize)

    resize()
    running = true
    if (reduced) {
      drawFrame()
      running = false
    } else {
      lastT = performance.now()
      rafId = requestAnimationFrame(loop)
    }

    return () => {
      running = false
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('pointermove', onPointerMove)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointercancel', onPointerUp)
      canvas.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return <canvas ref={canvasRef} />
}
